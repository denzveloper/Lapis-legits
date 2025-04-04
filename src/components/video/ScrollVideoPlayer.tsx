'use client';

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import useScrollVideo from '../../hooks/useScrollVideo';
import useVideoPreload, { preloadVideosInAdvance } from '../../hooks/useVideoPreload';
import { VideoSource } from '../../utils/videoPreloader';

// Types
interface ScrollVideoPlayerProps {
  /**
   * Array of video sources in different formats
   */
  sources: VideoSource[];
  
  /**
   * URL for poster/thumbnail image to show while video is loading
   */
  poster?: string;
  
  /**
   * Whether the video should loop when it reaches the end
   * @default true
   */
  loop?: boolean;
  
  /**
   * Whether the video should start muted
   * @default true
   */
  initiallyMuted?: boolean;
  
  /**
   * CSS aspect ratio of the video container
   * @default '16 / 9'
   */
  aspectRatio?: string;
  
  /**
   * Controls auto-play behavior based on scroll position
   * @default true
   */
  playOnScroll?: boolean;
  
  /**
   * Threshold at which to start playing when scrolling
   * Value between 0 and 1 representing the minimum intersection ratio
   * @default 0.3
   */
  playThreshold?: number;
  
  /**
   * Additional CSS class names
   */
  className?: string;
  
  /**
   * Additional inline styles
   */
  style?: React.CSSProperties;
  
  /**
   * Custom error message displayed when video can't be loaded
   */
  errorMessage?: string;
  
  /**
   * Whether to use the preloading strategy
   * @default true
   */
  usePreloading?: boolean;
  
  /**
   * Preload only metadata (faster but no full preloading benefit)
   * @default false
   */
  preloadMetadataOnly?: boolean;
  
  /**
   * Priority level for preloading (higher numbers are loaded first)
   * @default 1
   */
  preloadPriority?: number;

  /**
   * Callback fired when video has loaded data and is ready to play
   */
  onLoadedData?: () => void;
}

// Styled Components
const VideoContainer = styled.div<{ $aspectRatio: string }>`
  position: relative;
  width: 100%;
  aspect-ratio: ${props => props.$aspectRatio};
  overflow: hidden;
  background-color: #000;
  border-radius: 4px;
`;

const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ControlsOverlay = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 12px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  display: flex;
  justify-content: space-between;
  align-items: center;
  opacity: ${props => (props.$isVisible ? '1' : '0')};
  transition: opacity 0.3s ease;
`;

const ControlButton = styled.button`
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const ErrorDisplay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  text-align: center;
  padding: 20px;
`;

const ScrollProgressIndicator = styled.div<{ $progress: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: ${props => props.$progress * 100}%;
  background-color: #3498db;
  transition: width 0.1s ease;
`;

