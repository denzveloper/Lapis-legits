// Types
export interface VideoError {
  type: 'network' | 'format' | 'timeout' | 'unsupported' | 'unknown';
  message: string;
  originalError?: any;
  retryable: boolean;
}

export interface VideoErrorOptions {
  /**
   * Maximum number of retries
   * @default 3
   */
  maxRetries?: number;

  /**
   * Delay between retries in milliseconds
   * @default 2000
   */
  retryDelay?: number;

  /**
   * Video load timeout in milliseconds
   * @default 30000
   */
  loadTimeout?: number;
  
  /**
   * Custom error messages for different error types
   */
  errorMessages?: {
    network?: string;
    format?: string;
    timeout?: string;
    unsupported?: string;
    unknown?: string;
  };
  
  /**
   * Callback for logging errors
   */
  onErrorLogged?: (error: VideoError, attempt: number) => void;
}

const defaultOptions: VideoErrorOptions = {
  maxRetries: 3,
  retryDelay: 2000,
  loadTimeout: 30000,
  errorMessages: {
    network: 'Network error occurred while loading the video. Please check your connection.',
    format: 'The video format is not supported or the file is corrupted.',
    timeout: 'Video took too long to load. Please try again or check your connection.',
    unsupported: 'Your browser does not support this video format.',
    unknown: 'An unknown error occurred while loading the video.'
  }
};

/**
 * Parse the error event from video element to create a standardized VideoError
 */
export function parseVideoError(event: Event | string): VideoError {
  // Handle string error message
  if (typeof event === 'string') {
    return {
      type: 'unknown',
      message: event,
      retryable: true
    };
  }
  
  // Handle timeout error
  if (event.type === 'timeout') {
    return {
      type: 'timeout',
      message: defaultOptions.errorMessages?.timeout || 'Video load timeout',
      retryable: true
    };
  }
  
  // Handle media error
  const videoElement = event.target as HTMLVideoElement;
  if (videoElement && videoElement.error) {
    const mediaError = videoElement.error;
    
    switch (mediaError.code) {
      case MediaError.MEDIA_ERR_ABORTED:
        return {
          type: 'unknown',
          message: 'Video playback was aborted.',
          originalError: mediaError,
          retryable: true
        };
        
      case MediaError.MEDIA_ERR_NETWORK:
        return {
          type: 'network',
          message: defaultOptions.errorMessages?.network || 'Network error',
          originalError: mediaError,
          retryable: true
        };
        
      case MediaError.MEDIA_ERR_DECODE:
        return {
          type: 'format',
          message: defaultOptions.errorMessages?.format || 'Format error',
          originalError: mediaError,
          retryable: false
        };
        
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        return {
          type: 'unsupported',
          message: defaultOptions.errorMessages?.unsupported || 'Format not supported',
          originalError: mediaError,
          retryable: false
        };
        
      default:
        return {
          type: 'unknown',
          message: defaultOptions.errorMessages?.unknown || 'Unknown error',
          originalError: mediaError,
          retryable: true
        };
    }
  }
  
  // Fallback for other errors
  return {
    type: 'unknown',
    message: 'An error occurred with the video',
    originalError: event,
    retryable: true
  };
}

/**
 * Create a function that handles video errors with retry logic
 */
export function createVideoErrorHandler(options: VideoErrorOptions = {}) {
  const config = { ...defaultOptions, ...options };
  let retryCount = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  /**
   * Set up a timeout for video loading
   */
  const setupLoadTimeout = (videoElement: HTMLVideoElement, onTimeout: () => void) => {
    clearLoadTimeout();
    
    if (config.loadTimeout && config.loadTimeout > 0) {
      timeoutId = setTimeout(() => {
        onTimeout();
      }, config.loadTimeout);
      
      // Clear timeout when video can play
      const clearTimeoutOnLoad = () => {
        clearLoadTimeout();
        videoElement.removeEventListener('canplay', clearTimeoutOnLoad);
      };
      
      videoElement.addEventListener('canplay', clearTimeoutOnLoad);
    }
  };
  
  /**
   * Clear any existing load timeout
   */
  const clearLoadTimeout = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
  
  /**
   * Handle a video error and potentially retry loading
   */
  const handleError = (
    event: Event | string,
    onError: (error: VideoError) => void,
    videoElement?: HTMLVideoElement
  ) => {
    const videoError = parseVideoError(event);
    
    // Log the error
    console.error('Video error:', videoError);
    config.onErrorLogged?.(videoError, retryCount + 1);
    
    // Check if we should retry
    if (videoError.retryable && retryCount < (config.maxRetries || 0)) {
      retryCount++;
      console.log(`Retrying video load (attempt ${retryCount}/${config.maxRetries})...`);
      
      // Retry after delay
      setTimeout(() => {
        if (videoElement) {
          // Reset the video element and try again
          videoElement.load();
          
          // Set up timeout for the retry
          setupLoadTimeout(videoElement, () => {
            handleError('timeout', onError, videoElement);
          });
        }
      }, config.retryDelay);
    } else {
      // No more retries or not retryable, report the error
      onError(videoError);
    }
  };
  
  /**
   * Reset the retry counter, for use when successfully loading a new video
   */
  const resetRetryCount = () => {
    retryCount = 0;
    clearLoadTimeout();
  };
  
  return {
    handleError,
    setupLoadTimeout,
    clearLoadTimeout,
    resetRetryCount
  };
}

/**
 * Generate placeholder URLs for testing
 */
export function getPlaceholderVideoUrl(index: number, broken = false): string[] {
  const placeholders = [
    'https://storage.googleapis.com/web-dev-assets/video-and-source-tags/chrome.mp4',
    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
  ];
  
  // For testing error states
  if (broken) {
    return ['https://example.com/non-existent-video.mp4'];
  }
  
  const safeIndex = Math.abs(index) % placeholders.length;
  return [placeholders[safeIndex]];
} 