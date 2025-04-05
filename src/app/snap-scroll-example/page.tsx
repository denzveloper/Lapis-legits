'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SnapScrollContainer from '../../components/video/SnapScrollContainer';
import SnapScrollVideoSection, { VideoSection } from '../../components/video/SnapScrollVideoSection';
import IntersectionDebugger from '../../components/debug/IntersectionDebugger';
import Head from 'next/head';

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

// New component to display keyboard controls help
const KeyboardHelp = styled.div`
  position: fixed;
  left: 20px;
  bottom: 20px;
  padding: 10px 15px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 0.8rem;
  border-radius: 8px;
  z-index: 100;
  max-width: 250px;
  
  h3 {
    margin-top: 0;
    margin-bottom: 8px;
    font-size: 0.9rem;
  }
  
  ul {
    margin: 0;
    padding-left: 20px;
  }
  
  li {
    margin-bottom: 4px;
  }
  
  kbd {
    background-color: #eee;
    border-radius: 3px;
    border: 1px solid #b4b4b4;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
    color: #333;
    display: inline-block;
    font-size: 0.75rem;
    font-weight: 700;
    line-height: 1;
    padding: 2px 5px;
    margin: 0 2px;
  }
`;

// Sample video sections for the example
const sampleVideoSections: VideoSection[] = [
  {
    id: 'intro',
    title: 'Introduction',
    subtitle: 'Welcome to our creative agency',
    videoSrc: {
      src: '/videos/sample1.mp4',
      type: 'video/mp4',
    },
    textPosition: 'center',
    textColor: 'white',
    backgroundColor: '#000000',
  },
  {
    id: 'services',
    title: 'Our Services',
    subtitle: 'Strategy, design, and development',
    videoSrc: {
      src: '/videos/sample2.mp4',
      type: 'video/mp4',
    },
    textPosition: 'left',
    textColor: 'white',
    backgroundColor: '#2a2a2a',
  },
  {
    id: 'portfolio',
    title: 'Portfolio',
    subtitle: 'Explore our recent projects',
    videoSrc: {
      src: '/videos/sample3.mp4',
      type: 'video/mp4',
    },
    textPosition: 'right',
    textColor: 'white',
    backgroundColor: '#444444',
  },
  {
    id: 'contact',
    title: 'Contact Us',
    subtitle: 'Let\'s work together',
    videoSrc: {
      src: '/videos/sample4.mp4',
      type: 'video/mp4',
    },
    textPosition: 'center',
    textColor: 'white',
    backgroundColor: '#000000',
  },
];

export default function SnapScrollExample() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showDebug, setShowDebug] = useState(false);
  const [sectionVisibility, setSectionVisibility] = useState<number[]>([]);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(true);

  // Update the document title when the active section changes
  useEffect(() => {
    const currentSection = sampleVideoSections[activeIndex];
    document.title = `${currentSection.title} - Snap Scroll Example`;
  }, [activeIndex]);

  // Handle section change
  const handleSectionChange = (index: number) => {
    setActiveIndex(index);
    
    // Track visibility for debugging purposes
    const newVisibility = [...sectionVisibility];
    newVisibility[index] = 1;
    setSectionVisibility(newVisibility);
  };

  // Toggle debug mode
  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };

  // Auto-hide keyboard help after 10 seconds
  useEffect(() => {
    if (showKeyboardHelp) {
      const timer = setTimeout(() => {
        setShowKeyboardHelp(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [showKeyboardHelp]);

  // Show keyboard help when pressing '?' key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?') {
        setShowKeyboardHelp(!showKeyboardHelp);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showKeyboardHelp]);

  return (
    <>
      <Head>
        <title>Snap Scroll Example - LAPIS</title>
        <meta name="description" content="Demonstration of accessible snap scrolling with video sections" />
      </Head>
      
      <PageContainer>
        {/* Current section title - shown when debug is enabled */}
        {showDebug && (
          <CurrentSectionHeading>
            {sampleVideoSections[activeIndex].title}
          </CurrentSectionHeading>
        )}
        
        {/* Debug toggle button */}
        <button 
          style={{ 
            position: 'fixed', 
            top: '10px', 
            right: '10px', 
            zIndex: 100,
            padding: '5px 10px',
            background: 'rgba(0,0,0,0.5)',
            color: 'white',
            border: '1px solid white',
            borderRadius: '4px'
          }}
          onClick={toggleDebug}
          aria-pressed={showDebug}
        >
          {showDebug ? 'Hide Debug' : 'Show Debug'}
        </button>
        
        {/* Keyboard navigation help */}
        {showKeyboardHelp && (
          <KeyboardHelp>
            <h3>Keyboard Navigation</h3>
            <ul>
              <li><kbd>↑</kbd> <kbd>↓</kbd> or <kbd>Page Up</kbd> <kbd>Page Down</kbd>: Navigate between sections</li>
              <li><kbd>Home</kbd> <kbd>End</kbd>: Go to first/last section</li>
              <li><kbd>1</kbd>-<kbd>9</kbd>: Jump to specific section</li>
              <li><kbd>Tab</kbd>: Navigate interactive elements</li>
              <li><kbd>?</kbd>: Toggle this help</li>
            </ul>
          </KeyboardHelp>
        )}
        
        <SnapScrollContainer
          sections={sampleVideoSections.map(section => ({
            id: section.id,
            title: section.title,
            subtitle: section.subtitle
          }))}
          onSectionChange={handleSectionChange}
        >
          {sampleVideoSections.map((section, index) => (
            <SnapScrollVideoSection
              key={section.id}
              sections={[section]}
              activeIndex={0}
              preloadNext={index < sampleVideoSections.length - 1}
            />
          ))}
        </SnapScrollContainer>
        
        {/* Debugging tools */}
        {showDebug && (
          <IntersectionDebugger 
            visibility={sectionVisibility}
            activeIndex={activeIndex}
            totalSections={sampleVideoSections.length}
          />
        )}
      </PageContainer>
    </>
  );
} 