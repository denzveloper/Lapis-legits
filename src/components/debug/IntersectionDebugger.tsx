'use client';

import React from 'react';
import styled from 'styled-components';
import { debugFeatures, isDebugFeatureEnabled } from '@/utils/debugUtils';

interface IntersectionDebuggerProps {
  visibility: number[];
  activeIndex: number;
  totalSections: number;
}

const DebugContainer = styled.div`
  position: fixed;
  top: 20px;
  left: 20px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 15px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 14px;
  z-index: 1000;
  max-width: 300px;
  max-height: 80vh;
  overflow-y: auto;
  pointer-events: none;
`;

const Title = styled.div`
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 16px;
  color: #6aff6a;
`;

const SectionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SectionItem = styled.li<{ $isActive: boolean }>`
  padding: 6px 0;
  border-left: 3px solid ${props => props.$isActive ? '#6aff6a' : 'transparent'};
  padding-left: 10px;
  margin-bottom: 6px;
  transition: background-color 0.3s ease;
  background-color: ${props => props.$isActive ? 'rgba(106, 255, 106, 0.2)' : 'transparent'};
`;

const VisibilityBar = styled.div`
  height: 8px;
  background-color: #333;
  border-radius: 4px;
  margin-top: 5px;
  position: relative;
  overflow: hidden;
`;

const VisibilityFill = styled.div<{ $width: number }>`
  position: absolute;
  height: 100%;
  width: ${props => props.$width}%;
  background-color: ${props => {
    if (props.$width > 75) return '#6aff6a';
    if (props.$width > 50) return '#b8ff6a';
    if (props.$width > 25) return '#ffdd6a';
    return '#ff6a6a';
  }};
  border-radius: 4px;
  transition: width 0.3s ease, background-color 0.3s ease;
`;

const SectionLabel = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ThresholdMarker = styled.div`
  position: absolute;
  width: 2px;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.7);
  top: 0;
  z-index: 1;
`;

/**
 * Component for visualizing the Intersection Observer's visibility tracking
 * Only shown when debug mode is enabled
 */
const IntersectionDebugger: React.FC<IntersectionDebuggerProps> = ({ 
  visibility, 
  activeIndex,
  totalSections
}) => {
  // Format visibility percentage
  const formatVisibility = (value: number): string => {
    return `${Math.round(value * 100)}%`;
  };
  
  // Check if specific intersection observer debugging is enabled
  const isIntersectionDebugEnabled = isDebugFeatureEnabled(debugFeatures.INTERSECTION_OBSERVER);
  
  return (
    <DebugContainer>
      <Title>Intersection Observer Debug {isIntersectionDebugEnabled ? '(Enhanced)' : ''}</Title>
      <SectionList>
        {Array.from({ length: totalSections }).map((_, index) => (
          <SectionItem key={index} $isActive={activeIndex === index}>
            <SectionLabel>
              <span>Section {index + 1}</span>
              <span>{formatVisibility(visibility[index] || 0)}</span>
            </SectionLabel>
            <VisibilityBar>
              {/* Show threshold markers at 40% and 50% */}
              <ThresholdMarker style={{ left: '40%' }} />
              <ThresholdMarker style={{ left: '50%' }} />
              <VisibilityFill $width={(visibility[index] || 0) * 100} />
            </VisibilityBar>
            
            {/* Show additional details when enhanced debugging is enabled */}
            {isIntersectionDebugEnabled && (
              <div style={{ fontSize: '12px', marginTop: '5px', color: '#aaa' }}>
                Status: {visibility[index] > 0.5 ? 'Visible' : 'Hidden'} 
                | Threshold: {visibility[index] > 0.4 ? 'Passed' : 'Not Passed'}
              </div>
            )}
          </SectionItem>
        ))}
      </SectionList>
    </DebugContainer>
  );
};

export default IntersectionDebugger; 