'use client';

import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, useScroll, useTransform } from 'framer-motion';
import ScrollVideoPlayer from './ScrollVideoPlayer';
import { VideoSource } from '../../utils/videoPreloader';

interface VideoHeroProps {
  /**
   * Title text displayed in the hero section
   */
  title?: string;
  
  /**
   * Subtitle text displayed below the title
   */
  subtitle?: string;
  
  /**
   * Optional callback when scroll indicator is clicked
   */
  onScrollClick?: () => void;
  
  /**
   * Optional array of video sources for different formats
   */
  videoSources?: VideoSource[];
  
  /**
   * Optional URL for poster/thumbnail image
   */
  posterUrl?: string;
}

const HeroContainer = styled.section`
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background-color: var(--color-background-dark);
`;

const VideoWrapper = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
`;

const Overlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.5) 50%,
    rgba(0, 0, 0, 0.8) 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 var(--spacing-lg);
  text-align: center;
  z-index: 1;
`;

const Title = styled(motion.h1)`
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  max-width: 800px;
  color: var(--color-text-light);
  line-height: 1.2;
  
  @media (max-width: 768px) {
    max-width: 100%;
    padding: 0 var(--spacing-md);
  }
`;

const Subtitle = styled(motion.p)`
  font-size: clamp(1rem, 3vw, 1.5rem);
  max-width: 600px;
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-secondary);
  line-height: 1.6;
  
  @media (max-width: 768px) {
    max-width: 100%;
    padding: 0 var(--spacing-md);
  }
`;

const ScrollIndicator = styled(motion.div)`
  position: absolute;
  bottom: var(--spacing-lg);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  z-index: 2;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateX(-50%) translateY(5px);
  }
`;

const ScrollText = styled.span`
  font-size: var(--font-size-small);
  margin-bottom: var(--spacing-xs);
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--color-text-light);
`;

const ScrollIcon = styled.div`
  width: 30px;
  height: 50px;
  border: 2px solid var(--color-text-light);
  border-radius: 15px;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    top: 8px;
    left: 50%;
    width: 6px;
    height: 6px;
    background-color: var(--color-text-light);
    border-radius: 50%;
    transform: translateX(-50%);
    animation: scrollAnimation 2s infinite;
  }
  
  @keyframes scrollAnimation {
    0% {
      transform: translate(-50%, 0);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, 20px);
      opacity: 0;
    }
  }
`;

export default function VideoHero({
  title = "Captivating Visual Stories That Resonate",
  subtitle = "LAPIS creates immersive video experiences that blend artistry with powerful storytelling",
  onScrollClick,
  videoSources = [
    { src: '/videos/hero-video.mp4', type: 'video/mp4' },
    { src: '/videos/hero-video.webm', type: 'video/webm' }
  ],
  posterUrl = '/images/hero-poster.jpg'
}: VideoHeroProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // For parallax effect on scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const translateY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  
  const handleScrollClick = () => {
    if (onScrollClick) {
      onScrollClick();
    } else {
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    }
  };
  
  return (
    <HeroContainer ref={containerRef}>
      <VideoWrapper style={{ translateY: translateY }}>
        <ScrollVideoPlayer
          sources={videoSources}
          poster={posterUrl}
          loop={true}
          initiallyMuted={true}
          aspectRatio="16 / 9"
          playOnScroll={false}
          usePreloading={true}
          style={{ height: '100vh', width: '100vw', objectFit: 'cover' }}
          onLoadedData={() => setIsVideoLoaded(true)}
        />
      </VideoWrapper>
      
      <Overlay style={{ opacity }}>
        <Title
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVideoLoaded ? 1 : 0, y: isVideoLoaded ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {title}
        </Title>
        
        <Subtitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVideoLoaded ? 1 : 0, y: isVideoLoaded ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {subtitle}
        </Subtitle>
      </Overlay>
      
      <ScrollIndicator
        onClick={handleScrollClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: isVideoLoaded ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <ScrollText>Scroll</ScrollText>
        <ScrollIcon />
      </ScrollIndicator>
    </HeroContainer>
  );
}
