import React from 'react';

const PortfolioLoading: React.FC = () => {
  // Create an array with 8 items to match our sample data
  const skeletonItems = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {skeletonItems.map(index => (
        <div key={index} className="animate-pulse rounded-lg overflow-hidden shadow-md bg-white">
          {/* Thumbnail skeleton */}
          <div className="relative aspect-video bg-gray-300"></div>
          
          {/* Content skeleton */}
          <div className="p-4">
            <div className="h-5 bg-gray-200 rounded mb-2 w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded mb-3 w-1/2"></div>
            <div className="flex gap-1">
              <div className="h-3 bg-gray-200 rounded w-12 px-2 py-1"></div>
              <div className="h-3 bg-gray-200 rounded w-16 px-2 py-1"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PortfolioLoading; 