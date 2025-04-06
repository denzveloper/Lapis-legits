'use client';

import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useScrollTrigger } from '@/utils/scrollManager';
import { motion } from 'framer-motion';
import videoPreloader, { VideoSource } from '@/utils/videoPreloader';

interface VideoTransition {
  id: string;
  startPosition: number;
  endPosition: number;
  videoSrc: string;
  title?: string;
  subtitle?: string;
  posterSrc?: string; // Optional poster image for faster initial load
}

interface ScrollVideoControllerProps {
  transitions: VideoTransition[];
  preloadAll?: boolean;
  optimizeForMobile?: boolean; // Whether to use optimizations for mobile devices
  metadataOnly?: boolean; // Whether to preload only metadata initially
}

const VideoContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 5;
  overflow: hidden;
  background-color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
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
  
  @media (max-width: 768px) {
    background: linear-gradient(to bottom, 
      rgba(0, 0, 0, 0.6) 0%, 
      rgba(0, 0, 0, 0.3) 40%, 
      rgba(0, 0, 0, 0.3) 60%, 
      rgba(0, 0, 0, 0.6) 100%
    );
  }
`;

const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  z-index: 2;
  
  @media (max-width: 768px) {
    object-position: center center;
  }
`;

const PosterImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  transition: opacity 0.3s ease;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 2;
`;

const ProgressBar = styled.div<{ $progress: number }>`
  width: 60%;
  max-width: 300px;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.$progress * 100}%;
    background-color: white;
    transition: width 0.3s ease;
  }
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
`;

const Title = styled.h2`
  font-size: var(--font-size-xxlarge);
  margin-bottom: var(--spacing-md);
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  text-align: center;
  width: auto;
  max-width: 1200px;
  padding: 0 20px;
  
  @media (max-width: 768px) {
    font-size: var(--font-size-xlarge);
    margin-bottom: var(--spacing-sm);
    padding: 0 15px;
  }
  
  @media (max-width: 480px) {
    font-size: calc(var(--font-size-large) * 1.25);
    padding: 0 10px;
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

// Spacer component to create scroll space
const ScrollSpacer = styled.div<{ $totalSections: number }>`
  height: ${(props: { $totalSections: number }) => props.$totalSections * 100}vh;
  position: relative;
`;

const ScrollVideoController: React.FC<ScrollVideoControllerProps> = ({ 
  transitions,
  preloadAll = false,
  optimizeForMobile = true,
  metadataOnly = false
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [videosLoaded, setVideosLoaded] = useState<boolean[]>(Array(transitions.length).fill(false));
  const [loadingProgress, setLoadingProgress] = useState<number[]>(Array(transitions.length).fill(0));
  const [viewportHeight, setViewportHeight] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Initialize video refs array based on transitions array length
  useEffect(() => {
    videoRefs.current = videoRefs.current.slice(0, transitions.length);
  }, [transitions.length]);
  
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
  
  // Pre-load videos strategically
  useEffect(() => {
    console.log('Setting up video preloading:', transitions);
    
    // Define which videos to preload
    let videosToPreload = [];
    
    if (preloadAll) {
      // Preload all videos with different priorities
      videosToPreload = transitions.map((transition, index) => ({
        sources: [{ src: transition.videoSrc, type: getVideoType(transition.videoSrc) }],
        options: {
          priority: transitions.length - index, // Higher priority for earlier videos
          metadataOnly: metadataOnly || (optimizeForMobile && isMobile),
          onProgress: (progress: number) => {
            console.log(`Video ${index} loading progress:`, progress);
            setLoadingProgress(prev => {
              const newProgress = [...prev];
              newProgress[index] = progress;
              return newProgress;
            });
          }
        }
      }));
    } else {
      // Preload only the first video and preload metadata for next videos
      const firstVideo = {
        sources: [{ src: transitions[0].videoSrc, type: getVideoType(transitions[0].videoSrc) }],
        options: {
          priority: 10,
          metadataOnly: false,
          onProgress: (progress: number) => {
            setLoadingProgress(prev => {
              const newProgress = [...prev];
              newProgress[0] = progress;
              return newProgress;
            });
          }
        }
      };
      
      const nextVideos = transitions.slice(1, 3).map((transition, idx) => ({
        sources: [{ src: transition.videoSrc, type: getVideoType(transition.videoSrc) }],
        options: {
          priority: 5 - idx,
          metadataOnly: true,
          onProgress: (progress: number) => {
            setLoadingProgress(prev => {
              const newProgress = [...prev];
              newProgress[idx + 1] = progress;
              return newProgress;
            });
          }
        }
      }));
      
      videosToPreload = [firstVideo, ...nextVideos];
    }
    
    // Start preloading
    videoPreloader.preloadVideos(videosToPreload);
    
    // Clean up function will pause preloading if user navigates away
    return () => {
      videoPreloader.pauseAllPreloads();
    };
  }, [transitions, preloadAll, isMobile, optimizeForMobile, metadataOnly]);
  
  // Handle viewport height changes (especially for mobile)
  useEffect(() => {
    const updateViewportHeight = () => {
      setViewportHeight(window.innerHeight);
    };
    
    // Set initial viewport height
    updateViewportHeight();
    
    // Add event listeners for resize and orientation change
    window.addEventListener('resize', updateViewportHeight);
    window.addEventListener('orientationchange', updateViewportHeight);
    
    return () => {
      window.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('orientationchange', updateViewportHeight);
    };
  }, []);
  
  // Handle video loading
  useEffect(() => {
    console.log('Setting up video loading handlers');
    
    const handleVideoLoaded = (index: number) => {
      console.log(`Video ${index} loaded successfully`);
      setVideosLoaded(prev => {
        const updated = [...prev];
        updated[index] = true;
        return updated;
      });
      
      if (index === activeIndex && videoRefs.current[index]) {
        console.log(`Playing video ${index}`);
        videoRefs.current[index]?.play().catch(e => console.error("Error playing video:", e));
      }
    };
    
    videoRefs.current.forEach((video, index) => {
      if (video) {
        video.addEventListener('loadeddata', () => handleVideoLoaded(index));
      }
    });
    
    return () => {
      videoRefs.current.forEach((video, index) => {
        if (video) {
          video.removeEventListener('loadeddata', () => handleVideoLoaded(index));
        }
      });
    };
  }, [activeIndex]);
  
  // Cleanup stale videos on unmount
  useEffect(() => {
    return () => {
      // Clean up stale videos when component unmounts to free memory
      videoPreloader.cleanupStaleCache(1800000); // 30 minutes
    };
  }, []);
  
  // Helper function to determine video type from src
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
  
  // Debug current active transition
  useEffect(() => {
    console.log(`Active transition changed to: ${activeIndex}`);
    console.log(`Current transition:`, transitions[activeIndex]);
  }, [activeIndex, transitions]);
  
  // Set up scroll triggers for each transition
  transitions.forEach((transition, index) => {
    useScrollTrigger(
      transition.id,
      transition.startPosition,
      transition.endPosition,
      (progress) => {
        // Always set the active index when we're within this transition's range
        if (activeIndex !== index) {
          console.log(`Transition activated: ${index}, progress: ${progress}`);
          setActiveIndex(index);
          
          // Start preloading the next videos if they haven't been preloaded yet
          if (index < transitions.length - 1) {
            const nextIndex = index + 1;
            const nextVideo = transitions[nextIndex];
            
            videoPreloader.preloadVideo(
              [{ src: nextVideo.videoSrc, type: getVideoType(nextVideo.videoSrc) }],
              {
                priority: 10,
                metadataOnly: false,
                onProgress: (progress: number) => {
                  setLoadingProgress(prev => {
                    const newProgress = [...prev];
                    newProgress[nextIndex] = progress;
                    return newProgress;
                  });
                }
              }
            );
          }
          
          // Play the current video if it's loaded
          if (videosLoaded[index] && videoRefs.current[index]) {
            videoRefs.current[index]?.play().catch(e => console.error("Error playing video:", e));
          }
          
          // Pause other videos
          videoRefs.current.forEach((video, i) => {
            if (i !== index && video) {
              video.pause();
            }
          });
        }
        
        // Set opacity based on progress to create fade effect
        if (index < transitions.length - 1) {
          // Use the last 30% of the current section for fading
          if (progress > 0.7) {
            setOpacity(1 - ((progress - 0.7) / 0.3));
          } else {
            setOpacity(1);
          }
        }
      }
    );
  });
  
  if (transitions.length === 0) {
    return null;
  }
  
  const currentTransition = transitions[activeIndex];
  
  return (
    <>
      <VideoContainer 
        style={{ 
          height: viewportHeight > 0 ? `${viewportHeight}px` : '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {transitions.map((transition, index) => {
          const videoSrc = transition.videoSrc;
          const isActive = activeIndex === index;
          const loadProgress = loadingProgress[index];
          const isPosterVisible = transition.posterSrc && (!videosLoaded[index] || loadProgress < 1);
          
          return (
            <div 
              key={transition.id} 
              style={{ 
                display: isActive ? 'flex' : 'none', 
                position: 'relative', 
                width: '100%', 
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Poster image shown until video is loaded */}
              {isPosterVisible && (
                <PosterImage 
                  src={transition.posterSrc}
                  alt=""
                  loading="eager"
                  style={{ opacity: videosLoaded[index] ? 0 : 1 }}
                  onLoad={() => console.log(`Poster ${index} loaded`)}
                  onError={(e) => console.error(`Poster ${index} error:`, e)}
                />
              )}
              
              {/* Loading progress indicator */}
              {isActive && loadProgress < 1 && (
                <LoadingOverlay>
                  <ProgressBar $progress={loadProgress} />
                </LoadingOverlay>
              )}
              
              <VideoElement
                ref={(el) => { videoRefs.current[index] = el; }}
                src={videoSrc}
                loop
                muted
                playsInline
                autoPlay={isActive}
                poster={transition.posterSrc}
                style={{ 
                  opacity: isActive ? opacity : 0,
                  display: isActive ? 'block' : 'none'
                }}
                preload="auto"
                onError={(e) => console.error(`Video ${index} error:`, e)}
                onLoadStart={() => console.log(`Video ${index} load started`)}
                onLoadedData={() => console.log(`Video ${index} data loaded`)}
              />
            </div>
          );
        })}
        <VideoOverlay />
        
        {currentTransition.title && (
          <ContentContainer
            initial={{ opacity: 0 }}
            animate={{ opacity: opacity }}
            transition={{ duration: 0.5 }}
          >
            <div style={{ 
              maxWidth: '1200px', 
              width: '100%', 
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <Title>{currentTransition.title}</Title>
              {currentTransition.subtitle && (
                <Subtitle>{currentTransition.subtitle}</Subtitle>
              )}
            </div>
          </ContentContainer>
        )}
      </VideoContainer>
      
      {/* Create spacer for scrolling */}
      <ScrollSpacer $totalSections={transitions.length} />
    </>
  );
};

export default ScrollVideoController; 