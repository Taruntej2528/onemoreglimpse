import React, { useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const quickPrompts = [
    "Hi, I'd like to check date availability for our wedding!",
    "Could you share your full destination wedding brochure?",
    "Can we book a consultation call with your creative director?"
  ];

  const handleSend = (textToSend) => {
    const message = textToSend || customMsg || "Hello! I am inquiring about wedding photography packages.";
    const cleanNumber = siteConfig.brand.whatsappNumber.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-[#121620] border border-[#C9A96E]/40 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#181D2A] to-[#121620] p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                  <MessageCircle className="w-5 h-5 fill-emerald-400" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#121620] rounded-full" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {siteConfig.brand.name}
                </h4>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                  Online • Replies in minutes
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close Chat"
              className="p-1 rounded-full text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3 bg-[#0C0E14]/60">
            <div className="bg-[#181C28] p-3 rounded-2xl rounded-tl-sm text-xs text-neutral-200 border border-white/5 space-y-1">
              <p className="font-medium text-[#E5D2A8]">Namaste &amp; Welcome! 🙏</p>
              <p className="text-neutral-300">
                Planning your dream wedding celebration? Tap any quick question or write your dates below:
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="space-y-1.5 pt-1">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="w-full text-left text-[11px] text-neutral-300 hover:text-white bg-[#141824] hover:bg-[#1C2232] border border-white/10 hover:border-[#C9A96E]/40 p-2.5 rounded-xl transition-all"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>

          {/* Input Footer */}
          <div className="p-3 border-t border-white/10 bg-[#121620] flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-[#181C28] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#C9A96E]"
            />
            <button
              onClick={() => handleSend()}
              aria-label="Send WhatsApp Message"
              className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-all shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Pill / Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open WhatsApp Chat"
        className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 border border-emerald-300/30"
      >
        <MessageCircle className="w-5 h-5 fill-black" />
        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
          Chat on WhatsApp
        </span>
        <span className="relative flex h-2.5 w-2.5 sm:hidden">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-black"></span>
        </span>
      </button>
    </div>
  );
};
