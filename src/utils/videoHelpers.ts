/**
 * Determines the video MIME type based on file extension
 * @param url The URL or path to the video file
 * @returns The appropriate MIME type string
 */
export const getVideoType = (url: string): string => {
  if (url.endsWith('.mp4')) return 'video/mp4';
  if (url.endsWith('.webm')) return 'video/webm';
  if (url.endsWith('.ogg')) return 'video/ogg';
  if (url.endsWith('.mov')) return 'video/quicktime';
  if (url.endsWith('.avi')) return 'video/x-msvideo';
  if (url.endsWith('.flv')) return 'video/x-flv';
  if (url.endsWith('.wmv')) return 'video/x-ms-wmv';
  if (url.endsWith('.m4v')) return 'video/x-m4v';
  if (url.endsWith('.mkv')) return 'video/x-matroska';
  // Default to mp4 if unknown
  return 'video/mp4';
};

/**
 * Formats a file size in bytes to a human-readable string
 * @param bytes Size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Formats a duration in seconds to a readable time string
 * @param seconds Duration in seconds
 * @returns Formatted string (e.g., "1:30")
 */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Check if the browser supports video autoplay
 */
export const canAutoplay = async (): Promise<boolean> => {
  // Only run this check in the browser
  if (typeof window === 'undefined') return false;
  
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  
  try {
    // Try to play the video
    await video.play();
    return true;
  } catch (error) {
    return false;
  } finally {
    video.remove();
  }
};

/**
 * Generate a poster image from a video
 */
export const generateVideoPoster = (videoElement: HTMLVideoElement): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!videoElement) {
      reject(new Error('No video element provided'));
      return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    const handleVideoLoaded = () => {
      try {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Draw the video frame
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      } finally {
        videoElement.removeEventListener('loadeddata', handleVideoLoaded);
      }
    };
    
    if (videoElement.readyState >= 2) {
      // Video data is already loaded
      handleVideoLoaded();
    } else {
      // Wait for video data to load
      videoElement.addEventListener('loadeddata', handleVideoLoaded);
      
      // Set timeout in case video loading takes too long
      setTimeout(() => {
        reject(new Error('Timed out waiting for video to load'));
      }, 5000);
    }
  });
}; 