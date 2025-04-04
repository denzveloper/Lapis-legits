import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useServices } from './ServicesContext';
import ServiceCard from './ServiceCard';
import ServiceDetail from './ServiceDetail';
import { Service } from '@/data/servicesData';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  grid-gap: var(--spacing-md);
  position: relative;
  margin-top: var(--spacing-md);
  
  @media (max-width: 960px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    grid-gap: var(--spacing-sm);
    margin-top: var(--spacing-sm);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    grid-gap: var(--spacing-sm);
  }
`;

const NoServicesMessage = styled.p`
  text-align: center;
  font-size: var(--font-size-medium);
  padding: var(--spacing-lg);
  grid-column: 1 / -1;
  background-color: var(--color-background-light);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    font-size: var(--font-size-small);
    padding: var(--spacing-md);
  }
`;

const DetailContainer = styled(motion.div)`
  grid-column: 1 / -1;
  margin-top: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  overflow: hidden;
  border-radius: 12px;
  background-color: var(--color-background-light);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  
  @media (max-width: 768px) {
    margin-top: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
    border-radius: 8px;
  }
`;

const CategoryHeading = styled.h3`
  font-size: var(--font-size-large);
  margin-bottom: var(--spacing-sm);
  grid-column: 1 / -1;
  opacity: 0.9;
  
  @media (max-width: 768px) {
    font-size: var(--font-size-medium);
    margin-bottom: var(--spacing-xs);
  }
`;

const MobileFilterTip = styled.p`
  display: none;
  text-align: center;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  margin: var(--spacing-xs) 0 var(--spacing-sm);
  font-style: italic;
  
  @media (max-width: 480px) {
    display: block;
  }
`;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.05
    }
  }
};

const detailVariants = {
  initial: { opacity: 0, height: 0 },
  animate: { 
    opacity: 1, 
    height: 'auto',
    transition: { duration: 0.4 }
  },
  exit: { 
    opacity: 0, 
    height: 0,
    transition: { duration: 0.3 }
  }
};

const ServiceCardGrid: React.FC = () => {
  const { selectedCategory, activeService, setActiveService, getServicesByCategory } = useServices();
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  
  // Check screen size for adaptive layouts
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);
  
  useEffect(() => {
    if (selectedCategory) {
      // Reset active service when category changes
      setActiveService(null);
      
      // Filter services by selected category
      const services = getServicesByCategory(selectedCategory);
      setFilteredServices(services);
    }
  }, [selectedCategory, getServicesByCategory, setActiveService]);
  
  const handleCardClick = (service: Service) => {
    if (activeService && activeService.id === service.id) {
      // If clicking the active service, deselect it
      setActiveService(null);
    } else {
      // Otherwise, set as active service
      setActiveService(service);
      
      // On mobile, scroll to detail view
      if (isSmallScreen) {
        setTimeout(() => {
          const detailElement = document.getElementById(`service-detail-${service.id}`);
          if (detailElement) {
            detailElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 100);
      }
    }
  };
  
  // Get the current category name
  const currentCategoryName = selectedCategory ? 
    filteredServices.length > 0 ? 
      filteredServices[0].category : 
      '' : 
    '';
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {isSmallScreen && (
        <MobileFilterTip>
          Swipe left/right to explore different service categories
        </MobileFilterTip>
      )}
      
      <GridContainer>
        {currentCategoryName && (
          <CategoryHeading>{currentCategoryName} Services</CategoryHeading>
        )}
        
        {filteredServices.length > 0 ? (
          filteredServices.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              onClick={handleCardClick}
              isActive={activeService?.id === service.id}
            />
          ))
        ) : (
          <NoServicesMessage>
            No services found for this category.
          </NoServicesMessage>
        )}
        
        <AnimatePresence>
          {activeService && (
            <DetailContainer
              id={`service-detail-${activeService.id}`}
              key={`detail-${activeService.id}`}
              variants={detailVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              layout
            >
              <ServiceDetail service={activeService} onClose={() => setActiveService(null)} />
            </DetailContainer>
          )}
        </AnimatePresence>
      </GridContainer>
    </motion.div>
  );
};

export default ServiceCardGrid; 