// Additional styled component for preload overlay
const PreloadOverlay = styled.div<{ progress: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  
  .preload-progress {
    width: 80%;
    height: 4px;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    margin-top: 10px;
    overflow: hidden;
    
    .progress-bar {
      height: 100%;
      width: ${props => Math.round(props.progress * 100)}%;
      background-color: #3498db;
      transition: width 0.3s ease;
    }
  }
`;

// Icons
const MuteIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 101.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12A4.5 4.5 0 0014 7.97v1.79l2.48 2.48c.01-.08.02-.16.02-.24z" />
  </svg>
);

const UnmuteIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
  </svg>
);

// Main Component
const ScrollVideoPlayer: React.FC<ScrollVideoPlayerProps> = ({
  sources,
  poster,
  loop = true,
  initiallyMuted = true,
  aspectRatio = '16 / 9',
  playOnScroll = true,
  playThreshold = 0.3,
  className,
  style,
  errorMessage = 'Error loading video',
  usePreloading = true,
  preloadMetadataOnly = false,
  preloadPriority = 1,
  onLoadedData
}) => {
  // Refs and state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [containerRef, scrollState] = useScrollVideo<HTMLDivElement>();
  
  const [isMuted, setIsMuted] = useState(initiallyMuted);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Use our video preload hook if preloading is enabled
  const preload = usePreloading ? useVideoPreload(sources, {
    metadataOnly: preloadMetadataOnly,
    priority: preloadPriority
  }) : null;
  
  // Combine error states from both sources
  const combinedError = error || (preload?.error ?? null);
  
  // Set local video reference when preloaded video becomes available
  useEffect(() => {
    if (preload?.videoElement) {
      videoRef.current = preload.videoElement;
      setIsLoaded(true);
      
      // Call onLoadedData callback if provided
      if (onLoadedData) {
        onLoadedData();
      }
    }
  }, [preload?.videoElement, onLoadedData]);
  
  // Toggle mute state
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  // Handle video errors
  const handleVideoError = () => {
    // Only set error if we're not using preloading (preloading has its own error handling)
    if (!usePreloading) {
      setError(errorMessage);
    }
  };
  
  // Handle when video metadata is loaded
  const handleVideoLoaded = () => {
    // Only set loaded state if we're not using preloading (preloading has its own loading state)
    if (!usePreloading) {
      setIsLoaded(true);
    }
  };
  
  // Control playback based on scroll position
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !playOnScroll) return;
    
    // Don't attempt to play until video is ready
    if (usePreloading && (!preload?.isLoaded || preload?.isLoading)) {
      return;
    }
    
    // Check if the video is sufficiently in view
    if (scrollState.isIntersecting && scrollState.intersectionRatio >= playThreshold) {
      if (!isPlaying) {
        videoElement.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(err => {
            console.error('Error playing video:', err);
            setError('Could not autoplay video. Please interact with the page first.');
          });
      }
      
      // Control playback speed or seek position based on scroll progress if needed
      // This can be extended for more advanced scroll effects
    } else if (isPlaying) {
      videoElement.pause();
      setIsPlaying(false);
    }
  }, [
    scrollState.isIntersecting, 
    scrollState.intersectionRatio, 
    playThreshold, 
    isPlaying, 
    playOnScroll,
    usePreloading,
    preload?.isLoaded,
    preload?.isLoading
  ]);
  
  // Show/hide controls when hovering over the video
  const handleMouseEnter = () => setShowControls(true);
  const handleMouseLeave = () => setShowControls(false);
  
  // Preload videos for sections that will be viewed next
  // This is a demonstration of how you could preload multiple videos
  useEffect(() => {
    // Start preloading next videos when current video is in view
    if (scrollState.isIntersecting && sources.length > 0) {
      // This would typically be dynamically determined based on page content
      // For this example, we're using static sources
      preloadVideosInAdvance([
        // Example of preloading additional videos
        // In a real implementation, these would be the videos likely to be viewed next
        // based on navigation patterns or page structure
        {
          sources: sources, // Using same sources for demo
          options: {
            priority: preloadPriority - 1, // Lower priority than current video
            metadataOnly: true // Only preload metadata for these
          }
        }
      ]);
    }
  }, [scrollState.isIntersecting, preloadPriority, sources]);
  
  return (
    <VideoContainer 
      ref={containerRef}
      $aspectRatio={aspectRatio}
      className={className}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {(!usePreloading || !preload) && (
        <VideoElement
          ref={videoRef}
          poster={poster}
          loop={loop}
          muted={isMuted}
          playsInline
          onError={handleVideoError}
          onLoadedMetadata={handleVideoLoaded}
        >
          {sources.map((source, index) => (
            <source key={index} src={source.src} type={source.type} />
          ))}
          Your browser does not support the video tag.
        </VideoElement>
      )}
      
      {/* When using preloading, the video element comes from the preload hook */}
      {/* We need to handle the preloaded video element properly */}
      {usePreloading && preload?.videoElement && (
        <div style={{ display: 'contents' }}>
          {/* Cannot use cloneElement on DOM elements directly, set attributes manually instead */}
          <video
            ref={videoRef}
            poster={poster}
            loop={loop}
            muted={isMuted}
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          >
            {Array.from(preload.videoElement.children).map((child, index) => {
              // Clone source elements from the preloaded video
              if (child instanceof HTMLSourceElement) {
                return (
                  <source 
                    key={index} 
                    src={child.src} 
                    type={child.type} 
                  />
                );
              }
              return null;
            })}
          </video>
        </div>
      )}
      
      {/* Preloading overlay while video is being loaded */}
      {usePreloading && preload?.isLoading && (
        <PreloadOverlay progress={preload.progress}>
          <div>Loading video... {Math.round(preload.progress * 100)}%</div>
          <div className="preload-progress">
            <div className="progress-bar" />
          </div>
        </PreloadOverlay>
      )}
      
      {/* Error message display */}
      {combinedError && (
        <ErrorDisplay>
          <h3>⚠️ {combinedError}</h3>
          <p>Please try refreshing the page or check your connection.</p>
        </ErrorDisplay>
      )}
      
      {/* Controls overlay */}
      <ControlsOverlay $isVisible={showControls}>
        <ControlButton onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"}>
          {isMuted ? <UnmuteIcon /> : <MuteIcon />}
        </ControlButton>
        
        <div>
          {isPlaying ? "Playing" : "Paused"} 
          {isLoaded && ` - ${Math.round(scrollState.scrollProgress * 100)}%`}
        </div>
      </ControlsOverlay>
      
      {/* Scroll progress indicator */}
      <ScrollProgressIndicator $progress={scrollState.scrollProgress} />
    </VideoContainer>
  );
};

export default ScrollVideoPlayer; 