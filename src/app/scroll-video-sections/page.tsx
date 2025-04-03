'use client';

import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import ScrollVideoController from '@/components/video/ScrollVideoController';

const Page = styled.div`
  min-height: 100vh;
`;

const NavBar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 1rem;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, transparent 100%);
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.5);
  font-weight: 500;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
`;

// Example transition sections for the ScrollVideoController
const videoTransitions = [
  {
    id: 'section-1',
    startPosition: 0,
    endPosition: 0.33,
    videoSrc: '/videos/hero-video.mp4',
    title: 'Captivating Visual Stories',
    subtitle: 'Award-winning production company creating unforgettable visual experiences'
  },
  {
    id: 'section-2',
    startPosition: 0.33,
    endPosition: 0.66,
    videoSrc: '/videos/commercial.mp4',
    title: 'Commercial Productions',
    subtitle: 'High-impact video content that drives engagement and conversions'
  },
  {
    id: 'section-3',
    startPosition: 0.66,
    endPosition: 1,
    videoSrc: '/videos/documentary.mp4',
    title: 'Documentary Storytelling',
    subtitle: 'Authentic narratives that connect with audiences on a deeper level'
  }
];

export default function ScrollVideoSections() {
  return (
    <Page>
      <NavBar>
        <NavLink href="/">Back to Home</NavLink>
        <NavLink href="/scroll-test">Scroll Test</NavLink>
      </NavBar>
      
      <ScrollVideoController 
        transitions={videoTransitions}
        preloadAll={false}
      />
    </Page>
  );
} 