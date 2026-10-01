import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  ExternalLink,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { notificationsAPI } from '../../services/api';

export const AdminHeader = ({ toggleSidebar }) => {
  const { adminUser } = useAdminAuth();
  const location = useLocation();
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchNotifs = async () => {
      try {
        const res = await notificationsAPI.getAll();
        if (res?.data && isMounted) {
          setNotifications(
            res.data.map((n) => ({
              id: n._id || n.id,
              title: n.title,
              message: n.message,
              time: n.createdAt
                ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Recently',
              isRead: Boolean(n.isRead),
            }))
          );
        }
      } catch (err) {
        // silent fail
      }
    };
    fetchNotifs();
    return () => { isMounted = false; };
  }, [location.pathname]);

  const unreadNotifications = notifications.filter((n) => !n.isRead);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Studio Overview';
    if (path.includes('/events')) return 'Events & Shoot Schedule';
    if (path.includes('/requests')) return 'Client Booking Inquiries';
    if (path.includes('/settings')) return 'Settings & Multi-Cloud Storage';
    if (path.includes('/notifications')) return 'Notification Center';
    if (path.includes('/users')) return 'User Management';
    if (path.includes('/logs')) return 'Audit Logs';
    return 'Admin Studio';
  };

  return (
    /* z-40 ensures header & its dropdowns sit above all page content (z-30 or less) */
    <header className="h-20 bg-[#0E1118]/80 backdrop-blur-xl border-b border-white/10 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-40">

      {/* Left: Mobile Menu & Breadcrumb Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 lg:hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
            <span>Prazna Photography</span>
            <span>/</span>
            <span className="text-[#C9A96E]">Admin Portal</span>
          </div>
          <h1 className="text-lg sm:text-xl font-serif text-white font-semibold tracking-wide">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Center: Quick Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search bookings, couples, venues, or files..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A96E]/50 focus:ring-1 focus:ring-[#C9A96E]/50 transition-all"
          />
        </div>
      </div>

      {/* Right: Notifications & Live Site */}
      <div className="flex items-center gap-3">

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationsDropdown((prev) => !prev)}
            className="relative p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 transition-colors"
            aria-label="Open notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0E1118]" />
            )}
          </button>

          {showNotificationsDropdown && (
            <>
              {/* Invisible click-away layer so dropdown closes when you click outside */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotificationsDropdown(false)}
              />
              {/* Dropdown — z-50 so it's above the backdrop */}
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#121622] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">Notifications</span>
                    {unreadNotifications.length > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C9A96E]/20 text-[#E5D2A8] font-bold">
                        {unreadNotifications.length} New
                      </span>
                    )}
                  </div>
                  <Link
                    to="/admin/notifications"
                    onClick={() => setShowNotificationsDropdown(false)}
                    className="text-xs text-[#C9A96E] hover:underline"
                  >
                    View All
                  </Link>
                </div>

                <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="py-4 text-center text-xs text-slate-500">No notifications yet</p>
                  ) : (
                    notifications.slice(0, 5).map((notif) => (
                      <div key={notif.id} className="py-3 flex items-start gap-3">
                        <span
                          className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            notif.isRead ? 'bg-slate-600' : 'bg-[#C9A96E]'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{notif.title}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{notif.message}</p>
                          <span className="text-[10px] text-slate-500 mt-1 block">{notif.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Live Site Link */}
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          title="Open Website in New Tab"
          className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#C9A96E]" />
          <span>Live Site</span>
        </Link>
      </div>
    </header>
  );
};
