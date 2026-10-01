import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  Bell,
  ExternalLink,
  LogOut,
  Camera,
  ChevronRight,
  Shield,
  Activity,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { requestsAPI, notificationsAPI, eventsAPI } from '../../services/api';

export const AdminSidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { adminUser, isMasterAdmin, hasPermission, logout } = useAdminAuth();
  const navigate = useNavigate();

  const [counts, setCounts] = useState({
    events: 0,
    pendingRequests: 0,
    unreadNotifications: 0,
  });

  useEffect(() => {
    let isMounted = true;
    const loadCounts = async () => {
      try {
        const [reqRes, notifRes, evRes] = await Promise.allSettled([
          requestsAPI.getAll({ status: 'NEW' }),
          notificationsAPI.getAll({ isRead: false }),
          eventsAPI.getAll(),
        ]);

        if (isMounted) {
          setCounts({
            pendingRequests:
              reqRes.status === 'fulfilled' && reqRes.value?.data
                ? reqRes.value.data.filter((r) => r.status === 'NEW' || r.status === 'PENDING').length
                : 0,
            unreadNotifications:
              notifRes.status === 'fulfilled' && notifRes.value?.data
                ? notifRes.value.data.filter((n) => !n.isRead).length
                : 0,
            events:
              evRes.status === 'fulfilled' && evRes.value?.data
                ? evRes.value.data.length
                : 0,
          });
        }
      } catch (err) {
        console.debug('[Sidebar] Counts load:', err.message);
      }
    };

    loadCounts();
    const interval = setInterval(loadCounts, 30000); // 30s background poll
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: LayoutDashboard,
      badge: null,
      show: hasPermission('dashboard', 'view'),
    },
    {
      name: 'Events & Shoots',
      path: '/admin/events',
      icon: Calendar,
      badge: counts.events > 0 ? `${counts.events}` : null,
      show: hasPermission('events', 'view'),
    },
    {
      name: 'Client Requests',
      path: '/admin/requests',
      icon: Users,
      badge: counts.pendingRequests > 0 ? `${counts.pendingRequests}` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      show: hasPermission('client_requests', 'view'),
    },
    {
      name: 'Notifications',
      path: '/admin/notifications',
      icon: Bell,
      badge: counts.unreadNotifications > 0 ? `${counts.unreadNotifications}` : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      show: hasPermission('notifications', 'view'),
    },
    {
      name: 'Studio Settings',
      path: '/admin/settings',
      icon: Settings,
      badge: null,
      show: hasPermission('settings', 'view'),
    },
    {
      name: 'User Management',
      path: '/admin/users',
      icon: Users,
      badge: isMasterAdmin ? 'Master' : null,
      badgeColor: 'bg-[#C9A96E]/20 text-[#E5D2A8] border-[#C9A96E]/40',
      show: hasPermission('users', 'view'),
    },
    {
      name: 'Audit Logs',
      path: '/admin/logs',
      icon: Activity,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      show: hasPermission('logs', 'view'),
    },
  ].filter((item) => item.show);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside
      className={`h-screen sticky top-0 flex flex-col transition-all duration-300 flex-shrink-0 z-40 ${
        isCollapsed ? 'w-20' : 'w-72'
      } bg-[#0E1118] border-r border-white/10 text-slate-200 select-none shadow-2xl overflow-hidden`}
    >
      {/* Brand Header */}
      <div className="h-20 px-6 flex items-center justify-between border-b border-white/10 flex-shrink-0">
        <Link to="/admin" className="flex items-center gap-3 overflow-hidden group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C9A96E] to-[#A37E3E] flex items-center justify-center text-black font-bold shadow-gold-glow flex-shrink-0 group-hover:scale-105 transition-transform">
            <Camera className="w-5 h-5 text-black" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-serif tracking-[0.2em] text-sm font-semibold uppercase text-white leading-tight">
                PRAZNA
              </span>
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#C9A96E] font-medium">
                Admin Studio
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Menu (Scrolls if viewport is short) */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Studio Management
          </div>
        )}

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-[#C9A96E]/20 to-[#C9A96E]/5 text-[#E5D2A8] border border-[#C9A96E]/40 shadow-gold-glow'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`
            }
          >
            <div className="flex items-center gap-3 min-w-0">
              <item.icon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </div>

            {!isCollapsed && item.badge && (
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${
                  item.badgeColor || 'bg-white/10 text-slate-300 border-white/20'
                }`}
              >
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Footer Profile & Live Link (Fixed at bottom of sticky sidebar) */}
      <div className="p-4 border-t border-white/10 space-y-3 flex-shrink-0 bg-[#0E1118]">
        {/* Return to Live Site */}
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] hover:text-white transition-all border border-white/10 group"
        >
          <div className="flex items-center gap-2.5">
            <ExternalLink className="w-4 h-4 text-[#C9A96E] group-hover:rotate-12 transition-transform" />
            {!isCollapsed && <span>View Live Website</span>}
          </div>
          {!isCollapsed && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
        </Link>

        {/* User Profile Badge */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full ring-2 ring-[#C9A96E]/50 overflow-hidden flex-shrink-0 bg-slate-800">
              <img
                src={
                  adminUser?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                }
                alt={adminUser?.name || 'Admin'}
                className="w-full h-full object-cover"
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-white truncate">
                  {adminUser?.name || 'Studio Admin'}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {adminUser?.email || 'admin@prazna.com'}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            title="Log Out of Admin"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
