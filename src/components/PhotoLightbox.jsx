import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Tag } from 'lucide-react';

export const PhotoLightbox = ({ photo, photos, onClose, onSelectPhoto }) => {
  if (!photo) return null;

  const currentIndex = photos.findIndex((p) => p.id === photo.id);

  const handlePrev = (e) => {
    e.stopPropagation();
    const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
    onSelectPhoto(photos[prevIndex]);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    const nextIndex = (currentIndex + 1) % photos.length;
    onSelectPhoto(photos[nextIndex]);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev(e);
      if (e.key === 'ArrowRight') handleNext(e);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, photos]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[#0C0E14]/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8 animate-fade-in"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close Lightbox"
        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev button */}
      {photos.length > 1 && (
        <button
          onClick={handlePrev}
          aria-label="Previous Image"
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-50 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-[#C9A96E] hover:text-black text-white transition-all backdrop-blur-md"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next button */}
      {photos.length > 1 && (
        <button
          onClick={handleNext}
          aria-label="Next Image"
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-50 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-[#C9A96E] hover:text-black text-white transition-all backdrop-blur-md"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Center Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-5xl max-h-[90vh] flex flex-col items-center"
      >
        <img
          src={photo.src}
          alt={photo.title}
          className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-white/10"
        />

        {/* Caption Card */}
        <div className="mt-4 text-center max-w-xl">
          <div className="flex items-center justify-center gap-3 mb-1 text-xs text-[#C9A96E] uppercase tracking-widest">
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              {photo.category}
            </span>
            {photo.location && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-neutral-400">
                  <MapPin className="w-3.5 h-3.5 text-[#C9A96E]" />
                  {photo.location}
                </span>
              </>
            )}
          </div>
          <h3 className="font-serif text-xl sm:text-2xl text-white font-medium">
            {photo.title}
          </h3>
          {photo.subtitle && (
            <p className="text-sm text-neutral-400 font-light mt-0.5">
              {photo.subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
