'use client';

import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import SnapScrollContainer from './SnapScrollContainer';
import videoPreloader, { VideoSource } from '@/utils/videoPreloader';

// Type definitions
interface VideoSection {
  id: string;
  videoSrc: string;
  title?: string;
  subtitle?: string;
  posterSrc?: string;
}

interface SnapScrollVideoSectionProps {
  sections: VideoSection[];
  preloadAll?: boolean;
  optimizeForMobile?: boolean;
  onSectionChange?: (index: number) => void;
}

// Styled components
const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #000;
`;

const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const VideoOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, 
    rgba(0, 0, 0, 0.5) 0%, 
    rgba(0, 0, 0, 0.2) 40%, 
    rgba(0, 0, 0, 0.2) 60%, 
    rgba(0, 0, 0, 0.5) 100%
  );
  z-index: 1;
  pointer-events: none;
`;

const ContentContainer = styled(motion.div)`
  position: absolute;
  inset: 0;
  margin: auto;
  z-index: 2;
  text-align: center;
  width: 100%;
  max-width: 100%;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 2rem;
`;

const Title = styled.h2`
  font-size: var(--font-size-xxlarge);
  margin-bottom: var(--spacing-md);
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  text-align: center;
  width: auto;
  max-width: 1200px;
  
  @media (max-width: 768px) {
    font-size: var(--font-size-xlarge);
    margin-bottom: var(--spacing-sm);
  }
  
  @media (max-width: 480px) {
    font-size: calc(var(--font-size-large) * 1.25);
  }
`;

const Subtitle = styled.p`
  font-size: var(--font-size-large);
  opacity: 0.9;
  max-width: 800px;
  margin: 0 auto;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: var(--font-size-medium);
    max-width: 600px;
  }
  
  @media (max-width: 480px) {
    font-size: var(--font-size-base);
    max-width: 100%;
  }
`;

