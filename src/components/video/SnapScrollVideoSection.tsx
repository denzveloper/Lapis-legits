'use client';

import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { preloadVideo, preloadVideos, VideoSource } from '../../utils/videoPreloader';
import { Pause, Play, Volume2, VolumeX, RotateCcw } from 'lucide-react';

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
  isInView?: boolean; // Optional prop to control if section is in view
  autoplayDelay?: number; // Delay in ms before autoplay starts when section comes into view
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

// New styled components for controls and cinema bars
const ControlsContainer = styled(motion.div)`
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 12px;
  z-index: 5;
`;

const ControlButton = styled(motion.button)`
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
  }
`;

const CinemaBar = styled(motion.div)`
  position: absolute;
  left: 0;
  width: 100%;
  background-color: #000;
  z-index: 3;
`;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.8,
      ease: [0.16, 0.77, 0.47, 0.97],
      when: "beforeChildren",
      staggerChildren: 0.1 
    }
  },
  exit: { 
    opacity: 0,
    y: -50,
    transition: { 
      duration: 0.6,
      ease: [0.16, 0.77, 0.47, 0.97],
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

const itemVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.8, ease: [0.16, 0.77, 0.47, 0.97] }
  },
  exit: { 
    y: -40, 
    opacity: 0,
    transition: { duration: 0.6, ease: [0.16, 0.77, 0.47, 0.97] }
  }
};

const cinemaBarVariants = {
  hidden: { height: 0 },
  visible: { height: '10vh', transition: { duration: 0.6 } },
  exit: { height: 0, transition: { duration: 0.6 } }
};

const SnapScrollVideoSection: React.FC<SnapScrollVideoSectionProps> = ({
  sections,
  activeIndex,
  preloadNext = true,
  isInView = true,
  autoplayDelay = 2000 // User changed default
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false); // Start paused
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasPlayedOnceRef = useRef<Record<string, boolean>>({}); // Track if section played since last view

  const currentSection = sections[activeIndex];

  // Effect 1: Preload videos
  useEffect(() => {
    const videosToPreload: Array<{
      sources: VideoSource[];
      options?: { priority?: number };
    }> = [];

    if (currentSection?.videoSrc) {
      videosToPreload.push({
        sources: [currentSection.videoSrc],
        options: { priority: 5 },
      });
    }

    if (preloadNext && activeIndex < sections.length - 1) {
      const nextSection = sections[activeIndex + 1];
      if (nextSection?.videoSrc) {
        videosToPreload.push({
          sources: [nextSection.videoSrc],
          options: { priority: 3 },
        });
      }
    }

    if (videosToPreload.length > 0) {
      try {
        preloadVideos(videosToPreload);
        console.log(`Queued ${videosToPreload.length} videos for preloading`);
      } catch (error) {
        console.error('Error preloading videos:', error);
      }
    }
  }, [activeIndex, currentSection, preloadNext, sections]);

  // Effect 2: Handle Autoplay based on isInView and delay
  useEffect(() => {
    // Clear any existing timer when dependencies change
    if (autoplayTimerRef.current) {
      clearTimeout(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }

    const videoId = currentSection?.id;

    if (isInView && videoId && !hasPlayedOnceRef.current[videoId]) {
      // Only start autoplay timer if section is in view and hasn't played yet in this view cycle
      autoplayTimerRef.current = setTimeout(() => {
        setIsPlaying(true);
        hasPlayedOnceRef.current[videoId] = true; // Mark as played for this view cycle
      }, autoplayDelay);
    } else if (!isInView) {
      // If section is not in view, stop playing and reset play state for next view
      setIsPlaying(false);
      if (videoId) {
         // Allow autoplay again when it comes back into view
        hasPlayedOnceRef.current[videoId] = false;
      }
    }

    // Cleanup timer on unmount or dependency change
    return () => {
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
      }
    };
  }, [isInView, activeIndex, currentSection, autoplayDelay]);


  // Effect 3: Control the video element (play/pause/mute/time)
  useEffect(() => {
    const videoId = currentSection?.id;
    const videoElement = videoRefs.current[videoId];

    if (!videoElement) return;

    // Sync muted state
    videoElement.muted = isMuted;

    // Sync playing state
    if (isPlaying && videoElement.paused) {
       // Reset time only when starting play initiated by state change
      if (hasPlayedOnceRef.current[videoId]) { // Check if this play is due to autoplay or user action
         videoElement.currentTime = 0;
      }
      videoElement.play().catch((error) => {
        console.warn('Video play failed:', error);
        // If play fails (e.g., browser policy), set isPlaying state back to false
        setIsPlaying(false);
         hasPlayedOnceRef.current[videoId] = false; // Allow retry on next view
      });
    } else if (!isPlaying && !videoElement.paused) {
      videoElement.pause();
    }

  }, [isPlaying, isMuted, currentSection, activeIndex]); // Rely on currentSection changing with activeIndex

  // Effect 4: Pause previously active video when activeIndex changes
   useEffect(() => {
     Object.entries(videoRefs.current).forEach(([id, videoEl]) => {
       if (videoEl && id !== currentSection?.id && !videoEl.paused) {
         videoEl.pause();
       }
     });
   }, [activeIndex, currentSection]);

  // Handler for video load events (kept simple)
  // const handleVideoLoaded = (id: string) => {
  //   setLoadedVideos(prev => ({ ...prev, [id]: true }));
  // };

  // Video control handlers
  const togglePlay = () => {
    const videoId = currentSection?.id;
    setIsPlaying(prev => {
      const nextPlaying = !prev;
       // If user manually starts play, mark as played for this view cycle
      if(nextPlaying && videoId) {
          hasPlayedOnceRef.current[videoId] = true;
      }
      return nextPlaying;
    });
     // Clear autoplay timer if user interacts
     if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
     }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const replayVideo = () => {
    const videoId = currentSection?.id;
    const videoElement = videoRefs.current[videoId];
    if (videoElement) {
      videoElement.currentTime = 0;
      setIsPlaying(true); // Ensure state is set to playing
      if (videoId) {
        hasPlayedOnceRef.current[videoId] = true; // Mark as played
      }
      videoElement.play().catch(console.error);
       // Clear autoplay timer if user interacts
       if (autoplayTimerRef.current) {
          clearTimeout(autoplayTimerRef.current);
          autoplayTimerRef.current = null;
       }
    }
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

            {/* Cinema bars */}
            <CinemaBar
              variants={cinemaBarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ top: 0 }}
            />
            <CinemaBar
              variants={cinemaBarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ bottom: 0 }}
            />

            <VideoBackground
              ref={el => { if (currentSection.id && el) videoRefs.current[currentSection.id] = el; }}
              src={currentSection.videoSrc.src}
              poster={currentSection.poster}
              // Muted attribute is now controlled by the effect
              playsInline
              loop // Keep loop for seamless background
              // Remove onLoadedData if not used, or wire handleVideoLoaded back in
              // onLoadedData={() => handleVideoLoaded(currentSection.id)}
            >
              <source src={currentSection.videoSrc.src} type={currentSection.videoSrc.type} />
            </VideoBackground>

            {/* Video controls */}
            <ControlsContainer
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <ControlButton onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </ControlButton>
              <ControlButton onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"}>
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </ControlButton>
              <ControlButton onClick={replayVideo} aria-label="Replay">
                <RotateCcw size={20} />
              </ControlButton>
            </ControlsContainer>

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