import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  XCircle,
  FileText,
  Send,
  ExternalLink,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { requestsAPI } from '../../services/api';

export const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const normalizeRequest = (r) => ({
    id: r._id || r.id,
    clientName: r.clientName || 'Couple',
    email: r.email || '',
    phone: r.phone || '',
    eventDates: r.eventDate || r.eventDates || 'To be finalized',
    location: r.eventCity || r.location || 'India',
    estimatedBudget: r.budget || r.estimatedBudget || '₹2.5L - ₹4L',
    status:
      r.status === 'NEW'
        ? 'New'
        : r.status === 'CONFIRMED'
        ? 'Confirmed'
        : r.status === 'DECLINED'
        ? 'Declined'
        : r.status === 'CONTACTED'
        ? 'Quote Sent'
        : r.status === 'IN_PROGRESS'
        ? 'Under Review'
        : r.status || 'New',
    receivedAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : (r.receivedAt || 'Recent'),
    notes: r.notes || 'Interested in royal wedding coverage.',
    servicesRequested: r.selectedPackage
      ? [r.selectedPackage]
      : r.servicesRequested || ['Heritage Cinematic Film', 'Fine-Art Portraits'],
    attachmentUrl: r.attachmentUrl || '',
    attachmentType: r.attachmentType || '',
    attachmentName: r.attachmentName || '',
  });

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await requestsAPI.getAll();
      if (res?.data) {
        const normalized = res.data.map(normalizeRequest);
        setRequests(normalized);
        setSelectedReq(normalized[0] || null);
      }
    } catch (err) {
      console.warn('[AdminRequests] Load failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filterTabs = ['All', 'New', 'Under Review', 'Quote Sent', 'Confirmed', 'Declined'];

  const filteredRequests = requests.filter((req) => {
    const matchesFilter = statusFilter === 'All' || req.status === statusFilter;
    const matchesSearch =
      req.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleUpdateStatus = async (reqId, newStatus) => {
    const updated = requests.map((r) =>
      r.id === reqId ? { ...r, status: newStatus } : r
    );
    setRequests(updated);
    if (selectedReq?.id === reqId) {
      setSelectedReq({ ...selectedReq, status: newStatus });
    }

    try {
      const backendStatusMap = {
        'New': 'NEW',
        'Under Review': 'IN_PROGRESS',
        'Quote Sent': 'CONTACTED',
        'Confirmed': 'CONFIRMED',
        'Declined': 'DECLINED',
      };
      const apiStatus = backendStatusMap[newStatus] || newStatus.toUpperCase();
      await requestsAPI.updateStatus(reqId, apiStatus);
    } catch (err) {
      console.error('[AdminRequests] Update failed:', err.message);
    }
  };

  const handleDeleteRequest = async (reqId) => {
    if (!window.confirm('Are you sure you want to delete this client request?')) return;
    try {
      await requestsAPI.delete(reqId);
      const remaining = requests.filter((r) => r.id !== reqId);
      setRequests(remaining);
      setSelectedReq(remaining[0] || null);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl font-serif font-bold text-white tracking-wide">
          Client Requests & Inquiries
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Review leads generated from the Bespoke Quote Engine and Website Concierge form.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#11141D] border border-white/10">
        <div className="flex flex-wrap items-center gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                statusFilter === tab
                  ? 'bg-[#C9A96E] text-black font-semibold shadow-gold-glow'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search client, email or city..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A96E]/50"
          />
        </div>
      </div>

      {/* Split View or Empty State */}
      {requests.length === 0 && !loading ? (
        <div className="p-12 text-center rounded-3xl bg-[#11141D] border border-white/10 space-y-3">
          <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-semibold text-white">No Client Requests Yet</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Booking inquiries and bespoke quotes submitted by couples on the website will appear here in real time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left List (5 cols) */}
          <div className="lg:col-span-5 space-y-3 max-h-[750px] overflow-y-auto pr-1">
            {filteredRequests.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No inquiries matching filter '{statusFilter}'.
              </div>
            ) : null}
              {filteredRequests.map((req) => {
              const isSelected = selectedReq?.id === req.id;
              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedReq(req)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 relative ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#C9A96E]/15 to-transparent border-[#C9A96E]/50 shadow-gold-glow'
                      : 'bg-[#11141D] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{req.clientName}</span>
                        {req.attachmentUrl && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C9A96E]/20 text-[#E5D2A8] font-semibold border border-[#C9A96E]/30">
                            📎 Attachment
                          </span>
                        )}
                        {req.priority === 'high' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                            Priority
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#C9A96E]" />
                        {req.location}
                      </p>
                    </div>

                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                      req.status === 'New'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : req.status === 'Quote Sent'
                        ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                        : req.status === 'Confirmed'
                        ? 'bg-[#C9A96E]/20 text-[#E5D2A8] border-[#C9A96E]/40'
                        : 'bg-white/10 text-slate-400 border-white/10'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-white/5">
                    <span className="text-slate-400">{req.eventDates}</span>
                    <span className="font-serif font-bold text-[#E5D2A8]">{req.estimatedBudget}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Detail Drawer (7 cols) */}
          <div className="lg:col-span-7">
            {selectedReq ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#11141D] border border-white/10 space-y-6 shadow-2xl sticky top-28">
              
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">{selectedReq.id}</span>
                    <span className="text-xs text-slate-400">• Received {selectedReq.submittedAt}</span>
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-white tracking-wide">
                    {selectedReq.clientName}
                  </h3>
                  <p className="text-xs text-[#E5D2A8] flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#C9A96E]" />
                    {selectedReq.location}
                  </p>
                </div>

                {/* Status Switcher Dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 block">
                    Inquiry Status
                  </label>
                  <select
                    value={selectedReq.status}
                    onChange={(e) => handleUpdateStatus(selectedReq.id, e.target.value)}
                    className="p-2.5 rounded-xl bg-[#181C27] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                  >
                    <option value="New">New</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Quote Sent">Quote Sent</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>
              </div>

              {/* Direct Contact Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={`https://wa.me/${selectedReq.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium flex items-center justify-center gap-2 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Connect via WhatsApp</span>
                </a>

                <a
                  href={`mailto:${selectedReq.email}?subject=Prazna Photography Wedding Inquiry - ${selectedReq.clientName}`}
                  className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 text-xs font-medium flex items-center justify-center gap-2 transition-all"
                >
                  <Mail className="w-4 h-4 text-[#C9A96E]" />
                  <span>Send Official Quote Email</span>
                </a>
              </div>

              {/* Event Metadata Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">Event Timeline</span>
                  <p className="font-semibold text-white">{selectedReq.eventDates}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">Target Budget</span>
                  <p className="font-serif font-bold text-[#E5D2A8] text-sm">{selectedReq.estimatedBudget}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-500 uppercase">Phone</span>
                  <p className="font-semibold text-white">{selectedReq.phone}</p>
                </div>
              </div>

              {/* Services Requested */}
              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-medium">Bespoke Options Selected:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedReq.servicesRequested.map((srv, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-[#C9A96E]/30 text-xs text-[#E5D2A8] flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-[#C9A96E]" />
                      <span>{srv}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Client Notes & Details */}
              <div className="space-y-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-xs text-slate-400 font-medium">Client Vision / Notes:</span>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{selectedReq.notes}"
                </p>
              </div>

              {/* Client Attached Moodboard / Inspiration */}
              {selectedReq.attachmentUrl && (
                <div className="space-y-2.5 p-4 rounded-2xl bg-[#C9A96E]/5 border border-[#C9A96E]/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#E5D2A8] font-semibold flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5 text-[#C9A96E]" />
                      <span>Attached Inspiration / Moodboard Asset:</span>
                    </span>
                    <a
                      href={selectedReq.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#C9A96E] hover:underline flex items-center gap-1"
                    >
                      <span>Open Media</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-white/10 bg-black/50 max-h-52 flex items-center justify-center p-1">
                    {selectedReq.attachmentType === 'video' || selectedReq.attachmentUrl.match(/\.(mp4|webm|mov)$/i) ? (
                      <video src={selectedReq.attachmentUrl} controls className="max-h-48 w-full object-contain" />
                    ) : (
                      <img src={selectedReq.attachmentUrl} alt="Inquiry Attachment" className="max-h-48 w-full object-contain" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{selectedReq.attachmentUrl}</p>
                </div>
              )}

              {/* Bottom Conversion Action */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleDeleteRequest(selectedReq.id)}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Delete Request</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedReq.id, 'Confirmed')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow hover:opacity-95 transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>Convert to Confirmed Shoot</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 rounded-3xl bg-[#11141D] border border-white/10">
              Select an inquiry to view details
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
};