const SnapScrollVideoSection: React.FC<SnapScrollVideoSectionProps> = ({
  sections,
  preloadAll = false,
  optimizeForMobile = true,
  onSectionChange
}) => {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [videosLoaded, setVideosLoaded] = useState<boolean[]>(Array(sections.length).fill(false));
  const previousActiveIndexRef = useRef(activeVideoIndex);
  
  // Track previous active index for transition effects
  useEffect(() => {
    previousActiveIndexRef.current = activeVideoIndex;
  }, [activeVideoIndex]);
  
  // Initialize video refs based on sections array length
  useEffect(() => {
    videoRefs.current = videoRefs.current.slice(0, sections.length);
  }, [sections.length]);
  
  // Check device type
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  // Preload videos
  useEffect(() => {
    console.log('Setting up video preloading for snap scroll videos:', sections);
    
    // Get video type from src
    const getVideoType = (src: string): string => {
      const extension = src.split('.').pop()?.toLowerCase();
      
      switch(extension) {
        case 'mp4':
          return 'video/mp4';
        case 'webm':
          return 'video/webm';
        case 'mov':
          return 'video/quicktime';
        case 'ogg':
          return 'video/ogg';
        default:
          return 'video/mp4';
      }
    };
    
    // Prepare videos to preload
    let videosToPreload: any[] = [];
    
    if (preloadAll) {
      // Preload all videos at once with declining priority
      videosToPreload = sections.map((section: VideoSection, idx: number) => ({
        sources: [{ src: section.videoSrc, type: getVideoType(section.videoSrc) }],
        options: {
          priority: 10 - idx,
          metadataOnly: false,
          onProgress: (progress: number) => {
            console.log(`Video ${idx} preload progress: ${progress * 100}%`);
          }
        }
      }));
    } else {
      // Preload only the first video and metadata for next videos
      const firstVideo = {
        sources: [{ src: sections[0].videoSrc, type: getVideoType(sections[0].videoSrc) }],
        options: {
          priority: 10,
          metadataOnly: false,
          onProgress: (progress: number) => {
            console.log(`First video preload progress: ${progress * 100}%`);
          }
        }
      };
      
      const nextVideos = sections.slice(1, 3).map((section: VideoSection, idx: number) => ({
        sources: [{ src: section.videoSrc, type: getVideoType(section.videoSrc) }],
        options: {
          priority: 5 - idx,
          metadataOnly: true,
          onProgress: (progress: number) => {
            console.log(`Next video ${idx + 1} preload progress: ${progress * 100}%`);
          }
        }
      }));
      
      videosToPreload = [firstVideo, ...nextVideos];
    }
    
    // Start preloading
    videoPreloader.preloadVideos(videosToPreload);
    
    // Clean up function
    return () => {
      videoPreloader.pauseAllPreloads();
    };
  }, [sections, preloadAll, optimizeForMobile, isMobile]);
  
  // Handle video loading and playback with enhanced transitions
  useEffect(() => {
    console.log('Setting up video handling for active video:', activeVideoIndex);
    
    const previousIndex = previousActiveIndexRef.current;
    const isNextSection = activeVideoIndex > previousIndex;
    const isPrevSection = activeVideoIndex < previousIndex;
    
    // Play the active video if it's loaded
    if (videoRefs.current[activeVideoIndex]) {
      const activeVideo = videoRefs.current[activeVideoIndex];
      if (!activeVideo) return;
      
      // Reset video position for better transition experience
      if (isNextSection) {
        // For forward navigation, start from beginning
        activeVideo.currentTime = 0;
      } else if (isPrevSection) {
        // For backward navigation, show a frame near the beginning but not exactly at 0
        // This creates a smoother visual experience
        activeVideo.currentTime = 0.1;
      }
      
      // Apply fade-in effect through CSS
      activeVideo.style.opacity = '0';
      activeVideo.style.transition = 'opacity 0.5s ease';
      
      // Play with a short delay to allow for visual transitions
      setTimeout(() => {
        // Fade in
        activeVideo.style.opacity = '1';
        
        // Play the video
        activeVideo.play()
          .catch(e => console.error(`Error playing video ${activeVideoIndex}:`, e));
      }, 50);
      
      // Pause all other videos with a fade-out effect
      videoRefs.current.forEach((video, i) => {
        if (i !== activeVideoIndex && video) {
          // Add fade-out effect
          video.style.transition = 'opacity 0.3s ease';
          video.style.opacity = '0';
          
          // Pause after fade out
          setTimeout(() => {
            video.pause();
            // Hide completely after pausing
            video.style.display = 'none';
          }, 300);
        } else if (i === activeVideoIndex && video) {
          // Make sure active video is displayed
          video.style.display = 'block';
        }
      });
    }
    
    // If the next video exists, preload it
    if (activeVideoIndex < sections.length - 1) {
      const nextVideoIndex = activeVideoIndex + 1;
      const nextVideo = sections[nextVideoIndex];
      
      if (nextVideo) {
        const videoType = nextVideo.videoSrc.split('.').pop() === 'webm' ? 'video/webm' : 'video/mp4';
        
        videoPreloader.preloadVideo(
          [{ src: nextVideo.videoSrc, type: videoType }],
          {
            priority: 10,
            metadataOnly: false,
            onProgress: (progress: number) => {
              console.log(`Next video ${nextVideoIndex} preload progress: ${progress * 100}%`);
            }
          }
        );
      }
    }
    
    // Also preload previous video if going backwards
    if (activeVideoIndex > 0 && isPrevSection) {
      const prevVideoIndex = activeVideoIndex - 1;
      const prevVideo = sections[prevVideoIndex];
      
      if (prevVideo) {
        const videoType = prevVideo.videoSrc.split('.').pop() === 'webm' ? 'video/webm' : 'video/mp4';
        
        videoPreloader.preloadVideo(
          [{ src: prevVideo.videoSrc, type: videoType }],
          {
            priority: 8, // Slightly lower priority than next
            metadataOnly: false,
            onProgress: (progress: number) => {
              console.log(`Prev video ${prevVideoIndex} preload progress: ${progress * 100}%`);
            }
          }
        );
      }
    }
  }, [activeVideoIndex, sections]);
  
  // Handle video loading events
  const handleVideoLoaded = (index: number) => {
    console.log(`Video ${index} loaded successfully`);
    setVideosLoaded(prev => {
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });
    
    // Play video if it's the active one
    if (index === activeVideoIndex && videoRefs.current[index]) {
      videoRefs.current[index]?.play()
        .catch(e => console.error(`Error playing video ${index}:`, e));
    }
  };
  
  // Handle section change from the snap scroll container
  const handleSectionChange = (index: number) => {
    console.log(`Section changed to ${index}`);
    setActiveVideoIndex(index);
    
    // Callback if provided
    if (onSectionChange) {
      onSectionChange(index);
    }
  };
  
  return (
    <SnapScrollContainer
      sections={sections}
      onSectionChange={handleSectionChange}
    >
      {sections.map((section, index) => (
        <VideoContainer key={section.id}>
          {/* Video Element */}
          <VideoElement
            ref={(el) => { videoRefs.current[index] = el; }}
            src={section.videoSrc}
            poster={section.posterSrc}
            loop
            muted
            playsInline
            preload="auto"
            onLoadedData={() => handleVideoLoaded(index)}
            onError={(e) => console.error(`Video ${index} error:`, e)}
            style={{ 
              opacity: 0, // Start with 0 opacity and fade in when active
              display: index === 0 ? 'block' : 'none' // Display only first video initially
            }}
          />
          
          {/* Overlay */}
          <VideoOverlay />
          
          {/* Content */}
          {(section.title || section.subtitle) && (
            <ContentContainer
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {section.title && <Title>{section.title}</Title>}
              {section.subtitle && <Subtitle>{section.subtitle}</Subtitle>}
            </ContentContainer>
          )}
        </VideoContainer>
      ))}
    </SnapScrollContainer>
  );
};

export default SnapScrollVideoSection; 