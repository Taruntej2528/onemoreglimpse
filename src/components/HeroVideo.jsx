import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Film, Image as ImageIcon, Crown, Play, Pause, ChevronRight } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export const HeroVideo = ({ onOpenQuote }) => {
  // Background modes: 'bride' (Heritage Silk Saree), 'video' (4K Cinema Film), 'mosaic' (Photriya Collage Wall)
  const [bgMode, setBgMode] = useState('bride');
  const [selectedSceneId, setSelectedSceneId] = useState(siteConfig.defaultHeroSceneId || 'varsha-shiva');
  const [videoLoaded, setVideoLoaded] = useState(false);

  const currentScene = siteConfig.heroScenes.find(s => s.id === selectedSceneId) || siteConfig.heroScenes[0];

  useEffect(() => {
    setVideoLoaded(false);
  }, [selectedSceneId]);

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0A0C10]">
      
      {/* ========================================================================= */}
      {/* DYNAMIC BACKGROUND LAYER: SWITCH BETWEEN 3 DISTINCT LUXURY VISUAL MODES */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none select-none">
        <AnimatePresence mode="wait">
          
          {/* 1. HERITAGE BRIDE SHOWCASE (Matching Knoty Weddings emerald silk saree bride) */}
          {bgMode === 'bride' && (
            <motion.div
              key="bg-bride"
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <motion.img
                src="/assets/hero-green-saree-bride.jpg"
                alt="Prazna Heritage Silk Bride"
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

          {/* 2. 4K CINEMA STREAMING (Varsha & Shiva, Athiya & Rahul, Royal Jaipur) */}
          {bgMode === 'video' && (
            <motion.div
              key={`bg-video-${currentScene.videoId}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Instant High-Res Poster Fallback */}
              <img
                src={currentScene.poster}
                alt={currentScene.name}
                fetchPriority="high"
                loading="eager"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                  videoLoaded ? 'opacity-0' : 'opacity-100'
                }`}
              />

              {/* Verified High-Definition YouTube Embed */}
              <iframe
                key={currentScene.videoId}
                src={`https://www.youtube-nocookie.com/embed/${currentScene.videoId}?autoplay=1&mute=1&loop=1&playlist=${currentScene.videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1`}
                title={currentScene.name}
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

          {/* 3. PHOTRIYA MOSAIC COLLAGE WALL (Matching Photriya Studios reference) */}
          {bgMode === 'mosaic' && (
            <motion.div
              key="bg-mosaic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 w-full h-full overflow-hidden"
            >
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 w-[110%] h-[110%] -translate-x-[5%] -translate-y-[5%] filter grayscale contrast-110 brightness-60">
                {siteConfig.gallery.slice(0, 24).map((photo, i) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: [0.55, 0.8, 0.55] }}
                    transition={{ duration: 6 + (i % 5), repeat: Infinity, ease: "easeInOut" }}
                    className="overflow-hidden rounded-md bg-stone-900 aspect-[4/5]"
                  >
                    <img
                      src={photo.src}
                      alt={photo.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.75)_80%,rgba(0,0,0,0.96)_100%)]" />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ========================================================================= */}
      {/* FLOATING TOP/CORNER CONTROLLER: BACKGROUND THEME MODE SELECTOR            */}
      {/* ========================================================================= */}
      <div className="absolute top-24 sm:top-28 right-4 sm:right-8 z-30 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="p-1 rounded-full bg-black/65 backdrop-blur-xl border border-white/20 flex items-center gap-1 shadow-2xl"
        >
          <span className="text-[10px] text-white/50 uppercase tracking-wider pl-2.5 pr-1 hidden md:inline font-mono">
            Background:
          </span>

          <button
            onClick={() => setBgMode('bride')}
            title="Heritage Bride Visual"
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
              bgMode === 'bride'
                ? 'bg-[#56876D] text-white shadow-md font-semibold'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Crown className="w-3 h-3 text-[#E5D2A8]" />
            <span>Heritage Bride</span>
          </button>

          <button
            onClick={() => setBgMode('video')}
            title="4K Cinema Wedding Film"
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
              bgMode === 'video'
                ? 'bg-[#56876D] text-white shadow-md font-semibold'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Film className="w-3 h-3 text-[#C9A96E]" />
            <span>4K Film</span>
          </button>

          <button
            onClick={() => setBgMode('mosaic')}
            title="Photriya Photo Mosaic Wall"
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
              bgMode === 'mosaic'
                ? 'bg-[#56876D] text-white shadow-md font-semibold'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <ImageIcon className="w-3 h-3 text-[#E5D2A8]" />
            <span>Photo Wall</span>
          </button>
        </motion.div>
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
          key={`${bgMode}-${selectedSceneId}`}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-normal max-w-4xl leading-[1.14] tracking-tight drop-shadow-lg"
        >
          {bgMode === 'video'
            ? currentScene.tagline
            : siteConfig.brand.tagline || "Celebrating love in its most real and beautiful moments."}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-sm sm:text-base md:text-lg text-white/85 max-w-2xl font-light mt-5 leading-relaxed drop-shadow"
        >
          {siteConfig.heroSubtitle}
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
            className="px-7 py-3.5 rounded-full text-xs sm:text-sm font-medium tracking-wide text-white bg-[#56876D] hover:bg-[#46735c] transition-all shadow-xl hover:scale-105 active:scale-95"
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

        {/* Video Scene Switcher (Visible when '4K Film' mode is active) */}
        {bgMode === 'video' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-8 p-1.5 rounded-full bg-black/70 backdrop-blur-xl border border-white/20 flex flex-wrap items-center justify-center gap-1.5 shadow-2xl"
          >
            <span className="text-[10px] text-white/60 uppercase tracking-widest px-3 hidden sm:inline">
              Select Wedding Film:
            </span>
            {siteConfig.heroScenes.map((scene) => {
              const isSelected = selectedSceneId === scene.id;
              return (
                <button
                  key={scene.id}
                  onClick={() => setSelectedSceneId(scene.id)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-300 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#56876D] text-white shadow-md font-semibold'
                      : 'text-white/75 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  <span>{scene.name}</span>
                </button>
              );
            })}
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
