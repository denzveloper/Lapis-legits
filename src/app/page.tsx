'use client';

import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VideoHero from '@/components/video/VideoHero';
import VideoSection from '@/components/video/VideoSection';
import Link from 'next/link';

const Main = styled.main`
  width: 100%;
  min-height: 100vh;
`;

const Section = styled.section`
  padding: var(--spacing-xl) 0;
`;

const SectionTitle = styled.h2`
  font-size: var(--font-size-xlarge);
  margin-bottom: var(--spacing-lg);
  text-align: center;
`;

export default function Home() {
  useEffect(() => {
    // Ensure IntersectionObserver polyfill is loaded
    if (!('IntersectionObserver' in window)) {
      import('intersection-observer');
    }
  }, []);

  return (
    <>
      <Header />
      <Main>
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
            style={{ color: '#007bff', textDecoration: 'underline' }}
          >
            View Video Player Test Page
          </Link>
        </div>
        
        <VideoHero />
        
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
