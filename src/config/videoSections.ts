import { TEXT_ANIMATIONS, VIDEO_POSITIONS } from '../components/video/LazyVideoSection';
import { VideoSection } from '../components/video/SnapScrollVideoSection';

export const videoSections: VideoSection[] = [
  {
    id: 'intro',
    title: 'Welcome to Lapis',
    subtitle: 'Creating beautiful digital experiences',
    videoSrc: { src: '/videos/lapis_demo.mp4', type: 'video/mp4' },
    textPosition: VIDEO_POSITIONS.CENTER,
    textColor: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    textAnimation: TEXT_ANIMATIONS.TYPEWRITER,
    textAnimationOptions: {
      duration: 1,
      delay: 0,
      cursor: true,
      cursorChar: '|',
      cursorColor: '#ffffff',
      cursorStyle: 'blink',
      cursorBlinkSpeed: 0.5,
      randomize: true,
      speedVariation: 0.6,
      pauseProbability: 0.4,
      maxPauseDuration: 0.1
    }
  }
]; 