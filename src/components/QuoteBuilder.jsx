import React, { useState, useMemo } from 'react';
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
  X,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { siteConfig } from '../config/siteConfig';

export const QuoteBuilder = ({ isOpenAsModal = false, onClose, isDarkMode }) => {
  // Step navigation: 1 = Your Details (matching Screenshot 2), 2 = Events & Crew, 3 = Summary & Estimate
  const [currentStep, setCurrentStep] = useState(1);

  // Form Details
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [loadQuoteInput, setLoadQuoteInput] = useState('');

  // Selections
  const [selectedEvents, setSelectedEvents] = useState(['wedding']);
  const [photographerCount, setPhotographerCount] = useState(2);
  const [videographerCount, setVideographerCount] = useState(2);
  const [droneIncluded, setDroneIncluded] = useState(true);
  const [teaserReelIncluded, setTeaserReelIncluded] = useState(true);
  const [albumIncluded, setAlbumIncluded] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [eventCity, setEventCity] = useState('');
  const [notes, setNotes] = useState('');

  const [copied, setCopied] = useState(false);

  // Event Toggle
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

  // Pricing Calculation
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

  const getWhatsAppMessage = () => {
    const message = `✨ *Wedding Photography Quote - ${siteConfig.brand.name}* ✨
-----------------------------------------
👤 *Name:* ${clientName || 'Not specified'}
📱 *Phone:* ${clientPhone || 'Not specified'}
✉️ *Email:* ${clientEmail || 'Not specified'}
📅 *Date:* ${eventDate || 'To be decided'}
📍 *Location:* ${eventCity || 'Not specified'}

🎉 *Selected Events (${selectedEvents.length}):*
${calculation.selectedEventObjs.map((e) => `• ${e.name} (${formatCurrency(e.basePrice)})`).join('\n')}

🎥 *Team & Add-ons:*
• Photographers: ${photographerCount} team members
• Cinematographers: ${videographerCount} team members
• Aerial 4K Drone: ${droneIncluded ? 'Included' : 'No'}
• Instagram Reels: ${teaserReelIncluded ? 'Included' : 'No'}
• Heirloom Album: ${albumIncluded ? 'Included' : 'No'}

💰 *Estimated Package Investment:* ${formatCurrency(calculation.grandTotal)}
${notes ? `\n📝 *Notes:* ${notes}` : ''}
-----------------------------------------
Please verify date availability and confirm booking terms!`;

    return message;
  };

  const handleSendWhatsApp = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#56876D', '#C9A96E', '#1A1D20'],
    });

    const msg = getWhatsAppMessage();
    const cleanNumber = siteConfig.brand.whatsappNumber.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleCopyQuote = () => {
    const msg = getWhatsAppMessage();
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const content = (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header matching Screenshot 2 */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-2">
          <span className="w-5 h-[1.5px] bg-[#56876D]" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#56876D]">
            BUILD YOUR PACKAGE
          </span>
        </div>
        
        <h2 className={`font-serif text-3xl sm:text-5xl font-normal tracking-tight ${
          isDarkMode ? 'text-white' : 'text-[#1A1D20]'
        }`}>
          Build Your Quote
        </h2>

        <p className={`text-xs sm:text-base mt-2 max-w-2xl mx-auto font-light ${
          isDarkMode ? 'text-neutral-400' : 'text-[#5C6470]'
        }`}>
          Create a personalized quotation by selecting your preferred events and team members. Let's find the perfect package for your special day.
        </p>

        {/* Step Navigation Indicator */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {[
            { step: 1, label: '1. Your Details' },
            { step: 2, label: '2. Events & Crew' },
            { step: 3, label: '3. Investment Estimate' },
          ].map((item) => (
            <button
              key={item.step}
              onClick={() => setCurrentStep(item.step)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                currentStep === item.step
                  ? isDarkMode
                    ? 'bg-white text-black font-semibold'
                    : 'bg-[#1A1D20] text-white font-semibold'
                  : isDarkMode
                    ? 'bg-[#141824] text-neutral-400 hover:text-white'
                    : 'bg-white text-[#5C6470] border border-[#E0DCD3]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: YOUR DETAILS (Exact layout from Screenshot 2) */}
      {currentStep === 1 && (
        <div className={`rounded-3xl p-6 sm:p-10 max-w-2xl mx-auto border transition-all duration-300 ${
          isDarkMode ? 'bg-[#141824] border-white/10 shadow-2xl' : 'bg-white border-[#EBE7DF] shadow-[0_10px_35px_rgba(0,0,0,0.03)]'
        }`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-[#56876D] text-white flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <h3 className={`text-xl font-serif font-medium ${isDarkMode ? 'text-white' : 'text-[#1A1D20]'}`}>
              Your Details
            </h3>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); setCurrentStep(2); }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-2 ${
                  isDarkMode ? 'text-neutral-400' : 'text-[#5C6470]'
                }`}>
                  FULL NAME *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-colors border ${
                      isDarkMode
                        ? 'bg-[#0C0E14] border-white/15 text-white placeholder-neutral-500 focus:border-[#56876D]'
                        : 'bg-white border-[#E0DCD3] text-[#1A1D20] placeholder-neutral-400 focus:border-[#56876D]'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-2 ${
                  isDarkMode ? 'text-neutral-400' : 'text-[#5C6470]'
                }`}>
                  PHONE NUMBER *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    placeholder="Your Phone Number"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-colors border ${
                      isDarkMode
                        ? 'bg-[#0C0E14] border-white/15 text-white placeholder-neutral-500 focus:border-[#56876D]'
                        : 'bg-white border-[#E0DCD3] text-[#1A1D20] placeholder-neutral-400 focus:border-[#56876D]'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-2 ${
                isDarkMode ? 'text-neutral-400' : 'text-[#5C6470]'
              }`}>
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  placeholder="Your Email (Optional)"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-colors border ${
                    isDarkMode
                      ? 'bg-[#0C0E14] border-white/15 text-white placeholder-neutral-500 focus:border-[#56876D]'
                      : 'bg-white border-[#E0DCD3] text-[#1A1D20] placeholder-neutral-400 focus:border-[#56876D]'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all mt-4 flex items-center justify-center gap-2 ${
                isDarkMode
                  ? 'bg-[#56876D] hover:bg-[#46735c] text-white'
                  : 'bg-[#1A1D20] hover:bg-black text-white'
              }`}
            >
              <span>CONTINUE TO BUILD QUOTE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Load Previous Quote Option (matching Screenshot 2) */}
          <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5">
            <p className={`text-xs mb-3 ${isDarkMode ? 'text-neutral-400' : 'text-[#5C6470]'}`}>
              Have a previous quote ID?
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Enter your Quote ID"
                value={loadQuoteInput}
                onChange={(e) => setLoadQuoteInput(e.target.value)}
                className={`flex-1 rounded-xl px-4 py-2.5 text-xs outline-none border ${
                  isDarkMode
                    ? 'bg-[#0C0E14] border-white/15 text-white'
                    : 'bg-white border-[#E0DCD3] text-[#1A1D20]'
                }`}
              />
              <button
                type="button"
                onClick={() => {
                  if (loadQuoteInput) {
                    alert(`Loaded quote reference: ${loadQuoteInput}`);
                    setCurrentStep(2);
                  }
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider border ${
                  isDarkMode
                    ? 'border-white/20 text-white hover:bg-white/10'
                    : 'border-[#1A1D20] text-[#1A1D20] hover:bg-neutral-50'
                }`}
              >
                LOAD QUOTE
              </button>
            </div>
            <p className={`text-[11px] mt-2 ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
              Forgot your quote ID? Contact us.
            </p>
          </div>
        </div>
      )}

      {/* STEP 2: EVENTS & CREW CONFIGURATION */}
      {currentStep === 2 && (
        <div className={`rounded-3xl p-6 sm:p-8 border transition-all duration-300 space-y-6 ${
          isDarkMode ? 'bg-[#141824] border-white/10 shadow-2xl' : 'bg-white border-[#EBE7DF] shadow-[0_10px_35px_rgba(0,0,0,0.03)]'
        }`}>
          <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
            <div>
              <h3 className={`text-xl font-serif font-medium ${isDarkMode ? 'text-white' : 'text-[#1A1D20]'}`}>
                Select Events &amp; Team Crew
              </h3>
              <p className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-[#5C6470]'}`}>
                Tailored for {clientName || 'your special day'}
              </p>
            </div>
            <span className="text-xs text-[#56876D] font-semibold bg-[#56876D]/10 px-3 py-1 rounded-full border border-[#56876D]/20">
              {selectedEvents.length} selected
            </span>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {siteConfig.quoteEvents.map((event) => {
              const isSelected = selectedEvents.includes(event.id);
              return (
                <div
                  key={event.id}
                  onClick={() => toggleEvent(event.id)}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? isDarkMode
                        ? 'bg-[#1D2230] border-[#56876D]'
                        : 'bg-[#F2F8F5] border-[#56876D]'
                      : isDarkMode
                        ? 'bg-[#0C0E14] border-white/10 hover:border-white/20'
                        : 'bg-white border-[#E0DCD3] hover:border-[#1A1D20]/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className={`font-serif text-base font-medium ${isDarkMode ? 'text-white' : 'text-[#1A1D20]'}`}>
                      {event.name}
                    </h4>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-[#56876D] text-white' : 'border border-neutral-300 dark:border-white/20 text-transparent'
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>
                  <p className={`text-xs mb-3 line-clamp-2 ${isDarkMode ? 'text-neutral-400' : 'text-[#5C6470]'}`}>
                    {event.description}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 text-xs">
                    <span className={isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}>{event.hours}</span>
                    <span className="font-semibold text-[#56876D] text-sm">
                      {formatCurrency(event.basePrice)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Crew Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Photographers */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              isDarkMode ? 'bg-[#0C0E14] border-white/10' : 'bg-[#FAF8F5] border-[#E0DCD3]'
            }`}>
              <div>
                <p className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-[#1A1D20]'}`}>
                  Candid Photographers
                </p>
                <p className={`text-[11px] ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Master prime lens specialists
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

            {/* Videographers */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              isDarkMode ? 'bg-[#0C0E14] border-white/10' : 'bg-[#FAF8F5] border-[#E0DCD3]'
            }`}>
              <div>
                <p className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-[#1A1D20]'}`}>
                  Cinematographers
                </p>
                <p className={`text-[11px] ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  4K gimbal cinema coverage
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

          {/* Add-on toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              onClick={() => setDroneIncluded(!droneIncluded)}
              className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs ${
                droneIncluded
                  ? 'border-[#56876D] bg-[#56876D]/10 font-medium'
                  : isDarkMode ? 'border-white/10' : 'border-[#E0DCD3]'
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
                teaserReelIncluded
                  ? 'border-[#56876D] bg-[#56876D]/10 font-medium'
                  : isDarkMode ? 'border-white/10' : 'border-[#E0DCD3]'
              }`}
            >
              <span>48-Hour Instagram Reels</span>
              <div className={`w-4 h-4 rounded flex items-center justify-center ${teaserReelIncluded ? 'bg-[#56876D] text-white' : 'border'}`}>
                {teaserReelIncluded && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>

            <div
              onClick={() => setAlbumIncluded(!albumIncluded)}
              className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs ${
                albumIncluded
                  ? 'border-[#56876D] bg-[#56876D]/10 font-medium'
                  : isDarkMode ? 'border-white/10' : 'border-[#E0DCD3]'
              }`}
            >
              <span>Italian Leather Album</span>
              <div className={`w-4 h-4 rounded flex items-center justify-center ${albumIncluded ? 'bg-[#56876D] text-white' : 'border'}`}>
                {albumIncluded && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`text-xs underline ${isDarkMode ? 'text-neutral-400' : 'text-[#5C6470]'}`}
            >
              &larr; Back to Details
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className={`px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider text-white ${
                isDarkMode ? 'bg-[#56876D] hover:bg-[#46735c]' : 'bg-[#1A1D20] hover:bg-black'
              }`}
            >
              Calculate Instant Investment &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: INVESTMENT BREAKDOWN & WHATSAPP ROUTING */}
      {currentStep === 3 && (
        <div className={`rounded-3xl p-6 sm:p-10 border transition-all duration-300 space-y-6 ${
          isDarkMode ? 'bg-[#141824] border-white/10 shadow-2xl' : 'bg-white border-[#EBE7DF] shadow-[0_10px_35px_rgba(0,0,0,0.03)]'
        }`}>
          <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#56876D] font-bold">
                PERSONALIZED ESTIMATE
              </span>
              <h3 className={`text-2xl font-serif font-medium ${isDarkMode ? 'text-white' : 'text-[#1A1D20]'}`}>
                {clientName || 'Wedding'} Package Summary
              </h3>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-medium">
              Transparent Pricing
            </span>
          </div>

          {/* Breakdown items */}
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className={isDarkMode ? 'text-neutral-300' : 'text-[#5C6470]'}>
                Selected Events ({selectedEvents.length}): {calculation.selectedEventObjs.map(e => e.name).join(', ')}
              </span>
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-[#1A1D20]'}`}>
                {formatCurrency(calculation.eventsTotal)}
              </span>
            </div>

            {calculation.extraPhotoCost > 0 && (
              <div className="flex justify-between items-center text-neutral-400">
                <span>Additional Photographers ({photographerCount} total)</span>
                <span>+{formatCurrency(calculation.extraPhotoCost)}</span>
              </div>
            )}

            {calculation.extraVideoCost > 0 && (
              <div className="flex justify-between items-center text-neutral-400">
                <span>Additional Cinematographers ({videographerCount} total)</span>
                <span>+{formatCurrency(calculation.extraVideoCost)}</span>
              </div>
            )}

            {calculation.droneCost > 0 && (
              <div className="flex justify-between items-center text-neutral-400">
                <span>Aerial 4K Drone Coverage</span>
                <span>+{formatCurrency(calculation.droneCost)}</span>
              </div>
            )}

            {calculation.teaserCost > 0 && (
              <div className="flex justify-between items-center text-neutral-400">
                <span>48-Hour Instagram Reels Bundle</span>
                <span>+{formatCurrency(calculation.teaserCost)}</span>
              </div>
            )}

            {calculation.albumCost > 0 && (
              <div className="flex justify-between items-center text-neutral-400">
                <span>Heirloom Italian Leather Keepsake Album</span>
                <span>+{formatCurrency(calculation.albumCost)}</span>
              </div>
            )}
          </div>

          {/* Grand Total */}
          <div className="pt-4 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className={`text-[11px] uppercase tracking-wider block ${isDarkMode ? 'text-neutral-400' : 'text-[#5C6470]'}`}>
                Estimated Total Package
              </span>
              <div className="font-serif text-3xl sm:text-4xl font-semibold text-[#56876D]">
                {formatCurrency(calculation.grandTotal)}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="px-6 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 shadow-md flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Confirm on WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopyQuote}
                className={`px-5 py-3 rounded-full text-xs font-medium border flex items-center justify-center gap-2 ${
                  isDarkMode
                    ? 'border-white/20 text-neutral-300 hover:text-white'
                    : 'border-[#1A1D20] text-[#1A1D20] hover:bg-neutral-50'
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Copy Summary</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-start">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className={`text-xs underline ${isDarkMode ? 'text-neutral-400' : 'text-[#5C6470]'}`}
            >
              &larr; Modify Selections
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (isOpenAsModal) {
    return (
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full max-w-4xl rounded-3xl p-6 sm:p-10 my-8 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar ${
            isDarkMode ? 'bg-[#0E1118] text-white border border-white/10' : 'bg-[#FAF8F5] text-[#1A1D20]'
          }`}
        >
          <button
            onClick={onClose}
            aria-label="Close Quote Modal"
            className="absolute top-6 right-6 z-50 p-2 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 text-neutral-500 hover:text-black dark:text-neutral-300 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          {content}
        </div>
      </div>
    );
  }

  return (
    <section id="custom-quote" className={`py-20 transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0C0E14]' : 'bg-[#FAF8F5]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {content}
      </div>
    </section>
  );
};
