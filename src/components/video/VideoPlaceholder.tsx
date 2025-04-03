'use client';

import React from 'react';
import styled, { keyframes } from 'styled-components';

interface VideoPlaceholderProps {
  /**
   * Aspect ratio of the placeholder
   * @default '16 / 9'
   */
  aspectRatio?: string;
  
  /**
   * Whether the video is loading or has an error
   * @default 'loading'
   */
  state?: 'loading' | 'error';
  
  /**
   * Error message to display (only used when state is 'error')
   */
  errorMessage?: string;
  
  /**
   * Function to call when retry button is clicked
   */
  onRetry?: () => void;
  
  /**
   * Optional thumbnail image to show in the background
   */
  thumbnailSrc?: string;
  
  /**
   * Optional class name for styling
   */
  className?: string;
  
  /**
   * Custom loading message
   */
  loadingMessage?: string;
  
  /**
   * Loading progress (0-1)
   */
  progress?: number;
  
  /**
   * Whether to show progress indicator
   * @default true
   */
  showProgress?: boolean;
  
  /**
   * Timeout in milliseconds before showing a slow connection message
   * @default 10000 (10 seconds)
   */
  slowConnectionTimeout?: number;
}

// Animations
const pulse = keyframes`
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Styled components
const PlaceholderContainer = styled.div<{ aspectRatio: string; hasThumbnail: boolean }>`
  position: relative;
  width: 100%;
  aspect-ratio: ${props => props.aspectRatio};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.hasThumbnail ? 'transparent' : '#1a1a1a'};
  color: white;
  border-radius: 4px;
  overflow: hidden;
`;

const ThumbnailBackground = styled.div<{ src: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  filter: blur(2px) brightness(0.7);
  z-index: 0;
`;

const ContentOverlay = styled.div<{ isLoading: boolean }>`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  text-align: center;
  background-color: ${props => props.isLoading ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.7)'};
  width: 100%;
  height: 100%;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite;
  margin-bottom: 1rem;
`;

const LoadingText = styled.p`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  animation: ${pulse} 2s infinite ease-in-out;
`;

const ProgressBar = styled.div`
  width: 200px;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin-top: 1rem;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  width: ${props => props.progress * 100}%;
  background-color: #3498db;
  transition: width 0.3s ease;
`;

const ErrorTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

const ErrorMessage = styled.p`
  font-size: 0.9rem;
  margin-bottom: 1rem;
  opacity: 0.8;
  max-width: 80%;
`;

const RetryButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2980b9;
  }
`;

const SlowConnectionMessage = styled.p`
  font-size: 0.8rem;
  opacity: 0.7;
  margin-top: 1rem;
`;

const VideoPlaceholder: React.FC<VideoPlaceholderProps> = ({
  aspectRatio = '16 / 9',
  state = 'loading',
  errorMessage = 'Failed to load video',
  onRetry,
  thumbnailSrc,
  className,
  loadingMessage = 'Loading video...',
  progress = 0,
  showProgress = true,
  slowConnectionTimeout = 10000
}) => {
  const [showSlowConnection, setShowSlowConnection] = React.useState(false);
  
  // Show slow connection message after timeout
  React.useEffect(() => {
    if (state === 'loading') {
      const timeoutId = setTimeout(() => {
        setShowSlowConnection(true);
      }, slowConnectionTimeout);
      
      return () => clearTimeout(timeoutId);
    }
    
    setShowSlowConnection(false);
  }, [state, slowConnectionTimeout]);
  
  return (
    <PlaceholderContainer 
      aspectRatio={aspectRatio} 
      className={className}
      hasThumbnail={!!thumbnailSrc}
    >
      {thumbnailSrc && <ThumbnailBackground src={thumbnailSrc} />}
      
      <ContentOverlay isLoading={state === 'loading'}>
        {state === 'loading' ? (
          <>
            <LoadingSpinner />
            <LoadingText>{loadingMessage}</LoadingText>
            
            {showProgress && (
              <ProgressBar>
                <ProgressFill progress={progress} />
              </ProgressBar>
            )}
            
            {showSlowConnection && (
              <SlowConnectionMessage>
                This is taking longer than expected. Please check your connection.
              </SlowConnectionMessage>
            )}
          </>
        ) : (
          <>
            <ErrorTitle>⚠️ Error</ErrorTitle>
            <ErrorMessage>{errorMessage}</ErrorMessage>
            {onRetry && (
              <RetryButton onClick={onRetry}>
                Try Again
              </RetryButton>
            )}
          </>
        )}
      </ContentOverlay>
    </PlaceholderContainer>
  );
};

export default VideoPlaceholder; 