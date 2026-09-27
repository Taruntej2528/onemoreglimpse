import React from 'react';
import { Star, Quote } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export const Testimonials = ({ isDarkMode }) => {
  return (
    <section id="testimonials" className={`py-20 transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0C0E14]' : 'bg-[#FAF8F5]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-5 h-[1.5px] bg-[#56876D]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#56876D]">
              CLIENT LOVE
            </span>
          </div>
          <h2 className={`font-serif text-3xl sm:text-5xl font-normal tracking-tight ${
            isDarkMode ? 'text-white' : 'text-[#1A1D20]'
          }`}>
            Kind Words
          </h2>
          <p className={`text-xs sm:text-base font-light mt-2 ${
            isDarkMode ? 'text-neutral-400' : 'text-[#5C6470]'
          }`}>
            Over {siteConfig.brand.weddingsCount} stories captured with genuine affection and timeless elegance.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {siteConfig.testimonials.map((item, idx) => (
            <div
              key={idx}
              className={`p-7 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:shadow-lg border ${
                isDarkMode
                  ? 'bg-[#141824] border-white/10 hover:border-white/20'
                  : 'bg-white border-[#EBE7DF] hover:border-[#1A1D20]/20 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
              }`}
            >
              <Quote className="w-8 h-8 text-[#56876D]/40 mb-4" />

              <p className={`text-sm font-light leading-relaxed mb-6 italic ${
                isDarkMode ? 'text-neutral-300' : 'text-[#2D3139]'
              }`}>
                "{item.review}"
              </p>

              <div className="pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                <div>
                  <h4 className={`font-serif text-base font-medium ${
                    isDarkMode ? 'text-white' : 'text-[#1A1D20]'
                  }`}>
                    {item.name}
                  </h4>
                  <p className="text-xs text-[#56876D]">
                    {item.event}
                  </p>
                </div>

                <div className="flex gap-1 text-[#C9A96E]">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#C9A96E]" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
