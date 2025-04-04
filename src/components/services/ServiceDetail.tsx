import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Service } from '@/data/servicesData';
import VideoErrorBoundary from '@/components/video/VideoErrorBoundary';

interface ServiceDetailProps {
  service: Service;
  onClose: () => void;
}

const DetailContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: var(--spacing-md);
  padding: var(--spacing-lg);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: var(--spacing-md);
    grid-gap: var(--spacing-sm);
  }
`;

const VideoContainer = styled.div`
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 16/9;
  
  @media (max-width: 768px) {
    grid-row: 1;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Title = styled(motion.h3)`
  font-size: var(--font-size-large);
  margin-bottom: var(--spacing-sm);
  
  @media (max-width: 768px) {
    font-size: var(--font-size-medium);
  }
`;

const Description = styled(motion.p)`
  font-size: var(--font-size-medium);
  margin-bottom: var(--spacing-md);
  
  @media (max-width: 768px) {
    font-size: var(--font-size-small);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
`;

const Button = styled(motion.button)`
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 30px;
  font-size: var(--font-size-small);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
  }
`;

const PrimaryButton = styled(Button)`
  background-color: var(--color-primary);
  color: var(--color-text-light);
  border: none;
  
  &:hover {
    background-color: var(--color-primary-dark);
    transform: translateY(-2px);
  }
`;

const SecondaryButton = styled(Button)`
  background-color: transparent;
  color: var(--color-text);
  border: 2px solid var(--color-primary);
  
  &:hover {
    background-color: var(--color-primary-light);
    color: var(--color-text-light);
    transform: translateY(-2px);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: var(--font-size-medium);
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-primary);
  }
`;

const ServiceDetail: React.FC<ServiceDetailProps> = ({ service, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    // Play video when component mounts
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      videoRef.current.play().catch((error) => {
        console.error('Error playing video:', error);
      });
    }
    
    // Create keyboard event listener for escape key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);
  
  return (
    <DetailContainer>
      <CloseButton 
        onClick={onClose}
        aria-label="Close detail view"
      >
        ✕
      </CloseButton>
      
      <VideoContainer>
        <VideoErrorBoundary>
          <video
            ref={videoRef}
            width="100%"
            height="100%"
            loop
            muted
            playsInline
            preload="metadata"
            poster={service.thumbnailSrc}
          >
            {service.videoSources.map((source, idx) => (
              <source key={idx} src={source.src} type={source.type} />
            ))}
            Your browser does not support the video tag.
          </video>
        </VideoErrorBoundary>
      </VideoContainer>
      
      <ContentContainer>
        <div>
          <Title
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {service.title}
          </Title>
          
          <Description
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {service.description}
          </Description>
        </div>
        
        <ActionButtons>
          <PrimaryButton
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Request Quote
          </PrimaryButton>
          
          <SecondaryButton
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Examples
          </SecondaryButton>
        </ActionButtons>
      </ContentContainer>
    </DetailContainer>
  );
};

export default ServiceDetail; 