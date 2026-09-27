import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Film, Play, MapPin, Maximize2, Award, Clock, LayoutGrid, Rows } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { VideoModal } from './VideoModal';

export const FilmsCarousel = ({ isDarkMode }) => {
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' (multiple in a row) or 'carousel'

  return (
    <section id="films" className={`py-24 transition-colors duration-300 relative overflow-hidden ${
      isDarkMode ? 'bg-[#0E1118]' : 'bg-[#FAF8F5]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with View Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-[1.5px] bg-[#56876D]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#56876D]">
                CINEMATIC MASTER FILMS
              </span>
            </div>
            <h2 className={`font-serif text-3xl sm:text-5xl font-normal tracking-tight ${
              isDarkMode ? 'text-white' : 'text-[#1A1D20]'
            }`}>
              Wedding Films
            </h2>
            <p className={`text-xs sm:text-base mt-2 font-light ${
              isDarkMode ? 'text-neutral-400' : 'text-[#5C6470]'
            }`}>
              Click any film card to experience our cinematic master trailers in immersive full-screen mode.
            </p>
          </motion.div>

          {/* View Mode Switcher (Grid: 3 in a Row vs Carousel) */}
          <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-full border border-black/10 dark:border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? isDarkMode ? 'bg-white text-black shadow-md' : 'bg-[#1A1D20] text-white shadow-md'
                  : 'text-neutral-500 hover:text-current'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Multi-Card Grid</span>
            </button>

            <button
              onClick={() => setViewMode('carousel')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'carousel'
                  ? isDarkMode ? 'bg-white text-black shadow-md' : 'bg-[#1A1D20] text-white shadow-md'
                  : 'text-neutral-500 hover:text-current'
              }`}
            >
              <Rows className="w-3.5 h-3.5" />
              <span>Horizontal Slider</span>
            </button>
          </div>
        </div>

        {/* MULTIPLE VIDEOS IN A ROW (3 in a Row on Desktop, 2 on Tablet, 1 on Mobile) */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {siteConfig.films.map((film, idx) => (
              <motion.div
                key={film.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                onClick={() => setSelectedFilm(film)}
                className={`group relative rounded-3xl overflow-hidden cursor-pointer bg-black transition-all duration-300 hover:shadow-2xl flex flex-col border ${
                  isDarkMode ? 'border-white/10 hover:border-[#56876D]/60' : 'border-[#EAE6DE] hover:border-[#56876D]'
                }`}
              >
                {/* 16:9 Landscape Thumbnail Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <img
                    src={film.thumbnail}
                    alt={film.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-75 group-hover:opacity-65 transition-opacity" />

                  {/* Award Highlight Badge */}
                  {film.highlight && (
                    <div className="absolute top-3.5 left-3.5 z-10">
                      <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-black/65 backdrop-blur-md text-[#E5D2A8] border border-white/20 flex items-center gap-1 shadow-md">
                        <Award className="w-3 h-3 text-[#C9A96E]" />
                        <span>{film.highlight}</span>
                      </span>
                    </div>
                  )}

                  {/* Duration Badge */}
                  {film.duration && (
                    <div className="absolute bottom-3.5 right-3.5 z-10">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-medium bg-black/75 backdrop-blur-md text-white/90 border border-white/15 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#56876D]" />
                        <span>{film.duration}</span>
                      </span>
                    </div>
                  )}

                  {/* Centered Pulsing Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/95 group-hover:bg-white text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300">
                      <Play className="w-5 h-5 fill-black translate-x-0.5" />
                    </div>
                  </div>

                  {/* Fullscreen Pill Top Right */}
                  <div className="absolute top-3.5 right-3.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/25 flex items-center gap-1.5 shadow-md">
                      <Maximize2 className="w-3 h-3" />
                      <span>Play Full Screen</span>
                    </span>
                  </div>
                </div>

                {/* Card Meta Content */}
                <div className={`p-5 sm:p-6 flex-1 flex flex-col justify-between ${
                  isDarkMode ? 'bg-[#121620]' : 'bg-white'
                }`}>
                  <div>
                    {film.location && (
                      <div className="flex items-center gap-1.5 text-xs text-[#56876D] font-medium mb-1.5">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{film.location}</span>
                      </div>
                    )}

                    <h3 className={`font-serif text-lg sm:text-xl font-medium leading-tight ${
                      isDarkMode ? 'text-white' : 'text-[#1A1D20]'
                    }`}>
                      {film.title}
                    </h3>

                    {film.tagline && (
                      <p className={`text-xs font-light mt-1.5 line-clamp-2 ${
                        isDarkMode ? 'text-neutral-400' : 'text-[#5C6470]'
                      }`}>
                        {film.tagline}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs font-medium text-[#56876D]">
                    <span className="group-hover:underline">Watch Full Screen Film</span>
                    <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Horizontal Slider View */
          <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-6 pt-1">
            {siteConfig.films.map((film) => (
              <div
                key={film.id}
                onClick={() => setSelectedFilm(film)}
                className="min-w-[320px] sm:min-w-[480px] md:min-w-[560px] snap-start group relative rounded-3xl overflow-hidden cursor-pointer bg-black transition-all duration-300 hover:shadow-2xl flex-shrink-0 aspect-video border border-black/10 dark:border-white/10"
              >
                <img
                  src={film.thumbnail}
                  alt={film.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-70 transition-opacity" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/95 group-hover:bg-white text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all">
                    <Play className="w-6 h-6 fill-black translate-x-0.5" />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 z-10 flex items-end justify-between">
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-medium text-white leading-tight drop-shadow-md">
                      {film.title}
                    </h3>
                    <p className="text-xs text-white/80 font-light mt-1 drop-shadow">
                      {film.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#E5D2A8] font-medium group-hover:translate-x-1 transition-transform flex-shrink-0 ml-4">
                    <span>Watch Full Screen</span>
                    <span>&rarr;</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* True Full-Screen Cinema Video Modal */}
      <VideoModal
        film={selectedFilm}
        onClose={() => setSelectedFilm(null)}
      />
    </section>
  );
};
