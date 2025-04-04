'use client';

import React from 'react';
import styled from 'styled-components';

interface IntersectionDebuggerProps {
  visibility: number[];
  activeIndex: number;
  totalSections: number;
}

const DebugContainer = styled.div`
  position: fixed;
  top: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 12px;
  border-radius: 5px;
  z-index: 1000;
  font-family: monospace;
  font-size: 12px;
  max-width: 300px;
  pointer-events: none;
`;

const DebugTitle = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
  font-size: 14px;
`;

const DebugItem = styled.div<{ isActive: boolean }>`
  margin: 3px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  ${props => props.isActive && 'font-weight: bold; color: #4caf50;'}
`;

const VisibilityBar = styled.div`
  width: 100px;
  height: 8px;
  background-color: #333;
  border-radius: 4px;
  margin-left: 10px;
  overflow: hidden;
`;

const VisibilityIndicator = styled.div<{ width: number }>`
  height: 100%;
  width: ${props => props.width}%;
  background-color: #4caf50;
  transition: width 0.2s ease;
`;

const IntersectionDebugger: React.FC<IntersectionDebuggerProps> = ({
  visibility,
  activeIndex,
  totalSections
}) => {
  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Format the visibility percentage
  const formatPercentage = (value: number): string => {
    return `${Math.round(value * 100)}%`;
  };

  return (
    <DebugContainer>
      <DebugTitle>Intersection Observer Debug</DebugTitle>
      {Array.from({ length: totalSections }).map((_, index) => (
        <DebugItem key={index} isActive={index === activeIndex}>
          <div>
            Section {index + 1}: {formatPercentage(visibility[index] || 0)}
            {index === activeIndex ? ' (active)' : ''}
          </div>
          <VisibilityBar>
            <VisibilityIndicator width={(visibility[index] || 0) * 100} />
          </VisibilityBar>
        </DebugItem>
      ))}
    </DebugContainer>
  );
};

export default IntersectionDebugger; 