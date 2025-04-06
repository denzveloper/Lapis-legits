'use client';

import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { preloadVideo, preloadVideos, VideoSource } from '../../utils/videoPreloader';

// Type definitions
export interface VideoSection {
  id: string;
  title: string;
  subtitle?: string;
  videoSrc: { src: string; type: string };
  poster?: string;
  textPosition?: 'left' | 'right' | 'center';
  textColor?: string;
  backgroundColor?: string;
}

interface SnapScrollVideoSectionProps {
  sections: VideoSection[];
  activeIndex: number;
  preloadNext?: boolean;
}

// Styled components
const SectionContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

const VideoBackground = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
`;

const ContentOverlay = styled(motion.div)<{ position?: 'left' | 'right' | 'center'; textColor?: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 2;
  padding: 2rem;
  color: ${props => props.textColor || 'white'};
  text-align: ${props => {
    if (props.position === 'left') return 'left';
    if (props.position === 'right') return 'right';
    return 'center';
  }};
  
  ${props => {
    if (props.position === 'left') {
      return `
        align-items: flex-start;
        padding-left: 10%;
        padding-right: 40%;
      `;
    }
    if (props.position === 'right') {
      return `
        align-items: flex-end;
        padding-right: 10%;
        padding-left: 40%;
      `;
    }
    return `
      align-items: center;
      padding-left: 20%;
      padding-right: 20%;
    `;
  }}
  
  @media (max-width: 768px) {
    padding: 1rem;
    ${props => {
      if (props.position === 'left') {
        return `
          padding-left: 1.5rem;
          padding-right: 1.5rem;
        `;
      }
      if (props.position === 'right') {
        return `
          padding-left: 1.5rem;
          padding-right: 1.5rem;
        `;
      }
      return `
        padding-left: 1.5rem;
        padding-right: 1.5rem;
      `;
    }}
  }
`;

const BackgroundColor = styled(motion.div)<{ bgColor?: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: ${props => props.bgColor || 'rgba(0, 0, 0, 0.3)'};
  z-index: 1;
`;

const Title = styled(motion.h2)`
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.5rem;
  line-height: 1.5;
  margin-top: 1rem;
  max-width: 600px;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1 
    }
  },
  exit: { 
    opacity: 0,
    transition: { 
      duration: 0.3,
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  },
  exit: { 
    y: -20, 
    opacity: 0,
    transition: { duration: 0.3, ease: "easeIn" }
  }
};

const SnapScrollVideoSection: React.FC<SnapScrollVideoSectionProps> = ({ 
  sections,
  activeIndex,
  preloadNext = true
}) => {
  const [loadedVideos, setLoadedVideos] = useState<Record<string, boolean>>({});
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  
  const currentSection = sections[activeIndex];
  
  // Preload videos for smoother transitions
  useEffect(() => {
    const videosToPreload: Array<{
      sources: VideoSource[];
      options?: { priority?: number };
    }> = [];
    
    // Always preload the current video with highest priority
    if (currentSection?.videoSrc) {
      videosToPreload.push({
        sources: [currentSection.videoSrc],
        options: { priority: 5 }
      });
    }
    
    // Optionally preload the next video for smoother transitions
    if (preloadNext && activeIndex < sections.length - 1) {
      const nextSection = sections[activeIndex + 1];
      if (nextSection?.videoSrc) {
        videosToPreload.push({
          sources: [nextSection.videoSrc],
          options: { priority: 3 }
        });
      }
    }
    
    // Start preloading
    if (videosToPreload.length > 0) {
      try {
        preloadVideos(videosToPreload);
        console.log(`Queued ${videosToPreload.length} videos for preloading`);
      } catch (error) {
        console.error('Error preloading videos:', error);
      }
    }
  }, [activeIndex, currentSection, preloadNext, sections]);
  
  // Play/pause videos based on active section
  useEffect(() => {
    // Pause all videos first
    Object.values(videoRefs.current).forEach(videoRef => {
      if (videoRef) {
        videoRef.pause();
      }
    });
    
    // Play current video
    const currentVideoRef = videoRefs.current[currentSection?.id];
    if (currentVideoRef) {
      // Reset to beginning if it was already played
      currentVideoRef.currentTime = 0;
      
      // Play with a slight delay to ensure smooth transition
      const playPromise = currentVideoRef.play();
      
      // Handle play promise (prevent uncaught rejection errors)
      if (playPromise !== undefined) {
        playPromise
          .catch((error) => {
            console.warn('Auto-play was prevented:', error);
            // We can decide to add a play button here if needed
          });
      }
    }
  }, [activeIndex, currentSection]);
  
  // Handler for video load events
  const handleVideoLoaded = (id: string) => {
    setLoadedVideos(prev => ({
      ...prev,
      [id]: true
    }));
  };
  
  return (
    <AnimatePresence mode="wait">
      <SectionContainer
        key={currentSection?.id || 'empty-section'}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {currentSection && (
          <>
            <BackgroundColor 
              bgColor={currentSection.backgroundColor} 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
            
            <VideoBackground
              ref={el => { videoRefs.current[currentSection.id] = el; }}
              src={currentSection.videoSrc.src}
              poster={currentSection.poster}
              muted
              playsInline
              loop
              onLoadedData={() => handleVideoLoaded(currentSection.id)}
            >
              <source src={currentSection.videoSrc.src} type={currentSection.videoSrc.type} />
            </VideoBackground>
            
            <ContentOverlay 
              position={currentSection.textPosition} 
              textColor={currentSection.textColor}
            >
              <Title variants={itemVariants}>
                {currentSection.title}
              </Title>
              
              {currentSection.subtitle && (
                <Subtitle variants={itemVariants}>
                  {currentSection.subtitle}
                </Subtitle>
              )}
            </ContentOverlay>
          </>
        )}
      </SectionContainer>
    </AnimatePresence>
  );
};

export default SnapScrollVideoSection; 