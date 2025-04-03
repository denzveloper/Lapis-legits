import { useState, useEffect } from 'react';

// A hook to determine grid columns based on screen size
export function useResponsiveGrid() {
  const [columnCount, setColumnCount] = useState(4);
  
  useEffect(() => {
    // Function to update column count based on window width
    const updateColumnCount = () => {
      const width = window.innerWidth;
      
      if (width < 640) { // Mobile
        setColumnCount(1);
      } else if (width < 1024) { // Tablet
        setColumnCount(2);
      } else if (width < 1280) { // Small Desktop
        setColumnCount(3);
      } else { // Large Desktop
        setColumnCount(4);
      }
    };
    
    // Set initial count
    updateColumnCount();
    
    // Add event listener for resize
    window.addEventListener('resize', updateColumnCount);
    
    // Clean up event listener
    return () => window.removeEventListener('resize', updateColumnCount);
  }, []);
  
  return columnCount;
} 