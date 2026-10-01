import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sun, Moon, Shield } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { useSite } from '../context/SiteContext';

export const Navbar = ({ onOpenQuote, isDarkMode, setIsDarkMode }) => {
  const { brand: liveBrand } = useSite();
  const brand = liveBrand || siteConfig.brand || {};
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Portfolio', href: '#gallery' },
    { name: 'Films', href: '#films' },
    { name: 'Build Your Quote', href: '#custom-quote' },
    { name: 'Reserve Date', href: '#booking' },
    { name: 'Get in touch', href: '#footer' },
  ];

  // Helper to render brand name cleanly
  const renderBrandName = () => {
    const brandName = brand?.name || "PRAZNA / KNOTY WEDDINGS";
    if (brandName.includes('/')) {
      const [first, second] = brandName.split('/').map(s => s.trim());
      return (
        <div className="flex flex-col text-left">
          <span className="font-serif tracking-[0.25em] text-base sm:text-lg font-normal uppercase leading-tight">
            {first}
          </span>
          <span className="font-serif tracking-[0.3em] text-[10px] sm:text-[11px] font-light uppercase opacity-80 leading-none">
            {second}
          </span>
        </div>
      );
    }
    return (
      <span className="font-serif tracking-[0.25em] text-lg sm:text-xl font-normal uppercase">
        {brandName}
      </span>
    );
  };

  // Dynamic Logo renderer supporting image, text, or both
  const renderLogo = () => {
    const logoSrc = isDarkMode && brand.logoDarkUrl ? brand.logoDarkUrl : brand.logoUrl;
    const height = brand.logoHeight || 38;

    if (brand.logoType === 'image' && logoSrc) {
      return (
        <img
          src={logoSrc}
          alt={brand.name || 'Prazna Photography'}
          style={{ height: `${height}px` }}
          className="object-contain max-w-[200px]"
        />
      );
    }

    if (brand.logoType === 'both' && logoSrc) {
      return (
        <div className="flex items-center gap-3">
          <img
            src={logoSrc}
            alt={brand.name || 'Prazna Photography'}
            style={{ height: `${height}px` }}
            className="object-contain max-w-[120px]"
          />
          {renderBrandName()}
        </div>
      );
    }

    return renderBrandName();
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? isDarkMode
            ? 'bg-[#0C0E14]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3 text-white'
            : 'bg-[#FAF8F5]/90 backdrop-blur-xl border-b border-[#E0DCD3] shadow-md py-3 text-[#1A1D20]'
          : 'bg-gradient-to-b from-black/80 via-black/30 to-transparent py-4 text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Dynamic Brand Logo from siteConfig */}
          <a
            href="#"
            className="flex items-center gap-2 group focus:outline-none"
            aria-label={`${siteConfig.brand?.name || 'Prazna'} Home`}
          >
            {renderLogo()}
          </a>

          {/* Desktop Navigation Links & Action Icons */}
          <div className="hidden md:flex items-center gap-7">
            <nav className="flex items-center gap-6 text-xs sm:text-sm font-light">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="hover:opacity-100 opacity-80 transition-opacity"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2.5 pl-3 border-l border-current/20">
              
              {/* Theme Toggle Button (Light/Dark mode) */}
              <button
                type="button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                className="w-8 h-8 rounded-full border border-current/30 hover:border-current flex items-center justify-center transition-all opacity-80 hover:opacity-100"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Instagram link from siteConfig */}
              <a
                href={siteConfig.brand.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Profile"
                className="w-8 h-8 rounded-full border border-current/30 hover:border-current flex items-center justify-center transition-all opacity-80 hover:opacity-100"
              >
                <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>

              {/* WhatsApp link from siteConfig */}
              <a
                href={`https://wa.me/${siteConfig.brand.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Direct"
                className="w-8 h-8 rounded-full border border-current/30 hover:border-current flex items-center justify-center transition-all opacity-80 hover:opacity-100"
              >
                <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </a>

              {/* Admin Studio Portal Link */}
              <Link
                to="/admin"
                title="Studio Admin Portal"
                className="w-8 h-8 rounded-full border border-[#C9A96E]/50 hover:border-[#C9A96E] hover:bg-[#C9A96E]/15 flex items-center justify-center transition-all text-[#C9A96E]"
              >
                <Shield className="w-3.5 h-3.5" />
              </Link>

            </div>
          </div>

          {/* Mobile Menu & Theme Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 opacity-80 hover:opacity-100"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={onOpenQuote}
              className="px-3 py-1 rounded-full text-xs font-medium text-white bg-[#56876D]"
            >
              Quote
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className={`md:hidden px-6 py-6 space-y-4 shadow-xl border-b ${
          isDarkMode
            ? 'bg-[#0C0E14]/98 border-white/10 text-white'
            : 'bg-[#FAF8F5]/98 border-[#E0DCD3] text-[#1A1D20]'
        }`}>
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-left text-base font-light py-2 border-b border-current/10"
              >
                {link.name}
              </a>
            ))}
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left text-base font-medium py-2 border-b border-current/10 flex items-center justify-between text-[#C9A96E]"
            >
              <span>Admin Studio Portal</span>
              <Shield className="w-4 h-4" />
            </Link>
          </nav>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs opacity-60">Connect with us</span>
            <div className="flex items-center gap-3">
              <a
                href={siteConfig.brand.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-current/30 flex items-center justify-center"
              >
                <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>

              <a
                href={`https://wa.me/${siteConfig.brand.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-current/30 flex items-center justify-center"
              >
                <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
