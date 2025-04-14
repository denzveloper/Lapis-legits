import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';

/**
 * Common options for all text animations
 */
interface BaseAnimationOptions {
  duration?: number;
  delay?: number;
  ease?: string;
  stagger?: number;
  onComplete?: () => void;
}

/**
 * Options specific to the typewriter animation
 */
interface TypewriterOptions extends BaseAnimationOptions {
  // Basic animation settings
  cursor?: boolean;                 // Whether to show a cursor
  cursorBlinkSpeed?: number;        // Speed of cursor blinking (seconds per cycle)
  blinkDelay?: number;              // Delay before cursor starts blinking
  
  // Advanced animation features
  deleteSpeed?: number;             // Speed of deletion phase (if using type-delete-type pattern)
  randomize?: boolean;              // Enable random typing speed for more natural effect
  speedVariation?: number;          // Factor for speed variation (1 = default, higher = more variation)
  pauseProbability?: number;        // Probability (0-1) of adding occasional pauses between characters
  maxPauseDuration?: number;        // Maximum pause duration in seconds
  
  // Style settings
  cursorChar?: string;              // Character to use for cursor (default is |)
  cursorColor?: string;             // Color of the cursor
  cursorStyle?: 'solid' | 'blink';  // Style of cursor display
}

/**
 * Options for the text scramble animation
 */
interface ScrambleOptions extends BaseAnimationOptions {
  chars?: string; // Characters to use for scrambling
  scrambleDuration?: number; // How long the scrambling effect should last
  delimiter?: string; // For splitting text (e.g., by word, character)
}

/**
 * Options for the split text animation
 */
interface SplitTextOptions extends BaseAnimationOptions {
  direction?: 'up' | 'down' | 'left' | 'right'; 
  from?: gsap.TweenVars; // Initial state for elements
  to?: gsap.TweenVars; // Final state for elements
  staggerFrom?: 'start' | 'center' | 'end' | 'edges' | 'random';
}

/**
 * Creates a typewriter animation effect for text
 * @param element Target DOM element or ref
 * @param text Text content to animate (can be different from initial content)
 * @param options Animation options
 */
