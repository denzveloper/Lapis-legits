/**
 * Debug Utilities
 * 
 * This file contains utility functions for debugging purposes.
 * These functions should only be used during development and should not impact production.
 */

/**
 * Check if debug mode is enabled based on URL parameters
 * @returns {boolean} True if debug mode is enabled
 */
export const isDebugModeEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('debug') === 'true';
};

/**
 * Get URL with debug mode toggled
 * @param {boolean} currentDebugState Current debug state
 * @returns {string} URL with debug mode toggled
 */
export const getDebugToggleUrl = (currentDebugState: boolean): string => {
  if (typeof window === 'undefined') return '/';
  
  const url = new URL(window.location.href);
  
  if (currentDebugState) {
    // Remove debug parameter if it exists
    url.searchParams.delete('debug');
  } else {
    // Add debug parameter
    url.searchParams.set('debug', 'true');
  }
  
  return url.pathname + url.search;
};

/**
 * Debug log function that only logs in debug mode
 * @param {string} message Message to log
 * @param {any} data Optional data to log
 */
export const debugLog = (message: string, data?: any): void => {
  if (!isDebugModeEnabled()) return;
  
  if (data) {
    console.log(`[DEBUG] ${message}`, data);
  } else {
    console.log(`[DEBUG] ${message}`);
  }
};

/**
 * List of available debug features
 */
export const debugFeatures = {
  INTERSECTION_OBSERVER: 'intersection-observer',
  VIDEO_PRELOADING: 'video-preloading',
  SCROLL_PERFORMANCE: 'scroll-performance',
};

/**
 * Check if a specific debug feature is enabled
 * @param {string} feature Feature to check
 * @returns {boolean} True if the feature is enabled
 */
export const isDebugFeatureEnabled = (feature: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  const urlParams = new URLSearchParams(window.location.search);
  const debugFeatures = urlParams.get('debugFeatures');
  
  if (!debugFeatures) return false;
  
  return debugFeatures.split(',').includes(feature);
};

/**
 * Get all enabled debug features
 * @returns {string[]} Array of enabled debug features
 */
export const getEnabledDebugFeatures = (): string[] => {
  if (typeof window === 'undefined') return [];
  
  const urlParams = new URLSearchParams(window.location.search);
  const debugFeatures = urlParams.get('debugFeatures');
  
  if (!debugFeatures) return [];
  
  return debugFeatures.split(',');
}; 