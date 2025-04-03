'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import ScrollVideoPlayer from '../../components/video/ScrollVideoPlayer';
import { preloadVideosInAdvance, clearVideoPreloadCache } from '../../hooks/useVideoPreload';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.header`
  margin-bottom: 2rem;
`;

const BackLink = styled(Link)`
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #333;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const Description = styled.p`
  color: #666;
  margin-bottom: 2rem;
`;

const Section = styled.section`
  margin-bottom: 4rem;
`;

const SectionHeader = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const SectionContent = styled.div`
  margin-bottom: 1rem;
`;

const CodeExample = styled.pre`
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  margin-bottom: 2rem;
`;

// New section for preloading demo
const ToggleButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;

  &:hover {
    background-color: #2980b9;
  }

  &:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  margin-top: 1rem;
  margin-bottom: 1rem;
`;

const VideoTest: React.FC = () => {
  // Sample video sources for testing
  const sampleVideoSources = [
    {
      src: 'https://storage.googleapis.com/web-dev-assets/video-and-source-tags/chrome.mp4',
      type: 'video/mp4'
    }
  ];
  
  const shortVideoSources = [
    {
      src: 'https://storage.googleapis.com/web-dev-assets/video-and-source-tags/chrome.webm',
      type: 'video/webm'
    }
  ];
  
  // Preload videos when the page loads
  useEffect(() => {
    // Preload videos that will be needed soon
    preloadVideosInAdvance([
      {
        sources: sampleVideoSources,
        options: {
          priority: 2, // High priority
        }
      },
      {
        sources: shortVideoSources,
        options: {
          priority: 1, // Lower priority
          metadataOnly: true // Just preload metadata to save bandwidth
        }
      }
    ]);
    
    // Clean up preloaded videos when unmounting
    return () => {
      clearVideoPreloadCache();
    };
  }, []);
  
  return (
    <Container>
      <Header>
        <BackLink href="/">← Back to Home</BackLink>
        <Title>Scroll-Triggered Video Player Demo</Title>
        <Description>
          This page demonstrates the ScrollVideoPlayer component which integrates with the useScrollVideo hook
          to control video playback based on scroll position.
        </Description>
      </Header>
      
      <Section>
        <SectionHeader>Basic Usage</SectionHeader>
        <SectionContent>
          The ScrollVideoPlayer component automatically starts and stops video playback
          based on the scroll position. Scroll down to see the video start playing
          as it enters the viewport.
        </SectionContent>
        
        <CodeExample>
          {`
<ScrollVideoPlayer
  sources={[
    { src: 'path/to/video.mp4', type: 'video/mp4' }
  ]}
/>
          `}
        </CodeExample>
        
        <ScrollVideoPlayer
          sources={sampleVideoSources}
          aspectRatio="16 / 9"
        />
      </Section>
      
      <Section>
        <SectionHeader>Customized Aspect Ratio</SectionHeader>
        <SectionContent>
          You can customize the aspect ratio of the video container. Here's an example with a 21:9 aspect ratio.
        </SectionContent>
        
        <CodeExample>
          {`
<ScrollVideoPlayer
  sources={[
    { src: 'path/to/video.mp4', type: 'video/mp4' }
  ]}
  aspectRatio="21 / 9"
/>
          `}
        </CodeExample>
        
        <ScrollVideoPlayer
          sources={shortVideoSources}
          aspectRatio="21 / 9"
        />
      </Section>
      
      <Section>
        <SectionHeader>Custom Play Threshold</SectionHeader>
        <SectionContent>
          Control when videos start playing by adjusting the play threshold. This video will
          only start playing when 50% of it is visible in the viewport.
        </SectionContent>
        
        <CodeExample>
          {`
<ScrollVideoPlayer
  sources={[
    { src: 'path/to/video.mp4', type: 'video/mp4' }
  ]}
  playThreshold={0.5}
/>
          `}
        </CodeExample>
        
        <ScrollVideoPlayer
          sources={sampleVideoSources}
          playThreshold={0.5}
        />
      </Section>
      
      <Section>
        <SectionHeader>Multiple Players</SectionHeader>
        <SectionContent>
          You can have multiple video players on the same page. Each one will independently
          track its scroll position and play/pause accordingly.
        </SectionContent>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <ScrollVideoPlayer
            sources={sampleVideoSources}
            aspectRatio="1 / 1"
          />
          <ScrollVideoPlayer
            sources={shortVideoSources}
            aspectRatio="1 / 1"
          />
        </div>
      </Section>
      
      <Section>
        <SectionHeader>Scroll Indicator</SectionHeader>
        <SectionContent>
          The progress bar at the bottom of each video shows its scroll progress through the viewport.
          Experiment by scrolling the page and watching how the indicator updates in real-time.
        </SectionContent>
        
        <ScrollVideoPlayer
          sources={sampleVideoSources}
        />
      </Section>
      
      <Section>
        <SectionHeader>Preloading Strategy</SectionHeader>
        <SectionContent>
          This page demonstrates a video preloading strategy that improves playback performance
          by loading videos before they're needed. The videos below are preloaded as soon as the page loads
          or when other videos come into view.
        </SectionContent>
        
        <CodeExample>
          {`
// Preload videos that will be needed soon
preloadVideosInAdvance([
  {
    sources: videoSources,
    options: {
      priority: 2, // Higher priority videos load first
      metadataOnly: false // Preload the entire video
    }
  }
]);
          `}
        </CodeExample>
        
        <ScrollVideoPlayer
          sources={sampleVideoSources}
          usePreloading={true}
          preloadPriority={2}
        />
      </Section>
      
      <Section>
        <SectionHeader>Preloading with Progress Indicator</SectionHeader>
        <SectionContent>
          The ScrollVideoPlayer component can display loading progress when preloading videos.
          This is especially useful for larger videos or slower connections.
        </SectionContent>
        
        <ScrollVideoPlayer
          sources={shortVideoSources}
          usePreloading={true}
          preloadPriority={1}
        />
      </Section>
      
      <Section>
        <SectionHeader>Comparison: With vs Without Preloading</SectionHeader>
        <SectionContent>
          Compare the loading behavior of videos with and without the preloading strategy.
          The video on the left uses preloading, while the one on the right doesn't.
        </SectionContent>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <h3 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>With Preloading</h3>
            <ScrollVideoPlayer
              sources={sampleVideoSources}
              usePreloading={true}
            />
          </div>
          <div>
            <h3 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Without Preloading</h3>
            <ScrollVideoPlayer
              sources={sampleVideoSources}
              usePreloading={false}
            />
          </div>
        </div>
      </Section>
      
      <Section>
        <SectionHeader>Metadata-Only Preloading</SectionHeader>
        <SectionContent>
          For bandwidth-sensitive applications, you can preload only the video metadata.
          This still improves initial playback time while using much less data.
        </SectionContent>
        
        <CodeExample>
          {`
<ScrollVideoPlayer
  sources={[
    { src: 'path/to/video.mp4', type: 'video/mp4' }
  ]}
  usePreloading={true}
  preloadMetadataOnly={true}
/>
          `}
        </CodeExample>
        
        <ScrollVideoPlayer
          sources={shortVideoSources}
          usePreloading={true}
          preloadMetadataOnly={true}
        />
      </Section>
      
      <div style={{ margin: '3rem 0', textAlign: 'center' }}>
        <BackLink href="/">← Back to Home</BackLink>
      </div>
    </Container>
  );
};

export default VideoTest; 