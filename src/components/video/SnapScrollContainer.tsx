'use client';

import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// Type definitions
interface SnapScrollContainerProps {
  children: React.ReactNode;
  sections: {
    id: string;
    title?: string;
    subtitle?: string;
  }[];
  onSectionChange?: (index: number) => void;
}

// Styled components
const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  
  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }
  
  /* IE and Edge */
  -ms-overflow-style: none;
  
  /* Firefox */
  scrollbar-width: none;
`;

const Section = styled.section`
  position: relative;
  width: 100%;
  height: 100vh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
`;

const NavigationBullets = styled.div`
  position: fixed;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  z-index: 100;
  
  /* Vertical line behind bullets */
  &:before {
    content: '';
    position: absolute;
    top: -30px;
    bottom: -30px;
    left: 50%;
    width: 2px;
    background-color: rgba(255, 255, 255, 0.2);
    transform: translateX(-50%);
    z-index: 1;
  }
  
  @media (max-width: 768px) {
    right: 1rem;
    gap: 1rem;
    
    &:before {
      top: -20px;
      bottom: -20px;
    }
  }
`;

// Progress indicator that fills as user scrolls
const ProgressIndicator = styled.div<{ $progress: number }>`
  position: absolute;
  top: -30px;
  left: 50%;
  width: 2px;
  height: ${props => props.$progress * 100}%;
  background-color: white;
  transform: translateX(-50%);
  z-index: 1;
  transition: height 0.3s ease;
  
  @media (max-width: 768px) {
    top: -20px;
  }
`;

const BulletWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  
  &:hover .bullet-label {
    opacity: 1;
    transform: translateX(0);
  }
  
  /* Add a slight delay for each bullet when hovering over navigation */
  ${Array.from({ length: 10 }).map((_, i) => `
    &:nth-child(${i + 1}):hover ~ & .bullet-label {
      transition-delay: 0ms;
    }
  `)}
`;

const BulletLabel = styled.span`
  position: absolute;
  right: calc(100% + 10px);
  white-space: nowrap;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  font-size: 0.85rem;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  pointer-events: none;
  
  &:after {
    content: '';
    position: absolute;
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
    border-left: 6px solid rgba(0, 0, 0, 0.7);
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const Bullet = styled.button<{ $isActive: boolean }>`
  width: ${props => props.$isActive ? '14px' : '10px'};
  height: ${props => props.$isActive ? '14px' : '10px'};
  border-radius: 50%;
  background-color: ${props => props.$isActive ? 'white' : 'rgba(255, 255, 255, 0.4)'};
  border: ${props => props.$isActive ? '2px solid rgba(255, 255, 255, 0.8)' : 'none'};
  box-shadow: ${props => props.$isActive ? '0 0 8px rgba(255, 255, 255, 0.5)' : 'none'};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform: scale(${props => props.$isActive ? 1.2 : 1});
  position: relative;
  z-index: 2;
  
  &:hover {
    background-color: white;
    transform: scale(1.2);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
  }
  
  @media (max-width: 768px) {
    width: ${props => props.$isActive ? '12px' : '8px'};
    height: ${props => props.$isActive ? '12px' : '8px'};
  }
`;

const SectionIndicator = styled.div<{ $active: number, $total: number }>`
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 20px;
  padding: 0.5rem 1rem;
  color: white;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  z-index: 100;
  
  &:before {
    content: '${props => props.$active + 1} / ${props => props.$total}';
    margin-right: 0.5rem;
  }
  
  @media (max-width: 768px) {
    bottom: 1rem;
    font-size: 0.8rem;
  }
`;

const ProgressDots = styled.div`
  display: flex;
  gap: 4px;
`;

const ProgressDot = styled.div<{ $isActive: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${props => props.$isActive ? 'white' : 'rgba(255, 255, 255, 0.4)'};
  transition: background-color 0.3s ease, transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform: ${props => props.$isActive ? 'scale(1.2)' : 'scale(1)'};
`;

