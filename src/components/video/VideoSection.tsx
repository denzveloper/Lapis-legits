'use client';

import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, useScroll, useTransform } from 'framer-motion';

interface VideoSectionProps {
  title: string;
  videoSrc: string;
  description: string;
  reverse?: boolean;
}

const SectionContainer = styled.div<{ $reverse?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  margin: var(--spacing-xl) 0;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
  
  ${props => props.$reverse && `
    direction: rtl;
    
    @media (max-width: 768px) {
      direction: ltr;
    }
  `}
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  direction: ltr;
  padding: var(--spacing-lg);
`;

const VideoContainer = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  aspect-ratio: 16 / 9;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.2) 0%,
      rgba(0, 0, 0, 0) 50%,
      rgba(0, 0, 0, 0.2) 100%
    );
    z-index: 1;
    pointer-events: none;
  }
`;

const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Title = styled.h3`
  font-size: var(--font-size-large);
  margin-bottom: var(--spacing-md);
`;

const Description = styled.p`
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-lg);
`;

const Button = styled.a`
  display: inline-block;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 2px solid var(--color-accent);
  color: var(--color-accent);
  font-weight: 500;
  border-radius: 4px;
  transition: all var(--transition-fast);
  align-self: flex-start;
  
  &:hover {
    background-color: var(--color-accent);
    color: var(--color-secondary);
  }
`;

export default function VideoSection({ title, videoSrc, description, reverse = false }: VideoSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.4, 1, 1, 0.4]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.95]);
  
  useEffect(() => {
    if (!window.IntersectionObserver) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        
        if (entry.isIntersecting && videoRef.current) {
          videoRef.current.play().catch(error => {
            console.error("Error playing video:", error);
          });
        } else if (videoRef.current) {
          videoRef.current.pause();
        }
      },
      { threshold: 0.3 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);
  
  return (
    <SectionContainer ref={sectionRef} $reverse={reverse}>
      <motion.div
        style={{ opacity, scale }}
        initial={{ x: reverse ? 50 : -50, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <VideoContainer>
          <VideoElement
            ref={videoRef}
            muted
            loop
            playsInline
            src={videoSrc}
            poster="/images/placeholder.jpg"
          />
        </VideoContainer>
      </motion.div>
      
      <ContentContainer>
        <motion.div
          initial={{ x: reverse ? -50 : 50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <Title>{title}</Title>
          <Description>{description}</Description>
          <Button href="#">View Project</Button>
        </motion.div>
      </ContentContainer>
    </SectionContainer>
  );
}
