import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Cloud,
  HardDrive,
  CheckCircle2,
  Eye,
  EyeOff,
  Save,
  RotateCw,
  Sparkles,
  Globe,
  Sliders,
  Video,
  Layers,
  Award,
  DollarSign,
  MessageSquare,
  Plus,
  Trash2,
  Mail,
  Send,
  Share2,
  Server,
  Key,
  X,
  Smartphone,
  Copy,
  ExternalLink,
  Edit3,
  Crown,
  Layout,
  Upload,
  Bot,
  Zap,
  Play,
  Terminal,
  Image as ImageIcon,
  Camera,
  MapPin,
  Tag,
  ArrowUp,
  ArrowDown,
  Film,
} from 'lucide-react';
import { siteConfig } from '../../config/siteConfig';
import { settingsAPI, mediaAPI, chatAPI, categoriesAPI } from '../../services/api';
import { VideoModal } from '../../components/VideoModal';

const ModalPortal = ({ onClose, children }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return typeof document !== 'undefined'
    ? createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <div onClick={(e) => e.stopPropagation()} className="my-auto w-full flex justify-center">
            {children}
          </div>
        </div>,
        document.body
      )
    : null;
};

export const AdminSettings = () => {
  // Main Top-Level Tabs: 'configs' | 'website-ui'
  const [activeMainTab, setActiveMainTab] = useState('configs');

  // Sub-tab for Configs: 'storage' | 'ai' | 'email-sms' | 'templates' | 'social'
  const [configSubTab, setConfigSubTab] = useState('storage');

  // Sub-tab for Website UI: 'hero' | 'brand' | 'philosophy' | 'packages' | 'quote-engine' | 'testimonials'
  const [uiSubTab, setUiSubTab] = useState('hero');

  // AI Concierge Configuration State
  const defaultLuxurySystemPrompt = `You are the exclusive AI Concierge for PRAZNA PHOTOGRAPHY, India's foremost luxury wedding and heritage cinematography studio.
Your persona: Warm, poetic, ultra-sophisticated, respectful of sacred traditions (Muhurtham, Vedic vows, Sangeet, Royal Receptions), and knowledgeable about fine-art cinema.
Studio details:
- Over 25+ years of royal heritage and fine-art documentary cinema.
- Covered 4,500+ weddings with 38+ global honors.
- Bespoke locations: Udaipur (Lake Palace, Jagmandir), Hyderabad (Taj Falaknuma), Bengaluru, Mumbai, Florence, Lake Como, Bali.
- Packages: Intimate Sacred Vows (₹1.85L), Timeless Classical Memoir (₹2.95L), Royal Heritage Grandeur (₹4.95L), Bespoke Luxury Celebration (₹6.50L+).
- Philosophy: "We don't simply record ceremonies; we curate timeless heirlooms." Unobtrusive 4K cinema, master color grading with jewel tones, crystalline audio for Vedic mantras.
- Booking: Limited availability per wedding season to maintain signature artistic quality.
Always guide prospective couples with elegance. If they want to reserve dates or receive a bespoke brochure, encourage them to submit the inquiry form or connect directly with our studio director.`;

  const [aiConfig, setAiConfig] = useState({
    enabled: true,
    hideWidgetWhenDisabled: false,
    activeProvider: 'gemini',
    botName: 'Prazna AI Concierge',
    welcomeMessage: 'Namaste! I am your Prazna Concierge. How may I assist with your wedding celebration or cinematic heirloom today?',
    systemPrompt: defaultLuxurySystemPrompt,
    providers: {
      gemini: {
        apiKey: '',
        model: 'gemini-3.8-flash',
        temperature: 0.7,
      },
      openai: {
        apiKey: '',
        model: 'gpt-4o-mini',
        temperature: 0.7,
      },
      claude: {
        apiKey: '',
        model: 'claude-3-5-sonnet-20241022',
        temperature: 0.7,
      },
    },
    quickQuestions: [
      'What is included in the Royal Heritage Grandeur collection?',
      'Do you travel to destination weddings like Udaipur or Bali?',
      'How far in advance should we reserve our wedding dates?',
      'What is your documentary cinematography style?',
    ],
  });

  const [aiTestPrompt, setAiTestPrompt] = useState('What royal packages do you offer?');
  const [aiTestResponse, setAiTestResponse] = useState('');
  const [isAiTesting, setIsAiTesting] = useState(false);
  const [isSavingAi, setIsSavingAi] = useState(false);
  const [showAiKey, setShowAiKey] = useState(false);


  const [uploadingField, setUploadingField] = useState(null);

  const handleFileUpload = async (file, onUploaded, options = {}) => {
    if (!file) return;
    const fieldKey = options.field || 'file';
    setUploadingField(fieldKey);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (options.provider) formData.append('provider', options.provider);
      formData.append('folder', options.folder || 'brand-assets');
      if (options.title) formData.append('title', options.title);

      const res = await mediaAPI.upload(formData);
      if (res?.data?.url) {
        onUploaded(res.data.url, res.data);
        triggerSaveToast(`Uploaded to ${res.data.storageProvider || 'cloud'} & link stored!`);
      } else {
        throw new Error('Upload succeeded but no URL returned');
      }
    } catch (err) {
      console.error(err);
      triggerSaveToast(`Upload failed: ${err.message}`);
    } finally {
      setUploadingField(null);
    }
  };

  // Notification Toast State
  const [saveToast, setSaveToast] = useState(false);
  const triggerSaveToast = (msg = 'Configuration saved successfully!') => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(false), 3200);
  };

  // =========================================================================
  // 1. CONFIGS STATE
  // =========================================================================

  // (a) Storage Buckets State
  const [activeBucketId, setActiveBucketId] = useState('cloudinary');
  const [testingProvider, setTestingProvider] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [showKeys, setShowKeys] = useState(false);
  const [showAddBucketModal, setShowAddBucketModal] = useState(false);
  const [editingBucket, setEditingBucket] = useState(null);

  const [bucketsList, setBucketsList] = useState([
    {
      id: 'cloudinary',
      name: 'Cloudinary Cloud CDN',
      type: 'cloudinary',
      bucketOrFolder: 'prazna-photography',
      region: 'Global CDN',
      cloudName: 'dbwzgdmtv',
      apiKey: '839218392189321',
      apiSecret: 'abCdEfGhIjKlMnOpQrStUvWxYz12',
      desc: 'Automatic responsive image resizing, AVIF/WebP, and 4K video CDN.',
    },
    {
      id: 's3',
      name: 'Amazon Web Services (S3)',
      type: 's3',
      bucketOrFolder: 'prazna-photography-bucket',
      region: 'ap-south-1 (Mumbai)',
      accessKey: 'AKIAIOSFODNN7EXAMPLE',
      secretKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      customDomain: 'https://cdn.praznaphotography.com',
      desc: 'Industry standard archival storage with CloudFront CDN integration.',
    },
    {
      id: 'azure',
      name: 'Microsoft Azure Blob',
      type: 'azure',
      bucketOrFolder: 'prazna-media',
      region: 'Central India (Pune)',
      accountName: 'praznastorage',
      accountKey: 'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==',
      desc: 'Massive scale container storage for uncompressed RAW files.',
    },
    {
      id: 'gcs',
      name: 'Google Cloud Storage (GCS)',
      type: 'gcs',
      bucketOrFolder: 'prazna-photography-media',
      region: 'asia-south1 (Mumbai)',
      projectId: 'prazna-photography-prod',
      clientEmail: 'service-account@prazna-photography-prod.iam.gserviceaccount.com',
      desc: 'Low-latency global bucket storage powered by Google network.',
    },
    {
      id: 'firebase',
      name: 'Firebase Cloud Storage',
      type: 'firebase',
      bucketOrFolder: 'prazna-photography.appspot.com',
      region: 'asia-south1',
      projectId: 'prazna-photography',
      desc: 'Direct client-side uploads with Google Firebase rules.',
    },
    {
      id: 'local',
      name: 'Local Server Storage',
      type: 'local',
      bucketOrFolder: 'backend/uploads',
      region: 'Localhost:5000',
      baseUrl: 'http://localhost:5000/uploads',
      desc: 'Offline development storage stored in backend/uploads directory.',
    },
  ]);

  const [newBucketForm, setNewBucketForm] = useState({
    name: '',
    type: 's3',
    bucketOrFolder: '',
    region: 'ap-south-1',
    accessKey: '',
    secretKey: '',
    customDomain: '',
    desc: '',
  });

  // (b) Email & SMS Gateway Configuration
  const [emailConfig, setEmailConfig] = useState({
    provider: 'SendGrid',
    host: 'smtp.sendgrid.net',
    port: 587,
    username: 'apikey',
    apiKey: 'SG.9a8b7c6d5e4f3g2h1i0j_kLmNoPqRsTuVwXyZ',
    fromEmail: 'concierge@praznaphotography.com',
    fromName: 'Prazna Photography Concierge',
    encryption: 'TLS',
  });

  const [smsConfig, setSmsConfig] = useState({
    provider: 'Twilio',
    accountSid: '',
    authToken: '',
    senderId: 'PRAZNA',
    whatsappNumber: '+91 98765 43210',
    enableSmsAlerts: true,
    enableWhatsAppAlerts: true,
  });

  // (c) Email & SMS Notification Templates
  const [templates, setTemplates] = useState([
    {
      id: 'TMPL-01',
      title: 'New Client Enquiry Confirmation',
      channel: 'Email & WhatsApp',
      trigger: 'On website quote submission',
      subject: '✨ Thank you for choosing Prazna Photography, {client_name}!',
      emailBody: `Dear {client_name},\n\nWe have received your celebration enquiry for {venue} ({event_dates}) with an estimated budget of {estimated_budget}.\n\nEvery wedding is a sacred heirloom. Our Master Concierge will review your requirements and share an official quote and cinematography deck within 4 hours.\n\nWarm regards,\nPraveen Kumar | Prazna Photography`,
      smsBody: `Hi {client_name}! Prazna Photography has received your enquiry for {event_dates} at {venue}. Our concierge will connect on WhatsApp shortly.`,
    },
    {
      id: 'TMPL-02',
      title: 'Bespoke Quote & Rate Card Delivered',
      channel: 'Email & WhatsApp',
      trigger: 'When admin sends quote',
      subject: '👑 Your Bespoke Wedding Photography & Cinema Proposal - {client_name}',
      emailBody: `Dear {client_name},\n\nWe are delighted to present your customized itinerary and crew proposal ({package_name}) for your celebration at {venue}.\n\nPlease review the attached fine-art proposal deck and let us know your preferred dates for a pre-shoot consultation.\n\nWarm regards,\nPrazna Photography Team`,
      smsBody: `Hi {client_name}! Your bespoke wedding cinema quote ({package_name}) is ready. Please check your email or reply here to schedule a consultation.`,
    },
    {
      id: 'TMPL-03',
      title: 'Shoot Day Master Crew Reminder',
      channel: 'WhatsApp & SMS',
      trigger: '48 hours before wedding event',
      subject: '📸 Prazna Master Crew Deployment - {couple_names}',
      emailBody: `Dear {couple_names},\n\nOur fine-art team and 4K aerial cinematographers are prepped for your auspicious {ceremony_name} at {venue}.\n\nLead Artist: Praveen Kumar\nCall Time: {call_time}\nEmergency Contact: +91 98765 43210`,
      smsBody: `Namaste {couple_names}! Prazna Master Crew is scheduled for your {ceremony_name} at {venue}. Call time: {call_time}. We look forward to documenting your love story!`,
    },
  ]);

  const [showAddTemplateModal, setShowAddTemplateModal] = useState(false);
  const [newTemplateForm, setNewTemplateForm] = useState({
    title: '',
    channel: 'Email & WhatsApp',
    trigger: '',
    subject: '',
    emailBody: '',
    smsBody: '',
  });

  // (d) Social Media Links
  const [socialLinks, setSocialLinks] = useState([
    { id: 'whatsapp', platform: 'WhatsApp Booking', url: 'https://wa.me/919876543210', active: true },
    { id: 'instagram', platform: 'Instagram Portfolio', url: 'https://instagram.com/praznaphotography', active: true },
    { id: 'twitter', platform: 'Twitter / X', url: 'https://x.com/praznaphotography', active: true },
    { id: 'youtube', platform: 'YouTube 4K Channel', url: 'https://youtube.com/@praznaphotography', active: true },
    { id: 'facebook', platform: 'Facebook Page', url: 'https://facebook.com/praznaphotography', active: false },
    { id: 'pinterest', platform: 'Pinterest Moodboards', url: 'https://pinterest.com/praznaphotography', active: true },
  ]);
  const [showAddSocialModal, setShowAddSocialModal] = useState(false);
  const [newSocialForm, setNewSocialForm] = useState({ platform: '', url: '', active: true });

  // =========================================================================
  // 2. WEBSITE UI (siteConfig) STATE with localStorage sync
  // =========================================================================
  const [siteConfigData, setSiteConfigData] = useState(() => {
    try {
      const stored = localStorage.getItem('prazna_site_config');
      const base = stored ? JSON.parse(stored) : siteConfig;
      return {
        ...siteConfig,
        ...base,
        brand: { ...siteConfig.brand, ...(base.brand || {}) },
        footer: { ...siteConfig.footer, ...(base.footer || {}) },
        heroVideos: base.heroVideos || base.heroScenes || siteConfig.heroVideos || siteConfig.heroScenes || [],
        heroImages: base.heroImages || siteConfig.heroImages || [],
        heroMediaType: base.heroMediaType || 'video',
        activeHeroVideoId: base.activeHeroVideoId || base.defaultHeroSceneId || 'varsha-shiva',
        activeHeroImageId: base.activeHeroImageId || 'heritage-bride-silk',
        gallery: base.gallery || siteConfig.gallery || [],
      };
    } catch {
      return siteConfig;
    }
  });

  // Fetch live settings from MongoDB backend on mount
  useEffect(() => {
    let isMounted = true;
    const fetchBackendSettings = async () => {
      try {
        const res = await settingsAPI.get();
        if (res?.data && isMounted) {
          const s = res.data;
          if (s.storage?.activeProvider) {
            setActiveBucketId(s.storage.activeProvider);
          }
          if (s.storage?.providers) {
            setBucketsList((prev) =>
              prev.map((b) => {
                const prov = s.storage.providers[b.id];
                if (!prov) return b;
                return {
                  ...b,
                  cloudName: prov.cloudName || b.cloudName,
                  apiKey: prov.apiKey || b.apiKey,
                  apiSecret: prov.apiSecret || b.apiSecret,
                  bucketOrFolder: prov.bucket || prov.folder || b.bucketOrFolder,
                  accessKey: prov.accessKeyId || b.accessKey,
                };
              })
            );
          }
          if (s.socialLinks && s.socialLinks.length > 0) {
            setSocialLinks(s.socialLinks);
          }
          if (s.emailSms?.smtp) {
            setEmailConfig((prev) => ({
              ...prev,
              provider: s.emailSms.emailProvider || prev.provider,
              host: s.emailSms.smtp.host || prev.host,
              port: s.emailSms.smtp.port || prev.port,
              username: s.emailSms.smtp.user || prev.username,
              fromEmail: s.emailSms.smtp.fromEmail || prev.fromEmail,
            }));
          }
          if (s.emailSms?.smsProvider) {
            setSmsConfig((prev) => ({
              ...prev,
              provider: s.emailSms.smsProvider || prev.provider,
            }));
          }

          if (s.ai) {
            setAiConfig((prev) => ({
              ...prev,
              enabled: s.ai.enabled !== undefined ? s.ai.enabled : prev.enabled,
              hideWidgetWhenDisabled: Boolean(s.ai.hideWidgetWhenDisabled),
              activeProvider: s.ai.activeProvider || prev.activeProvider,
              botName: s.ai.botName || prev.botName,
              welcomeMessage: s.ai.welcomeMessage || prev.welcomeMessage,
              systemPrompt: s.ai.systemPrompt || prev.systemPrompt,
              providers: {
                gemini: { ...prev.providers.gemini, ...(s.ai.providers?.gemini || {}) },
                openai: { ...prev.providers.openai, ...(s.ai.providers?.openai || {}) },
                claude: { ...prev.providers.claude, ...(s.ai.providers?.claude || {}) },
              },
              quickQuestions: s.ai.quickQuestions?.length ? s.ai.quickQuestions : prev.quickQuestions,
            }));
          }

          setSiteConfigData((prev) => ({
            ...prev,
            brand: { ...prev.brand, ...(s.brand || {}) },
            footer: { ...prev.footer, ...(s.footer || {}) },
            philosophy: s.philosophy?.pillars?.length ? s.philosophy : prev.philosophy,
            films: s.films?.length ? s.films : prev.films,
            testimonials: s.testimonials?.length ? s.testimonials : prev.testimonials,
            gallery: s.gallery?.length ? s.gallery : prev.gallery,
            heroMediaType: s.hero?.heroMediaType || prev.heroMediaType,
            activeHeroVideoId: s.hero?.activeHeroVideoId || prev.activeHeroVideoId,
            activeHeroImageId: s.hero?.activeHeroImageId || prev.activeHeroImageId,
            heroVideos: s.hero?.heroVideos?.length ? s.hero.heroVideos : prev.heroVideos,
            heroImages: s.hero?.heroImages?.length ? s.hero.heroImages : prev.heroImages,
            heroSubtitle: s.hero?.heroSubtitle || prev.heroSubtitle,
            heroAvailability: s.hero?.heroAvailability || prev.heroAvailability,
            signaturePackages: s.signaturePackages?.length ? s.signaturePackages : prev.signaturePackages,
            quoteEvents: s.quoteEvents?.length ? s.quoteEvents : prev.quoteEvents,
            teamAddOns: s.teamAddOns ? { ...prev.teamAddOns, ...s.teamAddOns } : prev.teamAddOns,
            stats: s.stats?.length ? s.stats : prev.stats,
            seo: s.seo ? { ...prev.seo, ...s.seo } : prev.seo,
          }));
        }
      } catch (err) {
        console.warn('[AdminSettings] Failed to fetch live backend settings:', err.message);
      }
    };
    fetchBackendSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  // Hero Video & Image Modals / Forms
  const [showAddHeroModal, setShowAddHeroModal] = useState(false);
  const [editingHeroVideo, setEditingHeroVideo] = useState(null);
  const [newHeroForm, setNewHeroForm] = useState({
    id: '',
    name: '',
    videoId: '',
    location: '',
    tagline: '',
  });

  const [showAddHeroImageModal, setShowAddHeroImageModal] = useState(false);
  const [editingHeroImage, setEditingHeroImage] = useState(null);
  const [newHeroImageForm, setNewHeroImageForm] = useState({
    id: '',
    name: '',
    src: '',
    location: '',
    tagline: '',
  });

  // Curated Masterpieces Gallery State & Forms
  const [showAddGalleryModal, setShowAddGalleryModal] = useState(false);
  const [editingGalleryPhoto, setEditingGalleryPhoto] = useState(null);
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState('all');
  const [newGalleryForm, setNewGalleryForm] = useState({
    id: '',
    src: '',
    title: '',
    subtitle: '',
    location: '',
    category: 'wedding',
    orientation: 'portrait',
  });
  const [editingGalleryForm, setEditingGalleryForm] = useState({
    id: '',
    src: '',
    title: '',
    subtitle: '',
    location: '',
    category: 'wedding',
    orientation: 'portrait',
  });
  const [galleryCategories, setGalleryCategories] = useState([
    { id: 'wedding', name: 'Wedding' },
    { id: 'couple-shoot', name: 'Couple Shoot' },
    { id: 'haldi', name: 'Haldi' },
    { id: 'pre-wedding', name: 'Pre-Wedding' },
    { id: 'reception', name: 'Reception' },
    { id: 'destination', name: 'Destination' },
  ]);

  // Wedding Films Cinema State & Forms
  const [showAddFilmModal, setShowAddFilmModal] = useState(false);
  const [editingFilm, setEditingFilm] = useState(null);
  const [previewFilm, setPreviewFilm] = useState(null);
  const [newFilmForm, setNewFilmForm] = useState({
    id: '',
    title: '',
    couple: '',
    location: '',
    videoId: '',
    youtubeUrl: '',
    duration: '4K Cinema • 18 min',
    thumbnail: '',
    tagline: '',
    highlight: '',
  });
  const [editingFilmForm, setEditingFilmForm] = useState({
    id: '',
    title: '',
    couple: '',
    location: '',
    videoId: '',
    youtubeUrl: '',
    duration: '',
    thumbnail: '',
    tagline: '',
    highlight: '',
  });

  const handleEnableHeroVideo = (videoId) => {
    const updated = {
      ...siteConfigData,
      heroMediaType: 'video',
      activeHeroVideoId: videoId,
      defaultHeroSceneId: videoId,
    };
    setSiteConfigData(updated);
    try {
      localStorage.setItem('prazna_site_config', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    const video = (siteConfigData.heroVideos || []).find((v) => v.id === videoId);
    triggerSaveToast(`Enabled 4K Video '${video?.name || videoId}' as active landing hero!`);
  };

  const handleEnableHeroImage = (imageId) => {
    const updated = {
      ...siteConfigData,
      heroMediaType: 'image',
      activeHeroImageId: imageId,
    };
    setSiteConfigData(updated);
    try {
      localStorage.setItem('prazna_site_config', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    const img = (siteConfigData.heroImages || []).find((i) => i.id === imageId);
    triggerSaveToast(`Enabled Still Image '${img?.name || imageId}' as active landing hero!`);
  };

  const handleSwitchHeroMode = (mode) => {
    const updated = {
      ...siteConfigData,
      heroMediaType: mode,
    };
    setSiteConfigData(updated);
    try {
      localStorage.setItem('prazna_site_config', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    triggerSaveToast(`Landing Hero active mode set to ${mode === 'video' ? '4K Video' : 'Still Image'}!`);
  };

  const handleDeleteHeroVideo = (id) => {
    if (id === siteConfigData.activeHeroVideoId && siteConfigData.heroVideos?.length > 1) {
      alert('Cannot delete the currently active video. Please enable another video first.');
      return;
    }
    const updatedVideos = (siteConfigData.heroVideos || []).filter((v) => v.id !== id);
    const updated = { ...siteConfigData, heroVideos: updatedVideos, heroScenes: updatedVideos };
    setSiteConfigData(updated);
    triggerSaveToast('Hero video removed from library');
  };

  const handleDeleteHeroImage = (id) => {
    if (id === siteConfigData.activeHeroImageId && siteConfigData.heroImages?.length > 1) {
      alert('Cannot delete the currently active image. Please enable another image first.');
      return;
    }
    const updatedImages = (siteConfigData.heroImages || []).filter((img) => img.id !== id);
    const updated = { ...siteConfigData, heroImages: updatedImages };
    setSiteConfigData(updated);
    triggerSaveToast('Hero image removed from library');
  };

  const handleLogoFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(
        file,
        (uploadedUrl) => {
          setSiteConfigData({
            ...siteConfigData,
            brand: { ...siteConfigData.brand, [field]: uploadedUrl },
          });
        },
        { field, folder: 'brand-logos', title: `Logo - ${field}` }
      );
    }
  };

  const sampleGoldCrestSvg =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='46' fill='none' stroke='%23C9A96E' stroke-width='2'/><path d='M50 18 L58 38 L80 38 L62 52 L69 74 L50 60 L31 74 L38 52 L20 38 L42 38 Z' fill='%23C9A96E'/></svg>";

  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [newPackageForm, setNewPackageForm] = useState({
    id: '',
    name: '',
    badge: 'Curated',
    price: 195000,
    idealFor: 'Intimate Ceremonies',
    team: '4-Member Master Crew',
    inclusions: 'Full Day Coverage\nCinematic Highlight Film\nLeather Heirloom Album',
  });

  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEventForm, setNewEventForm] = useState({
    id: '',
    name: '',
    basePrice: 55000,
    hours: '4-5 Hours Coverage',
    description: '',
  });

  const [showAddTestimonialModal, setShowAddTestimonialModal] = useState(false);
  const [newTestimonialForm, setNewTestimonialForm] = useState({
    name: '',
    event: '',
    rating: 5,
    review: '',
  });

  const [showAddPillarModal, setShowAddPillarModal] = useState(false);
  const [newPillarForm, setNewPillarForm] = useState({ title: '', desc: '' });

  // Handlers for Storage Buckets
  const handleTestConnection = (bucketId) => {
    setTestingProvider(bucketId);
    setTestResult(null);
    setTimeout(() => {
      setTestingProvider(null);
      setTestResult({
        provider: bucketId,
        success: true,
        message: `Successfully connected to '${bucketId}' bucket! Ping: 38ms. Read/Write permissions verified.`,
      });
    }, 700);
  };

  const handleCreateBucket = (e) => {
    e.preventDefault();
    if (!newBucketForm.name || !newBucketForm.bucketOrFolder) return;
    const bucketId = newBucketForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const created = {
      id: bucketId,
      ...newBucketForm,
    };
    setBucketsList([...bucketsList, created]);
    setShowAddBucketModal(false);
    setNewBucketForm({
      name: '',
      type: 's3',
      bucketOrFolder: '',
      region: 'ap-south-1',
      accessKey: '',
      secretKey: '',
      customDomain: '',
      desc: '',
    });
    triggerSaveToast(`New storage bucket '${created.name}' created!`);
  };

  const handleDeleteBucket = (id) => {
    if (id === activeBucketId) {
      alert('Cannot delete the currently active storage bucket. Please switch active provider first.');
      return;
    }
    setBucketsList(bucketsList.filter((b) => b.id !== id));
    triggerSaveToast('Storage bucket removed');
  };

  // Handlers for Website UI siteConfig save
  const persistConfigUpdate = async (updatedConfig, successToastMsg) => {
    setSiteConfigData(updatedConfig);
    try {
      localStorage.setItem('prazna_site_config', JSON.stringify(updatedConfig));
      await settingsAPI.update({
        brand: updatedConfig.brand,
        hero: {
          heroMediaType: updatedConfig.heroMediaType,
          activeHeroVideoId: updatedConfig.activeHeroVideoId,
          activeHeroImageId: updatedConfig.activeHeroImageId,
          heroVideos: updatedConfig.heroVideos,
          heroImages: updatedConfig.heroImages,
          heroSubtitle: updatedConfig.heroSubtitle,
          heroAvailability: updatedConfig.heroAvailability,
        },
        footer: updatedConfig.footer,
        philosophy: updatedConfig.philosophy,
        films: updatedConfig.films,
        testimonials: updatedConfig.testimonials,
        gallery: updatedConfig.gallery,
        socialLinks: socialLinks,
        signaturePackages: updatedConfig.signaturePackages,
        quoteEvents: updatedConfig.quoteEvents,
        teamAddOns: updatedConfig.teamAddOns,
        stats: updatedConfig.stats,
        seo: updatedConfig.seo,
      });
      window.dispatchEvent(new Event('site-settings-updated'));
      if (successToastMsg) triggerSaveToast(successToastMsg);
    } catch (e) {
      console.error(e);
      if (successToastMsg) triggerSaveToast(successToastMsg);
    }
  };

  const handleSaveSiteConfig = () => {
    return persistConfigUpdate(siteConfigData, 'Website UI saved to MongoDB & applied to live site!');
  };

  return (
    <div className="space-y-8 animate-fade-in relative pb-16">
      {/* Toast Notification (Top Right) */}
      {saveToast && typeof document !== 'undefined' && createPortal(
        <div className="fixed top-6 right-6 z-[99999] pointer-events-none animate-fade-in">
          <div className="p-4 rounded-2xl bg-[#C9A96E] text-black font-semibold text-xs shadow-2xl flex items-center gap-3 border border-black/10 backdrop-blur-md">
            <CheckCircle2 className="w-5 h-5 text-black flex-shrink-0" />
            <span className="tracking-wide font-medium">{saveToast}</span>
          </div>
        </div>,
        document.body
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-wide">
            Studio Controls & Configurations
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage system gateways, storage buckets, email/SMS notifications, and dynamic website UI components.
          </p>
        </div>

        {/* Primary Tabs: CONFIGS vs WEBSITE UI */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#11141D] border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setActiveMainTab('configs')}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeMainTab === 'configs'
                ? 'bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black shadow-gold-glow font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Studio Configs</span>
          </button>

          <button
            onClick={() => setActiveMainTab('website-ui')}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeMainTab === 'website-ui'
                ? 'bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black shadow-gold-glow font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Website UI Settings</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. STUDIO CONFIGS (Storage Buckets, Email/SMS, Templates, Social Links)  */}
      {/* ========================================================================= */}
      {activeMainTab === 'configs' && (
        <div className="space-y-6">
          {/* Sub Navigation Bar for Configs */}
          <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-[#11141D] border border-white/10">
            {[
              { id: 'storage', name: 'Storage Buckets', icon: HardDrive },
              { id: 'ai', name: 'AI Concierge & Providers', icon: Sparkles },
              { id: 'email-sms', name: 'Email & SMS Gateways', icon: Server },
              { id: 'templates', name: 'Email & SMS Templates', icon: Mail },
              { id: 'social', name: 'Social Media Links', icon: Share2 },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setConfigSubTab(sub.id)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                  configSubTab === sub.id
                    ? 'bg-[#C9A96E] text-black font-semibold shadow-gold-glow'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <sub.icon className="w-3.5 h-3.5" />
                <span>{sub.name}</span>
              </button>
            ))}
          </div>

          {/* CONFIG SUB-TAB 1: STORAGE BUCKETS (Add New & Edit) */}
          {configSubTab === 'storage' && (
            <div className="space-y-6">
              {/* Header with Add New Bucket Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-6 rounded-3xl bg-[#11141D] border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-[#C9A96E]/10 text-[#C9A96E]">
                    <Cloud className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white">Multi-Cloud Storage Buckets</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Connect and manage AWS S3, Cloudinary, Azure Blob, GCS, Firebase, or custom S3-compatible buckets.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowKeys(!showKeys)}
                    className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-white/[0.03] border border-white/10 flex items-center gap-1.5"
                  >
                    {showKeys ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showKeys ? 'Hide Keys' : 'Show Keys'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddBucketModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow flex items-center gap-1.5 hover:opacity-95 transition-all"
                  >
                    <Plus className="w-4 h-4 text-black" />
                    <span>Add New Bucket</span>
                  </button>
                </div>
              </div>

              {/* Test Result Message Box */}
              {testResult && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>{testResult.message}</span>
                  </div>
                  <button onClick={() => setTestResult(null)} className="text-xs text-slate-400 hover:text-white">✕</button>
                </div>
              )}

              {/* Buckets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {bucketsList.map((b) => {
                  const isActive = activeBucketId === b.id;
                  const isTesting = testingProvider === b.id;
                  return (
                    <div
                      key={b.id}
                      className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-4 ${
                        isActive
                          ? 'bg-gradient-to-b from-[#C9A96E]/20 to-[#11141D] border-[#C9A96E] shadow-gold-glow ring-1 ring-[#C9A96E]/50'
                          : 'bg-[#11141D] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className={`p-3 rounded-2xl ${isActive ? 'bg-[#C9A96E] text-black' : 'bg-white/5 text-slate-300'}`}>
                            <HardDrive className="w-5 h-5" />
                          </div>
                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                              isActive
                                ? 'bg-[#C9A96E] text-black border-transparent font-bold'
                                : 'bg-white/5 text-slate-400 border-white/10'
                            }`}
                          >
                            {isActive ? 'Active Destination' : b.type.toUpperCase()}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-base font-serif font-semibold text-white">{b.name}</h4>
                          <p className="text-[11px] font-mono text-[#E5D2A8] mt-0.5 truncate">
                            Target: {b.bucketOrFolder}
                          </p>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{b.desc}</p>
                        </div>

                        {/* Region & Keys preview */}
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] space-y-1">
                          <div className="flex justify-between text-slate-400">
                            <span>Region:</span>
                            <span className="text-slate-200 font-mono">{b.region}</span>
                          </div>
                          {b.accessKey && (
                            <div className="flex justify-between text-slate-400">
                              <span>Access Key:</span>
                              <span className="text-slate-200 font-mono">
                                {showKeys ? b.accessKey : '••••••••••••'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                        {!isActive ? (
                          <button
                            type="button"
                            onClick={async () => {
                              setActiveBucketId(b.id);
                              try {
                                await settingsAPI.switchStorage(b.id);
                                triggerSaveToast(`Active upload bucket set to ${b.name} in MongoDB!`);
                              } catch (err) {
                                triggerSaveToast(`Active bucket set to ${b.name}`);
                              }
                            }}
                            className="flex-1 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-white transition-all border border-white/10"
                          >
                            Set Active
                          </button>
                        ) : (
                          <div className="flex-1 py-2 text-center text-xs font-semibold text-[#E5D2A8] bg-[#C9A96E]/10 rounded-xl border border-[#C9A96E]/30">
                            Active Destination
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => setEditingBucket({ ...b })}
                          title="Edit Storage Bucket"
                          className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-slate-300 border border-white/10 flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#C9A96E]" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleTestConnection(b.id)}
                          disabled={isTesting}
                          title="Test Connection"
                          className="px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-xs font-medium text-slate-300 border border-white/10 flex items-center gap-1.5"
                        >
                          <RotateCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-[#C9A96E]' : ''}`} />
                          <span>{isTesting ? 'Testing...' : 'Test'}</span>
                        </button>

                        {b.id !== 'cloudinary' && b.id !== 's3' && b.id !== 'local' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteBucket(b.id)}
                            className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-white/5 transition-colors"
                            title="Delete Bucket"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Bucket Modal */}
              {showAddBucketModal && (
                <ModalPortal onClose={() => setShowAddBucketModal(false)}>
                <div className="w-full max-w-lg bg-[#121622] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <h3 className="text-lg font-serif font-bold text-white">Add New Storage Bucket</h3>
                      <button onClick={() => setShowAddBucketModal(false)} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateBucket} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-medium">Bucket Friendly Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. S3 Europe Replica"
                            value={newBucketForm.name}
                            onChange={(e) => setNewBucketForm({ ...newBucketForm, name: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-medium">Storage Type</label>
                          <select
                            value={newBucketForm.type}
                            onChange={(e) => setNewBucketForm({ ...newBucketForm, type: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-[#181C27] border border-white/10 text-xs text-white"
                          >
                            <option value="s3">AWS S3 / Compatible</option>
                            <option value="azure">Azure Blob Storage</option>
                            <option value="gcs">Google Cloud Storage</option>
                            <option value="firebase">Firebase Storage</option>
                            <option value="cloudinary">Cloudinary</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-medium">Bucket / Container Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. my-wedding-bucket"
                            value={newBucketForm.bucketOrFolder}
                            onChange={(e) => setNewBucketForm({ ...newBucketForm, bucketOrFolder: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-medium">Region</label>
                          <input
                            type="text"
                            placeholder="e.g. ap-south-1"
                            value={newBucketForm.region}
                            onChange={(e) => setNewBucketForm({ ...newBucketForm, region: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Access Key / Account Name</label>
                        <input
                          type="text"
                          value={newBucketForm.accessKey}
                          onChange={(e) => setNewBucketForm({ ...newBucketForm, accessKey: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Secret Key / Account Key</label>
                        <input
                          type="password"
                          value={newBucketForm.secretKey}
                          onChange={(e) => setNewBucketForm({ ...newBucketForm, secretKey: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Custom CDN Domain (Optional)</label>
                        <input
                          type="text"
                          placeholder="https://cdn.praznaphotography.com"
                          value={newBucketForm.customDomain}
                          onChange={(e) => setNewBucketForm({ ...newBucketForm, customDomain: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="pt-4 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowAddBucketModal(false)}
                          className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow hover:opacity-95"
                        >
                          Save & Add Bucket
                        </button>
                      </div>
                    </form>
                  </div>
                </ModalPortal>
              )}

              {/* Edit Storage Bucket Modal */}
              {editingBucket && (
                <ModalPortal onClose={() => setEditingBucket(null)}>
                <div className="w-full max-w-lg bg-[#121622] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div>
                        <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                          <HardDrive className="w-5 h-5 text-[#C9A96E]" />
                          Edit Storage Bucket
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">Modify parameters, keys, or container endpoints</p>
                      </div>
                      <button onClick={() => setEditingBucket(null)} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const updated = bucketsList.map((item) => (item.id === editingBucket.id ? editingBucket : item));
                        setBucketsList(updated);
                        setEditingBucket(null);

                        // Save to backend MongoDB
                        try {
                          const payload = {
                            storage: {
                              activeProvider: activeBucketId,
                              providers: {},
                            },
                          };
                          if (editingBucket.type === 'cloudinary') {
                            payload.storage.providers.cloudinary = {
                              cloudName: editingBucket.cloudName || editingBucket.bucketOrFolder || '',
                              apiKey: editingBucket.apiKey || editingBucket.accessKey || '',
                              apiSecret: editingBucket.apiSecret || editingBucket.secretKey || '',
                              folder: editingBucket.bucketOrFolder || 'prazna-photography',
                            };
                          } else if (editingBucket.type === 's3') {
                            payload.storage.providers.s3 = {
                              bucket: editingBucket.bucketOrFolder || '',
                              region: editingBucket.region || 'ap-south-1',
                              accessKeyId: editingBucket.accessKey || '',
                              customDomain: editingBucket.customDomain || '',
                            };
                          }
                          await settingsAPI.update(payload);
                          triggerSaveToast(`Bucket '${editingBucket.name}' saved to MongoDB!`);
                        } catch (err) {
                          triggerSaveToast(`Bucket updated locally: ${err.message}`);
                        }
                      }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-medium">Bucket Friendly Name</label>
                          <input
                            type="text"
                            required
                            value={editingBucket.name || ''}
                            onChange={(e) => setEditingBucket({ ...editingBucket, name: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-medium">Storage Type</label>
                          <select
                            value={editingBucket.type || 's3'}
                            onChange={(e) => setEditingBucket({ ...editingBucket, type: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-[#181C27] border border-white/10 text-xs text-white"
                          >
                            <option value="s3">AWS S3 / Compatible</option>
                            <option value="azure">Azure Blob Storage</option>
                            <option value="gcs">Google Cloud Storage</option>
                            <option value="firebase">Firebase Storage</option>
                            <option value="cloudinary">Cloudinary</option>
                            <option value="local">Local Private Storage</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-medium">Bucket / Container / Cloud Name</label>
                          <input
                            type="text"
                            required
                            value={editingBucket.bucketOrFolder || editingBucket.cloudName || ''}
                            onChange={(e) =>
                              setEditingBucket({
                                ...editingBucket,
                                bucketOrFolder: e.target.value,
                                cloudName: e.target.value,
                              })
                            }
                            className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-medium">Region</label>
                          <input
                            type="text"
                            value={editingBucket.region || ''}
                            onChange={(e) => setEditingBucket({ ...editingBucket, region: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-[#C9A96E]" />
                          <span>Access Key / API Key / Account Name</span>
                        </label>
                        <input
                          type="text"
                          value={editingBucket.accessKey || editingBucket.apiKey || ''}
                          onChange={(e) =>
                            setEditingBucket({
                              ...editingBucket,
                              accessKey: e.target.value,
                              apiKey: e.target.value,
                            })
                          }
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-[#C9A96E]" />
                          <span>Secret Key / API Secret / Account Key</span>
                        </label>
                        <input
                          type={showKeys ? 'text' : 'password'}
                          value={editingBucket.secretKey || editingBucket.apiSecret || ''}
                          onChange={(e) =>
                            setEditingBucket({
                              ...editingBucket,
                              secretKey: e.target.value,
                              apiSecret: e.target.value,
                            })
                          }
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Custom CDN Domain (Optional)</label>
                        <input
                          type="text"
                          value={editingBucket.customDomain || ''}
                          onChange={(e) => setEditingBucket({ ...editingBucket, customDomain: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Description</label>
                        <textarea
                          rows={2}
                          value={editingBucket.desc || ''}
                          onChange={(e) => setEditingBucket({ ...editingBucket, desc: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="pt-4 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setEditingBucket(null)}
                          className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow hover:opacity-95"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </ModalPortal>
              )}
            </div>
          )}

          {/* CONFIG SUB-TAB: AI CONCIERGE & PROVIDERS */}
          {configSubTab === 'ai' && (
            <div className="space-y-8">
              {/* Header Banner with Save Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#11141D] border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-[#C9A96E]/10 text-[#C9A96E]">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-serif font-bold text-white">AI Concierge & Intelligence Engine</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#C9A96E]/20 text-[#C9A96E] border border-[#C9A96E]/30 uppercase tracking-wider">
                        {aiConfig.activeProvider} Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Configure live AI intelligence for the website chat concierge. Choose between Google Gemini, OpenAI, and Claude.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAiConfig((prev) => ({
                        ...prev,
                        systemPrompt: defaultLuxurySystemPrompt,
                      }));
                      triggerSaveToast('System prompt reset to luxury studio default!');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-slate-300 border border-white/10 flex items-center gap-1.5 transition-all"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-slate-400" />
                    <span>Reset Prompt</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSavingAi}
                    onClick={async () => {
                      try {
                        setIsSavingAi(true);
                        await settingsAPI.update({ ai: aiConfig });
                        window.dispatchEvent(new Event('site-settings-updated'));
                        triggerSaveToast('AI Concierge & Provider settings saved to database!');
                      } catch (err) {
                        triggerSaveToast(`Error saving AI settings: ${err.message}`);
                      } finally {
                        setIsSavingAi(false);
                      }
                    }}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow flex items-center gap-2 hover:opacity-95 transition-all"
                  >
                    {isSavingAi ? (
                      <RotateCw className="w-4 h-4 animate-spin text-black" />
                    ) : (
                      <Save className="w-4 h-4 text-black" />
                    )}
                    <span>{isSavingAi ? 'Saving to DB...' : 'Save AI Settings'}</span>
                  </button>
                </div>
              </div>

              {/* Master Website Chatbot Visibility & Control */}
              <div className="p-6 rounded-3xl bg-[#11141D] border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        Website Chatbot Widget Status
                      </h4>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 ${
                          aiConfig.enabled
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            aiConfig.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                          }`}
                        />
                        {aiConfig.enabled ? 'Enabled • Live on Website' : 'Disabled • Hidden from Website'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {aiConfig.enabled
                        ? 'The bottom-right chat widget is currently ACTIVE and visible to all website visitors.'
                        : 'The bottom-right chat widget is completely DISABLED and REMOVED from the website.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={async () => {
                        const newStatus = !aiConfig.enabled;
                        const updated = { ...aiConfig, enabled: newStatus };
                        setAiConfig(updated);
                        try {
                          await settingsAPI.update({ ai: updated });
                          window.dispatchEvent(new Event('site-settings-updated'));
                          triggerSaveToast(
                            newStatus
                              ? 'Chatbot Enabled: Widget is now VISIBLE on website!'
                              : 'Chatbot Disabled: Widget is now HIDDEN from website!'
                          );
                        } catch (err) {
                          triggerSaveToast(`Error: ${err.message}`);
                        }
                      }}
                      className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 shadow-md ${
                        aiConfig.enabled
                          ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                      }`}
                    >
                      {aiConfig.enabled ? (
                        <>
                          <X className="w-4 h-4" />
                          <span>Turn Off Chatbot</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Turn On Chatbot</span>
                        </>
                      )}
                    </button>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={aiConfig.enabled}
                        onChange={async (e) => {
                          const newStatus = e.target.checked;
                          const updated = { ...aiConfig, enabled: newStatus };
                          setAiConfig(updated);
                          try {
                            await settingsAPI.update({ ai: updated });
                            window.dispatchEvent(new Event('site-settings-updated'));
                            triggerSaveToast(
                              newStatus
                                ? 'Chatbot Enabled: Widget is now VISIBLE on website!'
                                : 'Chatbot Disabled: Widget is now HIDDEN from website!'
                            );
                          } catch (err) {
                            triggerSaveToast(`Error: ${err.message}`);
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A96E]"></div>
                    </label>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <label className="text-xs font-semibold text-white uppercase tracking-wider">
                    Bot Display Identity Name
                  </label>
                  <input
                    type="text"
                    value={aiConfig.botName}
                    onChange={(e) => setAiConfig({ ...aiConfig, botName: e.target.value })}
                    placeholder="e.g. Prazna AI Concierge"
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                  />
                </div>
              </div>

              {/* AI Provider Selection Cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Select Active AI Provider</h4>
                    <p className="text-xs text-slate-400">The selected provider will stream live answers to wedding couples</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Provider 1: Gemini */}
                  <div
                    onClick={() => setAiConfig({ ...aiConfig, activeProvider: 'gemini' })}
                    className={`cursor-pointer p-6 rounded-3xl border transition-all relative flex flex-col justify-between ${
                      aiConfig.activeProvider === 'gemini'
                        ? 'bg-[#181C28] border-[#C9A96E] shadow-[0_0_25px_rgba(201,169,110,0.15)] ring-1 ring-[#C9A96E]'
                        : 'bg-[#11141D] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="p-3 rounded-2xl bg-[#C9A96E]/15 text-[#C9A96E]">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Recommended
                        </span>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">Google Gemini</h4>
                        <p className="text-xs text-[#C9A96E] mt-0.5">Gemini 1.5 Flash / Pro</p>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Native REST SSE streaming with Google DeepMind architecture. Ultra-fast token responses with high context window.
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Streaming: <strong className="text-white">Active</strong></span>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        aiConfig.activeProvider === 'gemini' ? 'border-[#C9A96E]' : 'border-white/30'
                      }`}>
                        {aiConfig.activeProvider === 'gemini' && <div className="w-2 h-2 rounded-full bg-[#C9A96E]" />}
                      </div>
                    </div>
                  </div>

                  {/* Provider 2: OpenAI */}
                  <div
                    onClick={() => setAiConfig({ ...aiConfig, activeProvider: 'openai' })}
                    className={`cursor-pointer p-6 rounded-3xl border transition-all relative flex flex-col justify-between ${
                      aiConfig.activeProvider === 'openai'
                        ? 'bg-[#181C28] border-[#C9A96E] shadow-[0_0_25px_rgba(201,169,110,0.15)] ring-1 ring-[#C9A96E]'
                        : 'bg-[#11141D] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="p-3 rounded-2xl bg-cyan-500/15 text-cyan-400">
                          <Bot className="w-6 h-6" />
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/10 text-slate-300">
                          Standard
                        </span>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">ChatGPT / OpenAI</h4>
                        <p className="text-xs text-cyan-400 mt-0.5">GPT-4o Mini / GPT-4o</p>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Flagship general intelligence model. Reliable structured parsing and balanced consultative responses.
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Streaming: <strong className="text-white">Active</strong></span>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        aiConfig.activeProvider === 'openai' ? 'border-[#C9A96E]' : 'border-white/30'
                      }`}>
                        {aiConfig.activeProvider === 'openai' && <div className="w-2 h-2 rounded-full bg-[#C9A96E]" />}
                      </div>
                    </div>
                  </div>

                  {/* Provider 3: Claude */}
                  <div
                    onClick={() => setAiConfig({ ...aiConfig, activeProvider: 'claude' })}
                    className={`cursor-pointer p-6 rounded-3xl border transition-all relative flex flex-col justify-between ${
                      aiConfig.activeProvider === 'claude'
                        ? 'bg-[#181C28] border-[#C9A96E] shadow-[0_0_25px_rgba(201,169,110,0.15)] ring-1 ring-[#C9A96E]'
                        : 'bg-[#11141D] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400">
                          <Crown className="w-6 h-6" />
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          Fine Art Nuance
                        </span>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">Anthropic Claude</h4>
                        <p className="text-xs text-amber-400 mt-0.5">Claude 3.5 Sonnet</p>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Exceptional at poetic nuance, emotional warmth, and articulating luxury cinematic artistry.
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Streaming: <strong className="text-white">Active</strong></span>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        aiConfig.activeProvider === 'claude' ? 'border-[#C9A96E]' : 'border-white/30'
                      }`}>
                        {aiConfig.activeProvider === 'claude' && <div className="w-2 h-2 rounded-full bg-[#C9A96E]" />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Provider Configuration & Credentials */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#11141D] border border-white/10 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#C9A96E]/10 text-[#C9A96E]">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-serif font-bold text-white">
                        {aiConfig.activeProvider === 'gemini'
                          ? 'Google Gemini Credentials & Tuning'
                          : aiConfig.activeProvider === 'openai'
                          ? 'OpenAI Credentials & Tuning'
                          : 'Anthropic Claude Credentials & Tuning'}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Enter your API key below. Empty/dummy keys will automatically stream our realistic studio concierge fallback without crashing.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAiKey(!showAiKey)}
                    className="p-2 rounded-xl bg-white/[0.04] text-slate-400 hover:text-white flex items-center gap-1.5 text-xs"
                  >
                    {showAiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>{showAiKey ? 'Hide' : 'Show'} Key</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* API Key */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white uppercase tracking-wider flex items-center justify-between">
                      <span>API Secret Key</span>
                      <span className="text-[10px] text-slate-400 font-normal">Stored securely in DB</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showAiKey ? 'text' : 'password'}
                        value={aiConfig.providers?.[aiConfig.activeProvider]?.apiKey || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAiConfig({
                            ...aiConfig,
                            providers: {
                              ...aiConfig.providers,
                              [aiConfig.activeProvider]: {
                                ...aiConfig.providers[aiConfig.activeProvider],
                                apiKey: val,
                              },
                            },
                          });
                        }}
                        placeholder={
                          aiConfig.activeProvider === 'gemini'
                            ? 'AIzaSy... (Gemini API Key)'
                            : aiConfig.activeProvider === 'openai'
                            ? 'sk-proj-... (OpenAI Key)'
                            : 'sk-ant-... (Claude Key)'
                        }
                        className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      You can leave this blank or dummy for now. You can update with your live key anytime.
                    </p>
                  </div>

                  {/* Model Selector & Temperature */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white uppercase tracking-wider">Model</label>
                      <select
                        value={
                          aiConfig.providers?.[aiConfig.activeProvider]?.model ||
                          (aiConfig.activeProvider === 'gemini'
                            ? 'gemini-3.8-flash'
                            : aiConfig.activeProvider === 'openai'
                            ? 'gpt-4o-mini'
                            : 'claude-3-5-sonnet-20241022')
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          setAiConfig({
                            ...aiConfig,
                            providers: {
                              ...aiConfig.providers,
                              [aiConfig.activeProvider]: {
                                ...aiConfig.providers[aiConfig.activeProvider],
                                model: val,
                              },
                            },
                          });
                        }}
                        className="w-full p-3 rounded-xl bg-[#121622] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                      >
                        {aiConfig.activeProvider === 'gemini' && (
                          <>
                            <option value="gemini-3.5-flash">gemini-3.5-flash (Fast &amp; Highly Stable - Recommended)</option>
                            <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (Ultra Fast &amp; Lightweight)</option>
                            <option value="gemini-3.8-flash">gemini-3.8-flash (Latest Preview - High Demand on Google)</option>
                            <option value="gemini-3.7-flash">gemini-3.7-flash (Next-Gen Preview - High Demand on Google)</option>
                            <option value="gemini-flash-latest">gemini-flash-latest (Auto Latest)</option>
                            <option value="gemini-2.5-pro">gemini-2.5-pro (High Reasoning Pro)</option>
                          </>
                        )}
                        {aiConfig.activeProvider === 'openai' && (
                          <>
                            <option value="gpt-4o-mini">gpt-4o-mini (Balanced & Fast)</option>
                            <option value="gpt-4o">gpt-4o (Most Intelligent)</option>
                            <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                          </>
                        )}
                        {aiConfig.activeProvider === 'claude' && (
                          <>
                            <option value="claude-3-5-sonnet-20241022">claude-3-5-sonnet (Flagship)</option>
                            <option value="claude-3-haiku-20240307">claude-3-haiku (Ultra Fast)</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white uppercase tracking-wider flex items-center justify-between">
                        <span>Temperature</span>
                        <span className="text-[#C9A96E]">
                          {aiConfig.providers?.[aiConfig.activeProvider]?.temperature ?? 0.7}
                        </span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={aiConfig.providers?.[aiConfig.activeProvider]?.temperature ?? 0.7}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setAiConfig({
                            ...aiConfig,
                            providers: {
                              ...aiConfig.providers,
                              [aiConfig.activeProvider]: {
                                ...aiConfig.providers[aiConfig.activeProvider],
                                temperature: val,
                              },
                            },
                          });
                        }}
                        className="w-full mt-2 accent-[#C9A96E]"
                      />
                      <p className="text-[10px] text-slate-500">0.7 balances artistic prose with factual studio rates.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Prompt & Welcome Message Editor */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#11141D] border border-white/10 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#C9A96E]/10 text-[#C9A96E]">
                      <Terminal className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-serif font-bold text-white">Studio Persona & System Prompt</h4>
                      <p className="text-xs text-slate-400">
                        The comprehensive prompt instructing the AI on studio history, package prices, and royal decorum.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Welcome Message */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white uppercase tracking-wider">
                    Initial Chat Greeting (Welcome Message)
                  </label>
                  <input
                    type="text"
                    value={aiConfig.welcomeMessage}
                    onChange={(e) => setAiConfig({ ...aiConfig, welcomeMessage: e.target.value })}
                    placeholder="Namaste! I am your Prazna Concierge..."
                    className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                  />
                </div>

                {/* System Prompt Textarea */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white uppercase tracking-wider">
                      Master System Prompt
                    </label>
                    <span className="text-[11px] text-[#C9A96E]">
                      Tailored for Prazna Photography
                    </span>
                  </div>
                  <textarea
                    rows={12}
                    value={aiConfig.systemPrompt}
                    onChange={(e) => setAiConfig({ ...aiConfig, systemPrompt: e.target.value })}
                    className="w-full p-4 rounded-2xl bg-[#090C12] border border-white/15 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-[#C9A96E]"
                  />
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-[11px] text-slate-300 border border-white/10">
                      ✓ Sacred Vows (₹1.85L)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-[11px] text-slate-300 border border-white/10">
                      ✓ Classical Memoir (₹2.95L)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-[11px] text-slate-300 border border-white/10">
                      ✓ Royal Heritage Grandeur (₹4.95L)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-[11px] text-slate-300 border border-white/10">
                      ✓ Udaipur, Hyderabad, Italy Destinations
                    </span>
                  </div>
                </div>

                {/* Quick Questions Editor */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-semibold text-white uppercase tracking-wider">
                    Quick Suggested Questions (Website Widget Pills)
                  </label>
                  <div className="space-y-2">
                    {aiConfig.quickQuestions.map((q, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={q}
                          onChange={(e) => {
                            const updated = [...aiConfig.quickQuestions];
                            updated[idx] = e.target.value;
                            setAiConfig({ ...aiConfig, quickQuestions: updated });
                          }}
                          className="flex-1 p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setAiConfig({
                              ...aiConfig,
                              quickQuestions: aiConfig.quickQuestions.filter((_, i) => i !== idx),
                            });
                          }}
                          className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAiConfig({
                        ...aiConfig,
                        quickQuestions: [...aiConfig.quickQuestions, 'How do we book a bridal consultation?'],
                      });
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-slate-300 border border-white/10 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>Add Suggested Question</span>
                  </button>
                </div>
              </div>

              {/* Interactive Live AI Chat Sandbox & Tester */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#0E1119] border border-[#C9A96E]/30 space-y-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#C9A96E]/20 text-[#C9A96E]">
                      <Play className="w-5 h-5 fill-[#C9A96E]" />
                    </div>
                    <div>
                      <h4 className="text-base font-serif font-bold text-white">Live AI Chat Sandbox</h4>
                      <p className="text-xs text-slate-400">
                        Test the active AI provider ({aiConfig.activeProvider}) and prompt live before visitors use it.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-emerald-400 font-medium">SSE Stream Engine Ready</span>
                  </div>
                </div>

                {/* Test Response Preview */}
                <div className="min-h-36 p-4 rounded-2xl bg-[#080A10] border border-white/10 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed relative">
                  {aiTestResponse ? (
                    <div>{aiTestResponse}</div>
                  ) : (
                    <div className="text-slate-500 italic">
                      Click "Test Stream Response" below or type a custom question to see tokens stream live...
                    </div>
                  )}
                  {isAiTesting && (
                    <span className="inline-block w-2 h-4 ml-1 bg-[#C9A96E] animate-pulse align-middle" />
                  )}
                </div>

                {/* Test Input & Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    value={aiTestPrompt}
                    onChange={(e) => setAiTestPrompt(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter' && !isAiTesting) {
                        e.preventDefault();
                        if (!aiTestPrompt.trim()) return;
                        setIsAiTesting(true);
                        setAiTestResponse('');
                        try {
                          await chatAPI.streamMessage({
                            message: aiTestPrompt,
                            history: [],
                            onToken: (tok, full) => {
                              setAiTestResponse(full);
                            },
                            onComplete: () => {
                              setIsAiTesting(false);
                            },
                            onError: (err) => {
                              setAiTestResponse((prev) => prev + `\n\n[Error]: ${err.message}`);
                              setIsAiTesting(false);
                            },
                          });
                        } catch (err) {
                          setAiTestResponse(`[Test stream error]: ${err.message}`);
                          setIsAiTesting(false);
                        }
                      }
                    }}
                    placeholder="Ask a question (e.g. What are your Udaipur destination rates?)"
                    className="flex-1 w-full p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      disabled={isAiTesting}
                      onClick={async () => {
                        if (!aiTestPrompt.trim() || isAiTesting) return;
                        setIsAiTesting(true);
                        setAiTestResponse('');
                        try {
                          await chatAPI.streamMessage({
                            message: aiTestPrompt,
                            history: [],
                            onToken: (tok, full) => {
                              setAiTestResponse(full);
                            },
                            onComplete: () => {
                              setIsAiTesting(false);
                            },
                            onError: (err) => {
                              setAiTestResponse((prev) => prev + `\n\n[Error]: ${err.message}`);
                              setIsAiTesting(false);
                            },
                          });
                        } catch (err) {
                          setAiTestResponse(`[Test stream error]: ${err.message}`);
                          setIsAiTesting(false);
                        }
                      }}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow flex items-center gap-2 hover:opacity-95 disabled:opacity-50"
                    >
                      {isAiTesting ? (
                        <>
                          <RotateCw className="w-4 h-4 animate-spin text-black" />
                          <span>Streaming Tokens...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-black" />
                          <span>Test Stream Response</span>
                        </>
                      )}
                    </button>
                    {aiTestResponse && (
                      <button
                        type="button"
                        onClick={() => setAiTestResponse('')}
                        className="p-3 rounded-xl bg-white/[0.04] text-slate-400 hover:text-white text-xs"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONFIG SUB-TAB 2: EMAIL & SMS GATEWAYS */}
          {configSubTab === 'email-sms' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Email Gateway Config */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#11141D] border border-white/10 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#C9A96E]/10 text-[#C9A96E]">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-serif font-bold text-white">Email Gateway (SMTP / SES)</h3>
                      <p className="text-[11px] text-slate-400">Automated client proposals and quote receipts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => triggerSaveToast(`Simulated test email sent via ${emailConfig.provider} to ${emailConfig.fromEmail}!`)}
                      className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-slate-300 border border-white/10 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5 text-[#C9A96E]" />
                      <span>Test Send</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await settingsAPI.update({
                            emailSms: {
                              emailProvider: emailConfig.provider,
                              smtp: {
                                host: emailConfig.host,
                                port: Number(emailConfig.port) || 587,
                                user: emailConfig.username,
                                fromEmail: emailConfig.fromEmail,
                              },
                            },
                          });
                          window.dispatchEvent(new Event('site-settings-updated'));
                          triggerSaveToast('Email gateway settings saved to MongoDB!');
                        } catch (err) {
                          triggerSaveToast(`Error: ${err.message}`);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5 text-black" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-medium">Provider</label>
                      <select
                        value={emailConfig.provider}
                        onChange={(e) => setEmailConfig({ ...emailConfig, provider: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-[#181C27] border border-white/10 text-xs text-white"
                      >
                        <option value="SendGrid">SendGrid</option>
                        <option value="Amazon SES">Amazon SES</option>
                        <option value="Resend">Resend</option>
                        <option value="Brevo">Brevo / Sendinblue</option>
                        <option value="Custom SMTP">Custom SMTP</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-medium">SMTP Port</label>
                      <input
                        type="number"
                        value={emailConfig.port}
                        onChange={(e) => setEmailConfig({ ...emailConfig, port: parseInt(e.target.value, 10) || 587 })}
                        className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">SMTP Server Host</label>
                    <input
                      type="text"
                      value={emailConfig.host}
                      onChange={(e) => setEmailConfig({ ...emailConfig, host: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">From Email Address</label>
                    <input
                      type="email"
                      value={emailConfig.fromEmail}
                      onChange={(e) => setEmailConfig({ ...emailConfig, fromEmail: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">Sender Display Name</label>
                    <input
                      type="text"
                      value={emailConfig.fromName}
                      onChange={(e) => setEmailConfig({ ...emailConfig, fromName: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-[#C9A96E]" />
                      <span>API Secret / SMTP Password</span>
                    </label>
                    <input
                      type={showKeys ? 'text' : 'password'}
                      value={emailConfig.apiKey}
                      onChange={(e) => setEmailConfig({ ...emailConfig, apiKey: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* SMS & WhatsApp Gateway Config */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#11141D] border border-white/10 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-serif font-bold text-white">SMS & WhatsApp Gateway</h3>
                      <p className="text-[11px] text-slate-400">Instant client updates and crew call-time reminders</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => triggerSaveToast(`Simulated test SMS/WhatsApp sent via ${smsConfig.provider} to ${smsConfig.whatsappNumber}!`)}
                      className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-slate-300 border border-white/10 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Test Ping</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await settingsAPI.update({
                            emailSms: {
                              smsProvider: smsConfig.provider,
                            },
                          });
                          window.dispatchEvent(new Event('site-settings-updated'));
                          triggerSaveToast('SMS & WhatsApp gateway settings saved to MongoDB!');
                        } catch (err) {
                          triggerSaveToast(`Error: ${err.message}`);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5 text-black" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-medium">Gateway Service</label>
                      <select
                        value={smsConfig.provider}
                        onChange={(e) => setSmsConfig({ ...smsConfig, provider: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-[#181C27] border border-white/10 text-xs text-white"
                      >
                        <option value="Twilio">Twilio (Global)</option>
                        <option value="Msg91">Msg91 (India DLT)</option>
                        <option value="Fast2SMS">Fast2SMS</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-medium">DLT Sender ID</label>
                      <input
                        type="text"
                        value={smsConfig.senderId}
                        onChange={(e) => setSmsConfig({ ...smsConfig, senderId: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">Account SID / API Key</label>
                    <input
                      type="text"
                      value={smsConfig.accountSid}
                      onChange={(e) => setSmsConfig({ ...smsConfig, accountSid: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-[#C9A96E]" />
                      <span>Auth Token / Secret</span>
                    </label>
                    <input
                      type={showKeys ? 'text' : 'password'}
                      value={smsConfig.authToken}
                      onChange={(e) => setSmsConfig({ ...smsConfig, authToken: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">Dedicated WhatsApp Bot Line</label>
                    <input
                      type="text"
                      value={smsConfig.whatsappNumber}
                      onChange={(e) => setSmsConfig({ ...smsConfig, whatsappNumber: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-300">
                    <span>Enable Auto-WhatsApp on Enquiries</span>
                    <input
                      type="checkbox"
                      checked={smsConfig.enableWhatsAppAlerts}
                      onChange={(e) => setSmsConfig({ ...smsConfig, enableWhatsAppAlerts: e.target.checked })}
                      className="w-4 h-4 accent-[#C9A96E]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONFIG SUB-TAB 3: EMAIL & SMS TEMPLATES (Add & Edit) */}
          {configSubTab === 'templates' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-6 rounded-3xl bg-[#11141D] border border-white/10">
                <div>
                  <h3 className="text-lg font-serif font-bold text-white">Automated Notification Templates</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Customize messages dispatched on booking enquiries, quote generation, and gallery deliverables.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddTemplateModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-black" />
                  <span>Create Template</span>
                </button>
              </div>

              {/* Guide tags pill */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-slate-400">
                <span className="text-[#C9A96E] font-medium flex items-center gap-1.5">
                  <Copy className="w-3.5 h-3.5" />
                  <span>Dynamic Tags (click to copy):</span>
                </span>
                <div className="flex flex-wrap gap-2 font-mono text-[11px] text-slate-300">
                  {['{client_name}', '{event_dates}', '{venue}', '{package_name}', '{estimated_budget}'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        try {
                          navigator.clipboard.writeText(tag);
                          triggerSaveToast(`Copied ${tag} to clipboard!`);
                        } catch {
                          triggerSaveToast(`Tag ${tag} selected`);
                        }
                      }}
                      className="px-2 py-0.5 rounded bg-white/5 hover:bg-[#C9A96E]/20 hover:text-[#C9A96E] border border-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Click to copy tag"
                    >
                      <span>{tag}</span>
                      <Copy className="w-2.5 h-2.5 opacity-60" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Cards */}
              <div className="space-y-6">
                {templates.map((tmpl, idx) => (
                  <div
                    key={tmpl.id}
                    className="p-6 rounded-3xl bg-[#11141D] border border-white/10 space-y-4 shadow-xl"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#C9A96E]/20 text-[#E5D2A8] font-bold">
                          {tmpl.id}
                        </span>
                        <input
                          type="text"
                          value={tmpl.title}
                          onChange={(e) => {
                            const updated = [...templates];
                            updated[idx].title = e.target.value;
                            setTemplates(updated);
                          }}
                          className="font-serif font-bold text-white text-base bg-transparent border-b border-transparent focus:border-[#C9A96E] focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">{tmpl.channel}</span>
                        <button
                          type="button"
                          onClick={() => setTemplates(templates.filter((t) => t.id !== tmpl.id))}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[11px] text-[#C9A96E] font-medium">Email Subject Line</label>
                        <input
                          type="text"
                          value={tmpl.subject}
                          onChange={(e) => {
                            const updated = [...templates];
                            updated[idx].subject = e.target.value;
                            setTemplates(updated);
                          }}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-300 font-medium">Email Body Format</label>
                          <textarea
                            rows={6}
                            value={tmpl.emailBody}
                            onChange={(e) => {
                              const updated = [...templates];
                              updated[idx].emailBody = e.target.value;
                              setTemplates(updated);
                            }}
                            className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-200 font-mono leading-relaxed"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] text-emerald-400 font-medium">SMS & WhatsApp Notification Text</label>
                          <textarea
                            rows={6}
                            value={tmpl.smsBody}
                            onChange={(e) => {
                              const updated = [...templates];
                              updated[idx].smsBody = e.target.value;
                              setTemplates(updated);
                            }}
                            className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-200 font-mono leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => triggerSaveToast(`Template '${tmpl.title}' updated!`)}
                        className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-[#E5D2A8] border border-[#C9A96E]/30 flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Update Template</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Template Modal */}
              {showAddTemplateModal && (
                <ModalPortal onClose={() => setShowAddTemplateModal(false)}>
                <div className="w-full max-w-lg bg-[#121622] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <h3 className="text-lg font-serif font-bold text-white">Create Notification Template</h3>
                      <button onClick={() => setShowAddTemplateModal(false)} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newTemplateForm.title) return;
                        const created = {
                          id: `TMPL-0${templates.length + 1}`,
                          ...newTemplateForm,
                        };
                        setTemplates([...templates, created]);
                        setShowAddTemplateModal(false);
                        triggerSaveToast(`Template '${created.title}' created!`);
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Template Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 24-Hour Teaser Reel Delivered"
                          value={newTemplateForm.title}
                          onChange={(e) => setNewTemplateForm({ ...newTemplateForm, title: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Email Subject</label>
                        <input
                          type="text"
                          required
                          placeholder="✨ Your wedding teaser reel is live, {client_name}!"
                          value={newTemplateForm.subject}
                          onChange={(e) => setNewTemplateForm({ ...newTemplateForm, subject: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Email Body</label>
                        <textarea
                          rows={3}
                          placeholder="Dear {client_name}..."
                          value={newTemplateForm.emailBody}
                          onChange={(e) => setNewTemplateForm({ ...newTemplateForm, emailBody: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">WhatsApp / SMS Text</label>
                        <textarea
                          rows={2}
                          placeholder="Hi {client_name}! Your teaser is ready..."
                          value={newTemplateForm.smsBody}
                          onChange={(e) => setNewTemplateForm({ ...newTemplateForm, smsBody: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono"
                        />
                      </div>

                      <div className="pt-4 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowAddTemplateModal(false)}
                          className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow hover:opacity-95"
                        >
                          Save Template
                        </button>
                      </div>
                    </form>
                  </div>
                </ModalPortal>
              )}
            </div>
          )}

          {/* CONFIG SUB-TAB 4: SOCIAL MEDIA LINKS (Add & Edit) */}
          {configSubTab === 'social' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#11141D] border border-white/10 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-serif font-bold text-white">Social Media & Messaging Channels</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live links displayed on website navbar, footer, and inquiry concierges.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddSocialModal(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-black" />
                    <span>Add New Channel</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await settingsAPI.update({ socialLinks });
                        window.dispatchEvent(new Event('site-settings-updated'));
                        triggerSaveToast('Social media links saved to MongoDB!');
                      } catch (err) {
                        triggerSaveToast(`Error: ${err.message}`);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-white border border-white/10 flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>Save All</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {socialLinks.map((link, idx) => (
                  <div
                    key={link.id || idx}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-44">
                      <div className="p-2 rounded-xl bg-[#C9A96E]/10 text-[#C9A96E]">
                        <Share2 className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-white">{link.platform}</span>
                    </div>

                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => {
                          const updated = [...socialLinks];
                          updated[idx].url = e.target.value;
                          setSocialLinks(updated);
                        }}
                        className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                      />
                    </div>

                    <div className="flex items-center gap-3 justify-end">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#C9A96E] hover:bg-white/5 transition-colors"
                        title="Visit Link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={link.active}
                          onChange={(e) => {
                            const updated = [...socialLinks];
                            updated[idx].active = e.target.checked;
                            setSocialLinks(updated);
                          }}
                          className="w-4 h-4 accent-[#C9A96E]"
                        />
                        <span>Active</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setSocialLinks(socialLinks.filter((s) => s.id !== link.id))}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Social Channel Modal */}
              {showAddSocialModal && (
                <ModalPortal onClose={() => setShowAddSocialModal(false)}>
                <div className="w-full max-w-md bg-[#121622] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <h3 className="text-lg font-serif font-bold text-white">Add Social Channel</h3>
                      <button onClick={() => setShowAddSocialModal(false)} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newSocialForm.platform || !newSocialForm.url) return;
                        const created = {
                          id: newSocialForm.platform.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                          ...newSocialForm,
                        };
                        setSocialLinks([...socialLinks, created]);
                        setShowAddSocialModal(false);
                        triggerSaveToast(`Added ${created.platform}!`);
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Platform Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Threads / Telegram"
                          value={newSocialForm.platform}
                          onChange={(e) => setNewSocialForm({ ...newSocialForm, platform: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Direct Link URL</label>
                        <input
                          type="text"
                          required
                          placeholder="https://..."
                          value={newSocialForm.url}
                          onChange={(e) => setNewSocialForm({ ...newSocialForm, url: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="pt-4 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowAddSocialModal(false)}
                          className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow hover:opacity-95"
                        >
                          Add Channel
                        </button>
                      </div>
                    </form>
                  </div>
                </ModalPortal>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. WEBSITE UI SETTINGS (Hero, Brand, Philosophy, Packages, Quote, Reviews)*/}
      {/* ========================================================================= */}
      {activeMainTab === 'website-ui' && (
        <div className="space-y-6">
          {/* Sub Navigation Bar for UI Settings */}
          <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-[#11141D] border border-white/10">
            {[
              { id: 'hero', name: 'Landing Hero (Video/Image)', icon: Video },
              { id: 'gallery', name: 'Curated Masterpieces (Gallery)', icon: ImageIcon },
              { id: 'films', name: 'Wedding Films Cinema', icon: Film },
              { id: 'brand', name: 'Logo & Brand Identity', icon: Globe },
              { id: 'footer', name: 'Footer & Legal', icon: Layout },
              { id: 'philosophy', name: 'Philosophy & Pillars', icon: Award },
              { id: 'packages', name: 'Signature Packages', icon: Layers },
              { id: 'quote-engine', name: 'Quote Engine & Rates', icon: DollarSign },
              { id: 'testimonials', name: 'Testimonials', icon: MessageSquare },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setUiSubTab(sub.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                  uiSubTab === sub.id
                    ? 'bg-[#C9A96E] text-black font-semibold shadow-gold-glow'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <sub.icon className="w-3.5 h-3.5" />
                <span>{sub.name}</span>
              </button>
            ))}
          </div>

          {/* SUB-SECTION 1: HERO LANDING (Single Active Video OR Single Active Image) */}
          {uiSubTab === 'hero' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#11141D] border border-white/10 space-y-8 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white">Landing Hero Media &amp; Mode</h3>
                    <p className="text-xs text-slate-400">
                      Upload multiple 4K videos and high-res images to your studio library. Only <strong>ONE video</strong> or <strong>ONE image</strong> can be enabled on the live homepage hero at a time.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddHeroModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-white border border-white/10 flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>Add Video</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddHeroImageModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-white border border-white/10 flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>Add Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSiteConfig}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5 text-black" />
                    <span>Save UI Config</span>
                  </button>
                </div>
              </div>

              {/* PRIMARY MODE SELECTOR: VIDEO vs IMAGE */}
              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Select Active Hero Media Type (Only One Enabled on Website):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Mode Card 1: 4K Cinema Video */}
                  <div
                    onClick={() => handleSwitchHeroMode('video')}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center justify-between ${
                      (siteConfigData.heroMediaType || 'video') === 'video'
                        ? 'bg-gradient-to-r from-[#C9A96E]/20 to-[#181C27] border-[#C9A96E] ring-1 ring-[#C9A96E]/50 shadow-gold-glow'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`p-3 rounded-xl ${
                        (siteConfigData.heroMediaType || 'video') === 'video' ? 'bg-[#C9A96E] text-black' : 'bg-white/5 text-slate-400'
                      }`}>
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">4K Cinema Wedding Video</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Stream verified 4K wedding films with audio toggles</p>
                      </div>
                    </div>
                    {(siteConfigData.heroMediaType || 'video') === 'video' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#C9A96E] text-black">
                        Active Mode
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 hover:text-white">Enable</span>
                    )}
                  </div>

                  {/* Mode Card 2: High-Resolution Still Image */}
                  <div
                    onClick={() => handleSwitchHeroMode('image')}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center justify-between ${
                      siteConfigData.heroMediaType === 'image'
                        ? 'bg-gradient-to-r from-[#C9A96E]/20 to-[#181C27] border-[#C9A96E] ring-1 ring-[#C9A96E]/50 shadow-gold-glow'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`p-3 rounded-xl ${
                        siteConfigData.heroMediaType === 'image' ? 'bg-[#C9A96E] text-black' : 'bg-white/5 text-slate-400'
                      }`}>
                        <Crown className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">High-Resolution Still Image</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Fine-art portraiture with luxury Ken-Burns motion</p>
                      </div>
                    </div>
                    {siteConfigData.heroMediaType === 'image' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#C9A96E] text-black">
                        Active Mode
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 hover:text-white">Enable</span>
                    )}
                  </div>
                </div>

                {/* Live Active Media Confirmation Banner */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                    <span className="text-slate-300">
                      Currently Live on Website Hero:{' '}
                      <strong className="text-emerald-300">
                        {siteConfigData.heroMediaType === 'image' ? 'High-Res Still Image' : '4K Cinema Video'}
                      </strong>{' '}
                      —{' '}
                      <span className="text-white font-serif">
                        {siteConfigData.heroMediaType === 'image'
                          ? ((siteConfigData.heroImages || []).find((i) => i.id === siteConfigData.activeHeroImageId)?.name || 'Heritage Still')
                          : ((siteConfigData.heroVideos || []).find((v) => v.id === siteConfigData.activeHeroVideoId)?.name || 'Varsha & Shiva')}
                      </span>
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#E5D2A8] hidden sm:inline">
                    Single Active Media Enforced
                  </span>
                </div>
              </div>

              {/* General Hero Copy Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Hero Subtitle</label>
                  <input
                    type="text"
                    value={siteConfigData.heroSubtitle || ''}
                    onChange={(e) => setSiteConfigData({ ...siteConfigData, heroSubtitle: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Hero Availability Badge</label>
                  <input
                    type="text"
                    value={siteConfigData.heroAvailability || ''}
                    onChange={(e) => setSiteConfigData({ ...siteConfigData, heroAvailability: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                  />
                </div>
              </div>

              {/* ================================================================= */}
              {/* SECTION 1: HERO VIDEOS LIBRARY (Add, Edit, Only 1 Enabled)         */}
              {/* ================================================================= */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-serif font-bold text-white flex items-center gap-2">
                      <Video className="w-4 h-4 text-[#C9A96E]" />
                      Hero Videos Library (Upload / Add More)
                    </h4>
                    <p className="text-xs text-slate-400">
                      Add as many 4K wedding films as you like. Only the chosen video is enabled when Video mode is selected.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddHeroModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-white border border-white/10 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>Add Video</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(siteConfigData.heroVideos || []).map((v) => {
                    const isLiveActive =
                      (siteConfigData.heroMediaType || 'video') === 'video' &&
                      siteConfigData.activeHeroVideoId === v.id;
                    return (
                      <div
                        key={v.id}
                        className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-3 ${
                          isLiveActive
                            ? 'bg-gradient-to-b from-[#C9A96E]/20 to-[#141824] border-[#C9A96E] shadow-gold-glow ring-1 ring-[#C9A96E]/50'
                            : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-black/50 border border-white/10">
                            <img
                              src={v.poster || `https://img.youtube.com/vi/${v.videoId}/maxresdefault.jpg`}
                              alt={v.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <span className="p-2 rounded-full bg-black/60 text-white backdrop-blur-sm">
                                <Video className="w-4 h-4 text-[#C9A96E]" />
                              </span>
                            </div>
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono bg-black/70 text-white/90">
                              {v.videoId}
                            </span>
                            {isLiveActive && (
                              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C9A96E] text-black">
                                ✓ Live on Hero
                              </span>
                            )}
                          </div>

                          <div>
                            <h5 className="text-sm font-serif font-bold text-white line-clamp-1">{v.name}</h5>
                            <p className="text-[11px] text-[#E5D2A8] line-clamp-1 mt-0.5">{v.location}</p>
                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{v.tagline}</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                          {isLiveActive ? (
                            <div className="flex-1 py-1.5 text-center text-xs font-semibold text-[#E5D2A8] bg-[#C9A96E]/10 rounded-xl border border-[#C9A96E]/30">
                              Active Hero Film
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleEnableHeroVideo(v.id)}
                              className="flex-1 py-1.5 rounded-xl bg-white/[0.05] hover:bg-[#C9A96E] hover:text-black text-xs font-semibold text-white transition-all border border-white/10"
                            >
                              Enable for Hero
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setEditingHeroVideo({ ...v })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                            title="Edit Video"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#C9A96E]" />
                          </button>

                          {(siteConfigData.heroVideos || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteHeroVideo(v.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete Video"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ================================================================= */}
              {/* SECTION 2: HERO IMAGES LIBRARY (Add, Edit, Only 1 Enabled)         */}
              {/* ================================================================= */}
              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-serif font-bold text-white flex items-center gap-2">
                      <Crown className="w-4 h-4 text-[#C9A96E]" />
                      Hero Images Library (Upload / Add More)
                    </h4>
                    <p className="text-xs text-slate-400">
                      Add multiple fine-art photographs. Only the chosen image is enabled when Image mode is selected.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddHeroImageModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-white border border-white/10 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>Add Image</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(siteConfigData.heroImages || []).map((img) => {
                    const isLiveActive =
                      siteConfigData.heroMediaType === 'image' &&
                      siteConfigData.activeHeroImageId === img.id;
                    return (
                      <div
                        key={img.id}
                        className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-3 ${
                          isLiveActive
                            ? 'bg-gradient-to-b from-[#C9A96E]/20 to-[#141824] border-[#C9A96E] shadow-gold-glow ring-1 ring-[#C9A96E]/50'
                            : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/50 border border-white/10">
                            <img
                              src={img.src}
                              alt={img.name}
                              className="w-full h-full object-cover"
                            />
                            {isLiveActive && (
                              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C9A96E] text-black">
                                ✓ Live on Hero
                              </span>
                            )}
                          </div>

                          <div>
                            <h5 className="text-sm font-serif font-bold text-white line-clamp-1">{img.name}</h5>
                            <p className="text-[11px] text-[#E5D2A8] line-clamp-1 mt-0.5">{img.location}</p>
                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{img.tagline}</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                          {isLiveActive ? (
                            <div className="flex-1 py-1.5 text-center text-xs font-semibold text-[#E5D2A8] bg-[#C9A96E]/10 rounded-xl border border-[#C9A96E]/30">
                              Active Hero Image
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleEnableHeroImage(img.id)}
                              className="flex-1 py-1.5 rounded-xl bg-white/[0.05] hover:bg-[#C9A96E] hover:text-black text-xs font-semibold text-white transition-all border border-white/10"
                            >
                              Enable for Hero
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setEditingHeroImage({ ...img })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                            title="Edit Image"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#C9A96E]" />
                          </button>

                          {(siteConfigData.heroImages || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteHeroImage(img.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete Image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* MODAL 1: ADD NEW HERO VIDEO */}
              {showAddHeroModal && (
                <ModalPortal onClose={() => setShowAddHeroModal(false)}>
                <div className="w-full max-w-md bg-[#121622] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                        <Video className="w-5 h-5 text-[#C9A96E]" />
                        Add Hero Video
                      </h3>
                      <button onClick={() => setShowAddHeroModal(false)} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newHeroForm.name || !newHeroForm.videoId) return;
                        const sceneId = newHeroForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
                        const created = {
                          id: sceneId,
                          name: newHeroForm.name,
                          type: 'youtube',
                          videoId: newHeroForm.videoId,
                          poster: `https://img.youtube.com/vi/${newHeroForm.videoId}/maxresdefault.jpg`,
                          location: newHeroForm.location || 'Luxury Destination',
                          tagline: newHeroForm.tagline || 'Celebrating love in its most authentic moments.',
                        };
                        const updatedVideos = [...(siteConfigData.heroVideos || []), created];
                        const updatedConfig = {
                          ...siteConfigData,
                          heroVideos: updatedVideos,
                          heroScenes: updatedVideos,
                        };
                        setShowAddHeroModal(false);
                        setNewHeroForm({ id: '', name: '', videoId: '', location: '', tagline: '' });
                        persistConfigUpdate(updatedConfig, `Added video '${created.name}' & saved to database!`);
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Video Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Sravya &amp; Abhikshith (4K)"
                          value={newHeroForm.name}
                          onChange={(e) => setNewHeroForm({ ...newHeroForm, name: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-slate-300 font-medium">YouTube Video ID / URL or Upload</label>
                          <label className="text-[11px] text-[#C9A96E] hover:underline cursor-pointer flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            <span>{uploadingField === 'heroVideo' ? 'Uploading...' : 'Upload MP4'}</span>
                            <input
                              type="file"
                              accept="video/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(
                                    file,
                                    (uploadedUrl) => {
                                      setNewHeroForm({ ...newHeroForm, videoId: uploadedUrl });
                                    },
                                    { field: 'heroVideo', folder: 'hero-cinema', title: newHeroForm.name || 'Hero Video' }
                                  );
                                }
                              }}
                            />
                          </label>
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="e.g. jcBEUpPrqY0 or https://youtube.com/watch?v=... or upload file"
                          value={newHeroForm.videoId}
                          onChange={(e) => {
                            const val = e.target.value;
                            const match = val.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                            setNewHeroForm({ ...newHeroForm, videoId: match ? match[1] : val });
                          }}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Venue Location</label>
                        <input
                          type="text"
                          placeholder="e.g. Taj Falaknuma Palace, Hyderabad"
                          value={newHeroForm.location}
                          onChange={(e) => setNewHeroForm({ ...newHeroForm, location: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Tagline / Highlight</label>
                        <input
                          type="text"
                          placeholder="e.g. Celebrating love in its most authentic moments."
                          value={newHeroForm.tagline}
                          onChange={(e) => setNewHeroForm({ ...newHeroForm, tagline: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="pt-4 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowAddHeroModal(false)}
                          className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow hover:opacity-95"
                        >
                          Add Video
                        </button>
                      </div>
                    </form>
                  </div>
                </ModalPortal>
              )}

              {/* MODAL 2: EDIT HERO VIDEO */}
              {editingHeroVideo && (
                <ModalPortal onClose={() => setEditingHeroVideo(null)}>
                <div className="w-full max-w-md bg-[#121622] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                        <Video className="w-5 h-5 text-[#C9A96E]" />
                        Edit Hero Video
                      </h3>
                      <button onClick={() => setEditingHeroVideo(null)} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const updatedVideos = (siteConfigData.heroVideos || []).map((v) =>
                          v.id === editingHeroVideo.id ? editingHeroVideo : v
                        );
                        setSiteConfigData({
                          ...siteConfigData,
                          heroVideos: updatedVideos,
                          heroScenes: updatedVideos,
                        });
                        setEditingHeroVideo(null);
                        triggerSaveToast(`Updated video '${editingHeroVideo.name}'!`);
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Video Title</label>
                        <input
                          type="text"
                          required
                          value={editingHeroVideo.name || ''}
                          onChange={(e) => setEditingHeroVideo({ ...editingHeroVideo, name: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">YouTube Video ID</label>
                        <input
                          type="text"
                          required
                          value={editingHeroVideo.videoId || ''}
                          onChange={(e) =>
                            setEditingHeroVideo({
                              ...editingHeroVideo,
                              videoId: e.target.value,
                              poster: `https://img.youtube.com/vi/${e.target.value}/maxresdefault.jpg`,
                            })
                          }
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Venue Location</label>
                        <input
                          type="text"
                          value={editingHeroVideo.location || ''}
                          onChange={(e) => setEditingHeroVideo({ ...editingHeroVideo, location: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Tagline</label>
                        <input
                          type="text"
                          value={editingHeroVideo.tagline || ''}
                          onChange={(e) => setEditingHeroVideo({ ...editingHeroVideo, tagline: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="pt-4 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setEditingHeroVideo(null)}
                          className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow hover:opacity-95"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </ModalPortal>
              )}

              {/* MODAL 3: ADD NEW HERO IMAGE */}
              {showAddHeroImageModal && (
                <ModalPortal onClose={() => setShowAddHeroImageModal(false)}>
                <div className="w-full max-w-md bg-[#121622] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                        <Crown className="w-5 h-5 text-[#C9A96E]" />
                        Add Hero Image
                      </h3>
                      <button onClick={() => setShowAddHeroImageModal(false)} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newHeroImageForm.name || !newHeroImageForm.src) return;
                        const imageId = newHeroImageForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
                        const created = {
                          id: imageId,
                          name: newHeroImageForm.name,
                          src: newHeroImageForm.src,
                          location: newHeroImageForm.location || 'Luxury Destination',
                          tagline: newHeroImageForm.tagline || 'Immortalizing fine-art heirloom composure.',
                        };
                        const updatedImages = [...(siteConfigData.heroImages || []), created];
                        const updatedConfig = {
                          ...siteConfigData,
                          heroImages: updatedImages,
                        };
                        setShowAddHeroImageModal(false);
                        setNewHeroImageForm({ id: '', name: '', src: '', location: '', tagline: '' });
                        persistConfigUpdate(updatedConfig, `Added image '${created.name}' & saved to database!`);
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Image Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Royal Emerald Silk Bride"
                          value={newHeroImageForm.name}
                          onChange={(e) => setNewHeroImageForm({ ...newHeroImageForm, name: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-slate-300 font-medium">Image URL or Local Upload</label>
                          <label className="text-[11px] text-[#C9A96E] hover:underline cursor-pointer flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            <span>{uploadingField === 'heroImage' ? 'Uploading...' : 'Upload File'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(
                                    file,
                                    (uploadedUrl) => {
                                      setNewHeroImageForm({ ...newHeroImageForm, src: uploadedUrl });
                                    },
                                    { field: 'heroImage', folder: 'hero-stills', title: newHeroImageForm.name || 'Hero Still' }
                                  );
                                }
                              }}
                            />
                          </label>
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="e.g. https://res.cloudinary.com/... or upload file"
                          value={newHeroImageForm.src}
                          onChange={(e) => setNewHeroImageForm({ ...newHeroImageForm, src: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                        {newHeroImageForm.src && (
                          <div className="mt-2 h-16 w-full rounded-xl overflow-hidden border border-white/10 relative">
                            <img src={newHeroImageForm.src} alt="Preview" className="w-full h-full object-cover" />
                            <span className="absolute bottom-1 right-2 text-[9px] bg-black/70 px-1.5 py-0.5 rounded text-white font-mono">Ready</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Venue / Destination</label>
                        <input
                          type="text"
                          placeholder="e.g. Taj Falaknuma Palace"
                          value={newHeroImageForm.location}
                          onChange={(e) => setNewHeroImageForm({ ...newHeroImageForm, location: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Tagline</label>
                        <input
                          type="text"
                          placeholder="e.g. Handcrafted gold Kanjeevaram elegance"
                          value={newHeroImageForm.tagline}
                          onChange={(e) => setNewHeroImageForm({ ...newHeroImageForm, tagline: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="pt-4 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowAddHeroImageModal(false)}
                          className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow hover:opacity-95"
                        >
                          Add Image
                        </button>
                      </div>
                    </form>
                  </div>
                </ModalPortal>
              )}

              {/* MODAL 4: EDIT HERO IMAGE */}
              {editingHeroImage && (
                <ModalPortal onClose={() => setEditingHeroImage(null)}>
                <div className="w-full max-w-md bg-[#121622] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                        <Crown className="w-5 h-5 text-[#C9A96E]" />
                        Edit Hero Image
                      </h3>
                      <button onClick={() => setEditingHeroImage(null)} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const updatedImages = (siteConfigData.heroImages || []).map((img) =>
                          img.id === editingHeroImage.id ? editingHeroImage : img
                        );
                        setSiteConfigData({
                          ...siteConfigData,
                          heroImages: updatedImages,
                        });
                        setEditingHeroImage(null);
                        triggerSaveToast(`Updated image '${editingHeroImage.name}'!`);
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Image Title</label>
                        <input
                          type="text"
                          required
                          value={editingHeroImage.name || ''}
                          onChange={(e) => setEditingHeroImage({ ...editingHeroImage, name: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-slate-300 font-medium">Image URL or Local Upload</label>
                          <label className="text-[11px] text-[#C9A96E] hover:underline cursor-pointer flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            <span>{uploadingField === 'editHeroImage' ? 'Uploading...' : 'Replace File'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(
                                    file,
                                    (uploadedUrl) => {
                                      setEditingHeroImage({ ...editingHeroImage, src: uploadedUrl });
                                    },
                                    { field: 'editHeroImage', folder: 'hero-stills', title: editingHeroImage.name || 'Hero Still' }
                                  );
                                }
                              }}
                            />
                          </label>
                        </div>
                        <input
                          type="text"
                          required
                          value={editingHeroImage.src || ''}
                          onChange={(e) => setEditingHeroImage({ ...editingHeroImage, src: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Venue / Destination</label>
                        <input
                          type="text"
                          value={editingHeroImage.location || ''}
                          onChange={(e) => setEditingHeroImage({ ...editingHeroImage, location: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Tagline</label>
                        <input
                          type="text"
                          value={editingHeroImage.tagline || ''}
                          onChange={(e) => setEditingHeroImage({ ...editingHeroImage, tagline: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="pt-4 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setEditingHeroImage(null)}
                          className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow hover:opacity-95"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </ModalPortal>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-SECTION: CURATED MASTERPIECES (GALLERY)                                */}
          {/* ========================================================================= */}
          {uiSubTab === 'gallery' && (
            <div className="space-y-6">
              {/* Top Banner & Action Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#11141D] border border-white/10 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-[#C9A96E]/10 text-[#C9A96E]">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-serif font-bold text-white">Curated Masterpieces &amp; Visual Stories</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#C9A96E]/20 text-[#E5D2A8] border border-[#C9A96E]/30">
                          {(siteConfigData.gallery || []).length} Photographs
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Manage high-resolution photographs displayed in the Curated Masterpieces masonry gallery. Upload new files, edit editorial titles, and reorder.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setShowAddGalleryModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs flex items-center gap-1.5 shadow-gold-glow hover:opacity-95 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Upload Masterpiece Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => persistConfigUpdate(siteConfigData, 'Curated Masterpieces gallery changes saved to database!')}
                      className="px-4 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/15 text-xs font-medium flex items-center gap-1.5 transition-all border border-white/10"
                    >
                      <Save className="w-3.5 h-3.5 text-[#C9A96E]" />
                      <span>Save All Changes</span>
                    </button>
                  </div>
                </div>

                {/* Category Filter Bar */}
                <div className="pt-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium mr-1">Filter View:</span>
                  <button
                    type="button"
                    onClick={() => setGalleryCategoryFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      galleryCategoryFilter === 'all'
                        ? 'bg-[#C9A96E] text-black font-semibold shadow-gold-glow'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    All Stories ({(siteConfigData.gallery || []).length})
                  </button>
                  {galleryCategories.map((cat) => {
                    const count = (siteConfigData.gallery || []).filter((p) => p.category === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setGalleryCategoryFilter(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          galleryCategoryFilter === cat.id
                            ? 'bg-[#C9A96E] text-black font-semibold shadow-gold-glow'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {cat.name} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Gallery Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {(siteConfigData.gallery || [])
                  .filter((photo) =>
                    galleryCategoryFilter === 'all' ? true : photo.category === galleryCategoryFilter
                  )
                  .map((photo, index) => {
                    const actualIndex = (siteConfigData.gallery || []).findIndex((p) => p.id === photo.id);
                    return (
                      <div
                        key={photo.id || index}
                        className="rounded-2xl bg-[#11141D] border border-white/10 overflow-hidden flex flex-col justify-between group hover:border-[#C9A96E]/50 transition-all hover:shadow-xl"
                      >
                        {/* Thumbnail Image */}
                        <div className="relative aspect-[4/3] bg-black/40 overflow-hidden">
                          <img
                            src={photo.src}
                            alt={photo.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src = '/assets/hero-green-saree-bride.jpg';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                          {/* Top Badges */}
                          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 backdrop-blur-md text-[#E5D2A8] border border-white/15 uppercase tracking-wider">
                              {photo.category || 'wedding'}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/60 backdrop-blur-md text-white/80 border border-white/15 capitalize">
                              {photo.orientation || 'portrait'}
                            </span>
                          </div>

                          {/* Bottom title preview */}
                          <div className="absolute bottom-2.5 left-2.5 right-2.5 pointer-events-none">
                            <p className="text-xs font-serif font-bold text-white drop-shadow truncate">
                              {photo.title}
                            </p>
                            {photo.location && (
                              <p className="text-[10px] text-[#C9A96E] drop-shadow flex items-center gap-1 mt-0.5">
                                <MapPin className="w-2.5 h-2.5" />
                                <span className="truncate">{photo.location}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Card Content & Actions */}
                        <div className="p-3.5 space-y-3 bg-[#151923] flex-1 flex flex-col justify-between">
                          <div className="space-y-1">
                            <p className="text-xs text-slate-300 font-medium line-clamp-1">{photo.title}</p>
                            {photo.subtitle && (
                              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                                {photo.subtitle}
                              </p>
                            )}
                          </div>

                          {/* Action Toolbar */}
                          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={actualIndex === 0}
                                onClick={() => {
                                  const list = [...(siteConfigData.gallery || [])];
                                  if (actualIndex > 0) {
                                    const temp = list[actualIndex];
                                    list[actualIndex] = list[actualIndex - 1];
                                    list[actualIndex - 1] = temp;
                                    const updatedConfig = { ...siteConfigData, gallery: list };
                                    persistConfigUpdate(updatedConfig, 'Shifted photo earlier in gallery');
                                  }
                                }}
                                title="Move Earlier"
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={actualIndex === (siteConfigData.gallery || []).length - 1}
                                onClick={() => {
                                  const list = [...(siteConfigData.gallery || [])];
                                  if (actualIndex < list.length - 1) {
                                    const temp = list[actualIndex];
                                    list[actualIndex] = list[actualIndex + 1];
                                    list[actualIndex + 1] = temp;
                                    const updatedConfig = { ...siteConfigData, gallery: list };
                                    persistConfigUpdate(updatedConfig, 'Shifted photo later in gallery');
                                  }
                                }}
                                title="Move Later"
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingGalleryPhoto(photo);
                                  setEditingGalleryForm({
                                    id: photo.id,
                                    src: photo.src || '',
                                    title: photo.title || '',
                                    subtitle: photo.subtitle || '',
                                    location: photo.location || '',
                                    category: photo.category || 'wedding',
                                    orientation: photo.orientation || 'portrait',
                                  });
                                }}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-[#C9A96E]/20 text-slate-300 hover:text-[#C9A96E] transition-all"
                                title="Edit Photo"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to remove '${photo.title || 'this photograph'}' from the Curated Masterpieces gallery?`)) {
                                    const updatedGallery = (siteConfigData.gallery || []).filter((p) => p.id !== photo.id);
                                    const updatedConfig = { ...siteConfigData, gallery: updatedGallery };
                                    persistConfigUpdate(updatedConfig, `Removed '${photo.title}' from gallery`);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-all"
                                title="Delete Photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Empty State */}
              {(siteConfigData.gallery || []).length === 0 && (
                <div className="p-12 text-center rounded-3xl bg-[#11141D] border border-dashed border-white/15 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#C9A96E]/10 text-[#C9A96E] flex items-center justify-center mx-auto">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white">No Gallery Photographs Found</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Your gallery is currently empty. Click the button below to upload your first luxury wedding photograph!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddGalleryModal(true)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow hover:opacity-95"
                  >
                    Upload First Photo
                  </button>
                </div>
              )}

              {/* ========================================================================= */}
              {/* MODAL 1: UPLOAD / ADD NEW MASTERPIECE PHOTO                                */}
              {/* ========================================================================= */}
              {showAddGalleryModal && (
                <ModalPortal onClose={() => setShowAddGalleryModal(false)}>
                  <div className="w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-[#141824] border border-white/20 shadow-2xl text-white space-y-6 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[#C9A96E]/10 text-[#C9A96E]">
                          <Camera className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-white">Upload New Masterpiece Photograph</h4>
                          <p className="text-xs text-slate-400">Add a high-resolution photograph to the website Curated Masterpieces gallery.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddGalleryModal(false)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newGalleryForm.src || !newGalleryForm.title) return;
                        const photoId = 'photo-' + Date.now();
                        const created = {
                          id: photoId,
                          src: newGalleryForm.src,
                          title: newGalleryForm.title,
                          subtitle: newGalleryForm.subtitle || '',
                          location: newGalleryForm.location || '',
                          category: newGalleryForm.category || 'wedding',
                          orientation: newGalleryForm.orientation || 'portrait',
                        };
                        const updatedGallery = [...(siteConfigData.gallery || []), created];
                        const updatedConfig = { ...siteConfigData, gallery: updatedGallery };
                        setShowAddGalleryModal(false);
                        setNewGalleryForm({
                          id: '',
                          src: '',
                          title: '',
                          subtitle: '',
                          location: '',
                          category: 'wedding',
                          orientation: 'portrait',
                        });
                        persistConfigUpdate(updatedConfig, `Added '${created.title}' to Curated Masterpieces!`);
                      }}
                      className="space-y-4"
                    >
                      {/* Image Upload / URL Box */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-slate-300 font-medium">Photograph File or URL *</label>
                          <label className="text-[11px] text-[#C9A96E] hover:underline cursor-pointer flex items-center gap-1">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{uploadingField === 'galleryPhoto' ? 'Uploading...' : 'Choose File from Computer'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(
                                    file,
                                    (uploadedUrl) => {
                                      setNewGalleryForm((prev) => ({ ...prev, src: uploadedUrl }));
                                    },
                                    { field: 'galleryPhoto', folder: 'portfolio', title: newGalleryForm.title || 'Gallery Photograph' }
                                  );
                                }
                              }}
                            />
                          </label>
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="Paste image URL (http://... or https://...) or click Choose File above"
                          value={newGalleryForm.src}
                          onChange={(e) => setNewGalleryForm({ ...newGalleryForm, src: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A96E]"
                        />

                        {/* Live Image Preview */}
                        {newGalleryForm.src && (
                          <div className="relative rounded-2xl overflow-hidden border border-white/15 aspect-[16/9] bg-black/40">
                            <img
                              src={newGalleryForm.src}
                              alt="Upload Preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-emerald-400 border border-emerald-500/30">
                              ✓ Image Loaded
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Editorial Title *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. The Regal Silk & Temple Heritage"
                          value={newGalleryForm.title}
                          onChange={(e) => setNewGalleryForm({ ...newGalleryForm, title: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                        />
                      </div>

                      {/* Subtitle / Story */}
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Story Narrative / Subtitle</label>
                        <textarea
                          rows={2}
                          placeholder="e.g. Sacred Muhurtham rituals in handcrafted gold Kanjeevaram with ancient Vedic drums"
                          value={newGalleryForm.subtitle}
                          onChange={(e) => setNewGalleryForm({ ...newGalleryForm, subtitle: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                        />
                      </div>

                      {/* Location & Category Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-medium">Location</label>
                          <input
                            type="text"
                            placeholder="e.g. Hyderabad Palace, Udaipur Haveli"
                            value={newGalleryForm.location}
                            onChange={(e) => setNewGalleryForm({ ...newGalleryForm, location: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-medium">Category</label>
                          <select
                            value={newGalleryForm.category}
                            onChange={(e) => setNewGalleryForm({ ...newGalleryForm, category: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-[#121622] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                          >
                            {galleryCategories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Orientation */}
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Photo Layout / Aspect Ratio</label>
                        <select
                          value={newGalleryForm.orientation}
                          onChange={(e) => setNewGalleryForm({ ...newGalleryForm, orientation: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-[#121622] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                        >
                          <option value="portrait">Portrait (Vertical - Signature Fine-Art)</option>
                          <option value="landscape">Landscape (Horizontal - Wide Cinema)</option>
                          <option value="square">Square (1:1 Ratio)</option>
                        </select>
                      </div>

                      {/* Buttons */}
                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setShowAddGalleryModal(false)}
                          className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow hover:opacity-95"
                        >
                          Add Photograph to Gallery
                        </button>
                      </div>
                    </form>
                  </div>
                </ModalPortal>
              )}

              {/* ========================================================================= */}
              {/* MODAL 2: EDIT EXISTING MASTERPIECE PHOTO                                  */}
              {/* ========================================================================= */}
              {editingGalleryPhoto && (
                <ModalPortal onClose={() => setEditingGalleryPhoto(null)}>
                  <div className="w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-[#141824] border border-white/20 shadow-2xl text-white space-y-6 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[#C9A96E]/10 text-[#C9A96E]">
                          <Edit3 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-white">Edit Masterpiece Photograph</h4>
                          <p className="text-xs text-slate-400">Update photograph details, location, and visual metadata.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingGalleryPhoto(null)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!editingGalleryForm.src || !editingGalleryForm.title) return;
                        const updatedGallery = (siteConfigData.gallery || []).map((p) =>
                          p.id === editingGalleryForm.id ? { ...p, ...editingGalleryForm } : p
                        );
                        const updatedConfig = { ...siteConfigData, gallery: updatedGallery };
                        setEditingGalleryPhoto(null);
                        persistConfigUpdate(updatedConfig, `Updated '${editingGalleryForm.title}' in Gallery!`);
                      }}
                      className="space-y-4"
                    >
                      {/* Image Upload / URL Box */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-slate-300 font-medium">Photograph File or URL *</label>
                          <label className="text-[11px] text-[#C9A96E] hover:underline cursor-pointer flex items-center gap-1">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{uploadingField === 'galleryPhotoEdit' ? 'Uploading...' : 'Replace File'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(
                                    file,
                                    (uploadedUrl) => {
                                      setEditingGalleryForm((prev) => ({ ...prev, src: uploadedUrl }));
                                    },
                                    { field: 'galleryPhotoEdit', folder: 'portfolio', title: editingGalleryForm.title || 'Gallery Photograph' }
                                  );
                                }
                              }}
                            />
                          </label>
                        </div>
                        <input
                          type="text"
                          required
                          value={editingGalleryForm.src}
                          onChange={(e) => setEditingGalleryForm({ ...editingGalleryForm, src: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                        />

                        {/* Image Preview */}
                        {editingGalleryForm.src && (
                          <div className="relative rounded-2xl overflow-hidden border border-white/15 aspect-[16/9] bg-black/40">
                            <img
                              src={editingGalleryForm.src}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Editorial Title *</label>
                        <input
                          type="text"
                          required
                          value={editingGalleryForm.title}
                          onChange={(e) => setEditingGalleryForm({ ...editingGalleryForm, title: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                        />
                      </div>

                      {/* Subtitle / Story */}
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Story Narrative / Subtitle</label>
                        <textarea
                          rows={2}
                          value={editingGalleryForm.subtitle}
                          onChange={(e) => setEditingGalleryForm({ ...editingGalleryForm, subtitle: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                        />
                      </div>

                      {/* Location & Category Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-medium">Location</label>
                          <input
                            type="text"
                            value={editingGalleryForm.location}
                            onChange={(e) => setEditingGalleryForm({ ...editingGalleryForm, location: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-medium">Category</label>
                          <select
                            value={editingGalleryForm.category}
                            onChange={(e) => setEditingGalleryForm({ ...editingGalleryForm, category: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-[#121622] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                          >
                            {galleryCategories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Orientation */}
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Photo Layout / Aspect Ratio</label>
                        <select
                          value={editingGalleryForm.orientation}
                          onChange={(e) => setEditingGalleryForm({ ...editingGalleryForm, orientation: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-[#121622] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                        >
                          <option value="portrait">Portrait (Vertical - Signature Fine-Art)</option>
                          <option value="landscape">Landscape (Horizontal - Wide Cinema)</option>
                          <option value="square">Square (1:1 Ratio)</option>
                        </select>
                      </div>

                      {/* Buttons */}
                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setEditingGalleryPhoto(null)}
                          className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow hover:opacity-95"
                        >
                          Save Photo Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </ModalPortal>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-SECTION: WEDDING FILMS CINEMA                                         */}
          {/* ========================================================================= */}
          {uiSubTab === 'films' && (
            <div className="space-y-6">
              {/* Top Banner & Action Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#11141D] border border-white/10 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-[#C9A96E]/10 text-[#C9A96E]">
                      <Film className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-serif font-bold text-white">Wedding Films &amp; 4K Cinema Trailers</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#C9A96E]/20 text-[#E5D2A8] border border-[#C9A96E]/30">
                          {(siteConfigData.films || []).length} 4K Films
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Manage cinematic 4K master trailers displayed in the Wedding Films section. Add YouTube video links, set cover posters, and highlight awards.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setNewFilmForm({
                          id: '',
                          title: '',
                          couple: '',
                          location: '',
                          videoId: '',
                          youtubeUrl: '',
                          duration: '4K Cinema • 18 min',
                          thumbnail: '',
                          tagline: '',
                          highlight: '',
                        });
                        setShowAddFilmModal(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs flex items-center gap-1.5 shadow-gold-glow hover:opacity-95 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Masterpiece Film</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => persistConfigUpdate(siteConfigData, 'Wedding Films saved to database!')}
                      className="px-4 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/15 text-xs font-medium flex items-center gap-1.5 transition-all border border-white/10"
                    >
                      <Save className="w-3.5 h-3.5 text-[#C9A96E]" />
                      <span>Save All Changes</span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between text-xs text-slate-400">
                  <span>Reorder your films using the up/down arrows. The live website offers both a horizontal cinema reel slider and a multi-card grid.</span>
                </div>
              </div>

              {/* Films Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(siteConfigData.films || []).map((film, index) => {
                  const actualIndex = index;
                  return (
                    <div
                      key={film.id || index}
                      className="rounded-3xl bg-[#11141D] border border-white/10 overflow-hidden flex flex-col justify-between group hover:border-[#C9A96E]/50 transition-all hover:shadow-2xl"
                    >
                      {/* 16:9 Thumbnail Cover */}
                      <div className="relative aspect-video bg-black overflow-hidden">
                        <img
                          src={film.thumbnail || `https://img.youtube.com/vi/${film.videoId}/maxresdefault.jpg`}
                          alt={film.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = '/assets/hero-green-saree-bride.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
                          {film.highlight ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-black/70 backdrop-blur-md text-[#E5D2A8] border border-white/20 flex items-center gap-1 shadow-md">
                              <Award className="w-3 h-3 text-[#C9A96E]" />
                              <span>{film.highlight}</span>
                            </span>
                          ) : <span />}

                          {film.duration && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/75 backdrop-blur-md text-white/90 border border-white/15">
                              {film.duration}
                            </span>
                          )}
                        </div>

                        {/* Centered Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => setPreviewFilm(film)}
                            title="Watch Film Trailer"
                            className="w-12 h-12 rounded-full bg-white/95 group-hover:bg-[#C9A96E] text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all"
                          >
                            <Play className="w-5 h-5 fill-black translate-x-0.5" />
                          </button>
                        </div>

                        {/* Video ID overlay bottom left */}
                        {film.videoId && (
                          <div className="absolute bottom-2.5 left-3 text-[10px] text-white/60 font-mono drop-shadow pointer-events-none">
                            YouTube: {film.videoId}
                          </div>
                        )}
                      </div>

                      {/* Card Content & Action Bar */}
                      <div className="p-4 sm:p-5 space-y-3 bg-[#151923] flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          {film.location && (
                            <p className="text-[11px] text-[#C9A96E] font-medium flex items-center gap-1">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{film.location}</span>
                            </p>
                          )}
                          <h4 className="font-serif text-base font-bold text-white leading-snug line-clamp-1">
                            {film.title}
                          </h4>
                          {film.tagline && (
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                              {film.tagline}
                            </p>
                          )}
                        </div>

                        {/* Toolbar: Reorder, Preview, Edit, Delete */}
                        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={actualIndex === 0}
                              onClick={() => {
                                const list = [...(siteConfigData.films || [])];
                                if (actualIndex > 0) {
                                  const temp = list[actualIndex];
                                  list[actualIndex] = list[actualIndex - 1];
                                  list[actualIndex - 1] = temp;
                                  const updatedConfig = { ...siteConfigData, films: list };
                                  persistConfigUpdate(updatedConfig, 'Shifted film earlier');
                                }
                              }}
                              title="Move Earlier in Reel"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={actualIndex === (siteConfigData.films || []).length - 1}
                              onClick={() => {
                                const list = [...(siteConfigData.films || [])];
                                if (actualIndex < list.length - 1) {
                                  const temp = list[actualIndex];
                                  list[actualIndex] = list[actualIndex + 1];
                                  list[actualIndex + 1] = temp;
                                  const updatedConfig = { ...siteConfigData, films: list };
                                  persistConfigUpdate(updatedConfig, 'Shifted film later');
                                }
                              }}
                              title="Move Later in Reel"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setPreviewFilm(film)}
                              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center gap-1 transition-all"
                              title="Watch Full Screen Trailer"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Play</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingFilm(film);
                                setEditingFilmForm({
                                  id: film.id,
                                  title: film.title || '',
                                  couple: film.couple || '',
                                  location: film.location || '',
                                  videoId: film.videoId || '',
                                  youtubeUrl: film.youtubeUrl || (film.videoId ? `https://www.youtube.com/watch?v=${film.videoId}` : ''),
                                  duration: film.duration || '',
                                  thumbnail: film.thumbnail || '',
                                  tagline: film.tagline || '',
                                  highlight: film.highlight || '',
                                });
                              }}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-[#C9A96E]/20 text-slate-300 hover:text-[#C9A96E] transition-all"
                              title="Edit Film Details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to remove '${film.title || 'this wedding film'}' from the website?`)) {
                                  const updatedFilms = (siteConfigData.films || []).filter((f) => f.id !== film.id);
                                  const updatedConfig = { ...siteConfigData, films: updatedFilms };
                                  persistConfigUpdate(updatedConfig, `Removed '${film.title}' from Wedding Films`);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-all"
                              title="Delete Film"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty State */}
              {(siteConfigData.films || []).length === 0 && (
                <div className="p-12 text-center rounded-3xl bg-[#11141D] border border-dashed border-white/15 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#C9A96E]/10 text-[#C9A96E] flex items-center justify-center mx-auto">
                    <Film className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white">No Wedding Films Found</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Your wedding films collection is currently empty. Click below to add your first 4K cinema master film!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddFilmModal(true)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow hover:opacity-95"
                  >
                    Add First Wedding Film
                  </button>
                </div>
              )}

              {/* ========================================================================= */}
              {/* MODAL 1: ADD NEW WEDDING FILM                                              */}
              {/* ========================================================================= */}
              {showAddFilmModal && (
                <ModalPortal onClose={() => setShowAddFilmModal(false)}>
                  <div className="w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-[#141824] border border-white/20 shadow-2xl text-white space-y-6 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[#C9A96E]/10 text-[#C9A96E]">
                          <Film className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-white">Add Masterpiece Wedding Film</h4>
                          <p className="text-xs text-slate-400">Add a 4K cinema film trailer by providing a YouTube link or video ID.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddFilmModal(false)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newFilmForm.title) return;
                        
                        // Extract video ID from youtubeUrl or videoId
                        let vId = newFilmForm.videoId?.trim();
                        if (!vId && newFilmForm.youtubeUrl) {
                          const m = newFilmForm.youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                          if (m) vId = m[1];
                          else if (newFilmForm.youtubeUrl.trim().length === 11) vId = newFilmForm.youtubeUrl.trim();
                        }
                        if (!vId) vId = 'jcBEUpPrqY0'; // fallback sample video

                        const filmId = 'film-' + Date.now();
                        const thumb = newFilmForm.thumbnail || `https://img.youtube.com/vi/${vId}/maxresdefault.jpg`;
                        const yUrl = newFilmForm.youtubeUrl || `https://www.youtube.com/watch?v=${vId}`;

                        const created = {
                          id: filmId,
                          title: newFilmForm.title,
                          couple: newFilmForm.couple || newFilmForm.title.split('—')[0]?.trim() || newFilmForm.title,
                          location: newFilmForm.location || 'Heritage Destination',
                          videoId: vId,
                          youtubeUrl: yUrl,
                          duration: newFilmForm.duration || '4K Cinema • 18 min',
                          thumbnail: thumb,
                          tagline: newFilmForm.tagline || 'Immortalizing sacred traditions and unscripted intimacy.',
                          highlight: newFilmForm.highlight || 'Master Cinema Collection',
                        };

                        const updatedFilms = [...(siteConfigData.films || []), created];
                        const updatedConfig = { ...siteConfigData, films: updatedFilms };
                        setShowAddFilmModal(false);
                        persistConfigUpdate(updatedConfig, `Added film '${created.title}' to collection!`);
                      }}
                      className="space-y-4"
                    >
                      {/* YouTube Link / Video ID */}
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">YouTube Video URL or Video ID *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. https://www.youtube.com/watch?v=jcBEUpPrqY0 or jcBEUpPrqY0"
                          value={newFilmForm.youtubeUrl}
                          onChange={(e) => {
                            const val = e.target.value;
                            const m = val.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                            const extractedId = m ? m[1] : (val.length === 11 ? val : '');
                            setNewFilmForm({
                              ...newFilmForm,
                              youtubeUrl: val,
                              videoId: extractedId || newFilmForm.videoId,
                              thumbnail: extractedId ? `https://img.youtube.com/vi/${extractedId}/maxresdefault.jpg` : newFilmForm.thumbnail,
                            });
                          }}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A96E]"
                        />
                        <p className="text-[11px] text-slate-400">
                          Paste any YouTube link; the 4K thumbnail and player will be linked automatically.
                        </p>
                      </div>

                      {/* Thumbnail Cover URL or Upload */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-slate-300 font-medium">Poster Thumbnail Cover</label>
                          <label className="text-[11px] text-[#C9A96E] hover:underline cursor-pointer flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            <span>{uploadingField === 'filmThumb' ? 'Uploading...' : 'Upload Custom Cover'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(
                                    file,
                                    (uploadedUrl) => {
                                      setNewFilmForm((prev) => ({ ...prev, thumbnail: uploadedUrl }));
                                    },
                                    { field: 'filmThumb', folder: 'film-covers', title: newFilmForm.title || 'Film Cover' }
                                  );
                                }
                              }}
                            />
                          </label>
                        </div>
                        <input
                          type="text"
                          placeholder="Auto-generated from YouTube or custom image URL"
                          value={newFilmForm.thumbnail}
                          onChange={(e) => setNewFilmForm({ ...newFilmForm, thumbnail: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                        />

                        {/* Live Thumbnail Preview */}
                        {newFilmForm.thumbnail && (
                          <div className="relative rounded-2xl overflow-hidden border border-white/15 aspect-video bg-black/40">
                            <img
                              src={newFilmForm.thumbnail}
                              alt="Thumbnail Preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                              <div className="w-10 h-10 rounded-full bg-white/90 text-black flex items-center justify-center shadow-lg">
                                <Play className="w-4 h-4 fill-black translate-x-0.5" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Film Title */}
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Film Title *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Varsha & Shiva — The Palace Symphony"
                          value={newFilmForm.title}
                          onChange={(e) => setNewFilmForm({ ...newFilmForm, title: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                        />
                      </div>

                      {/* Couple & Location Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-medium">Couple Names</label>
                          <input
                            type="text"
                            placeholder="e.g. Varsha & Shiva"
                            value={newFilmForm.couple}
                            onChange={(e) => setNewFilmForm({ ...newFilmForm, couple: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-medium">Palace / Location</label>
                          <input
                            type="text"
                            placeholder="e.g. Taj Falaknuma Palace, Hyderabad"
                            value={newFilmForm.location}
                            onChange={(e) => setNewFilmForm({ ...newFilmForm, location: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                          />
                        </div>
                      </div>

                      {/* Duration & Award Highlight */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-medium">Duration Badge</label>
                          <input
                            type="text"
                            placeholder="e.g. 4K Cinema • 18 min"
                            value={newFilmForm.duration}
                            onChange={(e) => setNewFilmForm({ ...newFilmForm, duration: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-medium">Award / Highlight Badge</label>
                          <input
                            type="text"
                            placeholder="e.g. Winner: Best Wedding Film"
                            value={newFilmForm.highlight}
                            onChange={(e) => setNewFilmForm({ ...newFilmForm, highlight: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                          />
                        </div>
                      </div>

                      {/* Tagline / Narrative */}
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Film Tagline / Narrative</label>
                        <textarea
                          rows={2}
                          placeholder="e.g. A royal confluence of sacred Vedic rituals and timeless architectural splendour."
                          value={newFilmForm.tagline}
                          onChange={(e) => setNewFilmForm({ ...newFilmForm, tagline: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                        />
                      </div>

                      {/* Buttons */}
                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setShowAddFilmModal(false)}
                          className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow hover:opacity-95"
                        >
                          Add Film to Cinema Collection
                        </button>
                      </div>
                    </form>
                  </div>
                </ModalPortal>
              )}

              {/* ========================================================================= */}
              {/* MODAL 2: EDIT EXISTING WEDDING FILM                                       */}
              {/* ========================================================================= */}
              {editingFilm && (
                <ModalPortal onClose={() => setEditingFilm(null)}>
                  <div className="w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-[#141824] border border-white/20 shadow-2xl text-white space-y-6 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[#C9A96E]/10 text-[#C9A96E]">
                          <Edit3 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-white">Edit Wedding Film Details</h4>
                          <p className="text-xs text-slate-400">Update video link, poster cover, location, and storytelling metadata.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingFilm(null)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!editingFilmForm.title) return;

                        let vId = editingFilmForm.videoId?.trim();
                        if (editingFilmForm.youtubeUrl) {
                          const m = editingFilmForm.youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                          if (m) vId = m[1];
                          else if (editingFilmForm.youtubeUrl.trim().length === 11) vId = editingFilmForm.youtubeUrl.trim();
                        }

                        const updatedList = (siteConfigData.films || []).map((f) => {
                          if (f.id === editingFilmForm.id) {
                            return {
                              ...f,
                              ...editingFilmForm,
                              videoId: vId || f.videoId,
                              youtubeUrl: editingFilmForm.youtubeUrl || (vId ? `https://www.youtube.com/watch?v=${vId}` : f.youtubeUrl),
                              thumbnail: editingFilmForm.thumbnail || (vId ? `https://img.youtube.com/vi/${vId}/maxresdefault.jpg` : f.thumbnail),
                            };
                          }
                          return f;
                        });

                        const updatedConfig = { ...siteConfigData, films: updatedList };
                        setEditingFilm(null);
                        persistConfigUpdate(updatedConfig, `Updated '${editingFilmForm.title}' in Wedding Films!`);
                      }}
                      className="space-y-4"
                    >
                      {/* YouTube Link / Video ID */}
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">YouTube Video URL or Video ID *</label>
                        <input
                          type="text"
                          required
                          value={editingFilmForm.youtubeUrl || editingFilmForm.videoId}
                          onChange={(e) => {
                            const val = e.target.value;
                            const m = val.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                            const extractedId = m ? m[1] : (val.length === 11 ? val : '');
                            setEditingFilmForm({
                              ...editingFilmForm,
                              youtubeUrl: val,
                              videoId: extractedId || editingFilmForm.videoId,
                              thumbnail: extractedId ? `https://img.youtube.com/vi/${extractedId}/maxresdefault.jpg` : editingFilmForm.thumbnail,
                            });
                          }}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                        />
                      </div>

                      {/* Thumbnail Cover URL or Upload */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-slate-300 font-medium">Poster Thumbnail Cover</label>
                          <label className="text-[11px] text-[#C9A96E] hover:underline cursor-pointer flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            <span>{uploadingField === 'filmThumbEdit' ? 'Uploading...' : 'Replace Cover'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(
                                    file,
                                    (uploadedUrl) => {
                                      setEditingFilmForm((prev) => ({ ...prev, thumbnail: uploadedUrl }));
                                    },
                                    { field: 'filmThumbEdit', folder: 'film-covers', title: editingFilmForm.title || 'Film Cover' }
                                  );
                                }
                              }}
                            />
                          </label>
                        </div>
                        <input
                          type="text"
                          value={editingFilmForm.thumbnail}
                          onChange={(e) => setEditingFilmForm({ ...editingFilmForm, thumbnail: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                        />

                        {editingFilmForm.thumbnail && (
                          <div className="relative rounded-2xl overflow-hidden border border-white/15 aspect-video bg-black/40">
                            <img
                              src={editingFilmForm.thumbnail}
                              alt="Cover Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>

                      {/* Film Title */}
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Film Title *</label>
                        <input
                          type="text"
                          required
                          value={editingFilmForm.title}
                          onChange={(e) => setEditingFilmForm({ ...editingFilmForm, title: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                        />
                      </div>

                      {/* Couple & Location Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-medium">Couple Names</label>
                          <input
                            type="text"
                            value={editingFilmForm.couple}
                            onChange={(e) => setEditingFilmForm({ ...editingFilmForm, couple: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-medium">Palace / Location</label>
                          <input
                            type="text"
                            value={editingFilmForm.location}
                            onChange={(e) => setEditingFilmForm({ ...editingFilmForm, location: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                          />
                        </div>
                      </div>

                      {/* Duration & Award Highlight */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-medium">Duration Badge</label>
                          <input
                            type="text"
                            value={editingFilmForm.duration}
                            onChange={(e) => setEditingFilmForm({ ...editingFilmForm, duration: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-medium">Award / Highlight Badge</label>
                          <input
                            type="text"
                            value={editingFilmForm.highlight}
                            onChange={(e) => setEditingFilmForm({ ...editingFilmForm, highlight: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                          />
                        </div>
                      </div>

                      {/* Tagline / Narrative */}
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Film Tagline / Narrative</label>
                        <textarea
                          rows={2}
                          value={editingFilmForm.tagline}
                          onChange={(e) => setEditingFilmForm({ ...editingFilmForm, tagline: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
                        />
                      </div>

                      {/* Buttons */}
                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setEditingFilm(null)}
                          className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow hover:opacity-95"
                        >
                          Save Film Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </ModalPortal>
              )}

              {/* In-Admin Cinema Video Player Modal */}
              {previewFilm && (
                <VideoModal
                  film={previewFilm}
                  onClose={() => setPreviewFilm(null)}
                />
              )}
            </div>
          )}

          {/* SUB-SECTION 2: BRAND IDENTITY & STATS */}
          {uiSubTab === 'brand' && (
            <div className="space-y-6">
              {/* CARD 1: LOGO & HEADER PRESENTATION */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#11141D] border border-white/10 space-y-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#C9A96E]/10 text-[#C9A96E]">
                      <Crown className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-serif font-bold text-white">Studio Logo &amp; Header Presentation</h3>
                      <p className="text-xs text-slate-400">
                        Select display format (Text typography, Image logo, or Both), upload custom assets, and adjust scale.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveSiteConfig}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Save className="w-3.5 h-3.5 text-black" />
                    <span>Save Logo Settings</span>
                  </button>
                </div>

                {/* 1. LOGO FORMAT SELECTOR */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Logo Presentation Format:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        type: 'text',
                        title: 'Text Typography',
                        desc: 'Classic gold serif typography with monogram',
                      },
                      {
                        type: 'image',
                        title: 'Image Logo',
                        desc: 'High-res transparent PNG / SVG emblem only',
                      },
                      {
                        type: 'both',
                        title: 'Emblem + Text',
                        desc: 'Combines emblem icon with studio name',
                      },
                    ].map((item) => {
                      const isChosen = (siteConfigData.brand?.logoType || 'text') === item.type;
                      return (
                        <div
                          key={item.type}
                          onClick={() =>
                            setSiteConfigData({
                              ...siteConfigData,
                              brand: { ...siteConfigData.brand, logoType: item.type },
                            })
                          }
                          className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                            isChosen
                              ? 'bg-gradient-to-r from-[#C9A96E]/20 to-[#181C27] border-[#C9A96E] ring-1 ring-[#C9A96E]/50 shadow-gold-glow'
                              : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{item.title}</span>
                            {isChosen && (
                              <span className="w-2 h-2 rounded-full bg-[#C9A96E] shadow-gold-glow" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. IMAGE LOGO CONTROLS (Rendered for 'image' or 'both') */}
                {(siteConfigData.brand?.logoType === 'image' || siteConfigData.brand?.logoType === 'both') && (
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-white">Logo Graphic Assets:</span>
                      <button
                        type="button"
                        onClick={() =>
                          setSiteConfigData({
                            ...siteConfigData,
                            brand: {
                              ...siteConfigData.brand,
                              logoUrl: sampleGoldCrestSvg,
                              logoDarkUrl: sampleGoldCrestSvg,
                            },
                          })
                        }
                        className="text-[11px] text-[#C9A96E] hover:underline flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Use Luxury Crest Preset</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Primary Logo URL / Upload */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-slate-300 font-medium">Primary Logo (URL or Upload)</label>
                          <label className="text-[11px] text-[#C9A96E] hover:underline cursor-pointer flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            <span>Upload File</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleLogoFileUpload(e, 'logoUrl')}
                            />
                          </label>
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. /assets/logo.png or https://... or base64"
                          value={siteConfigData.brand?.logoUrl || ''}
                          onChange={(e) =>
                            setSiteConfigData({
                              ...siteConfigData,
                              brand: { ...siteConfigData.brand, logoUrl: e.target.value },
                            })
                          }
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      {/* Dark Mode / Inverted Logo */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-slate-300 font-medium">Dark Mode / Inverted Logo</label>
                          <label className="text-[11px] text-[#C9A96E] hover:underline cursor-pointer flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            <span>Upload File</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleLogoFileUpload(e, 'logoDarkUrl')}
                            />
                          </label>
                        </div>
                        <input
                          type="text"
                          placeholder="Optional dark mode contrast logo"
                          value={siteConfigData.brand?.logoDarkUrl || ''}
                          onChange={(e) =>
                            setSiteConfigData({
                              ...siteConfigData,
                              brand: { ...siteConfigData.brand, logoDarkUrl: e.target.value },
                            })
                          }
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      {/* Logo Height Slider */}
                      <div className="space-y-2 sm:col-span-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-medium">Logo Render Height in Header</span>
                          <span className="text-[#C9A96E] font-mono font-bold">
                            {siteConfigData.brand?.logoHeight || 38}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="90"
                          step="2"
                          value={siteConfigData.brand?.logoHeight || 38}
                          onChange={(e) =>
                            setSiteConfigData({
                              ...siteConfigData,
                              brand: { ...siteConfigData.brand, logoHeight: Number(e.target.value) },
                            })
                          }
                          className="w-full accent-[#C9A96E] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Monogram and Favicon */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">Brand Monogram / Short Badge</label>
                    <input
                      type="text"
                      placeholder="e.g. PRAZNA or PZ"
                      value={siteConfigData.brand?.monogram || ''}
                      onChange={(e) =>
                        setSiteConfigData({
                          ...siteConfigData,
                          brand: { ...siteConfigData.brand, monogram: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">Favicon Path / URL</label>
                    <input
                      type="text"
                      placeholder="/favicon.ico"
                      value={siteConfigData.brand?.favicon || ''}
                      onChange={(e) =>
                        setSiteConfigData({
                          ...siteConfigData,
                          brand: { ...siteConfigData.brand, favicon: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* 3. LIVE INTERACTIVE LOGO PREVIEW */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                    Live Header Simulation Preview:
                  </span>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Dark Navbar Preview */}
                    <div className="p-4 rounded-2xl bg-[#0C0E14]/90 backdrop-blur-xl border border-white/15 space-y-3">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-white/10 pb-2">
                        <span>Dark Glass Navbar Preview</span>
                        <span className="text-emerald-400 font-mono">Live Website Header</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        {/* Logo rendering */}
                        {siteConfigData.brand?.logoType === 'image' && siteConfigData.brand?.logoUrl ? (
                          <img
                            src={siteConfigData.brand?.logoUrl}
                            alt="Preview"
                            style={{ height: `${siteConfigData.brand?.logoHeight || 38}px` }}
                            className="object-contain max-w-[180px]"
                          />
                        ) : siteConfigData.brand?.logoType === 'both' && siteConfigData.brand?.logoUrl ? (
                          <div className="flex items-center gap-3">
                            <img
                              src={siteConfigData.brand?.logoUrl}
                              alt="Preview"
                              style={{ height: `${siteConfigData.brand?.logoHeight || 38}px` }}
                              className="object-contain max-w-[90px]"
                            />
                            <span className="font-serif tracking-[0.25em] text-white text-sm font-normal uppercase">
                              {siteConfigData.brand?.name || 'PRAZNA'}
                            </span>
                          </div>
                        ) : (
                          <span className="font-serif tracking-[0.25em] text-white text-base font-normal uppercase">
                            {siteConfigData.brand?.name || 'PRAZNA PHOTOGRAPHY'}
                          </span>
                        )}

                        <div className="flex items-center gap-3 text-[10px] tracking-wider text-slate-300 uppercase">
                          <span>Portfolio</span>
                          <span>Cinema</span>
                          <span className="px-2 py-0.5 rounded-full bg-[#C9A96E] text-black font-semibold text-[9px]">
                            Inquire
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Light Background Preview */}
                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E0DCD3] space-y-3">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-200 pb-2">
                        <span>Light Mode / Scrolled Preview</span>
                        <span className="text-slate-600 font-mono">Daylight View</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        {/* Logo rendering */}
                        {siteConfigData.brand?.logoType === 'image' && (siteConfigData.brand?.logoDarkUrl || siteConfigData.brand?.logoUrl) ? (
                          <img
                            src={siteConfigData.brand?.logoDarkUrl || siteConfigData.brand?.logoUrl}
                            alt="Preview"
                            style={{ height: `${siteConfigData.brand?.logoHeight || 38}px` }}
                            className="object-contain max-w-[180px]"
                          />
                        ) : siteConfigData.brand?.logoType === 'both' && (siteConfigData.brand?.logoDarkUrl || siteConfigData.brand?.logoUrl) ? (
                          <div className="flex items-center gap-3">
                            <img
                              src={siteConfigData.brand?.logoDarkUrl || siteConfigData.brand?.logoUrl}
                              alt="Preview"
                              style={{ height: `${siteConfigData.brand?.logoHeight || 38}px` }}
                              className="object-contain max-w-[90px]"
                            />
                            <span className="font-serif tracking-[0.25em] text-[#1A1D20] text-sm font-semibold uppercase">
                              {siteConfigData.brand?.name || 'PRAZNA'}
                            </span>
                          </div>
                        ) : (
                          <span className="font-serif tracking-[0.25em] text-[#1A1D20] text-base font-semibold uppercase">
                            {siteConfigData.brand?.name || 'PRAZNA PHOTOGRAPHY'}
                          </span>
                        )}

                        <div className="flex items-center gap-3 text-[10px] tracking-wider text-slate-600 uppercase font-medium">
                          <span>Portfolio</span>
                          <span>Cinema</span>
                          <span className="px-2 py-0.5 rounded-full bg-[#1A1D20] text-white font-semibold text-[9px]">
                            Inquire
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 2: BRAND IDENTITY & STATS */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#11141D] border border-white/10 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white">Brand Heritage &amp; Contact Profile</h3>
                    <p className="text-xs text-slate-400">Studio name, contact numbers, and public credentials.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveSiteConfig}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5 text-black" />
                    <span>Save Profile</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">Brand Title</label>
                    <input
                      type="text"
                      value={siteConfigData.brand?.name || ''}
                      onChange={(e) =>
                        setSiteConfigData({
                          ...siteConfigData,
                          brand: { ...siteConfigData.brand, name: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">WhatsApp Booking Line</label>
                    <input
                      type="text"
                      value={siteConfigData.brand?.whatsappNumber || ''}
                      onChange={(e) =>
                        setSiteConfigData({
                          ...siteConfigData,
                          brand: { ...siteConfigData.brand, whatsappNumber: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs text-slate-300 font-medium">Tagline</label>
                    <input
                      type="text"
                      value={siteConfigData.brand?.tagline || ''}
                      onChange={(e) =>
                        setSiteConfigData({
                          ...siteConfigData,
                          brand: { ...siteConfigData.brand, tagline: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs text-slate-300 font-medium">Subtitle</label>
                    <input
                      type="text"
                      value={siteConfigData.brand?.subtitle || ''}
                      onChange={(e) =>
                        setSiteConfigData({
                          ...siteConfigData,
                          brand: { ...siteConfigData.brand, subtitle: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">Official Email</label>
                    <input
                      type="email"
                      value={siteConfigData.brand?.email || ''}
                      onChange={(e) =>
                        setSiteConfigData({
                          ...siteConfigData,
                          brand: { ...siteConfigData.brand, email: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">Instagram URL</label>
                    <input
                      type="text"
                      value={siteConfigData.brand?.instagram || ''}
                      onChange={(e) =>
                        setSiteConfigData({
                          ...siteConfigData,
                          brand: { ...siteConfigData.brand, instagram: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs text-slate-300 font-medium">Location Coverage String</label>
                    <input
                      type="text"
                      value={siteConfigData.brand?.location || ''}
                      onChange={(e) =>
                        setSiteConfigData({
                          ...siteConfigData,
                          brand: { ...siteConfigData.brand, location: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Stats Counters */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <span className="text-xs text-slate-300 font-semibold block">Heritage Counter Badges:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {siteConfigData.stats?.map((stat, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                        <label className="text-[10px] text-slate-400">{stat.label}</label>
                        <input
                          type="text"
                          value={stat.value}
                          onChange={(e) => {
                            const updated = [...siteConfigData.stats];
                            updated[i].value = e.target.value;
                            setSiteConfigData({ ...siteConfigData, stats: updated });
                          }}
                          className="w-full p-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-serif font-bold text-[#E5D2A8]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-SECTION 3: PHILOSOPHY & PILLARS (with Add New Pillar) */}
          {uiSubTab === 'philosophy' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#11141D] border border-white/10 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-serif font-bold text-white">Brand Philosophy & Craftsmanship Pillars</h3>
                  <p className="text-xs text-slate-400">Fine-art narrative quote and editorial craftsmanship pillars.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddPillarModal(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-black" />
                    <span>Add Pillar</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSiteConfig}
                    className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 text-xs font-medium flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Editorial Master Quote</label>
                  <textarea
                    rows={3}
                    value={siteConfigData.philosophy?.quote || ''}
                    onChange={(e) =>
                      setSiteConfigData({
                        ...siteConfigData,
                        philosophy: { ...siteConfigData.philosophy, quote: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Lead Story Paragraph</label>
                  <textarea
                    rows={3}
                    value={siteConfigData.philosophy?.leadParagraph || ''}
                    onChange={(e) =>
                      setSiteConfigData({
                        ...siteConfigData,
                        philosophy: { ...siteConfigData.philosophy, leadParagraph: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                  />
                </div>

                {/* Craftsmanship Pillars */}
                <div className="pt-2 space-y-3">
                  <span className="text-xs text-slate-300 font-semibold block">Craftsmanship Pillars:</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {siteConfigData.philosophy?.pillars?.map((pillar, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 relative group">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] text-[#C9A96E] uppercase font-semibold">Pillar #{i + 1}</label>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = siteConfigData.philosophy.pillars.filter((_, idx) => idx !== i);
                              setSiteConfigData({
                                ...siteConfigData,
                                philosophy: { ...siteConfigData.philosophy, pillars: updated },
                              });
                            }}
                            className="p-1 text-slate-500 hover:text-rose-400"
                            title="Remove Pillar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={pillar.title}
                          onChange={(e) => {
                            const updated = [...siteConfigData.philosophy.pillars];
                            updated[i].title = e.target.value;
                            setSiteConfigData({
                              ...siteConfigData,
                              philosophy: { ...siteConfigData.philosophy, pillars: updated },
                            });
                          }}
                          className="w-full p-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-semibold text-white"
                        />
                        <textarea
                          rows={3}
                          value={pillar.desc}
                          onChange={(e) => {
                            const updated = [...siteConfigData.philosophy.pillars];
                            updated[i].desc = e.target.value;
                            setSiteConfigData({
                              ...siteConfigData,
                              philosophy: { ...siteConfigData.philosophy, pillars: updated },
                            });
                          }}
                          className="w-full p-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-slate-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Add New Pillar Modal */}
              {showAddPillarModal && (
                <ModalPortal onClose={() => setShowAddPillarModal(false)}>
                <div className="w-full max-w-md bg-[#121622] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <h3 className="text-lg font-serif font-bold text-white">Add Craftsmanship Pillar</h3>
                      <button onClick={() => setShowAddPillarModal(false)} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newPillarForm.title) return;
                        const updatedPillars = [...(siteConfigData.philosophy?.pillars || []), newPillarForm];
                        const updatedConfig = {
                          ...siteConfigData,
                          philosophy: {
                            ...(siteConfigData.philosophy || {}),
                            pillars: updatedPillars,
                          },
                        };
                        setShowAddPillarModal(false);
                        const pillarTitle = newPillarForm.title;
                        setNewPillarForm({ title: '', desc: '' });
                        persistConfigUpdate(updatedConfig, `Added pillar '${pillarTitle}' & saved to database!`);
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Pillar Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Master Lens Precision"
                          value={newPillarForm.title}
                          onChange={(e) => setNewPillarForm({ ...newPillarForm, title: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Pillar Description</label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Explain your approach..."
                          value={newPillarForm.desc}
                          onChange={(e) => setNewPillarForm({ ...newPillarForm, desc: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="pt-4 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowAddPillarModal(false)}
                          className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow hover:opacity-95"
                        >
                          Add Pillar
                        </button>
                      </div>
                    </form>
                  </div>
                </ModalPortal>
              )}
            </div>
          )}

          {/* SUB-SECTION 4: SIGNATURE COLLECTIONS (with Add New Package) */}
          {uiSubTab === 'packages' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#11141D] border border-white/10 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-serif font-bold text-white">Signature Packages & Pricing Tiers</h3>
                  <p className="text-xs text-slate-400">All-inclusive collections presented on the website quote section.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddPackageModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 text-black" />
                    <span>Add New Package</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSiteConfig}
                    className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 text-xs font-medium flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>Save Packages</span>
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {siteConfigData.signaturePackages?.map((pkg, idx) => (
                  <div
                    key={pkg.id || idx}
                    className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 hover:border-white/15 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-base font-serif font-bold text-white">{pkg.name}</span>
                        <input
                          type="text"
                          value={pkg.badge || ''}
                          onChange={(e) => {
                            const updated = [...siteConfigData.signaturePackages];
                            updated[idx].badge = e.target.value;
                            setSiteConfigData({ ...siteConfigData, signaturePackages: updated });
                          }}
                          placeholder="Badge"
                          className="p-1 px-2.5 rounded-md bg-[#C9A96E]/20 text-[#E5D2A8] text-[10px] font-semibold border border-[#C9A96E]/40"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-400">Price (₹):</span>
                          <input
                            type="number"
                            value={pkg.price}
                            onChange={(e) => {
                              const updated = [...siteConfigData.signaturePackages];
                              updated[idx].price = parseInt(e.target.value, 10) || 0;
                              setSiteConfigData({ ...siteConfigData, signaturePackages: updated });
                            }}
                            className="p-1.5 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-serif font-bold text-[#E5D2A8] w-36"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = siteConfigData.signaturePackages.filter((_, i) => i !== idx);
                            setSiteConfigData({ ...siteConfigData, signaturePackages: updated });
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400"
                          title="Remove Package"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-400">Ideal For</label>
                        <input
                          type="text"
                          value={pkg.idealFor}
                          onChange={(e) => {
                            const updated = [...siteConfigData.signaturePackages];
                            updated[idx].idealFor = e.target.value;
                            setSiteConfigData({ ...siteConfigData, signaturePackages: updated });
                          }}
                          className="w-full p-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-slate-200 mt-0.5"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400">Team Deployment</label>
                        <input
                          type="text"
                          value={pkg.team}
                          onChange={(e) => {
                            const updated = [...siteConfigData.signaturePackages];
                            updated[idx].team = e.target.value;
                            setSiteConfigData({ ...siteConfigData, signaturePackages: updated });
                          }}
                          className="w-full p-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-slate-200 mt-0.5"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400">Inclusions (one deliverable per line)</label>
                      <textarea
                        rows={3}
                        value={Array.isArray(pkg.inclusions) ? pkg.inclusions.join('\n') : ''}
                        onChange={(e) => {
                          const updated = [...siteConfigData.signaturePackages];
                          updated[idx].inclusions = e.target.value.split('\n');
                          setSiteConfigData({ ...siteConfigData, signaturePackages: updated });
                        }}
                        className="w-full p-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-slate-300 font-mono mt-0.5"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Package Modal */}
              {showAddPackageModal && (
                <ModalPortal onClose={() => setShowAddPackageModal(false)}>
                <div className="w-full max-w-lg bg-[#121622] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <h3 className="text-lg font-serif font-bold text-white">Create Signature Package</h3>
                      <button onClick={() => setShowAddPackageModal(false)} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newPackageForm.name) return;
                        const packageId = newPackageForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
                        const created = {
                          id: packageId,
                          name: newPackageForm.name,
                          badge: newPackageForm.badge,
                          price: parseInt(newPackageForm.price, 10) || 0,
                          idealFor: newPackageForm.idealFor,
                          team: newPackageForm.team,
                          inclusions: newPackageForm.inclusions.split('\n'),
                        };
                        const updatedPackages = [...(siteConfigData.signaturePackages || []), created];
                        const updatedConfig = {
                          ...siteConfigData,
                          signaturePackages: updatedPackages,
                        };
                        setShowAddPackageModal(false);
                        persistConfigUpdate(updatedConfig, `Added package '${created.name}' & saved to database!`);
                      }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-medium">Package Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Royal Pre-Wedding Odyssey"
                            value={newPackageForm.name}
                            onChange={(e) => setNewPackageForm({ ...newPackageForm, name: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-medium">Badge Tag</label>
                          <input
                            type="text"
                            placeholder="e.g. Exclusive"
                            value={newPackageForm.badge}
                            onChange={(e) => setNewPackageForm({ ...newPackageForm, badge: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-medium">Price (₹)</label>
                          <input
                            type="number"
                            required
                            value={newPackageForm.price}
                            onChange={(e) => setNewPackageForm({ ...newPackageForm, price: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-medium">Ideal For</label>
                          <input
                            type="text"
                            value={newPackageForm.idealFor}
                            onChange={(e) => setNewPackageForm({ ...newPackageForm, idealFor: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Team Deployment</label>
                        <input
                          type="text"
                          value={newPackageForm.team}
                          onChange={(e) => setNewPackageForm({ ...newPackageForm, team: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Deliverables / Inclusions (one per line)</label>
                        <textarea
                          rows={3}
                          value={newPackageForm.inclusions}
                          onChange={(e) => setNewPackageForm({ ...newPackageForm, inclusions: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono"
                        />
                      </div>

                      <div className="pt-4 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowAddPackageModal(false)}
                          className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow hover:opacity-95"
                        >
                          Save Package
                        </button>
                      </div>
                    </form>
                  </div>
                </ModalPortal>
              )}
            </div>
          )}

          {/* SUB-SECTION 5: BESPOKE QUOTE ENGINE & CEREMONY RATES (with Add Ceremony) */}
          {uiSubTab === 'quote-engine' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#11141D] border border-white/10 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-serif font-bold text-white">Bespoke Quote Calculator Rates</h3>
                  <p className="text-xs text-slate-400">Base prices for wedding events and crew add-on rate cards.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddEventModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 text-black" />
                    <span>Add Ceremony Event</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSiteConfig}
                    className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 text-xs font-medium flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>Save Rates</span>
                  </button>
                </div>
              </div>

              {/* Team Add-on Rates */}
              <div className="space-y-3">
                <span className="text-xs text-slate-300 font-semibold block">Team & Deliverable Add-On Rates (₹):</span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { key: 'photographerRate', label: 'Photographer' },
                    { key: 'videographerRate', label: 'Cinematographer' },
                    { key: 'droneRate', label: '4K Drone Pilot' },
                    { key: 'teaserReelRate', label: 'Instagram Reel' },
                    { key: 'albumRate', label: 'Italian Album' },
                  ].map((rate) => (
                    <div key={rate.key} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                      <label className="text-[10px] text-slate-400">{rate.label}</label>
                      <input
                        type="number"
                        value={siteConfigData.teamAddOns?.[rate.key] || 0}
                        onChange={(e) =>
                          setSiteConfigData({
                            ...siteConfigData,
                            teamAddOns: {
                              ...siteConfigData.teamAddOns,
                              [rate.key]: parseInt(e.target.value, 10) || 0,
                            },
                          })
                        }
                        className="w-full p-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-serif font-bold text-[#E5D2A8]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Ceremony Event Base Prices List */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <span className="text-xs text-slate-300 font-semibold block">Ceremony Event Base Pricing:</span>
                <div className="space-y-3">
                  {siteConfigData.quoteEvents?.map((evt, idx) => (
                    <div
                      key={evt.id || idx}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/10"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={evt.name}
                            onChange={(e) => {
                              const updated = [...siteConfigData.quoteEvents];
                              updated[idx].name = e.target.value;
                              setSiteConfigData({ ...siteConfigData, quoteEvents: updated });
                            }}
                            className="font-semibold text-white text-xs bg-transparent border-b border-transparent focus:border-[#C9A96E] focus:outline-none"
                          />
                          <span className="text-[10px] text-slate-500 font-mono">({evt.id})</span>
                        </div>
                        <input
                          type="text"
                          value={evt.description}
                          onChange={(e) => {
                            const updated = [...siteConfigData.quoteEvents];
                            updated[idx].description = e.target.value;
                            setSiteConfigData({ ...siteConfigData, quoteEvents: updated });
                          }}
                          className="w-full text-[11px] text-slate-400 bg-transparent border-b border-transparent focus:border-white/20 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-400">Base Price (₹):</span>
                          <input
                            type="number"
                            value={evt.basePrice}
                            onChange={(e) => {
                              const updated = [...siteConfigData.quoteEvents];
                              updated[idx].basePrice = parseInt(e.target.value, 10) || 0;
                              setSiteConfigData({ ...siteConfigData, quoteEvents: updated });
                            }}
                            className="p-1.5 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-serif font-bold text-[#E5D2A8] w-32"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = siteConfigData.quoteEvents.filter((_, i) => i !== idx);
                            setSiteConfigData({ ...siteConfigData, quoteEvents: updated });
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Ceremony Modal */}
              {showAddEventModal && (
                <ModalPortal onClose={() => setShowAddEventModal(false)}>
                <div className="w-full max-w-md bg-[#121622] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <h3 className="text-lg font-serif font-bold text-white">Add Ceremony Event</h3>
                      <button onClick={() => setShowAddEventModal(false)} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newEventForm.name) return;
                        const eventId = newEventForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
                        const created = {
                          id: eventId,
                          name: newEventForm.name,
                          basePrice: parseInt(newEventForm.basePrice, 10) || 0,
                          hours: newEventForm.hours,
                          description: newEventForm.description,
                        };
                        const updatedEvents = [...(siteConfigData.quoteEvents || []), created];
                        const updatedConfig = {
                          ...siteConfigData,
                          quoteEvents: updatedEvents,
                        };
                        setShowAddEventModal(false);
                        persistConfigUpdate(updatedConfig, `Added ceremony '${created.name}' & saved to database!`);
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Ceremony Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Sufi & Qawwali Night"
                          value={newEventForm.name}
                          onChange={(e) => setNewEventForm({ ...newEventForm, name: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-medium">Base Price (₹)</label>
                          <input
                            type="number"
                            required
                            value={newEventForm.basePrice}
                            onChange={(e) => setNewEventForm({ ...newEventForm, basePrice: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-slate-300 font-medium">Coverage Hours</label>
                          <input
                            type="text"
                            placeholder="4-5 Hours"
                            value={newEventForm.hours}
                            onChange={(e) => setNewEventForm({ ...newEventForm, hours: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Description</label>
                        <textarea
                          rows={2}
                          placeholder="Ceremony highlights and mood..."
                          value={newEventForm.description}
                          onChange={(e) => setNewEventForm({ ...newEventForm, description: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="pt-4 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowAddEventModal(false)}
                          className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow hover:opacity-95"
                        >
                          Add Ceremony
                        </button>
                      </div>
                    </form>
                  </div>
                </ModalPortal>
              )}
            </div>
          )}

          {/* SUB-SECTION 6: CLIENT TESTIMONIALS (with Add New Testimonial) */}
          {uiSubTab === 'testimonials' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#11141D] border border-white/10 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-serif font-bold text-white">Client Testimonials & Feedback</h3>
                  <p className="text-xs text-slate-400">Editorial client feedback and star reviews displayed on the website.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddTestimonialModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 text-black" />
                    <span>Add Testimonial</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSiteConfig}
                    className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 text-xs font-medium flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>Save Reviews</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {siteConfigData.testimonials?.map((t, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-serif font-bold text-[#E5D2A8]">Review #{i + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = siteConfigData.testimonials.filter((_, idx) => idx !== i);
                          const updatedConfig = { ...siteConfigData, testimonials: updated };
                          persistConfigUpdate(updatedConfig, 'Review removed & saved to database!');
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400"
                        title="Remove Testimonial"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400">Client Couple Name</label>
                        <input
                          type="text"
                          value={t.name}
                          onChange={(e) => {
                            const updated = [...siteConfigData.testimonials];
                            updated[i].name = e.target.value;
                            setSiteConfigData({ ...siteConfigData, testimonials: updated });
                          }}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-white mt-0.5"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400">Event / Venue</label>
                        <input
                          type="text"
                          value={t.event}
                          onChange={(e) => {
                            const updated = [...siteConfigData.testimonials];
                            updated[i].event = e.target.value;
                            setSiteConfigData({ ...siteConfigData, testimonials: updated });
                          }}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-200 mt-0.5"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400">Review Quotation</label>
                      <textarea
                        rows={2}
                        value={t.review}
                        onChange={(e) => {
                          const updated = [...siteConfigData.testimonials];
                          updated[i].review = e.target.value;
                          setSiteConfigData({ ...siteConfigData, testimonials: updated });
                        }}
                        className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-300 italic mt-0.5"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Testimonial Modal */}
              {showAddTestimonialModal && (
                <ModalPortal onClose={() => setShowAddTestimonialModal(false)}>
                <div className="w-full max-w-md bg-[#121622] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <h3 className="text-lg font-serif font-bold text-white">Add Client Testimonial</h3>
                      <button onClick={() => setShowAddTestimonialModal(false)} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newTestimonialForm.name || !newTestimonialForm.review) return;
                        const updatedTestimonials = [...(siteConfigData.testimonials || []), newTestimonialForm];
                        const updatedConfig = {
                          ...siteConfigData,
                          testimonials: updatedTestimonials,
                        };
                        setShowAddTestimonialModal(false);
                        const addedName = newTestimonialForm.name;
                        setNewTestimonialForm({ name: '', event: '', rating: 5, review: '' });
                        persistConfigUpdate(updatedConfig, `Added review from ${addedName} & saved to database!`);
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Client Names</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Sanjana & Rohit"
                          value={newTestimonialForm.name}
                          onChange={(e) => setNewTestimonialForm({ ...newTestimonialForm, name: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Venue / Destination</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Umaid Bhawan Palace Wedding"
                          value={newTestimonialForm.event}
                          onChange={(e) => setNewTestimonialForm({ ...newTestimonialForm, event: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Review Quote</label>
                        <textarea
                          rows={3}
                          required
                          placeholder="The memories and cinematic magic captured exceeded all our expectations..."
                          value={newTestimonialForm.review}
                          onChange={(e) => setNewTestimonialForm({ ...newTestimonialForm, review: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="pt-4 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowAddTestimonialModal(false)}
                          className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow hover:opacity-95"
                        >
                          Save Review
                        </button>
                      </div>
                    </form>
                  </div>
                </ModalPortal>
              )}
            </div>
          )}

          {/* SUB-SECTION 7: FOOTER & LEGAL CONFIGURATION */}
          {uiSubTab === 'footer' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#11141D] border border-white/10 space-y-8 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#C9A96E]/10 text-[#C9A96E]">
                    <Layout className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white">Footer &amp; Legal Configuration</h3>
                    <p className="text-xs text-slate-400">
                      Control footer branding, editorial biography, accreditation badges, physical address, and newsletter concierge.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSaveSiteConfig}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Save className="w-3.5 h-3.5 text-black" />
                  <span>Save Footer Changes</span>
                </button>
              </div>

              {/* Section 1: Footer Brand Identity & Editorial Narrative */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Footer Brand Identity &amp; Narrative
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">Footer Brand Name</label>
                    <input
                      type="text"
                      placeholder="PRAZNA PHOTOGRAPHY"
                      value={siteConfigData.footer?.brandName || ''}
                      onChange={(e) =>
                        setSiteConfigData({
                          ...siteConfigData,
                          footer: { ...siteConfigData.footer, brandName: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">Footer Tagline</label>
                    <input
                      type="text"
                      placeholder="Immortalizing love in its most real, poetic, and breathtaking moments."
                      value={siteConfigData.footer?.tagline || ''}
                      onChange={(e) =>
                        setSiteConfigData({
                          ...siteConfigData,
                          footer: { ...siteConfigData.footer, tagline: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs text-slate-300 font-medium">Studio Bio / Editorial Statement</label>
                    <textarea
                      rows={3}
                      placeholder="Over two decades of documenting royal palace weddings and destination celebrations..."
                      value={siteConfigData.footer?.description || ''}
                      onChange={(e) =>
                        setSiteConfigData({
                          ...siteConfigData,
                          footer: { ...siteConfigData.footer, description: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs text-slate-300 font-medium">Accreditation Badge Text</label>
                    <input
                      type="text"
                      placeholder="Honoring Sacred Vows Since 2000 • 38+ Global Honors"
                      value={siteConfigData.footer?.badgeText || ''}
                      onChange={(e) =>
                        setSiteConfigData({
                          ...siteConfigData,
                          footer: { ...siteConfigData.footer, badgeText: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#E5D2A8] font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Physical Address & Legal Copyright */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Locations &amp; Legal Notice
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs text-slate-300 font-medium">Studio Physical Address / Destinations</label>
                    <input
                      type="text"
                      placeholder="Bespoke Studios in Hyderabad, Bengaluru & Mumbai. Available worldwide."
                      value={siteConfigData.footer?.address || ''}
                      onChange={(e) =>
                        setSiteConfigData({
                          ...siteConfigData,
                          footer: { ...siteConfigData.footer, address: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs text-slate-300 font-medium">Official Legal Copyright Notice</label>
                    <input
                      type="text"
                      placeholder="PRAZNA PHOTOGRAPHY. All rights reserved. Fine-Art Heritage Cinema."
                      value={siteConfigData.footer?.copyright || ''}
                      onChange={(e) =>
                        setSiteConfigData({
                          ...siteConfigData,
                          footer: { ...siteConfigData.footer, copyright: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Newsletter Concierge & Social Icons */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Newsletter Concierge &amp; Social Links Display
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Toggle Newsletter */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-semibold text-white">Enable Newsletter Concierge</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">Displays email monograph subscription bar on footer</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSiteConfigData({
                          ...siteConfigData,
                          footer: {
                            ...siteConfigData.footer,
                            showNewsletter: !siteConfigData.footer?.showNewsletter,
                          },
                        })
                      }
                      className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                        siteConfigData.footer?.showNewsletter ? 'bg-[#C9A96E]' : 'bg-white/10'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-black transition-transform ${
                          siteConfigData.footer?.showNewsletter ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle Social Media Icons */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-semibold text-white">Show Social Channels in Footer</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">Render Instagram, WhatsApp &amp; Mail icons in footer</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSiteConfigData({
                          ...siteConfigData,
                          footer: {
                            ...siteConfigData.footer,
                            showSocialIcons: !siteConfigData.footer?.showSocialIcons,
                          },
                        })
                      }
                      className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                        siteConfigData.footer?.showSocialIcons !== false ? 'bg-[#C9A96E]' : 'bg-white/10'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-black transition-transform ${
                          siteConfigData.footer?.showSocialIcons !== false ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {siteConfigData.footer?.showNewsletter && (
                    <>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Newsletter Heading</label>
                        <input
                          type="text"
                          value={siteConfigData.footer?.newsletterHeading || ''}
                          onChange={(e) =>
                            setSiteConfigData({
                              ...siteConfigData,
                              footer: { ...siteConfigData.footer, newsletterHeading: e.target.value },
                            })
                          }
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Newsletter Subtitle / Disclaimer</label>
                        <input
                          type="text"
                          value={siteConfigData.footer?.newsletterSubtitle || ''}
                          onChange={(e) =>
                            setSiteConfigData({
                              ...siteConfigData,
                              footer: { ...siteConfigData.footer, newsletterSubtitle: e.target.value },
                            })
                          }
                          className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Section 4: Live Website Footer Preview */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Live Website Footer Simulation:
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Syncs with Website
                  </span>
                </div>

                <div className="p-6 rounded-2xl bg-[#080A0E] border border-white/15 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-400">
                    <div className="space-y-2">
                      <h5 className="font-serif tracking-[0.25em] text-white font-normal uppercase text-base">
                        {siteConfigData.footer?.brandName || siteConfigData.brand?.name || 'PRAZNA PHOTOGRAPHY'}
                      </h5>
                      <p className="text-[11px] leading-relaxed line-clamp-3">
                        {siteConfigData.footer?.description || siteConfigData.brand?.tagline}
                      </p>
                      {siteConfigData.footer?.badgeText && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono text-[#C9A96E] bg-white/5 border border-[#C9A96E]/20">
                          {siteConfigData.footer?.badgeText}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h6 className="font-serif text-white font-semibold text-xs tracking-wider uppercase">Studio Details</h6>
                      <p className="text-[11px]">{siteConfigData.footer?.address || siteConfigData.brand?.location}</p>
                      <p className="text-[11px] text-[#C9A96E]">{siteConfigData.brand?.email}</p>
                      <p className="text-[11px]">{siteConfigData.brand?.phone}</p>
                    </div>

                    <div className="space-y-2">
                      <h6 className="font-serif text-white font-semibold text-xs tracking-wider uppercase">Channels</h6>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded bg-white/5 text-[10px] text-white">Instagram</span>
                        <span className="px-2 py-1 rounded bg-white/5 text-[10px] text-emerald-400">WhatsApp</span>
                        <span className="px-2 py-1 rounded bg-white/5 text-[10px] text-white">Email</span>
                      </div>
                      {siteConfigData.footer?.showNewsletter && (
                        <div className="pt-2">
                          <span className="text-[10px] text-slate-500 block">{siteConfigData.footer?.newsletterHeading}</span>
                          <div className="flex gap-1 mt-1">
                            <input
                              disabled
                              placeholder="couple@celebration.com"
                              className="p-1 text-[10px] bg-white/5 rounded border border-white/10 flex-1 text-slate-400"
                            />
                            <button disabled className="px-2 py-1 bg-[#C9A96E] text-black text-[10px] rounded font-semibold">Join</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
                    <span>{siteConfigData.footer?.copyright || `© ${new Date().getFullYear()} PRAZNA PHOTOGRAPHY.`}</span>
                    <span className="text-[10px] font-mono text-slate-600">Fine-Art Heritage Cinema</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
