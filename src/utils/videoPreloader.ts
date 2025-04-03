/**
 * Video Preloader Utility
 * 
 * This utility provides functions to preload videos before they are needed,
 * improving the playback experience by reducing or eliminating buffering.
 */

export interface VideoSource {
  src: string;
  type: string;
}

export interface PreloadOptions {
  /**
   * Priority level for preloading (higher numbers indicate higher priority)
   * @default 1
   */
  priority?: number;
  
  /**
   * Whether to preload the video metadata only without downloading the full content
   * @default false
   */
  metadataOnly?: boolean;
  
  /**
   * Optional callback when preloading is complete
   */
  onComplete?: () => void;
  
  /**
   * Optional callback for progress updates during preloading
   * @param progress - Value between 0 and 1 indicating completion percentage
   */
  onProgress?: (progress: number) => void;
  
  /**
   * Optional callback for preloading errors
   * @param error - Error object or message
   */
  onError?: (error: Error | string) => void;
  
  /**
   * Whether to use the browser cache
   * @default true
   */
  useCache?: boolean;
  
  /**
   * Time in milliseconds after which a cached video is considered stale and should be re-preloaded
   * @default 3600000 (1 hour)
   */
  cacheDuration?: number;
  
  /**
   * Whether to use low-quality placeholders initially
   * @default false
   */
  useLowQualityPlaceholder?: boolean;
}

// Store preloaded video elements to prevent duplicate preloading
const preloadCache = new Map<string, {
  element: HTMLVideoElement;
  status: 'loading' | 'loaded' | 'error';
  priority: number;
  timestamp: number; // When the video was cached
}>();

/**
 * TypeScript definition for the Network Information API that might not be in standard lib
 */
interface NetworkInformation {
  effectiveType: string;
  addEventListener: (type: string, listener: EventListener) => void;
  removeEventListener: (type: string, listener: EventListener) => void;
}

/**
 * Extended Navigator interface with connection property
 */
interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}

/**
 * Queue for managing preload requests
 */
class PreloadQueue {
  private static instance: PreloadQueue;
  private queue: Array<{
    sources: VideoSource[];
    options: PreloadOptions;
    id: string;
  }> = [];
  private activePreloads = 0;
  private maxConcurrent = 2; // Maximum number of videos to preload at once
  private readonly CONNECTION_AWARE = true; // Adjust preloading based on connection type
  
  private constructor() {
    // Try to adapt to network conditions
    this.adaptToNetworkConditions();
  }
  
  // Adapt preloading strategy based on network conditions
  private adaptToNetworkConditions(): void {
    if (!this.CONNECTION_AWARE || typeof navigator === 'undefined') {
      return;
    }
    
    // Using the Network Information API if available
    const nav = navigator as NavigatorWithConnection;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    
    if (connection && connection.effectiveType) {
      // Adjust maxConcurrent based on connection quality
      switch (connection.effectiveType) {
        case 'slow-2g':
        case '2g':
          this.maxConcurrent = 1;
          break;
        case '3g':
          this.maxConcurrent = 2;
          break;
        case '4g':
          this.maxConcurrent = 3;
          break;
        default:
          this.maxConcurrent = 2;
      }
    }
    
    // Listen for changes in connection quality
    if (connection && typeof connection.addEventListener === 'function') {
      connection.addEventListener('change', this.adaptToNetworkConditions.bind(this));
    }
  }
  
  public static getInstance(): PreloadQueue {
    if (!PreloadQueue.instance) {
      PreloadQueue.instance = new PreloadQueue();
    }
    return PreloadQueue.instance;
  }
  
  /**
   * Add a video to the preload queue
   */
  public add(sources: VideoSource[], options: PreloadOptions, id: string): void {
    // Sort queue by priority before adding new item
    this.queue.push({ sources, options, id });
    this.queue.sort((a, b) => (b.options.priority || 1) - (a.options.priority || 1));
    
    this.processQueue();
  }
  
  /**
   * Process the preload queue, starting preloads as capacity allows
   */
  private processQueue(): void {
    if (this.activePreloads >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }
    
    const nextItem = this.queue.shift();
    if (!nextItem) return;
    
    this.activePreloads++;
    
    // Start preloading the video
    preloadVideo(
      nextItem.sources, 
      {
        ...nextItem.options,
        onComplete: () => {
          this.activePreloads--;
          nextItem.options.onComplete?.();
          this.processQueue(); // Process next in queue when this one completes
        },
        onError: (error) => {
          this.activePreloads--;
          nextItem.options.onError?.(error);
          this.processQueue(); // Process next in queue even if there's an error
        }
      },
      nextItem.id
    );
  }
  
