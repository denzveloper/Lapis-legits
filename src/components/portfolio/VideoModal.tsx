'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PortfolioItem } from '@/data/portfolioData';
import { useVideoPreload } from '@/hooks/useVideoPreload';
import { getVideoType } from '@/utils/videoHelpers';

interface VideoModalProps {
  item: PortfolioItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ item, isOpen, onClose }) => {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Use the video preload hook if we have an item
  const { videoElement, isLoaded, isLoading, progress, error } = useVideoPreload(
    item ? [{ src: item.videoUrl, type: getVideoType(item.videoUrl) }] : [],
    { metadataOnly: false }
  );

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!videoRef.current) return;

    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.log('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.log('Error attempting to exit fullscreen:', err);
      });
    }
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [onClose]);

  // Play video when loaded and stopped on close
  useEffect(() => {
    if (isOpen && videoRef.current && isVideoReady) {
      videoRef.current.play().catch(err => {
        console.log('Error playing video:', err);
      });
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [isOpen, isVideoReady]);

  // Update video element when source changes
  useEffect(() => {
    if (isLoaded && videoElement) {
      setIsVideoReady(true);
    } else {
      setIsVideoReady(false);
    }
  }, [isLoaded, videoElement, item]);

  // Stop scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !item) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 transition-opacity"
      onClick={onClose}
      ref={modalRef}
    >
      <div 
        className="relative w-full max-w-7xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Video container */}
        <div className="relative aspect-video bg-black">
          {/* Loading indicator */}
          {(isLoading || !isVideoReady) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
              <div className="w-16 h-16 border-t-4 border-white rounded-full animate-spin"></div>
              {progress > 0 && progress < 1 && (
                <div className="mt-4 text-white text-center">
                  <p>Loading video: {Math.round(progress * 100)}%</p>
                </div>
              )}
            </div>
          )}
          
          {/* Video player */}
          <video
            ref={videoRef}
            className={`absolute inset-0 w-full h-full object-contain ${isVideoReady ? 'opacity-100' : 'opacity-0'}`}
            controlsList="nodownload"
            controls
            playsInline
            onCanPlay={() => setIsVideoReady(true)}
            src={isLoaded && videoElement ? videoElement.src : ''}
          />
        </div>
        
        {/* Close button */}
        <button 
          className="absolute top-4 right-4 p-2 text-white bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        {/* Fullscreen button */}
        <button 
          className="absolute bottom-4 right-4 p-2 text-white bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isFullscreen ? (
              <>
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
              </>
            ) : (
              <>
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
              </>
            )}
          </svg>
        </button>
        
        {/* Project info */}
        <div className="absolute top-4 left-4 max-w-md p-4 bg-black/50 text-white rounded backdrop-blur">
          <h2 className="text-xl font-bold mb-1">{item.title}</h2>
          <p className="text-sm opacity-80 mb-2">Client: {item.client}</p>
          {item.description && (
            <p className="text-sm opacity-90">{item.description}</p>
          )}
          <div className="flex flex-wrap gap-1 mt-2">
            {item.category.map(cat => (
              <span
                key={`modal-${item.id}-${cat}`}
                className="bg-white/20 text-xs px-2 py-1 rounded"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal; 