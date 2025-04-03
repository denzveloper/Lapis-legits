import { useState, useEffect } from 'react';
import videoPreloader, { PreloadOptions, VideoSource } from '../utils/videoPreloader';

interface UseVideoPreloadResult {
  /**
   * Preloaded video element that can be used for playback
   * Will be null until preloading is complete
   */
  videoElement: HTMLVideoElement | null;
  
  /**
   * Current loading progress (0-1)
   */
  progress: number;
  
  /**
   * Whether the video has been fully preloaded
   */
  isLoaded: boolean;
  
  /**
   * Whether the preloading is currently in progress
   */
  isLoading: boolean;
  
  /**
   * Error message if preloading failed
   */
  error: string | null;
}

/**
 * React hook for preloading videos with progress tracking
 * 
 * @param sources - Array of video sources in different formats
 * @param options - Preloading options
 * @returns Object with preloaded video element and loading state
 */
export const useVideoPreload = (
  sources: VideoSource[],
  options: Omit<PreloadOptions, 'onComplete' | 'onProgress' | 'onError'> = {}
): UseVideoPreloadResult => {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Reset state when sources change
    setProgress(0);
    setIsLoaded(false);
    setIsLoading(true);
    setError(null);
    
    // Check if video is already preloaded
    if (videoPreloader.isVideoPreloaded(sources)) {
      const preloadedVideo = videoPreloader.getPreloadedVideo(sources);
      setVideoElement(preloadedVideo);
      setProgress(1);
      setIsLoaded(true);
      setIsLoading(false);
      return;
    }
    
    // Start preloading the video
    const preloadOptions: PreloadOptions = {
      ...options,
      onProgress: (loadProgress: number) => {
        setProgress(loadProgress);
      },
      onComplete: () => {
        const videoEl = videoPreloader.getPreloadedVideo(sources);
        setVideoElement(videoEl);
        setIsLoaded(true);
        setIsLoading(false);
      },
      onError: (err: Error | string) => {
        console.error('Video preloading error:', err);
        setError(typeof err === 'string' ? err : err.message);
        setIsLoading(false);
      }
    };
    
    videoPreloader.preloadVideo(sources, preloadOptions);
    
    // Cleanup function
    return () => {
      // We don't clear the cache here since other components might use the same video
      // The cache cleanup should be handled at a higher level when appropriate
    };
  }, [sources, options.metadataOnly, options.priority]);
  
  return {
    videoElement,
    progress,
    isLoaded,
    isLoading,
    error
  };
};

/**
 * Preload multiple videos in advance without waiting for the result
 * Useful for preloading videos that will be needed later
 * 
 * @param videosToPreload - Array of video sources and their preload options
 */
export const preloadVideosInAdvance = (
  videosToPreload: Array<{
    sources: VideoSource[];
    options?: Omit<PreloadOptions, 'onComplete' | 'onProgress' | 'onError'>;
  }>
): void => {
  videoPreloader.preloadVideos(
    videosToPreload.map(video => ({
      sources: video.sources,
      options: video.options
    }))
  );
};

/**
 * Clear all preloaded videos from cache
 * Call this when navigating away from pages with videos to free memory
 */
export const clearVideoPreloadCache = (): void => {
  videoPreloader.clearPreloadCache();
};

export default useVideoPreload; 