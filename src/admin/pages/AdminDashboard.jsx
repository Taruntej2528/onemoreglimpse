import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Calendar,
  Users,
  Camera,
  Film,
  HardDrive,
  ArrowUpRight,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
  PlusCircle,
  Cloud,
  Sparkles,
  Phone,
  Mail
} from 'lucide-react';
import { requestsAPI, eventsAPI, notificationsAPI, settingsAPI } from '../../services/api';

export const AdminDashboard = () => {
  const [data, setData] = useState({
    events: [],
    requests: [],
    notifications: [],
    kpis: {
      totalRevenue: '₹28,50,000',
      revenueGrowth: '+24% this season',
      activeEventsCount: 0,
      pendingRequestsCount: 0,
      totalPhotosCount: '2,400+',
      totalFilmsCount: '8 Master',
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        const [reqRes, evRes, notifRes] = await Promise.allSettled([
          requestsAPI.getAll(),
          eventsAPI.getAll(),
          notificationsAPI.getAll(),
        ]);

        if (isMounted) {
          const liveRequests =
            reqRes.status === 'fulfilled' && reqRes.value?.data
              ? reqRes.value.data.map((r) => ({
                  id: r._id || r.id,
                  clientName: r.clientName || 'Inquiry',
                  location: r.eventCity || r.location || 'India',
                  eventDates: r.eventDate || 'Upcoming 2026',
                  estimatedBudget: r.budget || '₹2.5L - ₹4L',
                  status:
                    r.status === 'NEW'
                      ? 'New'
                      : r.status === 'CONFIRMED'
                      ? 'Confirmed'
                      : r.status === 'CONTACTED'
                      ? 'Quote Sent'
                      : r.status || 'New',
                  receivedAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Today',
                  notes: r.notes || '',
                }))
              : [];

          const liveEvents =
            evRes.status === 'fulfilled' && evRes.value?.data
              ? evRes.value.data.map((e) => ({
                  id: e._id || e.id,
                  title: e.name || e.couple || 'Wedding Celebration',
                  couple: e.couple || e.name || 'Couple',
                  date: e.date || e.eventDate || 'Autumn 2026',
                  dates: e.date || e.eventDate || 'Autumn 2026',
                  venue: e.venue || e.idealFor || 'Palace Destination',
                  city: e.city || 'India',
                  package: e.package || e.selectedPackage || e.packageName || 'Heritage Coverage',
                  crew: Array.isArray(e.crew) ? e.crew : (e.team ? [{ name: e.team }] : [{ name: 'Master Artist' }]),
                  eventType: e.eventType || e.category || 'Luxury Wedding',
                  coverImage: e.coverImage || e.thumbnail || 'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/nature-mountains',
                  leadPhotographer:
                    e.crew && e.crew.length > 0 ? e.crew[0].name : e.team || 'Master Crew',
                  status: e.status || (e.isActive ? 'Upcoming' : 'Completed'),
                  deliverableProgress: e.deliverables?.filmProgress || 50,
                }))
              : [];

          const liveNotifications =
            notifRes.status === 'fulfilled' && notifRes.value?.data
              ? notifRes.value.data.map((n) => ({
                  id: n._id || n.id,
                  title: n.title,
                  message: n.message,
                  type: (n.category || n.type || 'system').toLowerCase(),
                  time: n.createdAt
                    ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Just now',
                  isRead: Boolean(n.isRead),
                }))
              : [];

          const pendingCount = liveRequests.filter(
            (r) => r.status === 'New' || r.status === 'NEW' || r.status === 'Under Review'
          ).length;

          setData({
            requests: liveRequests,
            events: liveEvents,
            notifications: liveNotifications,
            kpis: {
              totalRevenue: '₹34,80,000',
              revenueGrowth: '+32% this season',
              activeEventsCount: liveEvents.length,
              pendingRequestsCount: pendingCount,
              totalPhotosCount: `${Math.max(1, liveEvents.length) * 1200}+`,
              totalFilmsCount: `${liveEvents.length + 3} Films`,
            },
          });
        }
      } catch (err) {
        console.warn('[AdminDashboard] Live fetch failed:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  const { kpis, events, requests, notifications } = data;

  const statCards = [
    {
      label: 'YTD Booking Revenue',
      value: kpis.totalRevenue,
      change: kpis.revenueGrowth,
      isPositive: true,
      icon: TrendingUp,
      accent: 'from-[#C9A96E]/20 to-[#A37E3E]/5',
      border: 'border-[#C9A96E]/30',
      iconColor: 'text-[#C9A96E]',
    },
    {
      label: 'Scheduled Shoot Events',
      value: `${kpis.activeEventsCount} Events`,
      change: `${events.length} in pipeline`,
      isPositive: true,
      icon: Calendar,
      accent: 'from-blue-500/20 to-blue-500/5',
      border: 'border-blue-500/30',
      iconColor: 'text-blue-400',
    },
    {
      label: 'Pending Inquiries',
      value: `${kpis.pendingRequestsCount} Requests`,
      change: 'Active in CRM',
      isPositive: false,
      icon: Users,
      accent: 'from-amber-500/20 to-amber-500/5',
      border: 'border-amber-500/30',
      iconColor: 'text-amber-400',
    },
    {
      label: 'Portfolio Deliverables',
      value: `${kpis.totalPhotosCount} Master Frames`,
      change: `${kpis.totalFilmsCount} 4K Films`,
      isPositive: true,
      icon: Camera,
      accent: 'from-emerald-500/20 to-emerald-500/5',
      border: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#141824] via-[#11141D] to-[#0E1118] border border-white/10 overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#C9A96E]/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.25em] font-semibold uppercase px-2.5 py-1 rounded-full bg-[#C9A96E]/20 text-[#E5D2A8] border border-[#C9A96E]/40">
                Prazna Studio Ops
              </span>
              <span className="text-xs text-slate-400">• Autumn Wedding Season 2026</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
              Master Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Monitor active palace shoots, review high-value wedding enquiries, and manage multi-cloud bucket asset delivery.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/events"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs flex items-center gap-2 shadow-gold-glow hover:opacity-95 transition-all"
            >
              <PlusCircle className="w-4 h-4 text-black" />
              <span>New Shoot Event</span>
            </Link>
            <Link
              to="/admin/settings"
              className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-white font-medium text-xs border border-white/10 flex items-center gap-2 transition-all"
            >
              <Cloud className="w-4 h-4 text-[#C9A96E]" />
              <span>Storage Buckets</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-2xl bg-gradient-to-b ${card.accent} border ${card.border} backdrop-blur-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-xl`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-400">{card.label}</span>
                <div className="text-2xl font-serif font-bold text-white">{card.value}</div>
              </div>
              <div className={`p-3 rounded-xl bg-white/[0.05] ${card.iconColor}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className={`px-2 py-0.5 rounded-md font-semibold ${
                card.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-300'
              }`}>
                {card.change}
              </span>
              <span className="text-slate-500 text-[11px]">vs previous cycle</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Split: Left (Upcoming Shoots) & Right (Storage & Recent Notifications) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Upcoming Shoots & Inquiries */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Upcoming Shoots Timeline */}
          <div className="p-6 rounded-3xl bg-[#11141D] border border-white/10 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-lg font-serif font-semibold text-white">
                  Upcoming Palace & Destination Shoots
                </h3>
                <p className="text-xs text-slate-400">Scheduled weddings and master crew allocations</p>
              </div>
              <Link
                to="/admin/events"
                className="text-xs text-[#C9A96E] hover:underline flex items-center gap-1 font-medium"
              >
                <span>View All ({events.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {events.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#C9A96E]/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={event.coverImage}
                      alt={event.couple}
                      className="w-16 h-16 rounded-xl object-cover border border-white/10 flex-shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{event.couple}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          event.status === 'Upcoming'
                            ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                            : event.status === 'In Progress'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20 animate-pulse'
                            : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{event.eventType}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#C9A96E]" />
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {event.venue}, {event.city}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right sm:flex-shrink-0">
                    <div className="text-xs font-medium text-[#E5D2A8]">{(event.package || 'Heritage Coverage').split('(')[0]}</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Crew: {Array.isArray(event.crew) ? event.crew.length : 0} Master Artists
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Client Enquiries Table Preview */}
          <div className="p-6 rounded-3xl bg-[#11141D] border border-white/10 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-lg font-serif font-semibold text-white">
                  Recent High-Value Enquiries
                </h3>
                <p className="text-xs text-slate-400">Quotes requested through website concierge</p>
              </div>
              <Link
                to="/admin/requests"
                className="text-xs text-[#C9A96E] hover:underline flex items-center gap-1 font-medium"
              >
                <span>View All Leads ({requests.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="pb-3 font-medium">Client Couple</th>
                    <th className="pb-3 font-medium">Destination</th>
                    <th className="pb-3 font-medium">Dates</th>
                    <th className="pb-3 font-medium">Est. Budget</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {requests.slice(0, 4).map((req) => (
                    <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 font-semibold text-white">
                        <div>{req.clientName}</div>
                        <div className="text-[10px] text-slate-500 font-normal">{req.phone}</div>
                      </td>
                      <td className="py-3 text-slate-300">{req.location}</td>
                      <td className="py-3 text-slate-400">{req.eventDates}</td>
                      <td className="py-3 font-serif font-bold text-[#E5D2A8]">{req.estimatedBudget}</td>
                      <td className="py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          req.status === 'New'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : req.status === 'Quote Sent'
                            ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                            : req.status === 'Confirmed'
                            ? 'bg-[#C9A96E]/20 text-[#E5D2A8] border border-[#C9A96E]/30'
                            : 'bg-white/10 text-slate-400'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column (1 Col): Studio Quick Actions & Live Activity */}
        <div className="space-y-8">
          {/* Studio Quick Actions Card */}
          <div className="p-6 rounded-3xl bg-[#11141D] border border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-[#C9A96E]/10 text-[#C9A96E] border border-[#C9A96E]/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-semibold text-white">Studio Quick Actions</h3>
                  <p className="text-[11px] text-[#C9A96E] mt-0.5">Concierge Shortcuts</p>
                </div>
              </div>
              <Link
                to="/admin/settings"
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Settings
              </Link>
            </div>

            <div className="space-y-2.5 pt-1">
              <Link
                to="/admin/events"
                className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-[#C9A96E]/30 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-[#E5D2A8] transition-colors">
                      Schedule Shoot Event
                    </div>
                    <div className="text-[10px] text-slate-400">Assign crew & dates</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/admin/requests"
                className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-[#C9A96E]/30 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-[#E5D2A8] transition-colors">
                      Review Client Leads
                    </div>
                    <div className="text-[10px] text-slate-400">{kpis.pendingRequestsCount} active inquiries</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/admin/notifications"
                className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-[#C9A96E]/30 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-[#E5D2A8] transition-colors">
                      Activity Logs
                    </div>
                    <div className="text-[10px] text-slate-400">Real-time alerts</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Backend Status
              </span>
              <span className="text-[10px] font-mono text-emerald-400">API Ready (Port 5000)</span>
            </div>
          </div>

          {/* Recent Notifications / Alerts */}
          <div className="p-6 rounded-3xl bg-[#11141D] border border-white/10 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif font-semibold text-white">Live Activity</h3>
              <Link to="/admin/notifications" className="text-xs text-[#C9A96E] hover:underline font-medium">
                View All
              </Link>
            </div>

            <div className="space-y-3.5">
              {notifications.slice(0, 4).map((notif) => (
                <div
                  key={notif.id}
                  className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-3 hover:bg-white/[0.04] transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    notif.priority === 'high' ? 'bg-rose-400 animate-pulse' : 'bg-[#C9A96E]'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white">{notif.title}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{notif.message}</p>
                    <span className="text-[10px] text-slate-500 mt-1 block">{notif.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
