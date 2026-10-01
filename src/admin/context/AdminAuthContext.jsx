import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../../services/api';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const stored = localStorage.getItem('prazna_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validate session and refresh user profile on initial load
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('prazna_admin_token');
      if (!token) {
        setInitialLoading(false);
        return;
      }

      try {
        const response = await authAPI.getMe();
        if (response?.data) {
          setAdminUser(response.data);
          localStorage.setItem('prazna_admin_user', JSON.stringify(response.data));
        }
      } catch (err) {
        console.warn('[Auth] Session expired or invalid:', err.message);
        localStorage.removeItem('prazna_admin_token');
        localStorage.removeItem('prazna_admin_user');
        setAdminUser(null);
      } finally {
        setInitialLoading(false);
      }
    };

    verifySession();
  }, []);

  /**
   * Authenticate user with backend API
   */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      if (!email || !password) {
        throw new Error('Please provide both email and password.');
      }

      const response = await authAPI.login({
        email: email.trim().toLowerCase(),
        password,
      });

      if (!response?.data?.token) {
        throw new Error('Failed to retrieve authentication token.');
      }

      const { token, user } = response.data;

      // Store in localStorage
      localStorage.setItem('prazna_admin_token', token);
      localStorage.setItem('prazna_admin_user', JSON.stringify(user));

      setAdminUser(user);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('[Login Error]', err.message);
      setError(err.message || 'Login failed. Please verify your credentials.');
      setLoading(false);
      return false;
    }
  };

  /**
   * Log out and wipe session
   */
  const logout = () => {
    setAdminUser(null);
    localStorage.removeItem('prazna_admin_token');
    localStorage.removeItem('prazna_admin_user');
  };

  /**
   * RBAC Helper: Checks whether current user can perform an action on a module
   * @param {string} module - 'dashboard' | 'events' | 'client_requests' | 'media' | 'categories' | 'settings' | 'notifications' | 'users' | 'logs'
   * @param {'view'|'edit'|'delete'} action - Permission action
   */
  const hasPermission = (module, action = 'view') => {
    if (!adminUser) return false;
    // Master Admin has unrestricted bypass
    if (adminUser.role === 'ADMIN') return true;

    // Sub-Admin module check
    const moduleEntry = adminUser.modules?.find((m) => m.module === module);
    return Boolean(moduleEntry?.permissions?.[action]);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isAuthenticated: !!adminUser,
        isMasterAdmin: adminUser?.role === 'ADMIN',
        hasPermission,
        login,
        logout,
        loading,
        initialLoading,
        error,
        setError,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
