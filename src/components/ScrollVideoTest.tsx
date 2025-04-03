import React from 'react';
import useScrollVideo from '../hooks/useScrollVideo';

interface ScrollVideoTestProps {
  height?: string;
  backgroundColor?: string;
}

const ScrollVideoTest: React.FC<ScrollVideoTestProps> = ({
  height = '100vh',
  backgroundColor = '#f0f0f0',
}) => {
  const [elementRef, scrollState] = useScrollVideo<HTMLDivElement>();
  
  return (
    <div
      ref={elementRef}
      style={{
        height,
        backgroundColor,
        padding: '1rem',
        marginBottom: '1rem',
        position: 'relative',
        transition: 'background-color 0.3s ease',
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: '20px',
          padding: '1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        <h2>Scroll Observer Test</h2>
        <div>
          <p><strong>Is Intersecting:</strong> {scrollState.isIntersecting ? 'Yes' : 'No'}</p>
          <p><strong>Intersection Ratio:</strong> {scrollState.intersectionRatio.toFixed(2)}</p>
          <p><strong>Scroll Progress:</strong> {scrollState.scrollProgress.toFixed(2)}</p>
          
          {/* Visual progress indicator */}
          <div
            style={{
              width: '100%',
              height: '20px',
              backgroundColor: '#ddd',
              borderRadius: '10px',
              marginTop: '1rem',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${scrollState.scrollProgress * 100}%`,
                height: '100%',
                backgroundColor: '#3498db',
                transition: 'width 0.1s ease',
              }}
            />
          </div>
          
          {/* Position indicator */}
          {scrollState.boundingClientRect && (
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Position:</strong></p>
              <p>Top: {Math.round(scrollState.boundingClientRect.top)}px</p>
              <p>Bottom: {Math.round(scrollState.boundingClientRect.bottom)}px</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScrollVideoTest; 