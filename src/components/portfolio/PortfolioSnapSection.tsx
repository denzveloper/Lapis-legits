'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { portfolioItems } from '@/data/portfolioData';
import type { PortfolioItem } from '@/data/portfolioData';
import VideoModal from './VideoModal';

// Type definitions
interface PortfolioSnapSectionProps {
  title: string;
}

// Styled components
const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  background-color: var(--color-background-dark);
  
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const PortfolioItem = styled.div`
  width: 100%;
  max-width: 1200px;
  height: 80vh;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const PortfolioImage = styled.div<{ $bgImage: string }>`
  width: 100%;
  height: 100%;
  background-image: url(${props => props.$bgImage});
  background-size: cover;
  background-position: center;
  transition: transform 0.5s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const PortfolioContent = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 2rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0));
  color: white;
`;

const PortfolioTitle = styled.h3`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  font-weight: bold;
`;

const PortfolioClient = styled.p`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  opacity: 0.9;
`;

const PortfolioDescription = styled.p`
  font-size: 1rem;
  margin-bottom: 1rem;
  opacity: 0.8;
`;

const PlayButton = styled.button`
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--color-primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
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

const SectionTitle = styled.h2`
  font-size: var(--font-size-xlarge);
  color: white;
  margin-bottom: 2rem;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: var(--font-size-large);
    margin-bottom: var(--spacing-md);
  }
`;

const HeaderSection = styled.section`
  position: relative;
  width: 100%;
  height: 50vh; /* Half height for the header */
  scroll-snap-align: start;
  scroll-snap-stop: always;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: var(--color-background-dark);
`;

const PortfolioSnapSection: React.FC<PortfolioSnapSectionProps> = ({ title }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  
  // Use the first 4 portfolio items
  const displayItems = portfolioItems.slice(0, 4);
  
  const scrollToSection = (index: number) => {
    const container = document.getElementById('portfolio-container');
    if (!container) return;
    
    const sections = container.querySelectorAll('section');
    if (index < 0 || index >= sections.length) return;
    
    sections[index].scrollIntoView({ behavior: 'smooth' });
    setActiveIndex(index);
  };
  
  const handleSectionInView = (index: number) => {
    setActiveIndex(index);
  };
  
  const handlePlayClick = (item: PortfolioItem) => {
    setSelectedItem(item);
  };
  
  const handleCloseModal = () => {
    setSelectedItem(null);
  };
  
  return (
    <>
      <Container id="portfolio-container">
        <HeaderSection>
          <SectionTitle>{title}</SectionTitle>
        </HeaderSection>
        
        {displayItems.map((item, index) => (
          <Section key={item.id} id={`portfolio-section-${index}`}>
            <PortfolioItem>
              <PortfolioImage $bgImage={item.thumbnailUrl} />
              <PortfolioContent>
                <PortfolioTitle>{item.title}</PortfolioTitle>
                <PortfolioClient>{item.client}</PortfolioClient>
                <PortfolioDescription>{item.description}</PortfolioDescription>
                <PlayButton onClick={() => handlePlayClick(item)}>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                  </svg>
                  Watch Video
                </PlayButton>
              </PortfolioContent>
            </PortfolioItem>
          </Section>
        ))}
        
        <NavigationBullets>
          <Bullet 
            $isActive={activeIndex === 0} 
            onClick={() => scrollToSection(0)}
          />
          {displayItems.map((_, index) => (
            <Bullet 
              key={index}
              $isActive={activeIndex === index + 1} 
              onClick={() => scrollToSection(index + 1)}
            />
          ))}
        </NavigationBullets>
      </Container>
      
      {/* Video Modal */}
      <VideoModal 
        item={selectedItem}
        isOpen={selectedItem !== null}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default PortfolioSnapSection; 