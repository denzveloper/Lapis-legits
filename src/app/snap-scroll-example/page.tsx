'use client';

import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SnapScrollVideoSection from '@/components/video/SnapScrollVideoSection';

const Main = styled.main`
  width: 100%;
  min-height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text);
`;

const ContentSection = styled.section`
  padding: var(--spacing-xl) 0;
  position: relative;
  background-color: var(--color-background-dark);
  color: var(--color-text-light);
  
  @media (max-width: 768px) {
    padding: var(--spacing-lg) 0;
  }
  
  @media (max-width: 480px) {
    padding: var(--spacing-md) 0;
  }
`;

const DevBar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  z-index: 100;
`;

const BackLink = styled(Link)`
  color: white;
  text-decoration: none;
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
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

const SectionTitle = styled.h2`
  font-size: var(--font-size-xlarge);
  margin-bottom: var(--spacing-lg);
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: var(--font-size-large);
    margin-bottom: var(--spacing-md);
  }
`;

const CurrentSectionHeading = styled.h1`
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 30px;
  font-size: 1.2rem;
  z-index: 90;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  white-space: nowrap;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 0.4rem 1rem;
    top: 60px;
  }
`;

const ScrollIndicator = styled.div`
  position: fixed;
  bottom: 5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  font-size: 0.9rem;
  opacity: 0.8;
  z-index: 90;
  pointer-events: none;
  animation: bounce 2s infinite;
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateX(-50%) translateY(0);
    }
    40% {
      transform: translateX(-50%) translateY(-10px);
    }
    60% {
      transform: translateX(-50%) translateY(-5px);
    }
  }
  
  svg {
    width: 24px;
    height: 24px;
    margin-top: 8px;
  }
`;

// Define video sections for the snap scrolling
const videoSections = [
  {
    id: 'hero-section',
    videoSrc: '/videos/lapis_demo.mp4',
    posterSrc: '/images/portfolio/hero-poster.jpg',
    title: 'Captivating Visual Stories That Inspire',
    subtitle: 'LAPIS creates immersive visual experiences that blend artistry with powerful storytelling'
  },
  {
    id: 'commercial-section',
    videoSrc: '/videos/lapis_demo.mp4',
    posterSrc: '/images/portfolio/commercial-poster.jpg',
    title: 'Commercial Productions',
    subtitle: 'High-impact video content that drives engagement and elevates your brand'
  },
  {
    id: 'documentary-section',
    videoSrc: '/videos/lapis_demo.mp4',
    posterSrc: '/images/portfolio/documentary-poster.jpg',
    title: 'Documentary Storytelling',
    subtitle: 'Authentic narratives that connect with audiences on a deeper level'
  }
];

export default function SnapScrollExample() {
  const contentSectionRef = useRef<HTMLElement>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [headingText, setHeadingText] = useState('');
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  
  useEffect(() => {
    // Update heading text when the section changes
    if (videoSections[currentSection]) {
      setHeadingText(videoSections[currentSection].title || `Section ${currentSection + 1}`);
    }
    
    // Hide scroll indicator after the first section change
    if (currentSection > 0) {
      setShowScrollIndicator(false);
    }
    
    // Show scroll indicator again when reaching the last section
    if (currentSection === videoSections.length - 1) {
      // Show scroll indicator with text prompting to scroll to content
      setTimeout(() => {
        setShowScrollIndicator(true);
      }, 2000);
    }
  }, [currentSection]);
  
  // Scroll to content section
  const scrollToContent = () => {
    if (contentSectionRef.current) {
      contentSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Handle section change
  const handleSectionChange = (index: number) => {
    console.log(`Section changed to ${index}`);
    setCurrentSection(index);
    
    // If we've reached the last video section, prepare to scroll to content
    if (index === videoSections.length - 1) {
      console.log('Last section reached, prepare for content scroll');
    }
  };
  
  return (
    <>
      <Header />
      <DevBar>
        <BackLink href="/">Back to Home</BackLink>
        <span>Current Section: {currentSection + 1} of {videoSections.length}</span>
      </DevBar>
      
      <CurrentSectionHeading>
        {headingText}
      </CurrentSectionHeading>
      
      {/* Scroll indicator */}
      {showScrollIndicator && (
        <ScrollIndicator>
          <span>{currentSection === videoSections.length - 1 ? 'Scroll to content' : 'Scroll to navigate'}</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
            <path d="M12 2a10 10 0 0110 10 10 10 0 01-10 10A10 10 0 012 12 10 10 0 0112 2m0 15l5-5h-3V8h-4v4H7l5 5z" />
          </svg>
        </ScrollIndicator>
      )}
      
      <Main>
        {/* Video Sections with Snap Scrolling */}
        <SnapScrollVideoSection 
          sections={videoSections}
          preloadAll={true}
          onSectionChange={handleSectionChange}
        />
        
        {/* Content Section */}
        <ContentSection ref={contentSectionRef}>
          <ResponsiveContainer>
            <SectionTitle>Continue Exploring Our Work</SectionTitle>
            <p>
              This section demonstrates how the content flows after the snap-scrolling
              video sections. The transition is smooth and intuitive for users.
            </p>
          </ResponsiveContainer>
        </ContentSection>
      </Main>
      
      <Footer />
    </>
  );
} 