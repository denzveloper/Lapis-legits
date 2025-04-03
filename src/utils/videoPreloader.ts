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
}

// Store preloaded video elements to prevent duplicate preloading
const preloadCache = new Map<string, {
  element: HTMLVideoElement;
  status: 'loading' | 'loaded' | 'error';
  priority: number;
}>();

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
  private readonly MAX_CONCURRENT = 2; // Maximum number of videos to preload at once
  
  private constructor() {}
  
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
    if (this.activePreloads >= this.MAX_CONCURRENT || this.queue.length === 0) {
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
}

/**
 * Generate a unique ID for a video based on its sources
 */
const generateVideoId = (sources: VideoSource[]): string => {
  return sources.map(source => source.src).join('|');
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
  
  // If already in cache and loaded, return immediately
  if (preloadCache.has(id)) {
    const cached = preloadCache.get(id);
    if (cached && (cached.status === 'loaded' || cached.priority > (options.priority || 1))) {
      options.onComplete?.();
      return cached.element;
    }
  }
  
  // Create a new video element for preloading
  const videoElement = document.createElement('video');
  videoElement.style.display = 'none'; // Hidden from view
  videoElement.muted = true; // Must be muted for autoplay
  videoElement.playsInline = true; // Required for mobile
  videoElement.setAttribute('preload', options.metadataOnly ? 'metadata' : 'auto');
  
  // Add video to cache immediately to prevent duplicate preloading
  preloadCache.set(id, {
    element: videoElement,
    status: 'loading',
    priority: options.priority || 1
  });
  
  // Set up event listeners for tracking progress
  videoElement.addEventListener('loadedmetadata', () => {
    if (options.metadataOnly) {
      preloadCache.set(id, { 
        element: videoElement, 
        status: 'loaded',
        priority: options.priority || 1
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
          priority: options.priority || 1
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
      priority: options.priority || 1
    });
    options.onProgress?.(1);
    options.onComplete?.();
  });
  
  videoElement.addEventListener('error', (e) => {
    preloadCache.set(id, { 
      element: videoElement, 
      status: 'error',
      priority: options.priority || 1
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
 * Queue a video for preloading based on priority
 * 
 * @param sources - Array of video sources in different formats
 * @param options - Preloading options
 * @returns Unique ID for the queued video
 */
export const queueVideoPreload = (
  sources: VideoSource[],
  options: PreloadOptions = {}
): string => {
  const id = generateVideoId(sources);
  
  // If already in cache and loaded, don't queue again
  if (preloadCache.has(id)) {
    const cached = preloadCache.get(id);
    if (cached && cached.status === 'loaded') {
      options.onComplete?.();
      return id;
    }
  }
  
  // Add to queue
  PreloadQueue.getInstance().add(sources, options, id);
  return id;
};

/**
 * Preload multiple videos with assigned priorities
 * 
 * @param videosToPreload - Array of video sources and their preload options
 */
export const preloadVideos = (
  videosToPreload: Array<{
    sources: VideoSource[];
    options?: PreloadOptions;
  }>
): void => {
  // Sort by priority
  const sortedVideos = [...videosToPreload].sort((a, b) => {
    return (b.options?.priority || 1) - (a.options?.priority || 1);
  });
  
  // Queue each video for preloading
  sortedVideos.forEach(video => {
    queueVideoPreload(video.sources, video.options);
  });
};

/**
 * Get a preloaded video element if available
 * 
 * @param sources - Array of video sources to look up
 * @returns The preloaded video element or null if not found
 */
export const getPreloadedVideo = (sources: VideoSource[]): HTMLVideoElement | null => {
  const id = generateVideoId(sources);
  const cached = preloadCache.get(id);
  
  if (cached && cached.status === 'loaded') {
    // Clone the element to avoid conflicts with the preloaded version
    const clonedVideo = cached.element.cloneNode(true) as HTMLVideoElement;
    clonedVideo.style.display = '';
    return clonedVideo;
  }
  
  return null;
};

/**
 * Clear all preloaded videos from cache to free memory
 */
export const clearPreloadCache = (): void => {
  // Remove all video elements from DOM
  preloadCache.forEach(cached => {
    if (cached.element.parentNode) {
      cached.element.parentNode.removeChild(cached.element);
    }
  });
  
  // Clear the cache
  preloadCache.clear();
  
  // Clear the queue
  PreloadQueue.getInstance().clear();
};

/**
 * Check if a video is already preloaded
 */
export const isVideoPreloaded = (sources: VideoSource[]): boolean => {
  const id = generateVideoId(sources);
  const cached = preloadCache.get(id);
  return cached?.status === 'loaded';
};

export default {
  preloadVideo,
  queueVideoPreload,
  preloadVideos,
  getPreloadedVideo,
  clearPreloadCache,
  isVideoPreloaded
}; 