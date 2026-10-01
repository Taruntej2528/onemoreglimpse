import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { HeroVideo } from '../components/HeroVideo';
import { PhilosophyBanner } from '../components/PhilosophyBanner';
import { MasonryGallery } from '../components/MasonryGallery';
import { FilmsCarousel } from '../components/FilmsCarousel';
import { InteractiveQuoteEngine } from '../components/InteractiveQuoteEngine';
import { EnquiryForm } from '../components/EnquiryForm';
import { Testimonials } from '../components/Testimonials';
import { Footer } from '../components/Footer';
import { WhatsAppWidget } from '../components/WhatsAppWidget';

export function WebsiteLandingPage() {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.className = 'theme-dark bg-[#0C0E14] text-[#F3F4F6]';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'theme-light bg-[#FAF8F5] text-[#1A1D20]';
    }
  }, [isDarkMode]);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0C0E14] text-[#F3F4F6]' : 'bg-[#FAF8F5] text-[#1A1D20]'
    }`}>
      {/* Sticky Navigation Bar */}
      <Navbar
        onOpenQuote={() => setIsQuoteModalOpen(true)}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      {/* Main Content Sections */}
      <main className="flex-grow">
        {/* Fullscreen Video Hero Section */}
        <HeroVideo onOpenQuote={() => setIsQuoteModalOpen(true)} />

        {/* Brand Philosophy & Craftsmanship Section */}
        <PhilosophyBanner isDarkMode={isDarkMode} />

        {/* Visual Stories: Non-overlapping 4-column masonry grid */}
        <MasonryGallery isDarkMode={isDarkMode} />

        {/* Cinematic Master Films: 16:9 Landscape Widescreen Carousel */}
        <FilmsCarousel isDarkMode={isDarkMode} />

        {/* Next-Gen Interactive Quote Engine (Signature Packages & Bespoke Calculator) */}
        <InteractiveQuoteEngine
          isDarkMode={isDarkMode}
          onOpenCustomModal={() => setIsQuoteModalOpen(true)}
        />

        {/* Reserve Your Date: Enquiry Concierge Form */}
        <EnquiryForm isDarkMode={isDarkMode} />

        {/* Testimonials & Client Reviews */}
        <Testimonials isDarkMode={isDarkMode} />
      </main>

      {/* Luxury Footer */}
      <Footer
        onOpenQuote={() => setIsQuoteModalOpen(true)}
        isDarkMode={isDarkMode}
      />

      {/* Floating WhatsApp Widget */}
      <WhatsAppWidget />
    </div>
  );
}

export default WebsiteLandingPage;
