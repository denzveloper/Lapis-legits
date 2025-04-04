import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Service } from '@/data/servicesData';
import VideoErrorBoundary from '@/components/video/VideoErrorBoundary';
import VideoPlaceholder from '@/components/video/VideoPlaceholder';

interface ServiceCardProps {
  service: Service;
  index: number;
  onClick: (service: Service) => void;
  isActive: boolean;
}

const Card = styled(motion.div)<{ $isActive: boolean }>`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background-color: ${props => props.$isActive ? 'var(--color-background-light)' : 'var(--color-background)'};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  aspect-ratio: 16/9;
  cursor: pointer;
  transform-origin: center;
  
  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  }
`;

const CardContent = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-md);
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0));
  z-index: 2;
  
  @media (max-width: 768px) {
    padding: var(--spacing-sm);
  }
`;

const ServiceTitle = styled.h3`
  font-size: var(--font-size-medium);
  margin-bottom: var(--spacing-xs);
  color: var(--color-text-light);
  
  @media (max-width: 768px) {
    font-size: var(--font-size-small);
  }
`;

const ServiceDescription = styled.p`
  font-size: var(--font-size-small);
  color: var(--color-text-light);
  opacity: 0.9;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: var(--font-size-xsmall);
  }
`;

const VideoContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const cardVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: (custom: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: 0.05 * custom,
      duration: 0.4
    }
  }),
  hover: { scale: 1.03, transition: { duration: 0.3 } },
  tap: { scale: 0.97 }
};

const ServiceCard: React.FC<ServiceCardProps> = ({ service, index, onClick, isActive }) => {
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );
    
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    
    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (videoRef.current) {
      if (isInView && isActive) {
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        videoRef.current.play().catch((error) => {
          console.error('Error playing video:', error);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isInView, isActive]);
  
  return (
    <Card
      ref={cardRef}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      custom={index}
      $isActive={isActive}
      onClick={() => onClick(service)}
      aria-label={`Service: ${service.title}`}
    >
      <VideoContainer>
        <VideoErrorBoundary>
          {isInView ? (
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
          ) : (
            <VideoPlaceholder
              thumbnailSrc={service.thumbnailSrc}
              loadingMessage="Loading preview..."
              aspectRatio="16/9"
            />
          )}
        </VideoErrorBoundary>
      </VideoContainer>
      
      <CardContent>
        <ServiceTitle>{service.title}</ServiceTitle>
        <ServiceDescription>{service.shortDescription}</ServiceDescription>
      </CardContent>
    </Card>
  );
};

export default ServiceCard; 