import { useEffect, useState } from 'react';

/**
 * Interface for scroll positions that trigger video transitions
 */
interface ScrollTrigger {
  id: string;
  startPosition: number; // Scroll position where the trigger starts (percentage 0-1)
  endPosition: number;   // Scroll position where the trigger ends (percentage 0-1)
  callback: (progress: number) => void; // Callback function with progress value 0-1
}

/**
 * Scroll manager class to handle scroll events and trigger callbacks
 */
class ScrollManager {
  private static instance: ScrollManager;
  private triggers: ScrollTrigger[] = [];
  private scrollY: number = 0;
  private viewportHeight: number = 0;
  private documentHeight: number = 0;
  private ticking: boolean = false;
  private isListening: boolean = false;

  /**
   * Get the singleton instance of ScrollManager
   */
  public static getInstance(): ScrollManager {
    if (!ScrollManager.instance) {
      ScrollManager.instance = new ScrollManager();
    }
    return ScrollManager.instance;
  }

  /**
   * Start listening to scroll events
   */
  public startListening(): void {
    if (this.isListening) return;
    
    this.updateDimensions();
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    window.addEventListener('resize', this.updateDimensions);
    this.isListening = true;
  }

  /**
   * Stop listening to scroll events
   */
  public stopListening(): void {
    if (!this.isListening) return;
    
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.updateDimensions);
    this.isListening = false;
  }

  /**
   * Add a scroll trigger
   */
  public addTrigger(trigger: ScrollTrigger): void {
    // Check if trigger with this ID already exists
    const existingIndex = this.triggers.findIndex(t => t.id === trigger.id);
    if (existingIndex >= 0) {
      // Replace the existing trigger
      this.triggers[existingIndex] = trigger;
    } else {
      this.triggers.push(trigger);
    }
  }

  /**
   * Remove a scroll trigger by ID
   */
  public removeTrigger(triggerId: string): void {
    this.triggers = this.triggers.filter(trigger => trigger.id !== triggerId);
  }

  /**
   * Clear all triggers
   */
  public clearTriggers(): void {
    this.triggers = [];
  }

  /**
   * Update viewport and document dimensions
   */
  private updateDimensions = (): void => {
    this.viewportHeight = window.innerHeight;
    this.documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    this.checkTriggers();
  };

  /**
   * Handle scroll events
   */
  private handleScroll = (): void => {
    this.scrollY = window.scrollY;
    
    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        this.checkTriggers();
        this.ticking = false;
      });
      this.ticking = true;
    }
  };

  /**
   * Check if any triggers should be activated based on current scroll position
   */
  private checkTriggers = (): void => {
    // Calculate scroll progress as a percentage (0-1) of the scrollable area
    const maxScroll = this.documentHeight - this.viewportHeight;
    const scrollProgress = maxScroll > 0 ? this.scrollY / maxScroll : 0;
    
    // Debug output to check scroll progress
    if (this.scrollY % 100 < 10) { // Log only occasionally to avoid console spam
      console.log(`Scroll progress: ${scrollProgress.toFixed(3)}, scrollY: ${this.scrollY}, maxScroll: ${maxScroll}`);
    }
    
    // Check each trigger
    this.triggers.forEach(trigger => {
      // If scroll position is within the trigger range
      if (scrollProgress >= trigger.startPosition && scrollProgress <= trigger.endPosition) {
        // Calculate progress within this specific trigger range (0-1)
        const triggerRange = trigger.endPosition - trigger.startPosition;
        const triggerProgress = triggerRange > 0 
          ? (scrollProgress - trigger.startPosition) / triggerRange 
          : 0;
        
        // Call the trigger callback with the calculated progress
        trigger.callback(triggerProgress);
      }
    });
  };
}

/**
 * Hook to use the scroll manager in components
 */
export function useScrollManager() {
  const [manager] = useState(() => ScrollManager.getInstance());
  
  useEffect(() => {
    manager.startListening();
    return () => manager.stopListening();
  }, [manager]);
  
  return manager;
}

/**
 * Hook to create and manage a scroll trigger
 */
export function useScrollTrigger(
  id: string,
  startPosition: number,
  endPosition: number,
  callback: (progress: number) => void
) {
  const manager = useScrollManager();
  
  useEffect(() => {
    const trigger: ScrollTrigger = {
      id,
      startPosition,
      endPosition,
      callback
    };
    
    manager.addTrigger(trigger);
    
    return () => {
      manager.removeTrigger(id);
    };
  }, [id, startPosition, endPosition, callback, manager]);
}

export default ScrollManager.getInstance(); 