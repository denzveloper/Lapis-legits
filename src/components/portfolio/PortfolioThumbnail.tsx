import React from 'react';
import { PortfolioItem } from '@/data/portfolioData';
import PlaceholderImage from './PlaceholderImage';
import VideoLoadingIndicator from './VideoLoadingIndicator';

interface PortfolioThumbnailProps {
  item: PortfolioItem;
  onClick: () => void;
  loadingProgress?: number;
  showLoadingIndicator?: boolean;
}

const PortfolioThumbnail: React.FC<PortfolioThumbnailProps> = ({ 
  item, 
  onClick,
  loadingProgress = 0,
  showLoadingIndicator = false
}) => {
  // Format date for better display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short',
    }).format(date);
  };

  // Truncate description for preview
  const truncateDescription = (text: string, maxLength: number = 65) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div 
      className="group relative overflow-hidden rounded-lg shadow-md bg-white hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col h-full"
      onClick={onClick}
    >
      {/* Thumbnail container with aspect ratio */}
      <div className="relative aspect-video overflow-hidden">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10"></div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <button className="bg-white text-black px-4 py-2 rounded-full font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform">
            View Project
          </button>
        </div>
        {/* Placeholder Image */}
        <PlaceholderImage title={item.title} />
        
        {/* Loading indicator */}
        {showLoadingIndicator && loadingProgress > 0 && loadingProgress < 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-30 px-2 pb-2">
            <VideoLoadingIndicator progress={loadingProgress} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-bold">{item.title}</h3>
          <span className="text-xs text-gray-500">{formatDate(item.date)}</span>
        </div>
        <p className="text-sm text-gray-600 mb-2 flex justify-between">
          <span>Client: {item.client}</span>
        </p>
        
        {item.description && (
          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
            {truncateDescription(item.description)}
          </p>
        )}
        
        <div className="flex flex-wrap gap-1 mt-auto">
          {item.category.map(cat => (
            <span
              key={`${item.id}-${cat}`}
              className="bg-gray-100 text-xs px-2 py-1 rounded"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioThumbnail; 