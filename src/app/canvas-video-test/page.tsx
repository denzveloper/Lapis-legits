'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import CanvasVideoRenderer from '../../components/video/CanvasVideoRenderer';
import {
  fadeEffect,
  zoomEffect,
  blurEffect,
  grayscaleEffect,
  splitScreenEffect,
  EffectPipeline
} from '../../utils/videoEffects';

// Styled components
const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Heading = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #333;
`;

const Description = styled.p`
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.6;
  color: #555;
`;

const VideoSection = styled.section`
  margin-bottom: 5rem; // Extra space to allow scrolling
`;

const EffectTitle = styled.h2`
  font-size: 1.8rem;
  margin: 1rem 0;
  color: #333;
`;

const EffectDescription = styled.p`
  margin-bottom: 1.5rem;
  color: #555;
`;

const EffectSelector = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const EffectButton = styled.button<{ isActive: boolean }>`
  padding: 0.5rem 1rem;
  background-color: ${props => props.isActive ? '#3498db' : '#f0f0f0'};
  color: ${props => props.isActive ? 'white' : '#333'};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.isActive ? '#2980b9' : '#e0e0e0'};
  }
`;

// Sample video sources
const sampleVideoSources = [
  {
    src: 'https://storage.googleapis.com/web-dev-assets/video-and-source-tags/chrome.mp4',
    type: 'video/mp4'
  },
  {
    src: 'https://storage.googleapis.com/web-dev-assets/video-and-source-tags/chrome.webm',
    type: 'video/webm'
  }
];

// Effect options
const effectOptions = [
  { name: 'Fade', effect: fadeEffect },
  { name: 'Zoom', effect: zoomEffect },
  { name: 'Blur', effect: blurEffect },
  { name: 'Grayscale', effect: grayscaleEffect },
  { name: 'Split Screen', effect: splitScreenEffect },
  { 
    name: 'Combined (Zoom + Fade)', 
    effect: EffectPipeline.create()
      .add(zoomEffect)
      .add(fadeEffect)
      .build() 
  },
  { 
    name: 'Combined (Blur + Grayscale)', 
    effect: EffectPipeline.create()
      .add(blurEffect)
      .add(grayscaleEffect)
      .build() 
  }
];

export default function CanvasVideoTest() {
  const [selectedEffect, setSelectedEffect] = useState(effectOptions[0]);
  
  return (
    <PageContainer>
      <Heading>Canvas Video Renderer Test</Heading>
      <Description>
        This page demonstrates a canvas-based video rendering system that allows for 
        applying dynamic effects based on scroll position. Scroll down to see the 
        video transitions activate.
      </Description>
      
      <EffectSelector>
        <p><strong>Select Effect: </strong></p>
        {effectOptions.map((option) => (
          <EffectButton 
            key={option.name}
            isActive={selectedEffect.name === option.name}
            onClick={() => setSelectedEffect(option)}
          >
            {option.name}
          </EffectButton>
        ))}
      </EffectSelector>
      
      <VideoSection>
        <EffectTitle>{selectedEffect.name} Effect</EffectTitle>
        <EffectDescription>
          Scroll to see how the {selectedEffect.name.toLowerCase()} effect changes the video appearance.
        </EffectDescription>
        
        <CanvasVideoRenderer
          sources={sampleVideoSources}
          effects={[selectedEffect.effect]}
          aspectRatio="16 / 9"
          playOnScroll={true}
          playThreshold={0.3}
          initiallyMuted={true}
          loop={true}
          showControls={true}
        />
      </VideoSection>
      
      {/* Duplicate sections for comparison */}
      <VideoSection>
        <EffectTitle>Comparison: Standard HTML5 Video</EffectTitle>
        <EffectDescription>
          This is a standard HTML5 video player without canvas rendering for comparison.
        </EffectDescription>
        
        <div style={{ width: '100%', aspectRatio: '16 / 9' }}>
          <video
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            controls
            muted
            loop
            playsInline
            autoPlay
          >
            <source src={sampleVideoSources[0].src} type={sampleVideoSources[0].type} />
            <source src={sampleVideoSources[1].src} type={sampleVideoSources[1].type} />
            Your browser does not support the video tag.
          </video>
        </div>
      </VideoSection>
      
      {/* Multiple effect examples stacked */}
      <Heading>All Effects Gallery</Heading>
      <Description>
        Scroll through to see all available effects applied to different video sections.
      </Description>
      
      {effectOptions.map((option) => (
        <VideoSection key={option.name}>
          <EffectTitle>{option.name}</EffectTitle>
          <EffectDescription>
            {option.name} effect demonstration. Scroll to see the transition.
          </EffectDescription>
          
          <CanvasVideoRenderer
            sources={sampleVideoSources}
            effects={[option.effect]}
            aspectRatio="16 / 9"
            playOnScroll={true}
            playThreshold={0.3}
            initiallyMuted={true}
            loop={true}
          />
        </VideoSection>
      ))}
    </PageContainer>
  );
} 