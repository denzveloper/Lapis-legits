'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import CanvasVideoRenderer from '../../components/video/CanvasVideoRenderer';
import VideoPlaceholder from '../../components/video/VideoPlaceholder';
import VideoErrorBoundary from '../../components/video/VideoErrorBoundary';
import { getPlaceholderVideoUrl } from '../../utils/videoErrorHandling';
import { fadeEffect } from '../../utils/videoEffects';

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

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  margin: 1rem 0;
  color: #333;
`;

const SectionDescription = styled.p`
  margin-bottom: 1.5rem;
  color: #555;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const Button = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2980b9;
  }
`;

// Type for video source configuration
interface VideoConfig {
  id: string;
  label: string;
  sources: Array<{
    src: string;
    type: string;
  }>;
  poster?: string;
  broken?: boolean;
}

export default function VideoErrorTest() {
  // Demo video configurations
  const videoConfigs: VideoConfig[] = [
    {
      id: 'working',
      label: 'Working Video',
      sources: [
        {
          src: 'https://storage.googleapis.com/web-dev-assets/video-and-source-tags/chrome.mp4',
          type: 'video/mp4'
        },
        {
          src: 'https://storage.googleapis.com/web-dev-assets/video-and-source-tags/chrome.webm',
          type: 'video/webm'
        }
      ],
      poster: 'https://storage.googleapis.com/web-dev-assets/video-and-source-tags/poster.jpg'
    },
    {
      id: 'broken',
      label: 'Broken Video URL',
      sources: [
        {
          src: 'https://example.com/non-existent-video.mp4',
          type: 'video/mp4'
        }
      ]
    },
    {
      id: 'timeout',
      label: 'Timeout Simulation',
      sources: [
        // This is a very large video that will likely timeout during loading
        {
          src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
          type: 'video/mp4'
        }
      ]
    },
    {
      id: 'unsupported',
      label: 'Unsupported Format',
      sources: [
        {
          src: 'https://example.com/unsupported-video.xyz',
          type: 'video/xyz'
        }
      ]
    }
  ];
  
  // State for demo
  const [selectedVideo, setSelectedVideo] = useState<VideoConfig>(videoConfigs[0]);
  const [showPlaceholderDemo, setShowPlaceholderDemo] = useState(false);
  const [placeholderState, setPlaceholderState] = useState<'loading' | 'error'>('loading');
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Simulate progress animation for demo
  React.useEffect(() => {
    if (showPlaceholderDemo && placeholderState === 'loading') {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          const newValue = prev + 0.05;
          if (newValue >= 1) {
            clearInterval(interval);
            return 1;
          }
          return newValue;
        });
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [showPlaceholderDemo, placeholderState]);
  
  // Reset progress when switching back to loading state
  React.useEffect(() => {
    if (placeholderState === 'loading') {
      setLoadingProgress(0);
    }
  }, [placeholderState]);
  
  return (
    <PageContainer>
      <Heading>Video Error Handling & Placeholders</Heading>
      <Description>
        This page demonstrates the error handling capabilities and placeholder components 
        for video playback. Try different video sources to see how errors are handled.
      </Description>
      
      <VideoSection>
        <SectionTitle>Video Player with Error Handling</SectionTitle>
        <SectionDescription>
          Select different video sources to test error handling and retry mechanisms.
        </SectionDescription>
        
        <ButtonContainer>
          {videoConfigs.map(config => (
            <Button 
              key={config.id}
              onClick={() => setSelectedVideo(config)}
              style={{ 
                backgroundColor: selectedVideo.id === config.id ? '#2980b9' : '#3498db',
                opacity: selectedVideo.id === config.id ? 1 : 0.8
              }}
            >
              {config.label}
            </Button>
          ))}
        </ButtonContainer>
        
        <VideoErrorBoundary>
          <CanvasVideoRenderer
            sources={selectedVideo.sources}
            poster={selectedVideo.poster}
            effects={[fadeEffect]}
            aspectRatio="16 / 9"
            playOnScroll={true}
            playThreshold={0.3}
            initiallyMuted={true}
            loop={true}
          />
        </VideoErrorBoundary>
      </VideoSection>
      
      <VideoSection>
        <SectionTitle>Placeholder Component Demo</SectionTitle>
        <SectionDescription>
          This demonstrates the placeholder component in isolation.
        </SectionDescription>
        
        <ButtonContainer>
          <Button 
            onClick={() => {
              setShowPlaceholderDemo(true);
              setPlaceholderState('loading');
              setLoadingProgress(0);
            }}
          >
            Show Loading State
          </Button>
          <Button 
            onClick={() => {
              setShowPlaceholderDemo(true);
              setPlaceholderState('error');
            }}
          >
            Show Error State
          </Button>
          <Button 
            onClick={() => {
              setShowPlaceholderDemo(false);
            }}
          >
            Hide Placeholder
          </Button>
        </ButtonContainer>
        
        {showPlaceholderDemo ? (
          <VideoPlaceholder 
            state={placeholderState}
            progress={loadingProgress}
            errorMessage="This is a demo error message. The video could not be loaded."
            onRetry={() => alert('Retry clicked')}
            thumbnailSrc="https://storage.googleapis.com/web-dev-assets/video-and-source-tags/poster.jpg"
          />
        ) : (
          <div style={{ 
            width: '100%', 
            aspectRatio: '16 / 9', 
            backgroundColor: '#f0f0f0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '4px'
          }}>
            Click a button above to show placeholder
          </div>
        )}
      </VideoSection>
      
      <VideoSection>
        <SectionTitle>Placeholder Video Gallery</SectionTitle>
        <SectionDescription>
          These are the built-in placeholder videos available for development.
        </SectionDescription>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {[0, 1, 2, 3, 4].map((index) => {
            const sources = getPlaceholderVideoUrl(index).map(url => ({
              src: url,
              type: 'video/mp4'
            }));
            
            return (
              <div key={index} style={{ marginBottom: '1rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>Placeholder {index + 1}</h3>
                <CanvasVideoRenderer
                  sources={sources}
                  aspectRatio="16 / 9"
                  playOnScroll={true}
                  initiallyMuted={true}
                  loop={true}
                  effects={[fadeEffect]}
                />
              </div>
            );
          })}
        </div>
      </VideoSection>
    </PageContainer>
  );
} 