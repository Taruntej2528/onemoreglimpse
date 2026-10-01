import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar as CalendarIcon,
  Plus,
  MapPin,
  Users,
  Search,
  CheckCircle2,
  Clock,
  Film,
  Camera,
  Filter,
  ArrowRight,
  HardDrive,
  RefreshCw,
  Trash2,
  AlertCircle,
  Upload
} from 'lucide-react';
import { eventsAPI, mediaAPI } from '../../services/api';

export const AdminEvents = () => {
  const [eventsList, setEventsList] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // New Event Form State
  const [newEvent, setNewEvent] = useState({
    couple: '',
    eventType: 'Royal Muhurtham & Grand Reception',
    date: '',
    venue: '',
    city: '',
    package: 'The Royal Heritage Signature (₹4,95,000)',
    status: 'Upcoming',
    coverImage: '',
  });

  const showToast = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const normalizeEvent = (e) => ({
    id: e._id || e.id,
    couple: e.couple || e.name || 'Couple Shoot',
    eventType: e.eventType || (e.type === 'package' ? 'Signature Package' : 'Wedding Celebration'),
    date: e.date || 'TBD 2026',
    venue: e.venue || e.idealFor || 'Palace Destination',
    city: e.city || 'India',
    package: e.package || (e.price ? `₹${e.price.toLocaleString('en-IN')}` : 'Bespoke Package'),
    status: e.status || (e.isActive ? 'Upcoming' : 'Completed'),
    crew: e.crew && e.crew.length > 0
      ? e.crew
      : [
          { name: 'Praveen Kumar', role: 'Lead Fine-Art Master' },
          { name: 'Aditya Roy', role: '4K Cinematographer' },
        ],
    deliverables: e.deliverables || {
      rawStatus: 'Scheduled',
      filmProgress: 0,
      photosEdited: 0,
      totalExpected: 1200,
      albumApproved: false,
    },
    coverImage:
      e.coverImage ||
      'https://res.cloudinary.com/dbwzgdmtv/image/upload/v1768980002/portfolio/gddb5ytprmnhagxmlgew.jpg',
  });

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await eventsAPI.getAll();
      if (res?.data) {
        setEventsList(res.data.map(normalizeEvent));
      }
    } catch (err) {
      console.error('[AdminEvents] Failed to load from MongoDB:', err.message);
      showToast('Error loading shoots from database.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const filterTabs = ['All', 'Upcoming', 'In Progress', 'Post-Production', 'Completed'];

  const filteredEvents = eventsList.filter((event) => {
    const matchesFilter = activeFilter === 'All' || event.status === activeFilter;
    const matchesSearch =
      (event.couple || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.venue || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.city || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.couple || !newEvent.venue) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: newEvent.couple,
        couple: newEvent.couple,
        type: 'event',
        eventType: newEvent.eventType,
        date: newEvent.date || 'TBD 2026',
        venue: newEvent.venue,
        city: newEvent.city || 'India',
        package: newEvent.package,
        status: newEvent.status,
        crew: [
          { name: 'Praveen Kumar', role: 'Lead Fine-Art Master' },
          { name: 'Aditya Roy', role: '4K Cinematographer' },
        ],
        deliverables: {
          rawStatus: 'Scheduled',
          filmProgress: 0,
          photosEdited: 0,
          totalExpected: 1200,
          albumApproved: false,
        },
        coverImage:
          newEvent.coverImage ||
          'https://res.cloudinary.com/dbwzgdmtv/image/upload/v1768980002/portfolio/gddb5ytprmnhagxmlgew.jpg',
      };

      const res = await eventsAPI.create(payload);
      if (res?.data) {
        setEventsList((prev) => [normalizeEvent(res.data), ...prev]);
        showToast(`Shoot for '${newEvent.couple}' scheduled and saved to MongoDB!`);
      } else {
        await loadEvents();
        showToast('Shoot created successfully!');
      }

      setShowAddModal(false);
      setNewEvent({
        couple: '',
        eventType: 'Royal Muhurtham & Grand Reception',
        date: '',
        venue: '',
        city: '',
        package: 'The Royal Heritage Signature (₹4,95,000)',
        status: 'Upcoming',
        coverImage: '',
      });
    } catch (err) {
      console.error('[AdminEvents] Create failed:', err.message);
      showToast(`Failed to create shoot: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (eventId, newStatus) => {
    try {
      setEventsList((prev) =>
        prev.map((ev) => (ev.id === eventId ? { ...ev, status: newStatus } : ev))
      );
      await eventsAPI.update(eventId, { status: newStatus });
      showToast(`Status updated to '${newStatus}' in MongoDB`);
    } catch (err) {
      console.error('[AdminEvents] Update status failed:', err.message);
      showToast('Failed to update status in MongoDB');
      loadEvents();
    }
  };

  const handleDeleteEvent = async (eventId, coupleName) => {
    if (!window.confirm(`Are you sure you want to remove shoot for ${coupleName}?`)) return;

    try {
      setEventsList((prev) => prev.filter((ev) => ev.id !== eventId));
      await eventsAPI.delete(eventId);
      showToast(`Shoot for '${coupleName}' removed from MongoDB`);
    } catch (err) {
      console.error('[AdminEvents] Delete failed:', err.message);
      showToast('Failed to delete event from MongoDB');
      loadEvents();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Toast Notification (Top Right) */}
      {feedbackMsg && typeof document !== 'undefined' && createPortal(
        <div className="fixed top-6 right-6 z-[99999] pointer-events-none animate-fade-in">
          <div className="p-4 rounded-2xl bg-[#C9A96E] text-black font-semibold text-xs shadow-2xl flex items-center gap-3 border border-black/10 backdrop-blur-md">
            <CheckCircle2 className="w-5 h-5 text-black flex-shrink-0" />
            <span className="tracking-wide font-medium">{feedbackMsg}</span>
          </div>
        </div>,
        document.body
      )}

      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-wide flex items-center gap-2.5">
            <span>Shoots & Event Schedule</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#C9A96E]/20 text-[#E5D2A8] font-mono font-medium">
              Live MongoDB
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage wedding itineraries, crew deployments, and client delivery pipelines from the database.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadEvents}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all disabled:opacity-50"
            title="Refresh shoots from MongoDB"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#C9A96E]' : ''}`} />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Shoot</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Status Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#11141D] border border-white/10 overflow-x-auto no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeFilter === tab
                  ? 'bg-[#C9A96E] text-black font-semibold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search couple, venue, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#11141D] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A96E]"
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-96 rounded-3xl bg-white/[0.02] border border-white/5 animate-pulse p-6 space-y-4"
            >
              <div className="h-44 bg-white/5 rounded-2xl" />
              <div className="h-4 bg-white/5 rounded w-3/4" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredEvents.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-[#11141D] border border-white/10 space-y-3">
          <Camera className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-semibold text-white">No Shoots Found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery || activeFilter !== 'All'
              ? 'No shoots match your current search and filter criteria.'
              : 'There are currently no wedding shoots in MongoDB. Schedule your first shoot above!'}
          </p>
        </div>
      )}

      {/* Events Grid */}
      {!loading && filteredEvents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="rounded-3xl bg-[#11141D] border border-white/10 overflow-hidden hover:border-[#C9A96E]/50 transition-all duration-300 flex flex-col group shadow-xl"
            >
              {/* Cover Image & Status Badge */}
              <div className="relative h-48 overflow-hidden bg-black">
                <img
                  src={evt.coverImage}
                  alt={evt.couple}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#11141D] via-[#11141D]/40 to-transparent" />

                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="text-[10px] tracking-wider font-semibold font-mono uppercase px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10">
                    {evt.id.substring(0, 8)}...
                  </span>
                  
                  {/* Status Dropdown */}
                  <select
                    value={evt.status}
                    onChange={(e) => handleUpdateStatus(evt.id, e.target.value)}
                    className={`text-[10px] px-2.5 py-1 rounded-full font-semibold backdrop-blur-md border cursor-pointer focus:outline-none ${
                      evt.status === 'Upcoming'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        : evt.status === 'In Progress'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : evt.status === 'Post-Production'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    <option value="Upcoming" className="bg-[#121622] text-white">Upcoming</option>
                    <option value="In Progress" className="bg-[#121622] text-white">In Progress</option>
                    <option value="Post-Production" className="bg-[#121622] text-white">Post-Production</option>
                    <option value="Completed" className="bg-[#121622] text-white">Completed</option>
                  </select>
                </div>

                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-xl font-serif font-bold text-white tracking-wide truncate">
                    {evt.couple}
                  </h3>
                  <p className="text-xs text-[#E5D2A8] font-medium truncate">{evt.eventType}</p>
                </div>
              </div>

              {/* Event Details Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3 text-[#C9A96E]" />
                        Dates
                      </span>
                      <p className="font-medium text-white truncate">{evt.date}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        Destination
                      </span>
                      <p className="font-medium text-white truncate">
                        {evt.venue}, {evt.city}
                      </p>
                    </div>
                  </div>

                  {/* Package Selected */}
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Package Contract:</span>
                    <span className="font-serif font-bold text-[#E5D2A8] truncate ml-2">
                      {evt.package}
                    </span>
                  </div>

                  {/* Crew Assigned */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-400 font-medium">Assigned Master Crew:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {evt.crew.map((member, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2.5 py-1 rounded-lg bg-white/[0.04] text-slate-300 border border-white/5"
                        >
                          {member.name} • <span className="text-[#C9A96E]">{member.role}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Deliverables Status */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Post-Production Pipeline</span>
                      <span className="font-semibold text-white">
                        {evt.deliverables.photosEdited} / {evt.deliverables.totalExpected} Photos
                      </span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#C9A96E] to-[#E5D2A8] h-full"
                        style={{
                          width: `${Math.round(
                            (evt.deliverables.photosEdited / (evt.deliverables.totalExpected || 1)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Master Film: {evt.deliverables.filmProgress}% complete</span>
                      <span>{evt.deliverables.rawStatus}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Album: {evt.deliverables.albumApproved ? 'Approved by Client' : 'Pending Proofing'}
                  </span>
                  
                  <button
                    onClick={() => handleDeleteEvent(evt.id, evt.couple)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete shoot from MongoDB"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Event Modal */}
      {showAddModal && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="w-full max-w-lg bg-[#121622] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-serif font-bold text-white">Schedule New Wedding Shoot</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Couple Names</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shruti & Vikram"
                  value={newEvent.couple}
                  onChange={(e) => setNewEvent({ ...newEvent, couple: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Dates</label>
                  <input
                    type="text"
                    placeholder="e.g. Dec 24 - 26, 2026"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Status</label>
                  <select
                    value={newEvent.status}
                    onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#181C27] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Post-Production">Post-Production</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Venue</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Taj Krishna Palace"
                    value={newEvent.venue}
                    onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Hyderabad"
                    value={newEvent.city}
                    onChange={(e) => setNewEvent({ ...newEvent, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Package Tier</label>
                <select
                  value={newEvent.package}
                  onChange={(e) => setNewEvent({ ...newEvent, package: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#181C27] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                >
                  <option value="Royal Heritage Grandeur (₹4,95,000)">Royal Heritage Grandeur (₹4,95,000)</option>
                  <option value="Timeless Classical Memoir (₹2,95,000)">Timeless Classical Memoir (₹2,95,000)</option>
                  <option value="Intimate Sacred Vows (₹1,85,000)">Intimate Sacred Vows (₹1,85,000)</option>
                  <option value="Bespoke Luxury Celebration (₹6,50,000)">Bespoke Luxury Celebration (₹6,50,000)</option>
                </select>
              </div>

              {/* Shoot Cover Image Upload */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-300 font-medium">Cover Photo / Still (Cloudinary / Storage)</label>
                  <label className="text-[11px] text-[#C9A96E] hover:underline cursor-pointer flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>{isUploadingCover ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setIsUploadingCover(true);
                          try {
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('folder', 'shoots');
                            formData.append('title', newEvent.couple ? `${newEvent.couple} Cover` : file.name);
                            const res = await mediaAPI.upload(formData);
                            if (res?.data?.url) {
                              setNewEvent((prev) => ({ ...prev, coverImage: res.data.url }));
                              showToast('Cover photo uploaded to Cloudinary/storage!');
                            }
                          } catch (err) {
                            showToast(`Upload failed: ${err.message}`);
                          } finally {
                            setIsUploadingCover(false);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="e.g. https://res.cloudinary.com/... or click Upload Image above"
                  value={newEvent.coverImage}
                  onChange={(e) => setNewEvent({ ...newEvent, coverImage: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                />
                {newEvent.coverImage && (
                  <div className="relative w-full h-24 rounded-xl overflow-hidden border border-white/15 bg-black/40 mt-1.5">
                    <img src={newEvent.coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow hover:opacity-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving to MongoDB...' : 'Save & Assign Crew'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminEvents;
