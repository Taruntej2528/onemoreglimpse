import React from 'react';
import { Phone, Mail, MapPin, MessageCircle, Heart, ArrowUp } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { useSite } from '../context/SiteContext';

export const Footer = ({ onOpenQuote, isDarkMode }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { brand: liveBrand, footer: liveFooter } = useSite();
  const brand = liveBrand || siteConfig.brand || {};
  const footer = liveFooter || siteConfig.footer || {};
  const logoSrc = isDarkMode && brand.logoDarkUrl ? brand.logoDarkUrl : brand.logoUrl;

  return (
    <footer id="footer" className={`text-sm pt-20 pb-12 border-t transition-colors duration-300 ${
      isDarkMode
        ? 'bg-[#080A0E] text-neutral-400 border-white/10'
        : 'bg-[#F2EFE9] text-[#5C6470] border-[#E0DCD3]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Optional Newsletter Concierge Bar */}
        {footer.showNewsletter && (
          <div className="mb-12 p-6 sm:p-8 rounded-3xl bg-black/5 dark:bg-white/[0.03] border border-black/10 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className={`font-serif text-base sm:text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#1A1D20]'}`}>
                {footer.newsletterHeading || "Receive Studio Monographs & Seasonal Availability"}
              </h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-xl">
                {footer.newsletterSubtitle || "Strictly reserved for prospective couples and royal celebrations. No spam."}
              </p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); alert("Thank you for joining our private monograph list."); }} className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs w-full sm:w-64 focus:outline-none focus:border-[#C9A96E]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs whitespace-nowrap shadow-gold-glow hover:opacity-95"
              >
                Subscribe
              </button>
            </form>
          </div>
        )}

        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-black/5 dark:border-white/5">
          
          {/* Brand Info (2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Logo Image or Text or Both */}
            {brand.logoType === 'image' && logoSrc ? (
              <img
                src={logoSrc}
                alt={brand.name || 'Prazna Photography'}
                style={{ height: `${brand.logoHeight || 38}px` }}
                className="object-contain max-w-[220px]"
              />
            ) : brand.logoType === 'both' && logoSrc ? (
              <div className="flex items-center gap-3">
                <img
                  src={logoSrc}
                  alt={brand.name || 'Prazna Photography'}
                  style={{ height: `${brand.logoHeight || 38}px` }}
                  className="object-contain max-w-[120px]"
                />
                <span className={`font-serif tracking-[0.25em] text-lg font-normal uppercase ${
                  isDarkMode ? 'text-white' : 'text-[#1A1D20]'
                }`}>
                  {footer.brandName || brand.name}
                </span>
              </div>
            ) : (
              <span className={`font-serif tracking-[0.25em] text-xl font-normal uppercase ${
                isDarkMode ? 'text-white' : 'text-[#1A1D20]'
              }`}>
                {footer.brandName || brand.name}
              </span>
            )}

            <p className="text-xs sm:text-sm font-light max-w-sm leading-relaxed">
              {footer.description || brand.tagline || brand.description}
            </p>

            {footer.badgeText && (
              <div className="inline-block px-3 py-1 rounded-full text-[11px] font-mono tracking-wider bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#C9A96E]">
                {footer.badgeText}
              </div>
            )}

            {footer.showSocialIcons !== false && (
              <div className="flex items-center gap-3 pt-2">
                <a
                  href={brand.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Profile"
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
                    isDarkMode
                      ? 'border-white/10 text-white hover:border-[#56876D] hover:text-[#56876D]'
                      : 'border-[#D0CBC0] text-[#1A1D20] hover:border-[#56876D] hover:text-[#56876D]'
                  }`}
                >
                  <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>

                <a
                  href={`https://wa.me/${brand.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp Direct"
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
                    isDarkMode
                      ? 'border-white/10 text-white hover:border-emerald-500 hover:text-emerald-400'
                      : 'border-[#D0CBC0] text-[#1A1D20] hover:border-emerald-600 hover:text-emerald-600'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                </a>

                <a
                  href={`mailto:${brand.email}`}
                  aria-label="Email Inquiry"
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
                    isDarkMode
                      ? 'border-white/10 text-white hover:border-[#56876D] hover:text-[#56876D]'
                      : 'border-[#D0CBC0] text-[#1A1D20] hover:border-[#56876D] hover:text-[#56876D]'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className={`font-serif text-sm font-semibold uppercase tracking-wider mb-4 ${
              isDarkMode ? 'text-white' : 'text-[#1A1D20]'
            }`}>
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#gallery" className="hover:text-[#56876D] transition-colors">
                  Visual Stories
                </a>
              </li>
              <li>
                <a href="#films" className="hover:text-[#56876D] transition-colors">
                  Wedding Cinema
                </a>
              </li>
              <li>
                <a href="#custom-quote" className="hover:text-[#56876D] transition-colors">
                  Build Your Quote
                </a>
              </li>
              <li>
                <a href="#booking" className="hover:text-[#56876D] transition-colors">
                  Reserve Your Date
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-[#56876D] transition-colors">
                  Client Love
                </a>
              </li>
            </ul>
          </div>

          {/* Celebrations */}
          <div>
            <h4 className={`font-serif text-sm font-semibold uppercase tracking-wider mb-4 ${
              isDarkMode ? 'text-white' : 'text-[#1A1D20]'
            }`}>
              Events Covered
            </h4>
            <ul className="space-y-2.5 text-xs">
              {siteConfig.quoteEvents.map((e) => (
                <li key={e.id}>
                  {e.name}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className={`font-serif text-sm font-semibold uppercase tracking-wider mb-4 ${
              isDarkMode ? 'text-white' : 'text-[#1A1D20]'
            }`}>
              Studio Details
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#56876D] flex-shrink-0 mt-0.5" />
                <span>{footer.address || brand.location}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#56876D] flex-shrink-0" />
                <a href={`tel:${(brand.phone || '').replace(/[^0-9+]/g, '')}`} className="hover:underline">
                  {brand.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#56876D] flex-shrink-0" />
                <a href={`mailto:${brand.email}`} className="hover:underline">
                  {brand.email}
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs opacity-75">
          <div className="flex items-center gap-1.5">
            <span>{footer.copyright || `© ${new Date().getFullYear()} ${brand.name}. All rights reserved.`} Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-[#56876D] fill-[#56876D]" />
            <span>for timeless celebrations.</span>
          </div>

          <button
            onClick={scrollToTop}
            aria-label="Back to Top"
            className={`p-2.5 rounded-full border transition-all ${
              isDarkMode
                ? 'border-white/10 hover:border-white text-white'
                : 'border-[#D0CBC0] hover:border-[#1A1D20] text-[#1A1D20]'
            }`}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

      </div>
    </footer>
  );
};
