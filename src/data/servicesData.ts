import { VideoSource } from '@/utils/videoPreloader';

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  category?: string;
  videoSources: VideoSource[];
  thumbnailSrc: string;
  features?: string[];
}

// Service categories
export const serviceCategories: ServiceCategory[] = [
  {
    id: 'commercial',
    name: 'Commercial',
    description: 'High-quality commercial videos that drive engagement and conversions for your brand.'
  },
  {
    id: 'documentary',
    name: 'Documentary',
    description: 'Authentic documentary storytelling that connects with audiences on a deeper level.'
  },
  {
    id: 'events',
    name: 'Events',
    description: 'Dynamic event coverage that captures the energy and highlights of your special moments.'
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Professional corporate videos that communicate your company\'s message effectively.'
  },
  {
    id: 'social',
    name: 'Social Media',
    description: 'Engaging social media content optimized for different platforms and audience engagement.'
  }
];

// Services data
export const services: Service[] = [
  {
    id: 'commercial-brand',
    title: 'Brand Commercials',
    shortDescription: 'Cinematic brand storytelling',
    description: 'Cinematic commercials that tell your brand story and connect with your audience emotionally. Our brand commercials focus on creating a memorable impression that resonates with viewers.',
    categoryId: 'commercial',
    category: 'Commercial',
    videoSources: [
      { src: '/videos/SAC Final Cut.mov', type: 'video/quicktime' }
    ],
    thumbnailSrc: '/images/commercial-poster.jpg',
    features: [
      'Concept development and storyboarding',
      'High-quality production with professional crew',
      'Cinematic visual style with premium equipment',
      'Custom music and sound design',
      'Multiple delivery formats for different platforms'
    ]
  },
  {
    id: 'commercial-product',
    title: 'Product Videos',
    shortDescription: 'Showcase your products',
    description: 'Highlight your products with detailed and visually appealing videos that showcase features, benefits, and use cases. Our product videos are designed to drive conversions and sales.',
    categoryId: 'commercial',
    category: 'Commercial',
    videoSources: [
      { src: '/videos/SAC Final Cut.mov', type: 'video/quicktime' }
    ],
    thumbnailSrc: '/images/commercial-poster.jpg',
    features: [
      'Product feature highlighting',
      'Demonstration of product benefits',
      'Clean, professional lighting and setup',
      'Close-up detail shots',
      'Engaging presentation style'
    ]
  },
  {
    id: 'documentary-short',
    title: 'Short Documentaries',
    shortDescription: 'Compelling short-form stories',
    description: 'Concise documentaries that tell powerful stories in a condensed format, perfect for digital platforms and campaigns that require impactful storytelling.',
    categoryId: 'documentary',
    category: 'Documentary',
    videoSources: [
      { src: '/videos/SAC Final Cut.mov', type: 'video/quicktime' }
    ],
    thumbnailSrc: '/images/documentary-poster.jpg',
    features: [
      'Journalistic research and story development',
      'Interview filming and direction',
      'B-roll footage acquisition',
      'Narrative structure development',
      'Authentic storytelling approach'
    ]
  },
  {
    id: 'documentary-series',
    title: 'Documentary Series',
    shortDescription: 'Multi-episode documentary content',
    description: 'In-depth documentary series that explore complex subjects across multiple episodes, providing rich storytelling and deeper audience engagement over time.',
    categoryId: 'documentary',
    category: 'Documentary',
    videoSources: [
      { src: '/videos/SAC Final Cut.mov', type: 'video/quicktime' }
    ],
    thumbnailSrc: '/images/documentary-poster.jpg',
    features: [
      'Long-form storytelling with episode arcs',
      'Comprehensive subject exploration',
      'Multiple interview sources and perspectives',
      'Episodic structure and continuity',
      'Extended engagement strategy'
    ]
  },
  {
    id: 'events-live',
    title: 'Live Event Coverage',
    shortDescription: 'Capture events as they happen',
    description: 'Real-time event documentation that captures the energy and highlights of your special moments, from conferences to concerts to private celebrations.',
    categoryId: 'events',
    category: 'Events',
    videoSources: [
      { src: '/videos/SAC Final Cut.mov', type: 'video/quicktime' }
    ],
    thumbnailSrc: '/images/events-poster.jpg',
    features: [
      'Multi-camera setup for comprehensive coverage',
      'Live switching and editing capabilities',
      'Real-time content delivery options',
      'Highlight reel production',
      'Audio capture and mixing'
    ]
  },
  {
    id: 'corporate-training',
    title: 'Training Videos',
    shortDescription: 'Effective learning content',
    description: 'Clear and engaging training videos that effectively communicate procedures, policies, and skills to employees or customers.',
    categoryId: 'corporate',
    category: 'Corporate',
    videoSources: [
      { src: '/videos/SAC Final Cut.mov', type: 'video/quicktime' }
    ],
    thumbnailSrc: '/images/corporate-poster.jpg',
    features: [
      'Clear instructional content design',
      'Step-by-step visual demonstrations',
      'Professional narration and explanation',
      'On-screen text and graphics for key points',
      'Assessment-ready content structure'
    ]
  },
  {
    id: 'social-short',
    title: 'Social Media Shorts',
    shortDescription: 'Platform-optimized short content',
    description: 'Attention-grabbing short videos optimized for social media platforms, designed to increase engagement and shareability.',
    categoryId: 'social',
    category: 'Social Media',
    videoSources: [
      { src: '/videos/SAC Final Cut.mov', type: 'video/quicktime' }
    ],
    thumbnailSrc: '/images/social-poster.jpg',
    features: [
      'Platform-specific formatting and aspect ratios',
      'Short-form storytelling techniques',
      'Attention-grabbing opening moments',
      'Trend-aware content creation',
      'Caption and subtitle optimization'
    ]
  }
];

// Helper function to get services by category
export const getServicesByCategory = (categoryId: string): Service[] => {
  return services.filter(service => service.categoryId === categoryId);
}; 