export const typewriterAnimation = (
  element: HTMLElement | null,
  text: string,
  options: TypewriterOptions = {}
): gsap.core.Timeline | null => {
  if (!element) return null;
  
  // Merge default options with provided options
  const {
    // Basic animation settings
    duration = 1.5,
    delay = 0,
    ease = 'none',
    onComplete,
    
    // Cursor settings
    cursor = true,
    cursorChar = '|',
    cursorColor = 'inherit',
    cursorStyle = 'blink',
    cursorBlinkSpeed = 0.5,
    blinkDelay = 0.4,
    
    // Randomization settings
    randomize = false,
    speedVariation = 0.5,
    pauseProbability = 0.1,
    maxPauseDuration = 0.3,
  } = options;

  // Clear the element first
  element.innerHTML = '';
  
  // Create text span to hold the animated text
  const textSpan = document.createElement('span');
  textSpan.classList.add('typewriter-text');
  element.appendChild(textSpan);
  
  // Create and configure cursor element if enabled
  let cursorElement: HTMLSpanElement | null = null;
  if (cursor) {
    cursorElement = document.createElement('span');
    cursorElement.classList.add('typewriter-cursor');
    cursorElement.textContent = cursorChar;
    cursorElement.style.display = 'inline-block';
    cursorElement.style.marginLeft = '2px';
    cursorElement.style.color = cursorColor;
    
    // Add the blinking cursor animation style if it doesn't exist
    const styleId = 'cursor-blink-style';
    if (!document.getElementById(styleId) && cursorStyle === 'blink') {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    element.appendChild(cursorElement);
  }
  
  // Create the animation timeline
  const timeline = gsap.timeline({
    delay,
    onComplete,
  });
  
  // Base character delay - how long each character takes to type
  const baseCharDelay = duration / Math.max(text.length, 1);
  
  /**
   * Utility function to generate typing delay for a single character
   * Returns randomized delay if randomization is enabled, otherwise returns base delay
   */
  const getTypingDelay = () => {
    if (!randomize) return baseCharDelay;
    
    // Generate a random variation factor
    const variationFactor = 1 + (Math.random() * 2 - 1) * speedVariation;
    
    // Add occasional pauses to simulate human typing
    if (Math.random() < pauseProbability) {
      return baseCharDelay * variationFactor + Math.random() * maxPauseDuration;
    }
    
    return baseCharDelay * variationFactor;
  };
  
  // Apply typing effect with proper timing
  let currentText = '';
  let currentTime = 0;
  
  // Add each character to the timeline with appropriate timing
  for (let i = 0; i < text.length; i++) {
    // Calculate delay for this specific character
    const charDelay = getTypingDelay();
    
    // Add character typing to the timeline
    timeline.add(() => {
      currentText += text[i];
      textSpan.textContent = currentText;
    }, currentTime);
    
    // Increase current time position for next character
    currentTime += charDelay;
  }
  
  // Record final duration after all randomization
  const typingDuration = currentTime;
  
  // Add cursor blinking animation after typing completes
  if (cursor && cursorElement && cursorStyle === 'blink') {
    timeline.add(() => {
      cursorElement!.style.animation = `blink ${cursorBlinkSpeed}s infinite`;
    }, typingDuration + blinkDelay);
  }
  
  return timeline;
};

/**
 * Creates a text scramble/slot machine effect
 * @param element Target DOM element or ref
 * @param finalText The final text to display after scrambling
 * @param options Scramble animation options
 */
export const textScrambleAnimation = (
  element: HTMLElement | null,
  finalText: string,
  options: ScrambleOptions = {}
): gsap.core.Timeline | null => {
  if (!element) return null;
  
  const {
    duration = 2.5,
    delay = 0,
    ease = 'power1.inOut',
    chars = '!<>-_\\/[]{}—=+*^?#_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    scrambleDuration = 0.2,
    onComplete
  } = options;

  // Ensure the GSAP Text plugin is loaded (only works if TextPlugin is imported elsewhere)
  if (!gsap.utils.checkPrefix('textContent')) {
    console.warn("GSAP TextPlugin is required for text scramble animation. Fallback to basic animation.");
    
    // Fallback to basic animation
    const timeline = gsap.timeline({ delay, onComplete });
    element.textContent = '';
    
    let lastScrambledText = '';
    
    // Create scramble effect manually
    for (let progress = 0; progress <= 1; progress += 0.05) {
      let scrambledText = '';
      const targetLength = Math.floor(finalText.length * progress);
      
      // Determine how many characters to scramble vs. show final
      for (let i = 0; i < finalText.length; i++) {
        if (i < targetLength) {
          scrambledText += finalText[i];
        } else if (i === targetLength) {
          scrambledText += chars[Math.floor(Math.random() * chars.length)];
        } else if (progress > 0.5 && i < targetLength + 3) {
          scrambledText += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      
      lastScrambledText = scrambledText;
      
      timeline.add(
        gsap.to(element, {
          duration: 0.03,
          onStart: () => {
            element.textContent = scrambledText;
          }
        }),
        progress * duration
      );
    }
    
    // Final text
    timeline.add(
      gsap.to(element, {
        duration: 0.1,
        onStart: () => {
          element.textContent = finalText;
        }
      })
    );
    
    return timeline;
  }
  
  // Using TextPlugin for smoother animation (requires importing TextPlugin)
  const timeline = gsap.timeline({ delay, onComplete });
  
  timeline.to(element, {
    duration,
    scrambleText: { 
      text: finalText,
      chars,
      revealDelay: 0.5,
      speed: scrambleDuration,
    },
    ease
  });
  
  return timeline;
};

/**
 * Splits text and animates each piece with staggered timing
 * @param element Target DOM element or ref
 * @param options Split text animation options
 */
export const splitTextAnimation = (
  element: HTMLElement | null,
  options: SplitTextOptions = {}
): gsap.Context | null => {
  if (!element) return null;
  
  const {
    duration = 0.8,
    stagger = 0.05,
    delay = 0,
    ease = 'power2.out',
    direction = 'up',
    from,
    to,
    staggerFrom = 'start',
    onComplete
  } = options;

  // Default animation based on direction
  const defaultFrom: Record<string, gsap.TweenVars> = {
    up: { y: 20, opacity: 0 },
    down: { y: -20, opacity: 0 },
    left: { x: -20, opacity: 0 },
    right: { x: 20, opacity: 0 }
  };

  const defaultTo: Record<string, gsap.TweenVars> = {
    up: { y: 0, opacity: 1 },
    down: { y: 0, opacity: 1 },
    left: { x: 0, opacity: 1 },
    right: { x: 0, opacity: 1 }
  };

  // Split text by words and characters while preserving HTML structure
  const originalHTML = element.innerHTML;
  const text = element.innerText;
  const words = text.split(' ');
  
  let html = '';
  words.forEach((word, i) => {
    html += `<span class="split-word" style="display: inline-block; overflow: hidden;">`;
    for (let j = 0; j < word.length; j++) {
      html += `<span class="split-char" style="display: inline-block;">${word[j]}</span>`;
    }
    html += `</span> `;
  });
  element.innerHTML = html;
  
  // Create context to easily revert later
  return gsap.context(() => {
    // Get all characters
    const chars = element.querySelectorAll('.split-char');
    
    // Determine stagger order
    let staggerOrder: Element[] = Array.from(chars);
    if (staggerFrom === 'center') {
      const mid = Math.floor(chars.length / 2);
      // Reorder elements from middle outward
      staggerOrder = staggerOrder.sort((a, b) => {
        const aIndex = Array.from(chars).indexOf(a);
        const bIndex = Array.from(chars).indexOf(b);
        return Math.abs(aIndex - mid) - Math.abs(bIndex - mid);
      });
    } else if (staggerFrom === 'end') {
      staggerOrder = staggerOrder.reverse();
    } else if (staggerFrom === 'edges') {
      const length = chars.length;
      staggerOrder = staggerOrder.sort((a, b) => {
        const aIndex = Array.from(chars).indexOf(a);
        const bIndex = Array.from(chars).indexOf(b);
        const aFromEdge = Math.min(aIndex, length - 1 - aIndex);
        const bFromEdge = Math.min(bIndex, length - 1 - bIndex);
        return aFromEdge - bFromEdge;
      });
    } else if (staggerFrom === 'random') {
      staggerOrder = staggerOrder.sort(() => Math.random() - 0.5);
    }
    
    // Set initial state
    gsap.set(chars, from || defaultFrom[direction]);
    
    // Animate to final state
    gsap.to(staggerOrder, {
      ...to || defaultTo[direction],
      duration,
      stagger,
      delay,
      ease,
      onComplete
    });
    
    // Function to reset to original content
    return () => {
      element.innerHTML = originalHTML;
    };
  }, element);
};

/**
 * React hook for typewriter animation
 */
export const useTypewriterAnimation = (
  text: string,
  options: TypewriterOptions = {}
) => {
  const elementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let timeline: gsap.core.Timeline | null = null;
    
    if (elementRef.current) {
      timeline = typewriterAnimation(elementRef.current, text, options);
    }
    
    // Cleanup function to kill the animation if component unmounts
    return () => {
      if (timeline) {
        timeline.kill();
      }
    };
  }, [text, options]);
  
  return elementRef;
};

/**
 * React hook for scramble text animation
 */
export const useTextScrambleAnimation = (
  finalText: string,
  options: ScrambleOptions = {}
) => {
  const elementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (elementRef.current) {
      textScrambleAnimation(elementRef.current, finalText, options);
    }
    
    // No cleanup needed as the animation completes naturally
  }, [finalText, options]);
  
  return elementRef;
};

/**
 * React hook for split text animation
 */
export const useSplitTextAnimation = (
  options: SplitTextOptions = {}
) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef<gsap.Context | null>(null);
  
  useEffect(() => {
    if (elementRef.current) {
      // Clean up previous context if it exists
      if (contextRef.current) {
        contextRef.current.revert();
      }
      
      // Create new animation context
      contextRef.current = splitTextAnimation(elementRef.current, options);
    }
    
    return () => {
      // Clean up animation context
      if (contextRef.current) {
        contextRef.current.revert();
        contextRef.current = null;
      }
    };
  }, [options]);
  
  return elementRef;
}; 