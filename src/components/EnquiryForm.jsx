import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  CheckCircle2, 
  MessageCircle, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Mail, 
  Phone, 
  User, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Heart,
  Check,
  Upload,
  X,
  Film,
  Image as ImageIcon,
  Paperclip,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { siteConfig } from '../config/siteConfig';
import { useSite } from '../context/SiteContext';
import { mediaAPI } from '../services/api';

export const EnquiryForm = ({ isDarkMode }) => {
  const { brand: liveBrand, submitInquiry } = useSite();
  const brand = liveBrand || siteConfig.brand || {};

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: 'Sacred Muhurtham (Wedding)',
    eventDate: '',
    location: '',
    budget: '₹2.5L - ₹4L',
    notes: '',
  });

  const [attachment, setAttachment] = useState(null); // { url, type, name, size }
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const eventTypes = [
    "Sacred Muhurtham (Wedding)",
    "Grand Reception Gala",
    "Sangeet & Cocktails",
    "Haldi & Mehendi",
    "Pre-Wedding Cinema",
    "Complete 3-Day Wedding"
  ];

  const budgetOptions = [
    "₹1.5L - ₹2.5L",
    "₹2.5L - ₹4L",
    "₹4L - ₹6.5L",
    "Bespoke Royal (₹7L+)"
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectEventType = (type) => {
    setFormData({ ...formData, eventType: type });
  };

  const handleSelectBudget = (budget) => {
    setFormData({ ...formData, budget: budget });
  };

  const handleAttachmentUpload = async (file) => {
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      setUploadError('File exceeds 100MB limit.');
      return;
    }

    setIsUploadingAttachment(true);
    setUploadError('');

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('title', `${formData.name || 'Client'} - Moodboard / Inspiration`);

      const res = await mediaAPI.uploadPublic(uploadData);
      if (res?.data?.url) {
        setAttachment({
          url: res.data.url,
          type: res.data.type,
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2),
        });
      } else {
        throw new Error('Upload succeeded but no link was returned');
      }
    } catch (err) {
      console.error('[Attachment Upload Error]', err);
      setUploadError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    confetti({
      particleCount: 85,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#56876D', '#C9A96E', '#1A1D20', '#FFFFFF'],
    });

    // 1. Submit lead to MongoDB backend ClientRequests & Notifications
    await submitInquiry({
      clientName: formData.name,
      email: formData.email,
      phone: formData.phone,
      eventType: formData.eventType,
      eventDate: formData.eventDate,
      eventCity: formData.location,
      budget: formData.budget,
      notes: formData.notes,
      attachmentUrl: attachment?.url || '',
      attachmentType: attachment?.type || '',
      attachmentName: attachment?.name || '',
      source: 'enquiry_form',
    });

    // 2. Open WhatsApp for instantaneous concierge engagement
    const brandName = brand?.name || siteConfig.brand.name;
    let msg = `✨ *Wedding Date Reservation Enquiry - ${brandName}* ✨
-----------------------------------------
👤 *Couple / Client:* ${formData.name}
📱 *Phone:* ${formData.phone}
✉️ *Email:* ${formData.email || 'Not provided'}
🎉 *Event Celebration:* ${formData.eventType}
📅 *Event Date:* ${formData.eventDate || 'To be finalized'}
📍 *Destination / City:* ${formData.location || 'Not provided'}
💰 *Budget Bracket:* ${formData.budget}
📝 *Vision / Notes:* ${formData.notes || 'None'}`;

    if (attachment?.url) {
      msg += `\n📎 *Moodboard / Attachment:* ${attachment.url}`;
    }

    msg += `\n-----------------------------------------
Hi Prazna Team, please check your availability for our dates and share the next steps!`;

    const cleanNumber = (brand?.whatsappNumber || siteConfig.brand.whatsappNumber || '919876543210').replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    setSubmitted(true);
  };

  return (
    <section id="booking" className={`min-h-screen w-full flex items-center justify-center transition-colors duration-300 py-16 px-4 sm:px-6 lg:px-12 relative overflow-hidden ${
      isDarkMode ? 'bg-[#0A0C11]' : 'bg-[#FAF8F5]'
    }`}>
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-[#56876D]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-[#C9A96E]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto relative z-10">
        
        {/* Full-Screen Edge-to-Edge Container Card */}
        <div className={`rounded-3xl lg:rounded-[36px] overflow-hidden border transition-all duration-300 shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[85vh] ${
          isDarkMode 
            ? 'bg-[#121622] border-white/10' 
            : 'bg-white border-[#EAE6DE]'
        }`}>
          
          {/* LEFT COLUMN: Editorial Visual & Studio Concierge (5 Columns) */}
          <div className="lg:col-span-5 relative overflow-hidden p-8 sm:p-12 flex flex-col justify-between bg-black text-white min-h-[420px] lg:min-h-full">
            
            {/* Background Editorial Visual */}
            <div className="absolute inset-0 z-0">
              <img
                src="https://res.cloudinary.com/dbwzgdmtv/image/upload/v1768980002/portfolio/gddb5ytprmnhagxmlgew.jpg"
                alt="Editorial Bridal Background"
                className="w-full h-full object-cover opacity-45 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40" />
            </div>

            {/* Top Brand & Status */}
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-medium tracking-wide uppercase text-white/90">
                  Concierge Desk Online
                </span>
              </div>

              <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.15] text-white">
                Let's Immortalize <br />
                <span className="italic font-light text-[#E5D2A8]">Your Story</span>
              </h3>

              <p className="text-xs sm:text-sm text-white/80 font-light leading-relaxed max-w-md">
                Every wedding we document is an unrepeatable epic. Reserve your celebration dates early as our master team accepts limited commissions each season.
              </p>
            </div>

            {/* Middle Feature Highlights */}
            <div className="relative z-10 my-8 space-y-3.5 pt-4 border-t border-white/15">
              <div className="flex items-center gap-3 text-xs text-white/90">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-3.5 h-3.5 text-[#56876D]" />
                </div>
                <span>Average Response Time: Under 30 Minutes</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-white/90">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C9A96E]" />
                </div>
                <span>Confidential, Transparent &amp; Contracted Pricing</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-white/90">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-[#56876D]" />
                </div>
                <span>{siteConfig.brand.location}</span>
              </div>
            </div>

            {/* Bottom Direct Channels */}
            <div className="relative z-10 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] text-white/60 uppercase tracking-widest block">Direct Phone</span>
                <a href={`tel:${siteConfig.brand.phone.replace(/[^0-9+]/g, '')}`} className="font-medium text-white hover:underline">
                  {siteConfig.brand.phone}
                </a>
              </div>

              <div>
                <span className="text-[10px] text-white/60 uppercase tracking-widest block">Studio Email</span>
                <a href={`mailto:${siteConfig.brand.email}`} className="font-medium text-white hover:underline">
                  {siteConfig.brand.email}
                </a>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Full-Screen Luxury Interactive Form (7 Columns) */}
          <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-center">
            
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-[1.5px] bg-[#56876D]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#56876D]">
                  RESERVE YOUR CELEBRATION DATES
                </span>
              </div>
              <h2 className={`font-serif text-2xl sm:text-4xl font-normal ${
                isDarkMode ? 'text-white' : 'text-[#1A1D20]'
              }`}>
                Wedding Date Inquiry
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* 1. Select Celebration Type Chips */}
              <div>
                <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-2.5 ${
                  isDarkMode ? 'text-neutral-300' : 'text-[#5C6470]'
                }`}>
                  Select Event Celebration *
                </label>
                <div className="flex flex-wrap gap-2">
                  {eventTypes.map((type) => {
                    const isSelected = formData.eventType === type;
                    return (
                      <button
                        type="button"
                        key={type}
                        onClick={() => handleSelectEventType(type)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#56876D] text-white shadow-sm font-semibold'
                            : isDarkMode
                              ? 'bg-[#0C0E14] text-neutral-300 hover:text-white border border-white/10'
                              : 'bg-[#FAF8F5] text-[#5C6470] hover:text-[#1A1D20] border border-[#E0DCD3]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        <span>{type}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Your Name, Phone, Email */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${
                    isDarkMode ? 'text-neutral-400' : 'text-[#5C6470]'
                  }`}>
                    Your Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Diya &amp; Rohan"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full rounded-xl pl-10 pr-3.5 py-2.5 text-sm outline-none transition-colors border ${
                        isDarkMode
                          ? 'bg-[#0C0E14] border-white/15 text-white placeholder-neutral-500 focus:border-[#56876D]'
                          : 'bg-white border-[#E0DCD3] text-[#1A1D20] placeholder-neutral-400 focus:border-[#56876D]'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${
                    isDarkMode ? 'text-neutral-400' : 'text-[#5C6470]'
                  }`}>
                    WhatsApp Phone *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full rounded-xl pl-10 pr-3.5 py-2.5 text-sm outline-none transition-colors border ${
                        isDarkMode
                          ? 'bg-[#0C0E14] border-white/15 text-white placeholder-neutral-500 focus:border-[#56876D]'
                          : 'bg-white border-[#E0DCD3] text-[#1A1D20] placeholder-neutral-400 focus:border-[#56876D]'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${
                    isDarkMode ? 'text-neutral-400' : 'text-[#5C6470]'
                  }`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      name="email"
                      placeholder="you@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full rounded-xl pl-10 pr-3.5 py-2.5 text-sm outline-none transition-colors border ${
                        isDarkMode
                          ? 'bg-[#0C0E14] border-white/15 text-white placeholder-neutral-500 focus:border-[#56876D]'
                          : 'bg-white border-[#E0DCD3] text-[#1A1D20] placeholder-neutral-400 focus:border-[#56876D]'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Event Date & Event Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${
                    isDarkMode ? 'text-neutral-400' : 'text-[#5C6470]'
                  }`}>
                    Wedding Date *
                  </label>
                  <input
                    type="date"
                    name="eventDate"
                    required
                    value={formData.eventDate}
                    onChange={handleChange}
                    className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors border ${
                      isDarkMode
                        ? 'bg-[#0C0E14] border-white/15 text-white focus:border-[#56876D]'
                        : 'bg-white border-[#E0DCD3] text-[#1A1D20] focus:border-[#56876D]'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${
                    isDarkMode ? 'text-neutral-400' : 'text-[#5C6470]'
                  }`}>
                    Venue / City / Destination *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      name="location"
                      required
                      placeholder="e.g. Udaipur, Falaknuma, Goa, Bali"
                      value={formData.location}
                      onChange={handleChange}
                      className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-colors border ${
                        isDarkMode
                          ? 'bg-[#0C0E14] border-white/15 text-white placeholder-neutral-500 focus:border-[#56876D]'
                          : 'bg-white border-[#E0DCD3] text-[#1A1D20] placeholder-neutral-400 focus:border-[#56876D]'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* 4. Budget Range Chips */}
              <div>
                <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-2 ${
                  isDarkMode ? 'text-neutral-300' : 'text-[#5C6470]'
                }`}>
                  Approximate Budget Bracket
                </label>
                <div className="flex flex-wrap gap-2">
                  {budgetOptions.map((b) => {
                    const isSelected = formData.budget === b;
                    return (
                      <button
                        type="button"
                        key={b}
                        onClick={() => handleSelectBudget(b)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-[#1A1D20] text-white dark:bg-white dark:text-black font-semibold shadow-sm'
                            : isDarkMode
                              ? 'bg-[#0C0E14] text-neutral-300 hover:text-white border border-white/10'
                              : 'bg-[#FAF8F5] text-[#5C6470] hover:text-[#1A1D20] border border-[#E0DCD3]'
                        }`}
                      >
                        {b}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Special Notes / Vision */}
              <div>
                <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${
                  isDarkMode ? 'text-neutral-400' : 'text-[#5C6470]'
                }`}>
                  Celebration Details / Cultural Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Tell us about the celebration vibe, specific cultural rituals, or team preferences..."
                  value={formData.notes}
                  onChange={handleChange}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors border resize-none ${
                    isDarkMode
                      ? 'bg-[#0C0E14] border-white/15 text-white placeholder-neutral-500 focus:border-[#56876D]'
                      : 'bg-white border-[#E0DCD3] text-[#1A1D20] placeholder-neutral-400 focus:border-[#56876D]'
                  }`}
                />
              </div>

              {/* 6. Optional Moodboard / Invitation Upload */}
              <div>
                <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${
                  isDarkMode ? 'text-neutral-400' : 'text-[#5C6470]'
                }`}>
                  Attach Moodboard / Inspiration / Invitation Card (Optional)
                </label>

                {uploadError && (
                  <p className="text-xs text-rose-400 mb-2">{uploadError}</p>
                )}

                {attachment ? (
                  <div className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                    isDarkMode ? 'bg-white/[0.03] border-emerald-500/30' : 'bg-emerald-50/50 border-emerald-500/30'
                  }`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/40 flex items-center justify-center flex-shrink-0 border border-white/10">
                        {attachment.type === 'video' ? (
                          <Film className="w-5 h-5 text-[#C9A96E]" />
                        ) : (
                          <img src={attachment.url} alt="Attachment" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className={`text-xs font-semibold truncate ${isDarkMode ? 'text-white' : 'text-[#1A1D20]'}`}>
                            {attachment.name}
                          </p>
                          <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Attached
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 font-mono">
                          {attachment.size} MB • Stored in Cloud
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAttachment(null)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-2 cursor-pointer"
                      title="Remove attachment"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className={`block border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                    isDarkMode
                      ? 'border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]'
                      : 'border-[#E0DCD3] bg-white hover:border-[#56876D] hover:bg-[#FAF8F5]'
                  }`}>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      disabled={isUploadingAttachment}
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleAttachmentUpload(f);
                      }}
                    />

                    {isUploadingAttachment ? (
                      <div className="flex items-center justify-center gap-2 py-2 text-xs text-[#C9A96E]">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Uploading file to secure cloud storage...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3 py-1">
                        <div className="p-2 rounded-xl bg-neutral-500/10 text-[#C9A96E]">
                          <Paperclip className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className={`text-xs font-medium ${isDarkMode ? 'text-neutral-200' : 'text-[#1A1D20]'}`}>
                            Click or drag wedding invitation, moodboard, or video clip
                          </p>
                          <p className="text-[10px] text-neutral-400">
                            PNG, JPG, WebP, or MP4 (Max 100MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </label>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <button
                  type="submit"
                  id="enquiry-submit-btn"
                  className="w-full sm:w-auto px-8 py-4 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Reserve Date via WhatsApp</span>
                </button>

                <p className={`text-xs ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  Instant response • Zero obligation • Dates held provisionally for 48 hours
                </p>
              </div>

              {submitted && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Inquiry sent to our senior concierge on WhatsApp! We will check availability immediately.</span>
                </div>
              )}

            </form>

          </div>

        </div>

      </div>
    </section>
  );
};