  /**
   * Clear the entire preload queue
   */
  public clear(): void {
    this.queue = [];
  }
  
  /**
   * Get the current size of the queue
   */
  public size(): number {
    return this.queue.length;
  }
  
  /**
   * Pause all active preloads
   * Useful when user is actively viewing content to free up bandwidth
   */
  public pauseAllPreloads(): void {
    preloadCache.forEach((cache) => {
      if (cache.status === 'loading') {
        cache.element.setAttribute('preload', 'none');
      }
    });
  }
  
  /**
   * Resume all paused preloads
   */
  public resumeAllPreloads(): void {
    preloadCache.forEach((cache) => {
      if (cache.status === 'loading') {
        cache.element.setAttribute('preload', 'auto');
        cache.element.load();
      }
    });
  }
}

/**
 * Generate a unique ID for a video based on its sources
 */
const generateVideoId = (sources: VideoSource[]): string => {
  return sources.map(source => source.src).join('|');
};

/**
 * Check if a cached video is stale based on cacheDuration
 */
const isCacheStale = (cache: { timestamp: number }, cacheDuration: number): boolean => {
  return Date.now() - cache.timestamp > cacheDuration;
};

/**
 * Preload a single video with specified sources
 * 
 * @param sources - Array of video sources in different formats
 * @param options - Preloading options
 * @param videoId - Optional ID for the video (generated from sources if not provided)
 * @returns HTMLVideoElement that can be used for playback
 */
export const preloadVideo = (
  sources: VideoSource[],
  options: PreloadOptions = {},
  videoId?: string
): HTMLVideoElement | null => {
  const id = videoId || generateVideoId(sources);
  const cacheDuration = options.cacheDuration || 3600000; // Default: 1 hour
  
  // If already in cache and loaded, check if cache is still valid
  if (preloadCache.has(id)) {
    const cached = preloadCache.get(id);
    
    // If cache is stale, remove it and preload again
    if (cached && cached.status === 'loaded' && options.useCache !== false && !isCacheStale(cached, cacheDuration)) {
      options.onComplete?.();
      return cached.element;
    } else if (cached && cached.priority > (options.priority || 1)) {
      return cached.element;
    }
  }
  
  // Check if the browser supports IntersectionObserver for lazy loading
  const supportsLazyLoading = 'loading' in HTMLImageElement.prototype || 
                             typeof IntersectionObserver !== 'undefined';
  
  // Create a new video element for preloading
  const videoElement = document.createElement('video');
  videoElement.style.display = 'none'; // Hidden from view
  videoElement.muted = true; // Must be muted for autoplay
  videoElement.playsInline = true; // Required for mobile
  videoElement.setAttribute('preload', options.metadataOnly ? 'metadata' : 'auto');
  
  if (supportsLazyLoading) {
    videoElement.setAttribute('loading', 'lazy');
  }
  
  // Apply optimization attributes
  videoElement.setAttribute('decoding', 'async');
  
  // Add video to cache immediately to prevent duplicate preloading
  preloadCache.set(id, {
    element: videoElement,
    status: 'loading',
    priority: options.priority || 1,
    timestamp: Date.now()
  });
  
  // Set up event listeners for tracking progress
  videoElement.addEventListener('loadedmetadata', () => {
    if (options.metadataOnly) {
      preloadCache.set(id, { 
        element: videoElement, 
        status: 'loaded',
        priority: options.priority || 1,
        timestamp: Date.now()
      });
      options.onProgress?.(1);
      options.onComplete?.();
    }
  });
  
  videoElement.addEventListener('progress', () => {
    if (options.metadataOnly) return;
    
    // Calculate loading progress
    if (videoElement.buffered.length > 0) {
      const bufferedEnd = videoElement.buffered.end(videoElement.buffered.length - 1);
      const duration = videoElement.duration;
      const progress = bufferedEnd / duration;
      options.onProgress?.(progress);
      
      // Consider fully loaded when buffered to the end
      if (Math.abs(bufferedEnd - duration) < 0.1) {
        preloadCache.set(id, { 
          element: videoElement, 
          status: 'loaded',
          priority: options.priority || 1,
          timestamp: Date.now()
        });
        options.onComplete?.();
      }
    }
  });
  
  videoElement.addEventListener('canplaythrough', () => {
    if (options.metadataOnly) return;
    
    preloadCache.set(id, { 
      element: videoElement, 
      status: 'loaded',
      priority: options.priority || 1,
      timestamp: Date.now()
    });
    options.onProgress?.(1);
    options.onComplete?.();
  });
  
  videoElement.addEventListener('error', (e) => {
    preloadCache.set(id, { 
      element: videoElement, 
      status: 'error',
      priority: options.priority || 1,
      timestamp: Date.now()
    });
    options.onError?.(new Error(`Failed to preload video: ${e}`));
  });
  
  // Add source elements to the video
  sources.forEach(source => {
    const sourceElement = document.createElement('source');
    sourceElement.src = source.src;
    sourceElement.type = source.type;
    videoElement.appendChild(sourceElement);
  });
  
  // Start loading the video
  document.body.appendChild(videoElement);
  
  // Start loading by triggering the load method
  videoElement.load();
  
  return videoElement;
};

