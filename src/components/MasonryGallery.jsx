import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Eye, MapPin, ArrowRight } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { PhotoLightbox } from './PhotoLightbox';

export const MasonryGallery = ({ isDarkMode }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const filteredPhotos = useMemo(() => {
    if (activeCategory === 'all') return siteConfig.gallery;
    return siteConfig.gallery.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  return (
    <section id="gallery" className={`py-24 transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0C0E14]' : 'bg-[#FAF8F5]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-black/5 dark:border-white/5 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-[1.5px] bg-[#56876D]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#56876D]">
                VISUAL STORIES
              </span>
            </div>
            <h2 className={`font-serif text-3xl sm:text-5xl font-normal tracking-tight ${
              isDarkMode ? 'text-white' : 'text-[#1A1D20]'
            }`}>
              Curated Masterpieces
            </h2>
            <p className={`text-xs sm:text-sm mt-1 font-light ${
              isDarkMode ? 'text-neutral-400' : 'text-[#5C6470]'
            }`}>
              Every photograph is captured with editorial precision and honest emotion. Click to inspect full resolution.
            </p>
          </motion.div>

          <motion.a
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            href="#booking"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#56876D] hover:underline"
          >
            <span>Book your celebration dates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.a>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-10">
          {siteConfig.categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium tracking-wider transition-all duration-200 relative ${
                  isActive
                    ? isDarkMode
                      ? 'bg-white text-black font-semibold shadow-md'
                      : 'bg-[#1A1D20] text-white font-semibold shadow-md'
                    : isDarkMode
                      ? 'bg-[#141824] text-neutral-300 hover:text-white border border-white/10'
                      : 'bg-white text-[#5C6470] hover:text-[#1A1D20] border border-[#E0DCD3]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Non-overlapping Pure CSS Multi-Column Masonry */}
        <div className="masonry-columns">
          {filteredPhotos.map((photo, idx) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (idx % 6) * 0.08 }}
              onClick={() => setSelectedPhoto(photo)}
              className={`masonry-item group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-2xl border ${
                isDarkMode ? 'bg-[#151922] border-white/10' : 'bg-white border-[#EBE7DF]'
              }`}
            >
              {/* Natural aspect ratio image prevents overlap & clipping */}
              <img
                src={photo.src}
                alt={photo.title}
                loading="lazy"
                className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-600 ease-out"
              />

              {/* Gentle dark gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-5">
                
                {/* Top Badge */}
                <div className="flex justify-end">
                  <span className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20">
                    <Eye className="w-4 h-4" />
                  </span>
                </div>

                {/* Bottom Story Metadata */}
                <div>
                  {photo.location && (
                    <div className="flex items-center gap-1.5 text-xs text-[#C9A96E] font-medium mb-1 drop-shadow">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{photo.location}</span>
                    </div>
                  )}
                  <h3 className="font-serif text-lg text-white font-medium leading-snug drop-shadow-md">
                    {photo.title}
                  </h3>
                  {photo.subtitle && (
                    <p className="text-xs text-white/80 font-light mt-0.5 line-clamp-2 drop-shadow">
                      {photo.subtitle}
                    </p>
                  )}
                </div>

              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      <PhotoLightbox
        photo={selectedPhoto}
        photos={filteredPhotos}
        onClose={() => setSelectedPhoto(null)}
        onSelectPhoto={(photo) => setSelectedPhoto(photo)}
      />
    </section>
  );
};