// Enhanced touch area for better mobile experience
const TouchArea = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px; // Larger touch target (minimum 44px for iOS)
  height: 44px;
  right: -15px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 2;
  cursor: pointer;
  
  &:active {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

// Ripple animation for feedback on bullet click
const Ripple = styled(motion.div)`
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  z-index: 1;
  pointer-events: none;
`;

// Add new styled component for skip link
const SkipLink = styled.a`
  position: absolute;
  top: -40px;
  left: 0;
  padding: 8px 16px;
  background-color: white;
  color: black;
  z-index: 1000;
  transition: top 0.3s ease;
  
  &:focus {
    top: 0;
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.5);
  }
`;

const SnapScrollContainer: React.FC<SnapScrollContainerProps> = ({ 
  children, 
  sections,
  onSectionChange 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [sectionVisibility, setSectionVisibility] = useState<number[]>([]);
  const [showRipple, setShowRipple] = useState<number | null>(null);
  const [lastInteraction, setLastInteraction] = useState<'scroll' | 'click'>('scroll');
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  // Add ref for the announcement for screen readers
  const announcerRef = useRef<HTMLDivElement>(null);
  
  // Initialize section refs array and visibility tracking
  useEffect(() => {
    sectionRefs.current = sectionRefs.current.slice(0, sections.length);
    setSectionVisibility(new Array(sections.length).fill(0));
  }, [sections.length]);
  
  // Set up enhanced Intersection Observer to track section visibility
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create an array of threshold values for more granular observation
    const thresholds = Array.from({ length: 21 }, (_, i) => i * 0.05);
    
    const observer = new IntersectionObserver(
      (entries) => {
        // Only process if last interaction was scroll (not click)
        if (lastInteraction === 'click') return;
        
        // Update visibility ratios for each section
        const newVisibility = [...sectionVisibility];
        
        entries.forEach((entry) => {
          const sectionIndex = sectionRefs.current.findIndex(ref => ref === entry.target);
          if (sectionIndex !== -1) {
            newVisibility[sectionIndex] = entry.intersectionRatio;
          }
        });
        
        setSectionVisibility(newVisibility);
        
        // Find the most visible section
        let maxVisibility = 0;
        let mostVisibleIndex = activeSection; // Default to current active
        
        newVisibility.forEach((ratio, index) => {
          // Apply some hysteresis to prevent rapid switching - require more 
          // visibility to switch from current section
          const threshold = index === activeSection ? 0.4 : 0.5;
          
          if (ratio > threshold && ratio > maxVisibility) {
            maxVisibility = ratio;
            mostVisibleIndex = index;
          }
        });
        
        // Only update when most visible section changes
        if (mostVisibleIndex !== activeSection) {
          console.log(`Changing active section to ${mostVisibleIndex} with visibility ${maxVisibility}`);
          
          // Apply the transition effect
          applyBulletTransition(mostVisibleIndex);
          
          // Update active section
          setActiveSection(mostVisibleIndex);
          
          // Call the callback if provided
          if (onSectionChange) {
            onSectionChange(mostVisibleIndex);
          }
        }
      },
      {
        root: containerRef.current,
        rootMargin: '0px',
        threshold: thresholds, // Use multiple thresholds for more precise tracking
      }
    );
    
    // Observe all sections
    sectionRefs.current.forEach((section) => {
      if (section) {
        observer.observe(section);
      }
    });
    
    return () => {
      sectionRefs.current.forEach((section) => {
        if (section) {
          observer.unobserve(section);
        }
      });
    };
  }, [activeSection, lastInteraction, onSectionChange, sectionVisibility]);
  
  // Apply transition effect to bullets
  const applyBulletTransition = (newIndex: number) => {
    const bullets = document.querySelectorAll('.nav-bullet');
    bullets.forEach((bullet, i) => {
      const bulletEl = bullet as HTMLElement;
      // Apply delayed transition based on distance from active section
      const distance = Math.abs(i - newIndex);
      bulletEl.style.transitionDelay = `${distance * 50}ms`;
    });
  };
  
  // Handle navigation bullet click with visual feedback
  const scrollToSection = (index: number) => {
    if (sectionRefs.current[index]) {
      // Set last interaction type to click
      setLastInteraction('click');
      
      // Show ripple effect on clicked bullet
      setShowRipple(index);
      setTimeout(() => setShowRipple(null), 600);
      
      // Apply transition effect when changing sections via click
      applyBulletTransition(index);
      
      // Set active section immediately for UI feedback
      setActiveSection(index);
      
      // Call the callback if provided
      if (onSectionChange) {
        onSectionChange(index);
      }
      
      // Announce section change to screen readers
      if (announcerRef.current) {
        announcerRef.current.textContent = `Navigated to ${sections[index]?.title || `section ${index + 1}`}`;
      }
      
      // Schedule the scroll
      setTimeout(() => {
        sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth' });
        
        // Focus the section for keyboard users
        if (sectionRefs.current[index]) {
          sectionRefs.current[index]?.setAttribute('tabindex', '-1');
          sectionRefs.current[index]?.focus();
        }
        
        // Reset interaction type after scrolling completes
        setTimeout(() => {
          setLastInteraction('scroll');
        }, 1000);
      }, 10);
    }
  };
  
  // Calculate scroll progress
  useEffect(() => {
    if (!containerRef.current) return;
    
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const scrollTop = containerRef.current.scrollTop;
      const scrollHeight = containerRef.current.scrollHeight - containerRef.current.clientHeight;
      const progress = scrollTop / scrollHeight;
      
      setScrollProgress(progress);
    };
    
    const container = containerRef.current;
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard navigation if not in an input field
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      
      let handled = false;
      
      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
          if (activeSection < sections.length - 1) {
            scrollToSection(activeSection + 1);
            handled = true;
          }
          break;
        case 'ArrowUp':
        case 'PageUp':
          if (activeSection > 0) {
            scrollToSection(activeSection - 1);
            handled = true;
          }
          break;
        case 'Home':
          scrollToSection(0);
          handled = true;
          break;
        case 'End':
          scrollToSection(sections.length - 1);
          handled = true;
          break;
        case 'Tab':
          // Let Tab navigation work naturally
          break;
        default:
          // Handle number keys for direct section access (1-9)
          if (!e.ctrlKey && !e.altKey && !e.metaKey && /^[1-9]$/.test(e.key)) {
            const sectionIndex = parseInt(e.key, 10) - 1;
            if (sectionIndex >= 0 && sectionIndex < sections.length) {
              scrollToSection(sectionIndex);
              handled = true;
            }
          }
          break;
      }
      
      // Prevent default browser behavior for handled keys
      if (handled) {
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeSection, sections.length]);
  
  // Handle touch gestures for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchEndY - touchStartY;
    
    // Detect swipe direction
    if (Math.abs(deltaY) > 50) { // Minimum swipe distance
      if (deltaY > 0 && activeSection > 0) {
        // Swipe down -> previous section
        scrollToSection(activeSection - 1);
      } else if (deltaY < 0 && activeSection < sections.length - 1) {
        // Swipe up -> next section
        scrollToSection(activeSection + 1);
      }
    }
    
    setTouchStartY(null);
  };
  
  return (
    <>
      {/* Skip to content link for accessibility */}
      <SkipLink 
        href="#main-content"
        tabIndex={0}
        onClick={(e) => {
          e.preventDefault();
          scrollToSection(0);
        }}
      >
        Skip to main content
      </SkipLink>
      
      {/* Screen reader announcer (visually hidden) */}
      <div
        ref={announcerRef}
        role="status"
        aria-live="polite"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0
        }}
      />
      
      <Container 
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="region"
        aria-roledescription="scrollable content"
      >
        {React.Children.map(children, (child, index) => (
          <Section
            ref={(el) => { sectionRefs.current[index] = el; }}
            key={sections[index]?.id || `section-${index}`}
            tabIndex={activeSection === index ? 0 : -1}
            role="region"
            aria-label={sections[index]?.title || `Section ${index + 1}`}
            id={index === 0 ? "main-content" : `section-${sections[index]?.id || index}`}
          >
            {child}
          </Section>
        ))}
      </Container>
      
      {/* Navigation bullets */}
      <NavigationBullets 
        aria-label="Section Navigation" 
        role="navigation"
      >
        <ProgressIndicator $progress={scrollProgress} aria-hidden="true" />
        {sections.map((section, index) => (
          <BulletWrapper key={section.id}>
            <BulletLabel className="bullet-label">
              {section.title || `Section ${index + 1}`}
            </BulletLabel>
            
            {/* Enhanced click target for better touch experience */}
            <TouchArea 
              onClick={() => scrollToSection(index)}
              tabIndex={-1}
              aria-hidden="true"
            />
            
            {/* Visual feedback with ripple animation */}
            {showRipple === index && (
              <Ripple
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 1, opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            )}
            
            <Bullet
              className="nav-bullet"
              $isActive={activeSection === index}
              onClick={() => scrollToSection(index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  scrollToSection(index);
                }
              }}
              aria-label={`Navigate to ${section.title || `section ${index + 1}`}`}
              aria-current={activeSection === index ? 'true' : 'false'}
              role="button"
              tabIndex={0}
              aria-controls={`section-${section.id || index}`}
            />
          </BulletWrapper>
        ))}
      </NavigationBullets>
      
      {/* Section indicator at bottom */}
      {false && (
        <SectionIndicator 
          $active={activeSection} 
          $total={sections.length}
          aria-hidden="true"
        >
          <ProgressDots>
            {sections.map((_, index) => (
              <ProgressDot 
                key={index} 
                $isActive={activeSection === index}
                style={{ transitionDelay: `${Math.abs(activeSection - index) * 50}ms` }}
              />
            ))}
          </ProgressDots>
        </SectionIndicator>
      )}
    </>
  );
};

export default SnapScrollContainer; 