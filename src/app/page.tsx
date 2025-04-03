'use client';

import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { motion, useScroll, useTransform } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VideoHero from '@/components/video/VideoHero';
import VideoSection from '@/components/video/VideoSection';
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
`;

const SectionTitle = styled.h2`
  font-size: var(--font-size-xlarge);
  margin-bottom: var(--spacing-lg);
  text-align: center;
`;

// Sample video sources for development
const heroVideoSources: VideoSource[] = [
  { src: '/videos/hero-video.mp4', type: 'video/mp4' },
  { src: '/videos/hero-video.webm', type: 'video/webm' }
];

export default function Home() {
  const mainRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    // Ensure IntersectionObserver polyfill is loaded
    if (!('IntersectionObserver' in window)) {
      import('intersection-observer');
    }
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const handleHeroScroll = () => {
    if (mainRef.current) {
      const firstSection = mainRef.current.querySelector('section:nth-of-type(2)');
      if (firstSection) {
        firstSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <Header />
      <Main ref={mainRef}>
        {/* Development links - remove before production */}
        <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', textAlign: 'center' }}>
          <Link 
            href="/scroll-test" 
            style={{ color: '#007bff', textDecoration: 'underline', marginRight: '1rem' }}
          >
            View Scroll Video Hook Test Page
          </Link>
          <Link 
            href="/video-player-test" 
            style={{ color: '#007bff', textDecoration: 'underline', marginRight: '1rem' }}
          >
            View Video Player Test Page
          </Link>
          <Link 
            href="/scroll-video-sections" 
            style={{ color: '#007bff', textDecoration: 'underline' }}
          >
            View Scroll Video Sections Test Page
          </Link>
        </div>
        
        <VideoHero 
          title="Captivating Visual Stories That Inspire"
          subtitle="LAPIS creates immersive visual experiences that blend artistry with powerful storytelling"
          videoSources={heroVideoSources}
          posterUrl="/images/hero-poster.jpg"
          onScrollClick={handleHeroScroll}
        />
        
        <Section className="container">
          <SectionTitle>Our Work</SectionTitle>
          <VideoSection 
            title="Commercial Productions" 
            videoSrc="/videos/commercial.mp4" 
            description="High-impact commercial video production that captures attention and drives engagement."
          />
          
          <VideoSection 
            title="Documentary" 
            videoSrc="/videos/documentary.mp4" 
            description="Authentic storytelling that connects with audiences through compelling narratives."
            reverse
          />
          
          <VideoSection 
            title="Event Coverage" 
            videoSrc="/videos/event.mp4" 
            description="Dynamic event documentation that preserves the energy and highlights of your special moments."
          />
        </Section>
        
        <Section className="container">
          <SectionTitle>Our Services</SectionTitle>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Service content will be added in future tasks */}
            <p style={{ textAlign: 'center' }}>
              LAPIS offers a comprehensive range of video production services tailored to your specific needs.
            </p>
          </motion.div>
        </Section>
        
        <Section className="container">
          <SectionTitle>Contact Us</SectionTitle>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Contact form will be added in future tasks */}
            <p style={{ textAlign: 'center' }}>
              Ready to start your project? Get in touch with our team.
            </p>
          </motion.div>
        </Section>
      </Main>
      <Footer />
    </>
  );
}
