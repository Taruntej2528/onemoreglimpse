import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SiteProvider } from './context/SiteContext';
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import { ProtectedRoute } from './admin/components/ProtectedRoute';
import { AdminLayout } from './admin/components/AdminLayout';
import { AdminLogin } from './admin/pages/AdminLogin';
import { AdminDashboard } from './admin/pages/AdminDashboard';
import { AdminEvents } from './admin/pages/AdminEvents';
import { AdminRequests } from './admin/pages/AdminRequests';
import { AdminSettings } from './admin/pages/AdminSettings';
import { AdminNotifications } from './admin/pages/AdminNotifications';
import { AdminUsers } from './admin/pages/AdminUsers';
import { AdminLogs } from './admin/pages/AdminLogs';
import { WebsiteLandingPage } from './pages/WebsiteLandingPage';

export function App() {
  return (
    <SiteProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Website */}
            <Route path="/" element={<WebsiteLandingPage />} />

            {/* Admin Authentication Screen */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Suite */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard / Overview */}
              <Route
                index
                element={
                  <ProtectedRoute moduleRequired="dashboard">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute moduleRequired="dashboard">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Shoot Events & Schedules */}
              <Route
                path="events"
                element={
                  <ProtectedRoute moduleRequired="events">
                    <AdminEvents />
                  </ProtectedRoute>
                }
              />

              {/* Client Requests & Leads */}
              <Route
                path="requests"
                element={
                  <ProtectedRoute moduleRequired="client_requests">
                    <AdminRequests />
                  </ProtectedRoute>
                }
              />

              {/* Multi-Cloud Storage & Settings */}
              <Route
                path="settings"
                element={
                  <ProtectedRoute moduleRequired="settings">
                    <AdminSettings />
                  </ProtectedRoute>
                }
              />

              {/* Notification Center */}
              <Route
                path="notifications"
                element={
                  <ProtectedRoute moduleRequired="notifications">
                    <AdminNotifications />
                  </ProtectedRoute>
                }
              />

              {/* User Access Management & RBAC */}
              <Route
                path="users"
                element={
                  <ProtectedRoute moduleRequired="users">
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />

              {/* System Audit Logs */}
              <Route
                path="logs"
                element={
                  <ProtectedRoute moduleRequired="logs">
                    <AdminLogs />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </SiteProvider>
  );
}

export default App;