/**
 * Add a video to the preload queue
 * 
 * @param sources - Array of video sources in different formats
 * @param options - Preloading options
 * @returns The ID of the video in the queue
 */
export const queueVideoPreload = (
  sources: VideoSource[],
  options: PreloadOptions = {}
): string => {
  const videoId = generateVideoId(sources);
  const queue = PreloadQueue.getInstance();
  queue.add(sources, options, videoId);
  return videoId;
};

/**
 * Preload multiple videos at once
 * 
 * @param videosToPreload - Array of videos to preload with their options
 */
export const preloadVideos = (
  videosToPreload: Array<{
    sources: VideoSource[];
    options?: PreloadOptions;
  }>
): void => {
  videosToPreload.forEach(({ sources, options = {} }) => {
    queueVideoPreload(sources, options);
  });
};

/**
 * Get a previously preloaded video from the cache
 * 
 * @param sources - Array of video sources to identify the video
 * @returns HTMLVideoElement if found in cache, null otherwise
 */
export const getPreloadedVideo = (sources: VideoSource[]): HTMLVideoElement | null => {
  const id = generateVideoId(sources);
  const cached = preloadCache.get(id);
  
  if (cached && cached.status === 'loaded') {
    return cached.element;
  }
  
  return null;
};

/**
 * Clear all preloaded videos from the cache
 */
export const clearPreloadCache = (): void => {
  preloadCache.forEach(cached => {
    if (cached.element && cached.element.parentNode) {
      cached.element.parentNode.removeChild(cached.element);
    }
  });
  
  preloadCache.clear();
};

/**
 * Check if a video is already preloaded and available in the cache
 * 
 * @param sources - Array of video sources to identify the video
 * @returns Whether the video is preloaded and ready to use
 */
export const isVideoPreloaded = (sources: VideoSource[]): boolean => {
  const id = generateVideoId(sources);
  const cached = preloadCache.get(id);
  return Boolean(cached && cached.status === 'loaded');
};

/**
 * Pause all active preloads to conserve bandwidth
 * Useful when the user is actively viewing a video
 */
export const pauseAllPreloads = (): void => {
  const queue = PreloadQueue.getInstance();
  queue.pauseAllPreloads();
};

/**
 * Resume all previously paused preloads
 */
export const resumeAllPreloads = (): void => {
  const queue = PreloadQueue.getInstance();
  queue.resumeAllPreloads();
};

/**
 * Clean up stale videos from the cache
 * @param maxAge - Maximum age in milliseconds before a video is considered stale (default: 1 hour)
 */
export const cleanupStaleCache = (maxAge: number = 3600000): void => {
  const now = Date.now();
  const staleIds: string[] = [];
  
  preloadCache.forEach((cache, id) => {
    if (now - cache.timestamp > maxAge) {
      staleIds.push(id);
    }
  });
  
  staleIds.forEach(id => {
    const cached = preloadCache.get(id);
    if (cached && cached.element && cached.element.parentNode) {
      cached.element.parentNode.removeChild(cached.element);
    }
    preloadCache.delete(id);
  });
};

// Export all functions as a default object for easier imports
export default {
  preloadVideo,
  queueVideoPreload,
  preloadVideos,
  getPreloadedVideo,
  clearPreloadCache,
  isVideoPreloaded,
  pauseAllPreloads,
  resumeAllPreloads,
  cleanupStaleCache
}; 