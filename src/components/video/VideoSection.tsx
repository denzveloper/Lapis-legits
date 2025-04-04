'use client';

import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, useScroll, useTransform } from 'framer-motion';
import videoPreloader from '@/utils/videoPreloader';

interface VideoSectionProps {
  title: string;
  videoSrc: string;
  description: string;
  reverse?: boolean;
  posterSrc?: string; // Poster image for video
}

const SectionContainer = styled.div<{ $reverse?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  margin: var(--spacing-xl) 0;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
    margin: var(--spacing-lg) 0;
  }
  
  ${props => props.$reverse && `
    direction: rtl;
    
    @media (max-width: 768px) {
      direction: ltr;
    }
  `}
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  direction: ltr;
  padding: var(--spacing-lg);
  
  @media (max-width: 768px) {
    padding: var(--spacing-md) 0;
    text-align: center;
    order: 2;
  }
`;

const VideoContainer = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  aspect-ratio: 16 / 9;
  
  @media (max-width: 768px) {
    order: 1;
    border-radius: 6px;
  }
  
  @media (max-width: 480px) {
    border-radius: 4px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.2) 0%,
      rgba(0, 0, 0, 0) 50%,
      rgba(0, 0, 0, 0.2) 100%
    );
    z-index: 1;
    pointer-events: none;
  }
`;

const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PosterImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  transition: opacity 0.3s ease;
`;

const LoadingPlaceholder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--color-background-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 0;
`;

const Title = styled.h3`
  font-size: var(--font-size-large);
  margin-bottom: var(--spacing-md);
  
  @media (max-width: 768px) {
    margin-bottom: var(--spacing-sm);
  }
`;

const Description = styled.p`
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-lg);
  
  @media (max-width: 768px) {
    margin-bottom: var(--spacing-md);
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const Button = styled.a`
  display: inline-block;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 2px solid var(--color-accent);
  color: var(--color-accent);
  font-weight: 500;
  border-radius: 4px;
  transition: all var(--transition-fast);
  align-self: flex-start;
  
  @media (max-width: 768px) {
    align-self: center;
  }
  
  &:hover {
    background-color: var(--color-accent);
    color: var(--color-secondary);
  }
`;

export default function VideoSection({ 
  title, 
  videoSrc, 
  description, 
  reverse = false, 
  posterSrc 
}: VideoSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isVideoMounted, setIsVideoMounted] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  
  // Debug video source
  useEffect(() => {
    console.log(`VideoSection for ${title}, videoSrc: ${videoSrc}`);
  }, [title, videoSrc]);
  
  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Check initially and on resize
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.4, 1, 1, 0.4]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.95]);
  
  // Use IntersectionObserver for lazy loading and play/pause
  useEffect(() => {
    if (!window.IntersectionObserver) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        
        if (entry.isIntersecting) {
          // Only mount video element when it comes into view
          if (!isVideoMounted) {
            setIsVideoMounted(true);
            
            // Preload the video with metadata
            const videoType = videoSrc.endsWith('.mp4') ? 'video/mp4' : 
                             videoSrc.endsWith('.webm') ? 'video/webm' : 
                             videoSrc.endsWith('.mov') ? 'video/quicktime' : 'video/mp4';
            
            videoPreloader.preloadVideo(
              [{ src: videoSrc, type: videoType }],
              { 
                metadataOnly: isMobile, 
                priority: 1,
                onComplete: () => {
                  setIsVideoLoaded(true);
                  
                  // Play video when ready and in view
                  if (videoRef.current && entry.isIntersecting) {
                    videoRef.current.play().catch(error => {
                      console.error("Error playing video:", error);
                    });
                  }
                }
              }
            );
          } else if (videoRef.current && isVideoLoaded) {
            // If video is already loaded and comes back into view, play it
            videoRef.current.play().catch(error => {
              console.error("Error playing video:", error);
            });
          }
        } else if (videoRef.current) {
          // Pause video when out of view
          videoRef.current.pause();
        }
      },
      { 
        threshold: 0.3,
        rootMargin: '100px 0px'  // Start loading slightly before it comes into view
      }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [videoSrc, isMobile, isVideoMounted, isVideoLoaded]);
  
  // Handle video errors
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error(`Error loading video for ${title}:`, e);
    setVideoError(`Could not load video (${videoSrc})`);
  };
  
  // Handle video loaded event
  const handleVideoLoaded = () => {
    console.log(`Video loaded for ${title}`);
    setIsVideoLoaded(true);
    
    // Auto-play if in view
    if (isInView && videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error("Error playing video after load:", err);
      });
    }
  };
  
  return (
    <SectionContainer ref={sectionRef} $reverse={reverse && !isMobile}>
      <ContentContainer>
        <motion.div
          style={{ opacity, scale }}
          initial={{ x: reverse && !isMobile ? -50 : 50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <Title>{title}</Title>
          <Description>{description}</Description>
          <Button href="#">View Project</Button>
        </motion.div>
      </ContentContainer>
      
      <motion.div 
        style={{ opacity, scale }}
        initial={{ x: reverse && !isMobile ? 50 : -50, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <VideoContainer>
          {!isVideoLoaded && !videoError && (
            <LoadingPlaceholder>
              <span>Loading...</span>
            </LoadingPlaceholder>
          )}
          
          {videoError && (
            <LoadingPlaceholder>
              <span>{videoError}</span>
            </LoadingPlaceholder>
          )}
          
          {posterSrc && !isVideoLoaded && (
            <PosterImage 
              src={posterSrc} 
              alt={`${title} poster`} 
              loading="lazy"
              decoding="async"
            />
          )}
          
          {isVideoMounted && (
            <VideoElement
              ref={videoRef}
              src={videoSrc}
              playsInline
              muted
              loop
              onLoadedData={handleVideoLoaded}
              onError={handleVideoError}
              poster={posterSrc}
              preload={isMobile ? "metadata" : "auto"}
            />
          )}
        </VideoContainer>
      </motion.div>
    </SectionContainer>
  );
}
