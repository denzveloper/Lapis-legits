'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import useScrollVideo from '../../hooks/useScrollVideo';
import { VideoSource } from '../../utils/videoPreloader';
import { Effect, fadeEffect } from '../../utils/videoEffects';

// Types for component props
interface CanvasVideoRendererProps {
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
   * Array of effects to apply to the video
   * @default []
   */
  effects?: Effect[];
  
  /**
   * Whether to use hardware acceleration (experimental)
   * @default true
   */
  useHardwareAcceleration?: boolean;
  
  /**
   * Whether to display video controls
   * @default true
   */
  showControls?: boolean;
}

// Styled Components
const RendererContainer = styled.div<{ aspectRatio: string }>`
  position: relative;
  width: 100%;
  aspect-ratio: ${props => props.aspectRatio};
  overflow: hidden;
  background-color: #000;
  border-radius: 4px;
`;

const HiddenVideo = styled.video`
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
`;

const CanvasElement = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
`;

const ControlsOverlay = styled.div<{ isVisible: boolean }>`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 12px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  display: flex;
  justify-content: space-between;
  align-items: center;
  opacity: ${props => (props.isVisible ? '1' : '0')};
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

const ScrollProgressIndicator = styled.div<{ progress: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: ${props => props.progress * 100}%;
  background-color: #3498db;
  transition: width 0.1s ease;
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
const CanvasVideoRenderer: React.FC<CanvasVideoRendererProps> = ({
  sources,
  poster,
  loop = true,
  initiallyMuted = true,
  aspectRatio = '16 / 9',
  playOnScroll = true,
  playThreshold = 0.3,
  className,
  style,
  effects = [fadeEffect], // Default to simple fade effect
  useHardwareAcceleration = true,
  showControls = true
}) => {
  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [containerRef, scrollState] = useScrollVideo<HTMLDivElement>();
  const animationFrameRef = useRef<number | null>(null);
  
  // States
  const [isMuted, setIsMuted] = useState(initiallyMuted);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControlsState, setShowControlsState] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  
  // Toggle mute state
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  // Handle video errors
  const handleVideoError = () => {
    setError('Error loading video');
    cancelAnimationFrame();
  };
  
  // Handle when video metadata is loaded
  const handleVideoLoaded = () => {
    if (videoRef.current) {
      setVideoDimensions({
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight
      });
      setIsLoaded(true);
    }
  };
  
  // Update canvas size on window resize
  const updateCanvasSize = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;
    
    const container = containerRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match container
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // For high-DPI displays
    if (window.devicePixelRatio > 1 && useHardwareAcceleration) {
      const dpr = window.devicePixelRatio;
      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    }
  }, [useHardwareAcceleration]);
  
  // Draw video frame to canvas with effects
  const drawVideoFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isPlaying) {
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply effects
    if (effects.length > 0) {
      // Apply all effects in sequence
      effects.forEach(effect => {
        effect.apply(ctx, video, canvas, scrollState.scrollProgress);
      });
    } else {
      // Default: just draw the video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    
    // Request next frame
    animationFrameRef.current = requestAnimationFrame(drawVideoFrame);
  }, [effects, isPlaying, scrollState.scrollProgress]);
  
  // Cancel animation frame if component unmounts or playback stops
  const cancelAnimationFrame = useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);
  
  // Update canvas size on window resize
  useEffect(() => {
    updateCanvasSize();
    
    const handleResize = () => {
      updateCanvasSize();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [updateCanvasSize]);
  
  // Start/stop animation frame loop based on playback state
  useEffect(() => {
    if (isPlaying) {
      // Start the animation loop
      drawVideoFrame();
    } else {
      // Stop the animation loop
      cancelAnimationFrame();
    }
    
    return () => {
      cancelAnimationFrame();
    };
  }, [isPlaying, drawVideoFrame, cancelAnimationFrame]);
  
  // Control playback based on scroll position
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !playOnScroll || !isLoaded) return;
    
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
    isLoaded
  ]);
  
  // Clean up resources on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame();
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
        videoRef.current.load();
      }
    };
  }, [cancelAnimationFrame]);
  
  // Show/hide controls when hovering over the video
  const handleMouseEnter = () => setShowControlsState(true);
  const handleMouseLeave = () => setShowControlsState(false);
  
  return (
    <RendererContainer 
      ref={containerRef}
      aspectRatio={aspectRatio}
      className={className}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Hidden video element that serves as the source */}
      <HiddenVideo
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
      </HiddenVideo>
      
      {/* Canvas element for rendering */}
      <CanvasElement ref={canvasRef} />
      
      {/* Error message display */}
      {error && (
        <ErrorDisplay>
          <h3>⚠️ {error}</h3>
          <p>Please try refreshing the page or check your connection.</p>
        </ErrorDisplay>
      )}
      
      {/* Controls overlay */}
      {showControls && (
        <ControlsOverlay isVisible={showControlsState}>
          <ControlButton onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"}>
            {isMuted ? <UnmuteIcon /> : <MuteIcon />}
          </ControlButton>
          
          <div>
            {isPlaying ? "Playing" : "Paused"} 
            {isLoaded && ` - ${Math.round(scrollState.scrollProgress * 100)}%`}
          </div>
        </ControlsOverlay>
      )}
      
      {/* Scroll progress indicator */}
      <ScrollProgressIndicator progress={scrollState.scrollProgress} />
    </RendererContainer>
  );
};

export default CanvasVideoRenderer; 