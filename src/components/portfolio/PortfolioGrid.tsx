'use client';

import React, { useState, useEffect } from 'react';
import { portfolioItems, categories, PortfolioItem } from '@/data/portfolioData';
import PortfolioThumbnail from './PortfolioThumbnail';
import PortfolioLoading from './PortfolioLoading';
import PortfolioNavigation from './PortfolioNavigation';
import VideoModal from './VideoModal';
import { useResponsiveGrid } from '@/hooks/useResponsiveGrid';
import { usePortfolioVideos } from '@/hooks/usePortfolioVideos';
import dynamic from 'next/dynamic';

// Dynamically import VideoThumbnail with client-side only rendering to prevent SSR issues
const VideoThumbnailWithNoSSR = dynamic(
  () => import('./VideoThumbnail'),
  { ssr: false }
);

const PortfolioGrid: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useVideoThumbnails, setUseVideoThumbnails] = useState(false);
  const columnCount = useResponsiveGrid();

  // Filter items based on selected category
  const filteredItems = selectedCategory === 'All'
    ? portfolioItems
    : portfolioItems.filter(item => item.category.includes(selectedCategory));

  // Use our custom hook to manage video preloading
  const {
    isItemLoaded,
    getItemProgress,
    totalProgress,
  } = usePortfolioVideos(filteredItems, {
    batchSize: Math.min(3, filteredItems.length),
    metadataOnly: true,
    enablePreloading: !isLoading && useVideoThumbnails
  });

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Simulate loading when category changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [selectedCategory]);

  // Enable video thumbnails after initial load
  useEffect(() => {
    // Wait until the page has loaded to enhance with video thumbnails
    if (!isLoading) {
      // Start with a delay to ensure smooth initial render
      const timer = setTimeout(() => {
        setUseVideoThumbnails(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const handleItemClick = (itemId: string) => {
    const item = portfolioItems.find(item => item.id === itemId);
    if (item) {
      setSelectedItem(item);
    }
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  return (
    <div className="space-y-8">
      <PortfolioNavigation 
        currentCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        portfolioItems={portfolioItems}
      />

      {/* Loading state */}
      {isLoading ? (
        <PortfolioLoading />
      ) : (
        <>
          {/* Grid layout */}
          <div className={`grid gap-6 ${
            columnCount === 1 ? 'grid-cols-1' : 
            columnCount === 2 ? 'grid-cols-1 sm:grid-cols-2' : 
            columnCount === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}>
            {filteredItems.map(item => {
              const progress = getItemProgress(item.id);
              const isLoaded = isItemLoaded(item.id);
              
              return useVideoThumbnails && isLoaded ? (
                <VideoThumbnailWithNoSSR
                  key={item.id}
                  item={item}
                  onClick={() => handleItemClick(item.id)}
                />
              ) : (
                <PortfolioThumbnail 
                  key={item.id} 
                  item={item} 
                  onClick={() => handleItemClick(item.id)}
                  loadingProgress={progress}
                  showLoadingIndicator={useVideoThumbnails && !isLoaded}
                />
              );
            })}
          </div>

          {/* Empty state */}
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No projects found for this category.</p>
            </div>
          )}
        </>
      )}

      {/* Video Modal */}
      <VideoModal 
        item={selectedItem}
        isOpen={selectedItem !== null}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default PortfolioGrid; 