import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Film, Award, ShieldCheck, Camera } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export const PhilosophyBanner = ({ isDarkMode }) => {
  const pillars = [
    {
      icon: Heart,
      title: "Unscripted Emotion",
      desc: "No stiff poses or staged smiles. We capture the stolen glances, joyous family tears, and spontaneous festive ecstasy."
    },
    {
      icon: Sparkles,
      title: "Fine-Art Color Grading",
      desc: "Every frame is hand-mastered with rich jewel tones, skin-true warmth, and editorial cinematic contrast."
    },
    {
      icon: Film,
      title: "Cinema-Grade Audio & Optics",
      desc: "Broadcast wireless mics record sacred Vedic mantras, tender wedding vows, and heartfelt parent toasts with crystalline fidelity."
    }
  ];

  return (
    <section className={`py-24 transition-colors duration-300 relative overflow-hidden ${
      isDarkMode ? 'bg-[#0E1118]' : 'bg-[#F5F2EB]'
    }`}>
      {/* Subtle ambient blur embellishments */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#56876D]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#C9A96E]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Editorial Quote Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-3"
          >
            <span className="w-6 h-[1.5px] bg-[#56876D]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#56876D]">
              OUR PHILOSOPHY
            </span>
            <span className="w-6 h-[1.5px] bg-[#56876D]" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className={`font-serif text-3xl sm:text-4xl md:text-5xl font-normal leading-[1.25] tracking-tight ${
              isDarkMode ? 'text-white' : 'text-[#1A1D20]'
            }`}
          >
            "We don't simply record ceremonies; <br />
            <span className="italic font-light text-[#56876D]">we curate timeless heirlooms."</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className={`text-sm sm:text-base font-light mt-4 leading-relaxed ${
              isDarkMode ? 'text-neutral-400' : 'text-[#5C6470]'
            }`}
          >
            {siteConfig.philosophy.leadParagraph}
          </motion.p>
        </div>

        {/* 3 Pillars Grid with Framer Motion Stagger */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className={`p-8 rounded-3xl border transition-all duration-300 relative group ${
                  isDarkMode
                    ? 'bg-[#141824] border-white/10 hover:border-[#56876D]/50 shadow-xl'
                    : 'bg-white border-[#EAE6DE] hover:border-[#56876D]/60 shadow-[0_4px_25px_rgba(0,0,0,0.03)]'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 ${
                  isDarkMode ? 'bg-[#1C2232] text-[#56876D]' : 'bg-[#F0F6F2] text-[#4A7C59]'
                }`}>
                  <Icon className="w-6 h-6 stroke-[1.8]" />
                </div>

                <h3 className={`font-serif text-xl font-medium mb-3 ${
                  isDarkMode ? 'text-white' : 'text-[#1A1D20]'
                }`}>
                  {pillar.title}
                </h3>

                <p className={`text-xs sm:text-sm font-light leading-relaxed ${
                  isDarkMode ? 'text-neutral-400' : 'text-[#5C6470]'
                }`}>
                  {pillar.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
