'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SnapScrollContainer from '../../components/video/SnapScrollContainer';
import SnapScrollVideoSection, { VideoSection } from '../../components/video/SnapScrollVideoSection';
import { IntersectionDebugger } from '../../components/debug';

// Styled components
const PageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #000;
  color: white;
`;

const CurrentSectionHeading = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.5rem;
  font-weight: bold;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 30px;
  z-index: 100;
  transition: opacity 0.3s ease, transform 0.3s ease;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 0.4rem 1rem;
  }
`;

// Animated scroll indicator with bounce effect
const ScrollIndicator = styled.div`
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  font-size: 0.9rem;
  z-index: 100;
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }
  
  svg {
    margin-top: 8px;
    animation: bounce 2s infinite;
  }
`;

// Demo data: Video sections
const videoSections: VideoSection[] = [
  {
    id: 'intro',
    title: 'Welcome to Snap Scroll',
    subtitle: 'Scroll down or click a navigation bullet to explore our enhanced snap scroll experience',
    videoSrc: { 
      src: 'https://assets.mixkit.co/videos/preview/mixkit-white-sand-beach-and-palm-trees-1564-large.mp4',
      type: 'video/mp4'
    },
    textPosition: 'center',
    textColor: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.4)'
  },
  {
    id: 'feature-1',
    title: 'Smooth Transitions',
    subtitle: 'Enjoy perfectly timed video transitions with our enhanced intersection observer',
    videoSrc: { 
      src: 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4',
      type: 'video/mp4'
    },
    textPosition: 'left',
    textColor: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.3)'
  },
  {
    id: 'feature-2',
    title: 'Click Navigation',
    subtitle: 'Try clicking directly on the navigation bullets to jump to any section',
    videoSrc: { 
      src: 'https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4',
      type: 'video/mp4'
    },
    textPosition: 'right',
    textColor: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.3)'
  },
  {
    id: 'feature-3',
    title: 'Accessibility',
    subtitle: 'Fully accessible with keyboard navigation support, screen reader optimizations, and semantic markup',
    videoSrc: { 
      src: 'https://assets.mixkit.co/videos/preview/mixkit-woman-running-above-the-camera-on-a-running-track-32807-large.mp4',
      type: 'video/mp4'
    },
    textPosition: 'left',
    textColor: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.4)'
  },
  {
    id: 'conclusion',
    title: 'Get Started Today',
    subtitle: 'Add immersive, smooth scrolling experiences to your website with our snap scroll component',
    videoSrc: { 
      src: 'https://assets.mixkit.co/videos/preview/mixkit-top-aerial-shot-of-seashore-with-rocks-1090-large.mp4',
      type: 'video/mp4'
    },
    textPosition: 'center',
    textColor: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  }
];

export default function SnapScrollExample() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentSectionTitle, setCurrentSectionTitle] = useState('');
  const [sectionVisibility, setSectionVisibility] = useState<number[]>(new Array(videoSections.length).fill(0));
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  
  // Update current section heading when the active section changes
  useEffect(() => {
    // Update heading text
    setCurrentSectionTitle(videoSections[activeIndex]?.title || '');
    
    // Hide the scroll indicator after the first change
    if (activeIndex > 0) {
      setShowScrollIndicator(false);
    }
    
    // Show scroll indicator again when reaching the last section, with different text
    if (activeIndex === videoSections.length - 1) {
      setTimeout(() => {
        setShowScrollIndicator(true);
      }, 1000);
    }
  }, [activeIndex]);
  
  // Handle section change
  const handleSectionChange = (index: number) => {
    setActiveIndex(index);
    
    // Update section visibility for debugging (normally this would come from SnapScrollContainer)
    const newVisibility = Array(videoSections.length).fill(0);
    newVisibility[index] = 1; // Set current section to 100% visible
    setSectionVisibility(newVisibility);
  };
  
  return (
    <PageContainer>
      {/* Current section title */}
      <CurrentSectionHeading>
        {currentSectionTitle}
      </CurrentSectionHeading>
      
      {/* Scroll indicator (only shown at beginning and end) */}
      {showScrollIndicator && (
        <ScrollIndicator>
          {activeIndex === 0 ? 'Scroll to explore' : 'Scroll to content'}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 17L12 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M7 12L12 17L17 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ScrollIndicator>
      )}
      
      <SnapScrollContainer
        sections={videoSections.map(section => ({
          id: section.id,
          title: section.title,
          subtitle: section.subtitle
        }))}
        onSectionChange={handleSectionChange}
      >
        {videoSections.map((section, index) => (
          <SnapScrollVideoSection
            key={section.id}
            sections={[section]}
            activeIndex={0}
            preloadNext={index < videoSections.length - 1}
          />
        ))}
      </SnapScrollContainer>
      
      {/* Debug visualization for development */}
      <IntersectionDebugger 
        visibility={sectionVisibility}
        activeIndex={activeIndex}
        totalSections={videoSections.length}
      />
    </PageContainer>
  );
} 