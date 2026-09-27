import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Check, 
  Plus, 
  Minus, 
  Camera, 
  Video, 
  Plane, 
  BookOpen, 
  Film, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  MessageCircle, 
  Share2, 
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Award,
  Zap,
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { siteConfig } from '../config/siteConfig';

export const InteractiveQuoteEngine = ({ isDarkMode, onOpenCustomModal }) => {
  // Mode: "curated" (Signature Packages) vs "custom" (Bespoke Builder)
  const [activeTab, setActiveTab] = useState('curated');

  // Bespoke Builder Selections
  const [selectedEvents, setSelectedEvents] = useState(['wedding', 'sangeeth']);
  const [photographerCount, setPhotographerCount] = useState(2);
  const [videographerCount, setVideographerCount] = useState(2);
  const [droneIncluded, setDroneIncluded] = useState(true);
  const [teaserReelIncluded, setTeaserReelIncluded] = useState(true);
  const [albumIncluded, setAlbumIncluded] = useState(true);

  // Client Details
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventCity, setEventCity] = useState('');
  const [copied, setCopied] = useState(false);

  // Toggle events
  const toggleEvent = (eventId) => {
    setSelectedEvents((prev) => {
      if (prev.includes(eventId)) {
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== eventId);
      } else {
        return [...prev, eventId];
      }
    });
  };

  // Pricing calculation
  const calculation = useMemo(() => {
    let eventsTotal = 0;
    const selectedEventObjs = siteConfig.quoteEvents.filter((ev) =>
      selectedEvents.includes(ev.id)
    );
    selectedEventObjs.forEach((ev) => {
      eventsTotal += ev.basePrice;
    });

    const eventCount = selectedEvents.length;
    const extraPhotos = Math.max(0, photographerCount - 1);
    const extraVideos = Math.max(0, videographerCount - 1);

    const extraPhotoCost = extraPhotos * siteConfig.teamAddOns.photographerRate * eventCount;
    const extraVideoCost = extraVideos * siteConfig.teamAddOns.videographerRate * eventCount;
    const droneCost = droneIncluded ? siteConfig.teamAddOns.droneRate * eventCount : 0;
    const teaserCost = teaserReelIncluded ? siteConfig.teamAddOns.teaserReelRate * eventCount : 0;
    const albumCost = albumIncluded ? siteConfig.teamAddOns.albumRate : 0;

    const grandTotal = eventsTotal + extraPhotoCost + extraVideoCost + droneCost + teaserCost + albumCost;

    return {
      eventsTotal,
      selectedEventObjs,
      extraPhotoCost,
      extraVideoCost,
      droneCost,
      teaserCost,
      albumCost,
      grandTotal,
    };
  }, [
    selectedEvents,
    photographerCount,
    videographerCount,
    droneIncluded,
    teaserReelIncluded,
    albumIncluded,
  ]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Send Signature Package to WhatsApp
  const handleReservePackage = (pkg) => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#56876D', '#C9A96E', '#1A1D20'],
    });

    const msg = `✨ *Wedding Photography Inquiry - ${siteConfig.brand.name}* ✨
-----------------------------------------
👑 *Selected Signature Collection:* ${pkg.name}
💰 *Package Investment:* ${formatCurrency(pkg.price)}
🎯 *Ideal For:* ${pkg.idealFor}
🎥 *Crew Size:* ${pkg.team}

📦 *Key Inclusions:*
${pkg.inclusions.map(inc => `• ${inc}`).join('\n')}
-----------------------------------------
Hi Prazna Studio, please check date availability and send me the detailed contract!`;

    const cleanNumber = siteConfig.brand.whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Send Bespoke Custom Quote to WhatsApp
  const handleSendCustomQuote = () => {
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#56876D', '#C9A96E', '#FFFFFF'],
    });

    const quoteId = `PRZ-${Math.floor(100 + Math.random() * 900)}`;

    const msg = `✨ *Bespoke Wedding Quote [Ref: ${quoteId}] - ${siteConfig.brand.name}* ✨
-----------------------------------------
👤 *Client Name:* ${clientName || 'Not specified'}
📱 *Phone:* ${clientPhone || 'Not specified'}
📅 *Wedding Dates:* ${eventDate || 'To be decided'}
📍 *Destination / Venue:* ${eventCity || 'Not specified'}

🎉 *Selected Celebrations (${selectedEvents.length}):*
${calculation.selectedEventObjs.map((e) => `• ${e.name} (${formatCurrency(e.basePrice)})`).join('\n')}

🎥 *Tailored Crew & Deliverables:*
• Fine-Art Photographers: ${photographerCount} dedicated members
• 4K Cinematographers: ${videographerCount} dedicated members
• Aerial 4K Drone Coverage: ${droneIncluded ? 'Included' : 'No'}
• 48-Hour Instagram Reels: ${teaserReelIncluded ? 'Included' : 'No'}
• Handcrafted Italian Heirloom Album: ${albumIncluded ? 'Included' : 'No'}

💰 *Estimated Investment:* ${formatCurrency(calculation.grandTotal)}
-----------------------------------------
Please verify date availability and reserve this quote configuration!`;

    const cleanNumber = siteConfig.brand.whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleCopyQuote = () => {
    const quoteId = `PRZ-${Math.floor(100 + Math.random() * 900)}`;
    const summary = `Prazna Photography Quote [Ref: ${quoteId}]
Total: ${formatCurrency(calculation.grandTotal)}
Events: ${calculation.selectedEventObjs.map(e => e.name).join(', ')}
Crew: ${photographerCount} Photographers, ${videographerCount} Cinematographers
Drone: ${droneIncluded ? 'Yes' : 'No'} | Album: ${albumIncluded ? 'Yes' : 'No'}
Contact: ${siteConfig.brand.phone}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <section id="custom-quote" className={`py-24 transition-colors duration-300 relative overflow-hidden ${
      isDarkMode ? 'bg-[#0C0E14]' : 'bg-[#FAF8F5]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-6 h-[1.5px] bg-[#56876D]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#56876D]">
              TRANSPARENT INVESTMENT
            </span>
            <span className="w-6 h-[1.5px] bg-[#56876D]" />
          </div>

          <h2 className={`font-serif text-3xl sm:text-5xl font-normal tracking-tight ${
            isDarkMode ? 'text-white' : 'text-[#1A1D20]'
          }`}>
            Quotation &amp; Collections
          </h2>

          <p className={`text-xs sm:text-base font-light mt-3 leading-relaxed ${
            isDarkMode ? 'text-neutral-400' : 'text-[#5C6470]'
          }`}>
            Choose from our all-inclusive signature collections or craft a custom bespoke package tailored to your exact celebration timeline.
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setActiveTab('curated')}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'curated'
                  ? isDarkMode
                    ? 'bg-white text-black shadow-lg'
                    : 'bg-[#1A1D20] text-white shadow-lg'
                  : isDarkMode
                    ? 'bg-[#141824] text-neutral-400 hover:text-white border border-white/10'
                    : 'bg-white text-[#5C6470] hover:text-[#1A1D20] border border-[#E0DCD3]'
              }`}
            >
              <Award className="w-4 h-4 text-[#56876D]" />
              <span>Signature Collections</span>
            </button>

            <button
              onClick={() => setActiveTab('custom')}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'custom'
                  ? isDarkMode
                    ? 'bg-white text-black shadow-lg'
                    : 'bg-[#1A1D20] text-white shadow-lg'
                  : isDarkMode
                    ? 'bg-[#141824] text-neutral-400 hover:text-white border border-white/10'
                    : 'bg-white text-[#5C6470] hover:text-[#1A1D20] border border-[#E0DCD3]'
              }`}
            >
              <Sliders className="w-4 h-4 text-[#56876D]" />
              <span>Bespoke Calculator</span>
            </button>
          </div>
        </div>

        {/* TAB 1: CURATED SIGNATURE COLLECTIONS */}
        <AnimatePresence mode="wait">
          {activeTab === 'curated' && (
            <motion.div
              key="curated"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch"
            >
              {siteConfig.signaturePackages.map((pkg, idx) => (
                <div
                  key={pkg.id}
                  className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative border ${
                    pkg.badge === "Most Popular"
                      ? isDarkMode
                        ? 'bg-[#161B27] border-[#56876D] shadow-2xl scale-[1.02]'
                        : 'bg-white border-[#56876D] shadow-xl scale-[1.02]'
                      : isDarkMode
                        ? 'bg-[#141824] border-white/10 hover:border-white/20'
                        : 'bg-white border-[#EBE7DF] hover:border-[#1A1D20]/20 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
                  }`}
                >
                  {/* Badge */}
                  {pkg.badge && (
                    <div className="absolute -top-3.5 left-8">
                      <span className="px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#56876D] text-white shadow-md">
                        {pkg.badge}
                      </span>
                    </div>
                  )}

                  <div>
                    <h3 className={`font-serif text-2xl font-medium mt-2 ${
                      isDarkMode ? 'text-white' : 'text-[#1A1D20]'
                    }`}>
                      {pkg.name}
                    </h3>

                    <div className="mt-4 mb-4">
                      <span className="text-[11px] uppercase tracking-wider text-neutral-400 block mb-0.5">
                        Investment
                      </span>
                      <span className="font-serif text-3xl font-semibold text-[#56876D]">
                        {formatCurrency(pkg.price)}
                      </span>
                    </div>

                    <p className={`text-xs font-light mb-4 pb-4 border-b border-black/5 dark:border-white/10 ${
                      isDarkMode ? 'text-neutral-300' : 'text-[#5C6470]'
                    }`}>
                      {pkg.idealFor}
                    </p>

                    <div className={`p-3 rounded-xl mb-6 text-xs flex items-start gap-2.5 ${
                      isDarkMode ? 'bg-[#0C0E14]' : 'bg-[#FAF8F5]'
                    }`}>
                      <Camera className="w-4 h-4 text-[#56876D] flex-shrink-0 mt-0.5" />
                      <span className={isDarkMode ? 'text-neutral-300' : 'text-[#333740]'}>
                        {pkg.team}
                      </span>
                    </div>

                    {/* Inclusions List */}
                    <div className="space-y-2.5 mb-8">
                      {pkg.inclusions.map((inc, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs">
                          <Check className="w-3.5 h-3.5 text-[#56876D] flex-shrink-0 mt-0.5 stroke-[3]" />
                          <span className={isDarkMode ? 'text-neutral-300' : 'text-[#4A505C]'}>
                            {inc}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reserve Button */}
                  <button
                    onClick={() => handleReservePackage(pkg)}
                    className={`w-full py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-2 ${
                      pkg.badge === "Most Popular"
                        ? 'bg-[#56876D] hover:bg-[#46735c] text-white'
                        : isDarkMode
                          ? 'bg-[#222938] hover:bg-[#2c3548] text-white'
                          : 'bg-[#1A1D20] hover:bg-black text-white'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Inquire via WhatsApp</span>
                  </button>
                </div>
              ))}
            </motion.div>
          )}

          {/* TAB 2: BESPOKE EVENT & CREW CALCULATOR */}
          {activeTab === 'custom' && (
            <motion.div
              key="custom"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Column: Events & Team Selectors */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 1. Choose Events */}
                <div className={`rounded-3xl p-6 sm:p-8 border ${
                  isDarkMode ? 'bg-[#141824] border-white/10' : 'bg-white border-[#EBE7DF]'
                }`}>
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-black/5 dark:border-white/10">
                    <h3 className={`font-serif text-lg font-medium ${isDarkMode ? 'text-white' : 'text-[#1A1D20]'}`}>
                      1. Select Celebrations to Cover
                    </h3>
                    <span className="text-xs text-[#56876D] font-semibold bg-[#56876D]/10 px-3 py-1 rounded-full">
                      {selectedEvents.length} selected
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {siteConfig.quoteEvents.map((event) => {
                      const isSelected = selectedEvents.includes(event.id);
                      return (
                        <div
                          key={event.id}
                          onClick={() => toggleEvent(event.id)}
                          className={`p-4 rounded-2xl cursor-pointer border transition-all duration-200 flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#56876D] bg-[#56876D]/10 shadow-sm'
                              : isDarkMode
                                ? 'bg-[#0C0E14] border-white/10 hover:border-white/20'
                                : 'bg-white border-[#E0DCD3] hover:border-[#1A1D20]/30'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <h4 className={`font-serif text-base font-medium ${isDarkMode ? 'text-white' : 'text-[#1A1D20]'}`}>
                              {event.name}
                            </h4>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              isSelected ? 'bg-[#56876D] text-white' : 'border border-neutral-300 dark:border-white/20'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>

                          <p className={`text-xs mb-3 line-clamp-2 ${isDarkMode ? 'text-neutral-400' : 'text-[#5C6470]'}`}>
                            {event.description}
                          </p>

                          <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 text-xs">
                            <span className={isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}>{event.hours}</span>
                            <span className="font-semibold text-[#56876D]">
                              {formatCurrency(event.basePrice)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Team Crew Sizing */}
                <div className={`rounded-3xl p-6 sm:p-8 border ${
                  isDarkMode ? 'bg-[#141824] border-white/10' : 'bg-white border-[#EBE7DF]'
                }`}>
                  <h3 className={`font-serif text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-[#1A1D20]'}`}>
                    2. Crew Configuration
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Photographers */}
                    <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                      isDarkMode ? 'bg-[#0C0E14] border-white/10' : 'bg-[#FAF8F5] border-[#E0DCD3]'
                    }`}>
                      <div>
                        <p className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-[#1A1D20]'}`}>
                          Fine-Art Photographers
                        </p>
                        <p className={`text-[11px] ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          Master candid portraiture
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setPhotographerCount(Math.max(1, photographerCount - 1))}
                          className="w-7 h-7 rounded-full border border-neutral-300 dark:border-white/20 flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className={`w-5 text-center text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-[#1A1D20]'}`}>
                          {photographerCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPhotographerCount(Math.min(5, photographerCount + 1))}
                          className="w-7 h-7 rounded-full bg-[#56876D] text-white flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Cinematographers */}
                    <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                      isDarkMode ? 'bg-[#0C0E14] border-white/10' : 'bg-[#FAF8F5] border-[#E0DCD3]'
                    }`}>
                      <div>
                        <p className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-[#1A1D20]'}`}>
                          4K Cinematographers
                        </p>
                        <p className={`text-[11px] ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          Gimbal &amp; audio film crew
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setVideographerCount(Math.max(1, videographerCount - 1))}
                          className="w-7 h-7 rounded-full border border-neutral-300 dark:border-white/20 flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className={`w-5 text-center text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-[#1A1D20]'}`}>
                          {videographerCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => setVideographerCount(Math.min(5, videographerCount + 1))}
                          className="w-7 h-7 rounded-full bg-[#56876D] text-white flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Add-ons */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                    <div
                      onClick={() => setDroneIncluded(!droneIncluded)}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs ${
                        droneIncluded ? 'border-[#56876D] bg-[#56876D]/10 font-medium' : isDarkMode ? 'border-white/10' : 'border-[#E0DCD3]'
                      }`}
                    >
                      <span>Aerial 4K Drone</span>
                      <div className={`w-4 h-4 rounded flex items-center justify-center ${droneIncluded ? 'bg-[#56876D] text-white' : 'border'}`}>
                        {droneIncluded && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    <div
                      onClick={() => setTeaserReelIncluded(!teaserReelIncluded)}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs ${
                        teaserReelIncluded ? 'border-[#56876D] bg-[#56876D]/10 font-medium' : isDarkMode ? 'border-white/10' : 'border-[#E0DCD3]'
                      }`}
                    >
                      <span>Social Reels Suite</span>
                      <div className={`w-4 h-4 rounded flex items-center justify-center ${teaserReelIncluded ? 'bg-[#56876D] text-white' : 'border'}`}>
                        {teaserReelIncluded && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    <div
                      onClick={() => setAlbumIncluded(!albumIncluded)}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs ${
                        albumIncluded ? 'border-[#56876D] bg-[#56876D]/10 font-medium' : isDarkMode ? 'border-white/10' : 'border-[#E0DCD3]'
                      }`}
                    >
                      <span>Italian Heirloom Book</span>
                      <div className={`w-4 h-4 rounded flex items-center justify-center ${albumIncluded ? 'bg-[#56876D] text-white' : 'border'}`}>
                        {albumIncluded && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Live Estimate & Lead Card */}
              <div className="lg:col-span-1">
                <div className={`rounded-3xl p-6 sm:p-7 border sticky top-28 space-y-6 shadow-xl ${
                  isDarkMode ? 'bg-[#141824] border-white/10' : 'bg-white border-[#EBE7DF]'
                }`}>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#56876D]">
                      LIVE ESTIMATE
                    </span>
                    <h3 className={`font-serif text-2xl font-medium mt-1 ${isDarkMode ? 'text-white' : 'text-[#1A1D20]'}`}>
                      Investment Summary
                    </h3>
                  </div>

                  {/* Line Items */}
                  <div className="space-y-2.5 text-xs pb-4 border-b border-black/5 dark:border-white/10">
                    <div className="flex justify-between items-center">
                      <span className={isDarkMode ? 'text-neutral-300' : 'text-[#5C6470]'}>
                        Events ({selectedEvents.length})
                      </span>
                      <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-[#1A1D20]'}`}>
                        {formatCurrency(calculation.eventsTotal)}
                      </span>
                    </div>

                    {calculation.extraPhotoCost > 0 && (
                      <div className="flex justify-between items-center text-neutral-400">
                        <span>Extra Photographers</span>
                        <span>+{formatCurrency(calculation.extraPhotoCost)}</span>
                      </div>
                    )}

                    {calculation.extraVideoCost > 0 && (
                      <div className="flex justify-between items-center text-neutral-400">
                        <span>Extra Cinematographers</span>
                        <span>+{formatCurrency(calculation.extraVideoCost)}</span>
                      </div>
                    )}

                    {calculation.droneCost > 0 && (
                      <div className="flex justify-between items-center text-neutral-400">
                        <span>4K Aerial Drone</span>
                        <span>+{formatCurrency(calculation.droneCost)}</span>
                      </div>
                    )}

                    {calculation.teaserCost > 0 && (
                      <div className="flex justify-between items-center text-neutral-400">
                        <span>Reels Bundle</span>
                        <span>+{formatCurrency(calculation.teaserCost)}</span>
                      </div>
                    )}

                    {calculation.albumCost > 0 && (
                      <div className="flex justify-between items-center text-neutral-400">
                        <span>Italian Heirloom Book</span>
                        <span>+{formatCurrency(calculation.albumCost)}</span>
                      </div>
                    )}
                  </div>

                  {/* Grand Total */}
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-neutral-400 block mb-0.5">
                      Estimated Investment
                    </span>
                    <div className="font-serif text-3xl font-bold text-[#56876D]">
                      {formatCurrency(calculation.grandTotal)}
                    </div>
                  </div>

                  {/* Couple Details */}
                  <div className="space-y-3 pt-1">
                    <input
                      type="text"
                      placeholder="Your Name (Optional)"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className={`w-full rounded-xl px-3.5 py-2.5 text-xs outline-none border ${
                        isDarkMode ? 'bg-[#0C0E14] border-white/15 text-white' : 'bg-[#FAF8F5] border-[#E0DCD3] text-[#1A1D20]'
                      }`}
                    />

                    <input
                      type="tel"
                      placeholder="WhatsApp Phone (Optional)"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className={`w-full rounded-xl px-3.5 py-2.5 text-xs outline-none border ${
                        isDarkMode ? 'bg-[#0C0E14] border-white/15 text-white' : 'bg-[#FAF8F5] border-[#E0DCD3] text-[#1A1D20]'
                      }`}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={handleSendCustomQuote}
                      className="w-full py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 shadow-md flex items-center justify-center gap-2 transition-all"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>Lock Quote on WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyQuote}
                      className={`w-full py-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-2 transition-all ${
                        isDarkMode ? 'border-white/15 text-neutral-300 hover:text-white' : 'border-[#1A1D20] text-[#1A1D20] hover:bg-neutral-50'
                      }`}
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Copied Quote to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4" />
                          <span>Copy Breakdown</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};
