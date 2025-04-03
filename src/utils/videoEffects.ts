import { useCallback } from 'react';

// Effect interface
export interface Effect {
  name: string;
  apply: (
    ctx: CanvasRenderingContext2D, 
    video: HTMLVideoElement, 
    canvas: HTMLCanvasElement,
    scrollProgress: number
  ) => void;
}

/**
 * Fade effect - adjusts opacity based on scroll progress
 */
export const fadeEffect: Effect = {
  name: 'fade',
  apply: (ctx, video, canvas, scrollProgress) => {
    // Adjust opacity based on scroll progress
    ctx.globalAlpha = Math.min(1, scrollProgress * 2); // Fade in as we scroll
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1; // Reset alpha
  }
};

/**
 * Zoom effect - zooms in as user scrolls
 */
export const zoomEffect: Effect = {
  name: 'zoom',
  apply: (ctx, video, canvas, scrollProgress) => {
    // Calculate zoom factor (1.0 to 1.3)
    const zoom = 1 + (scrollProgress * 0.3);
    
    // Calculate dimensions with zoom
    const vw = canvas.width;
    const vh = canvas.height;
    const zoomedWidth = vw * zoom;
    const zoomedHeight = vh * zoom;
    
    // Calculate position to keep center
    const x = (vw - zoomedWidth) / 2;
    const y = (vh - zoomedHeight) / 2;
    
    ctx.drawImage(video, x, y, zoomedWidth, zoomedHeight);
  }
};

/**
 * Blur effect - applies a blur filter that changes with scroll
 */
export const blurEffect: Effect = {
  name: 'blur',
  apply: (ctx, video, canvas, scrollProgress) => {
    // Draw the video first
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Apply blur filter based on scroll
    const blurAmount = Math.max(0, 10 * (1 - scrollProgress));
    if (blurAmount > 0) {
      ctx.filter = `blur(${blurAmount}px)`;
      ctx.drawImage(canvas, 0, 0);
      ctx.filter = 'none';
    }
  }
};

/**
 * Grayscale effect - transitions from color to grayscale
 */
export const grayscaleEffect: Effect = {
  name: 'grayscale',
  apply: (ctx, video, canvas, scrollProgress) => {
    // Draw the video first
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Apply grayscale filter based on scroll
    const grayscaleAmount = scrollProgress;
    if (grayscaleAmount > 0) {
      ctx.filter = `grayscale(${grayscaleAmount})`;
      ctx.drawImage(canvas, 0, 0);
      ctx.filter = 'none';
    }
  }
};

/**
 * Split screen effect - reveals the video by splitting from the center
 */
export const splitScreenEffect: Effect = {
  name: 'splitScreen',
  apply: (ctx, video, canvas, scrollProgress) => {
    // First draw a black background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const halfHeight = canvas.height / 2;
    const splitAmount = (1 - scrollProgress) * halfHeight;
    
    // Top half
    ctx.drawImage(
      video,
      0, 0, canvas.width, halfHeight, // source coords
      0, -splitAmount, canvas.width, halfHeight // dest coords
    );
    
    // Bottom half
    ctx.drawImage(
      video,
      0, halfHeight, canvas.width, halfHeight, // source coords
      0, halfHeight + splitAmount, canvas.width, halfHeight // dest coords
    );
  }
};

/**
 * Combinable effect - create a function that applies multiple effects in sequence
 */
export const combineEffects = (...effects: Effect[]): Effect => {
  return {
    name: 'combined',
    apply: (ctx, video, canvas, scrollProgress) => {
      // Apply each effect in sequence
      effects.forEach(effect => {
        effect.apply(ctx, video, canvas, scrollProgress);
      });
    }
  };
};

/**
 * Hook to create a custom effect based on scroll direction
 */
export const useScrollDirectionEffect = (): Effect => {
  let lastScrollProgress = 0;
  
  return {
    name: 'scrollDirection',
    apply: (ctx, video, canvas, scrollProgress) => {
      // Determine scroll direction
      const isScrollingDown = scrollProgress > lastScrollProgress;
      
      // Apply different effects based on direction
      if (isScrollingDown) {
        // Apply a warm filter when scrolling down
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'color';
        ctx.fillStyle = 'rgba(255, 200, 150, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
      } else {
        // Apply a cool filter when scrolling up
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'color';
        ctx.fillStyle = 'rgba(150, 200, 255, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
      }
      
      // Update for next frame
      lastScrollProgress = scrollProgress;
    }
  };
};

/**
 * Create an effect pipeline that allows for easily chaining effects
 */
export class EffectPipeline {
  private effects: Effect[] = [];
  
  /**
   * Add an effect to the pipeline
   */
  add(effect: Effect): EffectPipeline {
    this.effects.push(effect);
    return this;
  }
  
  /**
   * Clear all effects
   */
  clear(): EffectPipeline {
    this.effects = [];
    return this;
  }
  
  /**
   * Get the combined effect
   */
  build(): Effect {
    return combineEffects(...this.effects);
  }
  
  /**
   * Create a new effect pipeline
   */
  static create(): EffectPipeline {
    return new EffectPipeline();
  }
} 