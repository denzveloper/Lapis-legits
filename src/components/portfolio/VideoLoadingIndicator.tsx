'use client';

import React from 'react';

interface VideoLoadingIndicatorProps {
  progress: number;
  className?: string;
}

const VideoLoadingIndicator: React.FC<VideoLoadingIndicatorProps> = ({ 
  progress, 
  className = '' 
}) => {
  // Ensure progress is between 0 and 1
  const normalizedProgress = Math.max(0, Math.min(1, progress));
  const progressPercent = Math.round(normalizedProgress * 100);
  
  return (
    <div className={`relative ${className}`}>
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-black transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      {/* Show percentage text only if progress has started but not complete */}
      {progress > 0 && progress < 0.99 && (
        <div className="absolute bottom-2 right-0 text-xs font-medium text-gray-600">
          {progressPercent}%
        </div>
      )}
    </div>
  );
};

export default VideoLoadingIndicator; 