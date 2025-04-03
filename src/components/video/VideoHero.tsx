'use client';

import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const HeroContainer = styled.section`
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
`;

const VideoWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
`;

const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Overlay = styled.div`
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
`;

const Title = styled(motion.h1)`
  font-size: var(--font-size-xxlarge);
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  max-width: 800px;
  
  @media (max-width: 768px) {
    font-size: var(--font-size-xlarge);
  }
`;

const Subtitle = styled(motion.p)`
  font-size: var(--font-size-medium);
  max-width: 600px;
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-secondary);
  
  @media (max-width: 768px) {
    font-size: var(--font-size-base);
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
`;

const ScrollText = styled.span`
  font-size: var(--font-size-small);
  margin-bottom: var(--spacing-xs);
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const ScrollIcon = styled.div`
  width: 30px;
  height: 50px;
  border: 2px solid var(--color-text);
  border-radius: 15px;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    top: 8px;
    left: 50%;
    width: 6px;
    height: 6px;
    background-color: var(--color-text);
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

export default function VideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  
  useEffect(() => {
    const videoElement = videoRef.current;
    
    if (videoElement) {
      videoElement.addEventListener('loadeddata', () => {
        setIsVideoLoaded(true);
      });
      
      // Placeholder for video - in a real implementation, you would use an actual video
      // This is just a placeholder for now
      setIsVideoLoaded(true);
    }
    
    return () => {
      if (videoElement) {
        videoElement.removeEventListener('loadeddata', () => {
          setIsVideoLoaded(true);
        });
      }
    };
  }, []);
  
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };
  
  return (
    <HeroContainer>
      <VideoWrapper>
        <VideoElement
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster="/images/hero-poster.jpg"
        >
          {/* In a real implementation, you would include actual video sources */}
          {/* <source src="/videos/hero.mp4" type="video/mp4" /> */}
        </VideoElement>
      </VideoWrapper>
      
      <Overlay>
        <Title
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVideoLoaded ? 1 : 0, y: isVideoLoaded ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Captivating Visual Stories That Resonate
        </Title>
        
        <Subtitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVideoLoaded ? 1 : 0, y: isVideoLoaded ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          LAPIS creates immersive video experiences that blend artistry with powerful storytelling
        </Subtitle>
      </Overlay>
      
      <ScrollIndicator
        onClick={scrollToContent}
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
