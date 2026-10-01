import React, { useEffect, useRef, useState } from 'react';
import { X, Film, MapPin, Maximize2, Minimize2, ExternalLink } from 'lucide-react';

export const VideoModal = ({ film, onClose }) => {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!film) return null;

  // Extract YouTube ID from youtubeUrl or direct videoId
  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : (url.length === 11 ? url : null);
  };

  const youtubeId = film.videoId || getYouTubeId(film.youtubeUrl);
  const externalLinkUrl = film.youtubeUrl || (youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : null);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !document.fullscreenElement) onClose();
    };
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 w-screen h-screen bg-black flex flex-col justify-between animate-fade-in"
    >
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full h-full bg-black flex flex-col justify-between"
      >
        {/* Floating Top Header Bar */}
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-5 bg-gradient-to-b from-black/90 via-black/40 to-transparent">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-full bg-[#56876D]/30 border border-[#56876D]/50 text-white flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-medium text-white drop-shadow">
                {film.title}
              </h3>
              {film.location && (
                <p className="text-xs text-white/70 flex items-center gap-1.5 drop-shadow">
                  <MapPin className="w-3.5 h-3.5 text-[#C9A96E]" />
                  <span>{film.location}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Native Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              aria-label="Toggle Fullscreen"
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors backdrop-blur-md border border-white/20"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* YouTube Direct Link */}
            {externalLinkUrl && (
              <a
                href={externalLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open on YouTube"
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors backdrop-blur-md border border-white/20"
                title="Watch on YouTube"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close Film Player"
              className="p-2.5 rounded-full bg-white/10 hover:bg-red-500/80 text-white transition-colors backdrop-blur-md border border-white/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player: 100% Full-Bleed Screen Container */}
        <div className="w-full h-full flex-1 flex items-center justify-center bg-black">
          {youtubeId ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&controls=1`}
              title={film.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
            />
          ) : (
            <video
              autoPlay
              controls
              playsInline
              poster={film.thumbnail}
              className="w-full h-full object-contain"
            >
              <source src={film.videoUrl} type="video/mp4" />
              Your browser does not support HTML5 video.
            </video>
          )}
        </div>

        {/* Bottom Floating Info Pill */}
        <div className="absolute bottom-5 left-6 right-6 z-30 pointer-events-none flex items-center justify-between text-xs text-white/70">
          <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center gap-3">
            <span className="text-[#56876D] font-medium tracking-wider uppercase text-[10px]">
              Full Screen Cinema Mode
            </span>
            {film.duration && <span>• {film.duration}</span>}
          </div>

          {film.highlight && (
            <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[#E5D2A8] text-[11px] font-medium">
              {film.highlight}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
