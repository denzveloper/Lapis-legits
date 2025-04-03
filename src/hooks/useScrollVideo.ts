import { useState, useEffect, useRef, RefObject } from 'react';

interface ScrollVideoOptions {
  /**
   * Threshold values for the Intersection Observer
   * Values between 0 and 1 representing percentage of element visibility
   * Default is [0, 0.25, 0.5, 0.75, 1] for better granularity
   */
  thresholds?: number[];
  
  /**
   * Root margin for the Intersection Observer
   * CSS-like margin string that adjusts the bounding box of the root element
   */
  rootMargin?: string;
  
  /**
   * Element to use as the viewport for checking visibility
   * Default is the browser viewport
   */
  root?: Element | null;
}

interface ScrollVideoState {
  /**
   * Whether the element is currently intersecting with the viewport
   */
  isIntersecting: boolean;
  
  /**
   * Intersection ratio (0-1) indicating how much of the element is visible
   */
  intersectionRatio: number;
  
  /**
   * Normalized scroll progress based on the element's position (0-1)
   * - 0: Element just entered the viewport
   * - 0.5: Element is centered in the viewport
   * - 1: Element is about to leave the viewport
   */
  scrollProgress: number;
  
  /**
   * Bounding client rect of the target element
   */
  boundingClientRect: DOMRectReadOnly | null;
}

/**
 * Custom hook for tracking scroll position and element visibility
 * using the Intersection Observer API
 */
export const useScrollVideo = <T extends HTMLElement>(
  options: ScrollVideoOptions = {}
): [RefObject<T>, ScrollVideoState] => {
  const {
    thresholds = [0, 0.25, 0.5, 0.75, 1],
    rootMargin = '0px',
    root = null,
  } = options;

  const elementRef = useRef<T>(null);
  
  const [state, setState] = useState<ScrollVideoState>({
    isIntersecting: false,
    intersectionRatio: 0,
    scrollProgress: 0,
    boundingClientRect: null,
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const calculateScrollProgress = (entry: IntersectionObserverEntry): number => {
      const rect = entry.boundingClientRect;
      const windowHeight = window.innerHeight;
      
      // Calculate how far the element has scrolled through the viewport
      // 0 when the element's top enters the bottom of the viewport
      // 1 when the element's bottom exits the top of the viewport
      const elementHeight = rect.height;
      const elementTop = rect.top;
      const elementBottom = rect.bottom;
      
      // If element is taller than viewport, use a different calculation
      if (elementHeight > windowHeight) {
        // Calculate progress based on how much of the element has scrolled past the top
        return Math.max(0, Math.min(1, Math.abs(elementTop) / (elementHeight - windowHeight)));
      } else {
        // For elements smaller than the viewport
        // Progress from 0 (just entered) to 1 (about to exit)
        return Math.max(0, Math.min(1, 1 - (elementBottom / windowHeight)));
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setState({
            isIntersecting: entry.isIntersecting,
            intersectionRatio: entry.intersectionRatio,
            scrollProgress: calculateScrollProgress(entry),
            boundingClientRect: entry.boundingClientRect,
          });
        }
      },
      {
        root,
        rootMargin,
        threshold: thresholds,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [thresholds, rootMargin, root]);

  return [elementRef, state];
};

export default useScrollVideo; 