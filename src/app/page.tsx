'use client';

import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { motion, useScroll, useTransform } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VideoHero from '@/components/video/VideoHero';
import VideoSection from '@/components/video/VideoSection';
import ScrollVideoController from '@/components/video/ScrollVideoController';
import ServicesSection from '@/components/services/ServicesSection';
import Link from 'next/link';
import { VideoSource } from '@/utils/videoPreloader';

const Main = styled.main`
  width: 100%;
  min-height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text);
`;

const Section = styled.section`
  padding: var(--spacing-xl) 0;
  position: relative;
  
  @media (max-width: 768px) {
    padding: var(--spacing-lg) 0;
  }
  
  @media (max-width: 480px) {
    padding: var(--spacing-md) 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: var(--font-size-xlarge);
  margin-bottom: var(--spacing-lg);
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: var(--font-size-large);
    margin-bottom: var(--spacing-md);
  }
`;

const ContentSection = styled.section`
  padding: var(--spacing-xl) 0;
  position: relative;
  background-color: var(--color-background-dark);
  color: var(--color-text-light);
  margin-top: 100vh; /* Add space for the video scroll sections */
  
  @media (max-width: 768px) {
    padding: var(--spacing-lg) 0;
  }
  
  @media (max-width: 480px) {
    padding: var(--spacing-md) 0;
  }
`;

const DevLinks = styled.div`
  padding: 1rem;
  background-color: rgba(248, 249, 250, 0.8);
  text-align: center;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
`;

const DevLink = styled(Link)`
  color: #007bff;
  text-decoration: underline;
  margin-right: 1rem;
  
  @media (max-width: 768px) {
    margin-right: 0;
  }
  
  &:last-child {
    margin-right: 0;
  }
`;

const ResponsiveContainer = styled.div`
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  
  @media (max-width: 768px) {
    padding: 0 var(--spacing-md);
  }
  
  @media (max-width: 480px) {
    padding: 0 var(--spacing-sm);
  }
`;

// Sample video sources for development
const heroVideoSources: VideoSource[] = [
  { src: '/videos/hero-video.mp4', type: 'video/mp4' },
  { src: '/videos/hero-video.webm', type: 'video/webm' }
];

// Define video transitions for the landing page
const videoTransitions = [
  {
    id: 'hero-section',
    startPosition: 0,
    endPosition: 0.3,
    videoSrc: '/videos/lapis_demo.mp4',
    posterSrc: '/images/portfolio/hero-poster.jpg',
    title: 'Captivating Visual Stories That Inspire',
    subtitle: 'LAPIS creates immersive visual experiences that blend artistry with powerful storytelling'
  },
  {
    id: 'commercial-section',
    startPosition: 0.301,
    endPosition: 0.6,
    videoSrc: '/videos/lapis_demo.mp4',
    posterSrc: '/images/portfolio/commercial-poster.jpg',
    title: 'Commercial Productions',
    subtitle: 'High-impact video content that drives engagement and elevates your brand'
  },
  {
    id: 'documentary-section',
    startPosition: 0.601,
    endPosition: 1,
    videoSrc: '/videos/lapis_demo.mp4',
    posterSrc: '/images/portfolio/documentary-poster.jpg',
    title: 'Documentary Storytelling',
    subtitle: 'Authentic narratives that connect with audiences on a deeper level'
  }
];

export default function Home() {
  const mainRef = useRef<HTMLDivElement>(null);
  const contentSectionRef = useRef<HTMLElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  useEffect(() => {
    console.log('Home component mounted, video transitions:', videoTransitions);
    
    // Ensure IntersectionObserver polyfill is loaded
    if (!('IntersectionObserver' in window)) {
      import('intersection-observer');
    }
    
    // Debounce scroll events for better performance
    let timeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setScrollY(window.scrollY);
      }, 10);
    };
    
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 480);
      setIsTablet(window.innerWidth > 480 && window.innerWidth <= 768);
    };
    
    // Initial check
    checkDevice();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
      clearTimeout(timeout);
    };
  }, []);
  
  const handleHeroScroll = () => {
    if (contentSectionRef.current) {
      contentSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Header />
      <Main ref={mainRef} style={{ position: 'relative' }}>
        {/* Development links - remove before production */}
        <DevLinks>
          <DevLink href="/snap-scroll-example">
            View Snap Scroll Example Page
          </DevLink>
          <DevLink href="/scroll-test">
            View Scroll Video Hook Test Page
          </DevLink>
          <DevLink href="/video-player-test">
            View Video Player Test Page
          </DevLink>
          <DevLink href="/scroll-video-sections">
            View Scroll Video Sections Test Page
          </DevLink>
        </DevLinks>
        
        {/* Scroll Video Controller for the hero and video sections */}
        <ScrollVideoController 
          transitions={videoTransitions}
          preloadAll={true}
          optimizeForMobile={false}
          metadataOnly={false}
        />
        
        {/* Content sections start after the video scroll sections */}
        <ContentSection ref={contentSectionRef}>
          <ResponsiveContainer>
            <SectionTitle>Our Work</SectionTitle>
            <VideoSection 
              title="Commercial Productions" 
              videoSrc="/videos/lapis_demo.mp4" 
              description="High-impact commercial video production that captures attention and drives engagement."
            />
            
            <VideoSection 
              title="Documentary" 
              videoSrc="/videos/lapis_demo.mp4" 
              description="Authentic storytelling that connects with audiences through compelling narratives."
              reverse
            />
            
            <VideoSection 
              title="Event Coverage" 
              videoSrc="/videos/lapis_demo.mp4" 
              description="Dynamic event documentation that preserves the energy and highlights of your special moments."
            />
          
            {/* Services Section */}
            <ServicesSection />
          </ResponsiveContainer>
        </ContentSection>
      </Main>
      <Footer />
    </>
  );
}
