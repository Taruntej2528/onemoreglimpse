import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingsAPI, eventsAPI, categoriesAPI, requestsAPI } from '../services/api';
import { siteConfig as fallbackConfig } from '../config/siteConfig';

const SiteContext = createContext(null);

export const SiteProvider = ({ children }) => {
  const [siteSettings, setSiteSettings] = useState(null);
  const [packages, setPackages] = useState(fallbackConfig.pricing?.packages || []);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inquirySubmitting, setInquirySubmitting] = useState(false);

  // Fetch live settings and public website data
  const loadSiteData = useCallback(async () => {
    try {
      // 1. Fetch live settings
      const settingsRes = await settingsAPI.get().catch(() => null);
      if (settingsRes?.data) {
        setSiteSettings(settingsRes.data);
      }

      // 2. Fetch active packages
      const packagesRes = await eventsAPI.getActivePackages().catch(() => null);
      if (packagesRes?.data && packagesRes.data.length > 0) {
        setPackages(packagesRes.data);
      }

      // 3. Fetch active portfolio categories
      const categoriesRes = await categoriesAPI.getActive().catch(() => null);
      if (categoriesRes?.data && categoriesRes.data.length > 0) {
        setCategories(categoriesRes.data);
      }
    } catch (err) {
      console.warn('[SiteContext] Falling back to default siteConfig:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSiteData();
    const handleUpdate = () => {
      loadSiteData();
    };
    window.addEventListener('site-settings-updated', handleUpdate);
    return () => window.removeEventListener('site-settings-updated', handleUpdate);
  }, [loadSiteData]);

  // Derived Brand Information (combining backend settings with fallback)
  const brand = {
    ...fallbackConfig.brand,
    ...(siteSettings?.brand || {}),
  };

  // Derived Hero Information
  const hero = {
    heroMediaType: siteSettings?.hero?.heroMediaType || 'video',
    activeHeroVideoId: siteSettings?.hero?.activeHeroVideoId || 'varsha-shiva',
    activeHeroImageId: siteSettings?.hero?.activeHeroImageId || 'heritage-bride-silk',
    heroVideos:
      siteSettings?.hero?.heroVideos && siteSettings.hero.heroVideos.length > 0
        ? siteSettings.hero.heroVideos
        : fallbackConfig.heroScenes || [],
    heroImages:
      siteSettings?.hero?.heroImages && siteSettings.hero.heroImages.length > 0
        ? siteSettings.hero.heroImages
        : [
            {
              id: 'heritage-bride-silk',
              name: 'Royal Emerald Silk Bride',
              src: '/assets/hero-green-saree-bride.jpg',
              location: 'Hyderabad Heritage Palace',
              tagline: 'Immortalizing timeless bridal composure & handcrafted silks.',
            },
          ],
    heroSubtitle:
      siteSettings?.hero?.heroSubtitle ||
      'Preserving the emotions, joy, and magic that make your love story truly yours.',
    heroAvailability:
      siteSettings?.hero?.heroAvailability || 'Limited availability. Enquire now.',
  };

  // Active Hero Media Objects
  const activeHeroVideo =
    hero.heroVideos.find((v) => v.id === hero.activeHeroVideoId) ||
    hero.heroVideos[0] ||
    null;

  const activeHeroImage =
    hero.heroImages.find((img) => img.id === hero.activeHeroImageId) ||
    hero.heroImages[0] ||
    null;

  // Derived Footer Information
  const footer = {
    brandName: siteSettings?.footer?.brandName || brand.name || 'PRAZNA PHOTOGRAPHY',
    tagline: siteSettings?.footer?.tagline || brand.tagline,
    description:
      siteSettings?.footer?.description ||
      'Over two decades of documenting royal palace weddings and destination celebrations. Harmonizing classic fine-art portraiture with unobtrusive, soul-stirring documentary filmmaking.',
    copyright:
      siteSettings?.footer?.copyright ||
      'PRAZNA PHOTOGRAPHY. All rights reserved. Fine-Art Heritage Cinema.',
    badgeText:
      siteSettings?.footer?.badgeText || 'Honoring Sacred Vows Since 2000 • 38+ Global Honors',
    address:
      siteSettings?.footer?.address ||
      'Bespoke Studios in Hyderabad, Bengaluru & Mumbai. Available for destination celebrations worldwide.',
    showNewsletter: siteSettings?.footer?.showNewsletter ?? true,
    showSocialIcons: siteSettings?.footer?.showSocialIcons ?? true,
    newsletterHeading:
      siteSettings?.footer?.newsletterHeading ||
      'Receive Studio Monographs & Seasonal Availability',
    newsletterSubtitle:
      siteSettings?.footer?.newsletterSubtitle ||
      'Strictly reserved for prospective couples and royal celebrations. No spam.',
  };

  // Derived Philosophy
  const philosophy = siteSettings?.philosophy?.pillars?.length
    ? siteSettings.philosophy
    : fallbackConfig.philosophy;

  // Derived Films
  const films = siteSettings?.films?.length
    ? siteSettings.films
    : fallbackConfig.films;

  // Derived Testimonials
  const testimonials = siteSettings?.testimonials?.length
    ? siteSettings.testimonials
    : fallbackConfig.testimonials;

  // Derived Curated Masterpieces Gallery
  const gallery = siteSettings?.gallery?.length
    ? siteSettings.gallery
    : fallbackConfig.gallery;

  // Derived Social Links
  const socialLinks = siteSettings?.socialLinks?.length
    ? siteSettings.socialLinks
    : [
        { id: 'whatsapp', platform: 'WhatsApp Booking', url: `https://wa.me/${brand.whatsappNumber}`, active: true },
        { id: 'instagram', platform: 'Instagram Portfolio', url: brand.instagram, active: true },
      ];

  // Derived Packages & Quote Builder Engine
  const signaturePackages = siteSettings?.signaturePackages?.length
    ? siteSettings.signaturePackages
    : (packages?.length ? packages : fallbackConfig.signaturePackages);

  const quoteEvents = siteSettings?.quoteEvents?.length
    ? siteSettings.quoteEvents
    : fallbackConfig.quoteEvents;

  const teamAddOns = siteSettings?.teamAddOns
    ? { ...fallbackConfig.teamAddOns, ...siteSettings.teamAddOns }
    : fallbackConfig.teamAddOns;

  const stats = siteSettings?.stats?.length
    ? siteSettings.stats
    : fallbackConfig.stats;

  const seo = siteSettings?.seo || fallbackConfig.seo;

  /**
   * Submit Date Inquiry or Bespoke Quote to MongoDB
   * @param {Object} inquiryData
   */
  const submitInquiry = async (inquiryData) => {
    setInquirySubmitting(true);
    try {
      const response = await requestsAPI.submit(inquiryData);
      setInquirySubmitting(false);
      return {
        success: true,
        message: response.message || 'Your inquiry has been received. Our concierge will be in touch shortly.',
        data: response.data,
      };
    } catch (err) {
      setInquirySubmitting(false);
      return {
        success: false,
        message: err.message || 'Failed to submit inquiry. Please try again or reach us via WhatsApp.',
      };
    }
  };

  return (
    <SiteContext.Provider
      value={{
        siteSettings,
        brand,
        hero,
        footer,
        packages,
        signaturePackages,
        quoteEvents,
        teamAddOns,
        stats,
        seo,
        categories,
        philosophy,
        films,
        testimonials,
        gallery,
        socialLinks,
        activeHeroVideo,
        activeHeroImage,
        loading,
        inquirySubmitting,
        submitInquiry,
        refreshSettings: loadSiteData,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
};
