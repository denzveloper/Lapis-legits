/**
 * Client-side component for lazy-loading a video section with a smooth loading animation.
 * Uses Next.js dynamic imports to load the video section only when needed, improving performance.
 * Includes a styled loading spinner with fade-in/out animations for a polished user experience.
 * Also exports video-related constants for use throughout the application.
 */
'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { DynamicOptionsLoadingProps } from 'next/dynamic';

/**
 * Video configuration constants.
 * Contains timing, animation, and layout parameters for video components.
 */
export const VIDEO_CONSTANTS = {
  AUTOPLAY_DELAY: 2000,
  MOBILE_BREAKPOINT: 480,
  TABLET_BREAKPOINT: 768,
  SCROLL_INDICATOR_DELAY: 1000,
  VIDEO_PRELOAD_PRIORITY: {
    CURRENT: 5,
    NEXT: 3
  },
  ANIMATION_DELAYS: {
    TEXT_ANIMATION: 0.5,
    CONTROLS_FADE: 0.3,
    CONTROLS_DURATION: 0.4
  }
};

/**
 * Video positioning options for layout purposes.
 */
export const VIDEO_POSITIONS = {
  LEFT: 'left',
  RIGHT: 'right',
  CENTER: 'center'
} as const;

/**
 * Text animation style options for video overlays.
 */
export const TEXT_ANIMATIONS = {
  TYPEWRITER: 'typewriter',
  SCRAMBLE: 'scramble',
  SPLIT: 'split',
  FADE: 'fade',
  NONE: 'none'
} as const;

/**
 * Styled container for the loading spinner.
 * - Full viewport height (100vh) to cover the entire screen.
 * - Semi-transparent black background to overlay content.
 * - Flexbox centering for the spinner.
 */
const LoadingContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
`;

/**
 * Styled loading spinner with smooth rotation animation.
 * - Circular design with a white top border for visibility.
 * - Infinite 360-degree rotation animation.
 */
const LoadingSpinner = styled(motion.div)`
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: white;
`;

/**
 * Loading placeholder component with animations.
 * @param {DynamicOptionsLoadingProps} props - Props from Next.js dynamic import.
 * @returns {JSX.Element} - Rendered loading spinner with fade animations.
 */
const LoadingPlaceholder = (props: DynamicOptionsLoadingProps): JSX.Element => (
  <LoadingContainer
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <LoadingSpinner
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  </LoadingContainer>
);

/**
 * Dynamically imported video section component.
 * - Loads only when needed (code-splitting).
 * - Shows LoadingPlaceholder while loading.
 * - Disabled for SSR to ensure client-side only behavior.
 */
const SnapScrollVideoSection = dynamic(
  () => import('./SnapScrollVideoSection'),
  {
    loading: LoadingPlaceholder,
    ssr: false // Disable server-side rendering for this component
  }
);

export default SnapScrollVideoSection; 