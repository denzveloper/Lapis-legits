'use client';

import { useEffect, useState } from 'react';
import { PortfolioItem } from '@/data/portfolioData';
import * as videoPreloader from '@/utils/videoPreloader';
import { getVideoType } from '@/utils/videoHelpers';

interface UsePortfolioVideosOptions {
  /**
   * Number of items to preload at a time
   */
  batchSize?: number;
  
  /**
   * Delay between loading batches (ms)
   */
  batchDelay?: number;
  
  /**
   * Whether to preload only metadata (faster) or full videos (better UX)
   */
  metadataOnly?: boolean;
  
  /**
   * Callback when all videos are preloaded
   */
  onAllLoaded?: () => void;
  
  /**
   * Whether to enable preloading (can be disabled on low-end devices)
   */
  enablePreloading?: boolean;
}

export const usePortfolioVideos = (
  items: PortfolioItem[],
  options: UsePortfolioVideosOptions = {}
) => {
  const {
    batchSize = 3,
    batchDelay = 500,
    metadataOnly = true,
    onAllLoaded,
    enablePreloading = true
  } = options;
  
  const [loadedItems, setLoadedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<Record<string, number>>({});
  
  useEffect(() => {
    if (!enablePreloading || items.length === 0) return;
    
    setIsLoading(true);
    
    // Group items into batches for progressive loading
    const batches: PortfolioItem[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    
    // Function to load a single batch
    const loadBatch = async (batchIndex: number) => {
      if (batchIndex >= batches.length) {
        setIsLoading(false);
        onAllLoaded?.();
        return;
      }
      
      const currentBatch = batches[batchIndex];
      
      // Prepare videos for preloading
      const videosToPreload = currentBatch.map(item => ({
        sources: [{ src: item.videoUrl, type: getVideoType(item.videoUrl) }],
        options: {
          metadataOnly,
          priority: batches.length - batchIndex, // Earlier batches get higher priority
          onProgress: (progress: number) => {
            setLoadingProgress(prev => ({
              ...prev,
              [item.id]: progress
            }));
          },
          onComplete: () => {
            setLoadedItems(prev => [...prev, item.id]);
          }
        }
      }));
      
      // Start preloading the batch
      videoPreloader.preloadVideos(videosToPreload);
      
      // Schedule the next batch
      setTimeout(() => {
        loadBatch(batchIndex + 1);
      }, batchDelay);
    };
    
    // Start loading with the first batch
    loadBatch(0);
    
    // Cleanup function
    return () => {
      // Note: We don't clear video cache as other components might use it
    };
  }, [items, batchSize, batchDelay, metadataOnly, enablePreloading, onAllLoaded]);
  
  // Check if a specific item is loaded
  const isItemLoaded = (itemId: string) => loadedItems.includes(itemId);
  
  // Get the loading progress for a specific item
  const getItemProgress = (itemId: string) => loadingProgress[itemId] || 0;
  
  return {
    loadedItems,
    isLoading,
    loadingProgress,
    isItemLoaded,
    getItemProgress,
    totalProgress: loadedItems.length / items.length
  };
}; 