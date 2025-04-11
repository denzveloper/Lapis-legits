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

export const VIDEO_POSITIONS = {
  LEFT: 'left',
  RIGHT: 'right',
  CENTER: 'center'
} as const;

export const TEXT_ANIMATIONS = {
  TYPEWRITER: 'typewriter',
  SCRAMBLE: 'scramble',
  SPLIT: 'split',
  FADE: 'fade',
  NONE: 'none'
} as const; 