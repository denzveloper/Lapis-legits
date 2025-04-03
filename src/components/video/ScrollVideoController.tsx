'use client';

import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useScrollTrigger } from '@/utils/scrollManager';
import { motion } from 'framer-motion';

interface VideoTransition {
  id: string;
  startPosition: number;
  endPosition: number;
  videoSrc: string;
  title?: string;
  subtitle?: string;
}

interface ScrollVideoControllerProps {
  transitions: VideoTransition[];
  preloadAll?: boolean;
}

const VideoContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: -1;
  overflow: hidden;
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
`;

const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ContentContainer = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  text-align: center;
  width: 80%;
  max-width: 1200px;
  color: white;
`;

const Title = styled.h2`
  font-size: var(--font-size-xxlarge);
  margin-bottom: var(--spacing-md);
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  
  @media (max-width: 768px) {
    font-size: var(--font-size-xlarge);
  }
`;

const Subtitle = styled.p`
  font-size: var(--font-size-large);
  opacity: 0.9;
  max-width: 800px;
  margin: 0 auto;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  
  @media (max-width: 768px) {
    font-size: var(--font-size-medium);
  }
`;

// Spacer component to create scroll space
const ScrollSpacer = styled.div<{ totalSections: number }>`
  height: ${props => props.totalSections * 100}vh;
  position: relative;
`;

const ScrollVideoController: React.FC<ScrollVideoControllerProps> = ({ 
  transitions,
  preloadAll = false
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [videosLoaded, setVideosLoaded] = useState<boolean[]>(Array(transitions.length).fill(false));
  
  // Initialize video refs array based on transitions array length
  useEffect(() => {
    videoRefs.current = videoRefs.current.slice(0, transitions.length);
  }, [transitions.length]);
  
  // Handle video loading
  useEffect(() => {
    const handleVideoLoaded = (index: number) => {
      setVideosLoaded(prev => {
        const updated = [...prev];
        updated[index] = true;
        return updated;
      });
      
      if (index === activeIndex && videoRefs.current[index]) {
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
  
  // Set up scroll triggers for each transition
  transitions.forEach((transition, index) => {
    useScrollTrigger(
      transition.id,
      transition.startPosition,
      transition.endPosition,
      (progress) => {
        // If we're at the beginning of a transition and it's not the active one
        if (progress < 0.1 && activeIndex !== index) {
          setActiveIndex(index);
          
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
      <VideoContainer>
        {transitions.map((transition, index) => (
          <VideoElement
            key={transition.id}
            ref={(el) => { videoRefs.current[index] = el; }}
            src={transition.videoSrc}
            loop
            muted
            playsInline
            style={{ 
              display: activeIndex === index ? 'block' : 'none',
              opacity: activeIndex === index ? opacity : 0
            }}
            preload={preloadAll || index === activeIndex || index === activeIndex + 1 ? "auto" : "none"}
          />
        ))}
        <VideoOverlay />
        
        {currentTransition.title && (
          <ContentContainer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: opacity, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Title>{currentTransition.title}</Title>
            {currentTransition.subtitle && (
              <Subtitle>{currentTransition.subtitle}</Subtitle>
            )}
          </ContentContainer>
        )}
      </VideoContainer>
      
      {/* Create spacer for scrolling */}
      <ScrollSpacer totalSections={transitions.length} />
    </>
  );
};

export default ScrollVideoController; 