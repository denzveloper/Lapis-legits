import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ServicesProvider, useServices } from './ServicesContext';
import ServiceCategorySelector from './ServiceCategorySelector';
import ServiceCardGrid from './ServiceCardGrid';

const ServicesContainer = styled.section`
  width: 100%;
  padding: var(--spacing-xl) 0;
  background-color: var(--color-background-alt);
  position: relative;
  overflow: hidden; // Prevent any decorations from causing horizontal scrolling
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(circle at 20% 30%, rgba(var(--color-primary-rgb), 0.05) 0%, transparent 70%);
    z-index: 0;
  }
  
  @media (max-width: 768px) {
    padding: var(--spacing-lg) 0;
  }
  
  @media (max-width: 480px) {
    padding: var(--spacing-md) var(--spacing-xs);
  }
`;

const ResponsiveContainer = styled.div`
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  position: relative;
  z-index: 1;
  
  @media (max-width: 1024px) {
    max-width: 90%;
  }
  
  @media (max-width: 768px) {
    padding: 0 var(--spacing-md);
    max-width: 95%;
  }
  
  @media (max-width: 480px) {
    padding: 0 var(--spacing-sm);
    max-width: 100%;
  }
`;

const SectionTitle = styled.h2`
  font-size: var(--font-size-xlarge);
  margin-bottom: var(--spacing-md);
  text-align: center;
  position: relative;
  
  &::after {
    content: '';
    display: block;
    width: 60px;
    height: 4px;
    background-color: var(--color-primary);
    margin: var(--spacing-sm) auto 0;
    border-radius: 2px;
  }
  
  @media (max-width: 768px) {
    font-size: var(--font-size-large);
    margin-bottom: var(--spacing-sm);
    
    &::after {
      width: 40px;
      height: 3px;
    }
  }
  
  @media (max-width: 480px) {
    font-size: var(--font-size-medium);
    
    &::after {
      width: 30px;
      height: 2px;
      margin-top: var(--spacing-xs);
    }
  }
`;

const SectionDescription = styled.p`
  font-size: var(--font-size-medium);
  text-align: center;
  max-width: 800px;
  margin: 0 auto var(--spacing-lg);
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: var(--font-size-small);
    margin-bottom: var(--spacing-md);
    max-width: 600px;
  }
  
  @media (max-width: 480px) {
    font-size: var(--font-size-xsmall);
    line-height: 1.5;
    max-width: 100%;
  }
`;

// Decorative elements for visual interest
const DecorativeLine = styled.div`
  position: absolute;
  width: 1px;
  background: linear-gradient(to bottom, transparent, rgba(var(--color-primary-rgb), 0.3), transparent);
  top: 10%;
  bottom: 10%;
  
  &.left {
    left: 2%;
  }
  
  &.right {
    right: 2%;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const ServicesContent: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory } = useServices();
  
  useEffect(() => {
    // Set default category when component mounts
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory, setSelectedCategory]);
  
  return (
    <ServicesContainer id="services">
      <DecorativeLine className="left" />
      <DecorativeLine className="right" />
      
      <ResponsiveContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <SectionTitle>Our Services</SectionTitle>
          <SectionDescription>
            LAPIS offers a comprehensive range of video production services tailored to your specific needs.
            Explore our service categories below to find the perfect solution for your project.
          </SectionDescription>
        </motion.div>
        
        <ServiceCategorySelector />
        <ServiceCardGrid />
      </ResponsiveContainer>
    </ServicesContainer>
  );
};

const ServicesSection: React.FC = () => {
  return (
    <ServicesProvider>
      <ServicesContent />
    </ServicesProvider>
  );
};

export default ServicesSection; 