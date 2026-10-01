import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Film, Crown, ChevronRight } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { useSite } from '../context/SiteContext';

export const HeroVideo = ({ onOpenQuote }) => {
  const { hero: liveHero, brand: liveBrand } = useSite();
  const brand = liveBrand || siteConfig.brand || {};
  const heroMediaType = liveHero?.heroMediaType || siteConfig.heroMediaType || 'video'; // 'video' | 'image'
  const activeVideoId = liveHero?.activeHeroVideoId || siteConfig.activeHeroVideoId || siteConfig.defaultHeroSceneId || 'varsha-shiva';
  const activeImageId = liveHero?.activeHeroImageId || siteConfig.activeHeroImageId || 'heritage-bride-silk';

  const heroVideos = (liveHero?.heroVideos && liveHero.heroVideos.length > 0)
    ? liveHero.heroVideos
    : siteConfig.heroVideos || siteConfig.heroScenes || [];
  const heroImages = (liveHero?.heroImages && liveHero.heroImages.length > 0)
    ? liveHero.heroImages
    : siteConfig.heroImages || [];

  const currentVideo = heroVideos.find(v => v.id === activeVideoId) || heroVideos[0] || siteConfig.heroScenes[0];
  const currentImage = heroImages.find(img => img.id === activeImageId) || heroImages[0] || {
    id: 'heritage-bride-silk',
    name: 'Royal Emerald Silk Bride',
    src: '/assets/hero-green-saree-bride.jpg',
    tagline: 'Immortalizing timeless bridal composure & handcrafted silks.'
  };

  // Dynamic Hero media driven purely by the database (Admin Settings)
  const bgMode = heroMediaType === 'image' ? 'image' : 'video';
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    setVideoLoaded(false);
  }, [currentVideo.videoId]);

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0A0C10]">
      
      {/* ========================================================================= */}
      {/* DYNAMIC BACKGROUND LAYER: SINGLE ACTIVE VIDEO OR SINGLE ACTIVE IMAGE      */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none select-none">
        <AnimatePresence mode="wait">
          
          {/* 1. SINGLE ACTIVE HERO IMAGE (Configured by admin) */}
          {bgMode === 'image' && (
            <motion.div
              key={`bg-image-${currentImage.id || currentImage.src}`}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <motion.img
                src={currentImage.src}
                alt={currentImage.name || "Prazna Heritage Visual"}
                fetchPriority="high"
                loading="eager"
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full object-cover object-center"
              />
              {/* Rich warm vignette and depth shadows */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/50" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.65)_70%,rgba(0,0,0,0.92)_100%)]" />
            </motion.div>
          )}

          {/* 2. SINGLE ACTIVE HERO 4K VIDEO (Configured by admin) */}
          {bgMode === 'video' && (
            <motion.div
              key={`bg-video-${currentVideo.videoId}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Instant High-Res Poster Fallback */}
              <img
                src={currentVideo.poster}
                alt={currentVideo.name}
                fetchPriority="high"
                loading="eager"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                  videoLoaded ? 'opacity-0' : 'opacity-100'
                }`}
              />

              {/* Verified High-Definition YouTube Embed */}
              <iframe
                key={currentVideo.videoId}
                src={`https://www.youtube-nocookie.com/embed/${currentVideo.videoId}?autoplay=1&mute=1&loop=1&playlist=${currentVideo.videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1`}
                title={currentVideo.name}
                frameBorder="0"
                loading="eager"
                allow="autoplay; encrypted-media"
                onLoad={() => setVideoLoaded(true)}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[max(100vw,177.78vh)] h-[max(100vh,56.25vw)] pointer-events-none border-0"
              />

              <div className="absolute inset-0 bg-black/30 backdrop-blur-[0.5px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/50" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.6)_75%,rgba(0,0,0,0.92)_100%)]" />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ========================================================================= */}
      {/* HERO OVERLAY CENTER CONTENT (Clean, Editorial, High-Impact)               */}
      {/* ========================================================================= */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center pt-28 pb-20">
        
        {/* Floating Brand Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-black/45 backdrop-blur-md mb-6 shadow-xl"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#C9A96E]" />
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#E5D2A8] font-medium">
            Fine-Art Cinema &amp; Photography
          </span>
        </motion.div>

        {/* Animated Main Headline */}
        <motion.h1
          key={`${bgMode}-${bgMode === 'video' ? currentVideo.id : currentImage.id}`}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-normal max-w-4xl leading-[1.14] tracking-tight drop-shadow-lg"
        >
          {bgMode === 'video'
            ? currentVideo.tagline || brand.tagline || siteConfig.brand.tagline
            : currentImage.tagline || brand.tagline || siteConfig.brand.tagline || "Celebrating love in its most real and beautiful moments."}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-sm sm:text-base md:text-lg text-white/85 max-w-2xl font-light mt-5 leading-relaxed drop-shadow"
        >
          {liveHero?.heroSubtitle || brand.subtitle || siteConfig.heroSubtitle}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-8 flex flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto"
        >
          <a
            href="#gallery"
            id="hero-see-portfolio"
            className="px-7 py-3.5 rounded-full text-xs sm:text-sm font-medium tracking-wide text-white bg-black/40 hover:bg-black/70 border border-white/40 hover:border-white transition-all backdrop-blur-md shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <span>Explore Portfolio</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-70" />
          </a>

          <a
            href="#custom-quote"
            id="hero-build-quote"
            onClick={onOpenQuote}
            className="px-7 py-3.5 rounded-full text-xs sm:text-sm font-medium tracking-wide text-white bg-[#56876D] hover:bg-[#46735c] transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
          >
            Build Your Quote
          </a>
        </motion.div>

        {/* Availability Line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-4 text-xs text-white/70"
        >
          <a
            href="#booking"
            className="hover:text-white hover:underline transition-colors"
          >
            {siteConfig.heroAvailability}
          </a>
        </motion.div>

        {/* Active Cinema / Film Tagline Badge */}
        {bgMode === 'video' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-6 px-4 py-2 rounded-full bg-black/60 backdrop-blur-xl border border-[#C9A96E]/30 inline-flex items-center gap-2 shadow-2xl"
          >
            <Film className="w-3.5 h-3.5 text-[#C9A96E]" />
            <span className="text-xs text-white/90 font-medium">
              Featured 4K Film: <strong className="text-[#E5D2A8]">{currentVideo.name}</strong>
            </span>
            {currentVideo.location && (
              <>
                <span className="text-white/40">•</span>
                <span className="text-[11px] text-white/70">{currentVideo.location}</span>
              </>
            )}
          </motion.div>
        )}

        {/* Active Image Badge */}
        {bgMode === 'image' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-6 px-4 py-2 rounded-full bg-black/60 backdrop-blur-xl border border-[#C9A96E]/30 inline-flex items-center gap-2 shadow-2xl"
          >
            <Crown className="w-3.5 h-3.5 text-[#C9A96E]" />
            <span className="text-xs text-white/90 font-medium">
              Featured Fine-Art Still: <strong className="text-[#E5D2A8]">{currentImage.name}</strong>
            </span>
            {currentImage.location && (
              <>
                <span className="text-white/40">•</span>
                <span className="text-[11px] text-white/70">{currentImage.location}</span>
              </>
            )}
          </motion.div>
        )}

        {/* Dynamic Animated Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mt-10 pt-8 border-t border-white/15 max-w-3xl w-full"
        >
          {siteConfig.stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className="font-serif text-2xl sm:text-3xl font-semibold text-white drop-shadow">
                {stat.value}
              </span>
              <span className="text-[10px] sm:text-xs text-white/70 uppercase tracking-widest mt-0.5">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

      </div>

      {/* Hero Scroll Down Indicator */}
      <a
        href="#gallery"
        aria-label="Scroll down to portfolio"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center group"
      >
        <div className="w-[18px] h-[30px] rounded-full border border-white/40 flex items-start justify-center p-1 group-hover:border-white transition-colors">
          <span className="w-1 h-2 rounded-full bg-white animate-bounce" />
        </div>
      </a>
    </section>
  );
};
