import React from 'react';
import { Star, Quote } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { useSite } from '../context/SiteContext';

export const Testimonials = ({ isDarkMode }) => {
  const { testimonials: liveTestimonials, brand: liveBrand } = useSite();
  const brand = liveBrand || siteConfig.brand || {};
  const testimonialsList =
    liveTestimonials && liveTestimonials.length > 0
      ? liveTestimonials
      : siteConfig.testimonials;

  // Determine optimal responsive grid layout based on review count
  const getGridClass = (count) => {
    if (count <= 1) return 'max-w-xl mx-auto grid grid-cols-1';
    if (count === 2) return 'max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8';
    if (count === 4) return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6';
    return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8';
  };

  return (
    <section id="testimonials" className={`py-24 transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0C0E14]' : 'bg-[#FAF8F5]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-5 h-[1.5px] bg-[#56876D]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#56876D]">
              CLIENT LOVE &amp; CELEBRATION STORIES
            </span>
            <span className="w-5 h-[1.5px] bg-[#56876D]" />
          </div>
          <h2 className={`font-serif text-3xl sm:text-5xl font-normal tracking-tight ${
            isDarkMode ? 'text-white' : 'text-[#1A1D20]'
          }`}>
            Kind Words
          </h2>
          <p className={`text-xs sm:text-base font-light mt-2 ${
            isDarkMode ? 'text-neutral-400' : 'text-[#5C6470]'
          }`}>
            Over {brand.weddingsCount || siteConfig.brand?.weddingsCount || '4,500+'} stories captured with genuine affection and timeless elegance.
          </p>
        </div>

        {/* Dynamic Responsive Cards Grid */}
        <div className={getGridClass(testimonialsList.length)}>
          {testimonialsList.map((item, idx) => {
            const ratingCount = Math.max(1, Math.min(5, Number(item.rating) || 5));
            return (
              <div
                key={idx}
                className={`p-7 sm:p-8 rounded-3xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border h-full ${
                  isDarkMode
                    ? 'bg-[#141824] border-white/10 hover:border-[#56876D]/40'
                    : 'bg-white border-[#EBE7DF] hover:border-[#56876D]/50 shadow-[0_4px_25px_rgba(0,0,0,0.03)]'
                }`}
              >
                <div>
                  <Quote className="w-8 h-8 text-[#56876D]/40 mb-4" />
                  <p className={`text-sm sm:text-[15px] font-light leading-relaxed mb-6 italic ${
                    isDarkMode ? 'text-neutral-200' : 'text-[#2D3139]'
                  }`}>
                    "{item.review}"
                  </p>
                </div>

                <div className="pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-3">
                  <div>
                    <h4 className={`font-serif text-base font-medium ${
                      isDarkMode ? 'text-white' : 'text-[#1A1D20]'
                    }`}>
                      {item.name}
                    </h4>
                    <p className="text-xs text-[#56876D] mt-0.5">
                      {item.event}
                    </p>
                  </div>

                  <div className="flex gap-1 text-[#C9A96E] shrink-0">
                    {[...Array(ratingCount)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#C9A96E]" />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
