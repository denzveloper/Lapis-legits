'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PortfolioItem } from '@/data/portfolioData';
import PlaceholderImage from './PlaceholderImage';
import { useVideoPreload } from '@/hooks/useVideoPreload';
import { getVideoType } from '@/utils/videoHelpers';

interface VideoThumbnailProps {
  item: PortfolioItem;
  onClick: () => void;
}

// Helper to determine video type if not already defined
const determineVideoType = (url: string) => {
  return getVideoType ? getVideoType(url) : 
    url.endsWith('.mp4') ? 'video/mp4' : 
    url.endsWith('.webm') ? 'video/webm' : 
    url.endsWith('.ogg') ? 'video/ogg' : 
    'video/mp4';
};

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({ item, onClick }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Format date for better display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short',
    }).format(date);
  };

  // Truncate description for preview
  const truncateDescription = (text: string, maxLength: number = 65) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Use the video preload hook to efficiently load video metadata
  const { videoElement, isLoaded, isLoading, error } = useVideoPreload(
    [{ src: item.videoUrl, type: determineVideoType(item.videoUrl) }], 
    { metadataOnly: true }
  );

  // Play video on hover if loaded
  useEffect(() => {
    if (isHovering && videoRef.current && videoLoaded) {
      videoRef.current.play().catch(err => {
        console.log('Auto-play prevented:', err);
      });
    } else if (!isHovering && videoRef.current) {
      videoRef.current.pause();
      // Reset to first frame when mouse leaves
      videoRef.current.currentTime = 0;
    }
  }, [isHovering, videoLoaded]);

  // Set up loaded video to our ref
  useEffect(() => {
    if (isLoaded && videoElement) {
      // Clone the preloaded video to use in our component
      if (videoRef.current) {
        videoRef.current.src = videoElement.src;
        videoRef.current.load();
        setVideoLoaded(true);
      }
    }
  }, [isLoaded, videoElement]);

  return (
    <div 
      ref={containerRef}
      className="group relative overflow-hidden rounded-lg shadow-md bg-white hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col h-full"
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Thumbnail container with aspect ratio */}
      <div className="relative aspect-video overflow-hidden">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10"></div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <button className="bg-white text-black px-4 py-2 rounded-full font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform">
            View Project
          </button>
        </div>
        
        {/* Video element for hover preview */}
        {isLoaded && (
          <video 
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity"
            playsInline
            muted
            loop
            preload="metadata"
          />
        )}
        
        {/* Placeholder Image (always visible or when video not hovering) */}
        <div className={`absolute inset-0 transition-opacity ${isHovering && videoLoaded ? 'opacity-0' : 'opacity-100'}`}>
          <PlaceholderImage title={item.title} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-bold">{item.title}</h3>
          <span className="text-xs text-gray-500">{formatDate(item.date)}</span>
        </div>
        <p className="text-sm text-gray-600 mb-2 flex justify-between">
          <span>Client: {item.client}</span>
        </p>
        
        {item.description && (
          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
            {truncateDescription(item.description)}
          </p>
        )}
        
        <div className="flex flex-wrap gap-1 mt-auto">
          {item.category.map(cat => (
            <span
              key={`${item.id}-${cat}`}
              className="bg-gray-100 text-xs px-2 py-1 rounded"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoThumbnail; 