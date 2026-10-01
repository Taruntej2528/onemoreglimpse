import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Users,
  Calendar,
  CreditCard,
  Trash2,
  Check,
  RefreshCw,
} from 'lucide-react';
import { notificationsAPI } from '../../services/api';

export const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const normalizeNotification = (n) => ({
    id: n._id || n.id,
    title: n.title,
    message: n.message,
    type: (n.category || n.type || 'system').toLowerCase(),
    priority: n.priority || 'medium',
    time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString() : (n.time || 'Just now'),
    isRead: Boolean(n.isRead),
  });

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationsAPI.getAll();
      if (res?.data) {
        setNotifications(res.data.map(normalizeNotification));
      }
    } catch (err) {
      console.warn('[AdminNotifications] Load failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return !n.isRead;
    return n.type === filter.toLowerCase();
  });

  const markAllAsRead = async () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    try {
      await Promise.all(notifications.filter((n) => !n.isRead).map((n) => notificationsAPI.markAsRead(n.id)));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleRead = async (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
    try {
      await notificationsAPI.markAsRead(id);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    try {
      await notificationsAPI.delete(id);
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'inquiry':
        return Users;
      case 'payment':
        return CreditCard;
      case 'storage':
        return HardDrive;
      case 'event':
        return Calendar;
      default:
        return Bell;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-serif font-bold text-white tracking-wide">
              Notification Center
            </h2>
            {unreadCount > 0 && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time activity logs for client inquiries, shoot deadlines, and cloud storage jobs.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-slate-200 border border-white/10 flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <Check className="w-3.5 h-3.5 text-[#C9A96E]" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-[#11141D] border border-white/10">
        {['All', 'Unread', 'Inquiry', 'Event', 'Storage'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filter === tab
                ? 'bg-[#C9A96E] text-black font-semibold shadow-gold-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((n) => {
            const Icon = getIcon(n.type);
            return (
              <div
                key={n.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-4 ${
                  !n.isRead
                    ? 'bg-gradient-to-r from-white/[0.04] to-[#11141D] border-[#C9A96E]/40 shadow-gold-glow'
                    : 'bg-[#11141D] border-white/5 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl flex-shrink-0 mt-0.5 ${
                    n.priority === 'high'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-[#C9A96E]/10 text-[#C9A96E] border border-[#C9A96E]/20'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white">{n.title}</h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#C9A96E] animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-500 block pt-1">{n.time}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleRead(n.id)}
                    title={n.isRead ? 'Mark as Unread' : 'Mark as Read'}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <CheckCircle2 className={`w-4 h-4 ${n.isRead ? 'text-emerald-400' : ''}`} />
                  </button>
                  <button
                    onClick={() => deleteNotification(n.id)}
                    title="Dismiss Notification"
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-slate-500 rounded-3xl bg-[#11141D] border border-white/10">
            No notifications found in this view
          </div>
        )}
      </div>
    </div>
  );
};
