export interface PortfolioItem {
  id: string;
  title: string;
  client: string;
  date: string;
  category: string[];
  thumbnailUrl: string;
  videoUrl: string;
  description: string;
}

export const portfolioItems: PortfolioItem[] = [
  {
    id: '1',
    title: 'Brand Video',
    client: 'Acme Studios',
    date: '2023-06-15',
    category: ['Commercial', 'Brand'],
    thumbnailUrl: '/images/portfolio/placeholder-1.jpg',
    videoUrl: '/videos/placeholder-1.mp4',
    description: 'A captivating brand video showcasing the client\'s innovative products.',
  },
  {
    id: '2',
    title: 'Product Launch',
    client: 'TechVision',
    date: '2023-08-22',
    category: ['Commercial', 'Product'],
    thumbnailUrl: '/images/portfolio/placeholder-2.jpg',
    videoUrl: '/videos/placeholder-2.mp4',
    description: 'An exciting product launch video highlighting key features and benefits.',
  },
  {
    id: '3',
    title: 'Documentary Short',
    client: 'EcoImpact',
    date: '2023-04-10',
    category: ['Documentary', 'Short Film'],
    thumbnailUrl: '/images/portfolio/placeholder-3.jpg',
    videoUrl: '/videos/placeholder-3.mp4',
    description: 'A moving documentary about environmental conservation efforts.',
  },
  {
    id: '4',
    title: 'Social Media Campaign',
    client: 'Fashion Forward',
    date: '2023-10-05',
    category: ['Social Media', 'Fashion'],
    thumbnailUrl: '/images/portfolio/placeholder-4.jpg',
    videoUrl: '/videos/placeholder-4.mp4',
    description: 'A series of engaging social media videos promoting seasonal fashion collections.',
  },
  {
    id: '5',
    title: 'Corporate Event',
    client: 'Global Enterprises',
    date: '2023-09-18',
    category: ['Corporate', 'Event'],
    thumbnailUrl: '/images/portfolio/placeholder-5.jpg',
    videoUrl: '/videos/placeholder-5.mp4',
    description: 'Coverage of an international corporate event with keynote speeches and highlights.',
  },
  {
    id: '6',
    title: 'Music Video',
    client: 'Sonic Wave Records',
    date: '2023-07-30',
    category: ['Music', 'Creative'],
    thumbnailUrl: '/images/portfolio/placeholder-6.jpg',
    videoUrl: '/videos/placeholder-6.mp4',
    description: 'A visually stunning music video with innovative cinematography and visual effects.',
  },
  {
    id: '7',
    title: 'Travel Series',
    client: 'Wanderlust Magazine',
    date: '2023-05-12',
    category: ['Travel', 'Documentary'],
    thumbnailUrl: '/images/portfolio/placeholder-7.jpg',
    videoUrl: '/videos/placeholder-7.mp4',
    description: 'A breathtaking travel series showcasing exotic destinations and local cultures.',
  },
  {
    id: '8',
    title: 'Educational Content',
    client: 'Learn & Grow',
    date: '2023-11-02',
    category: ['Educational', 'Explainer'],
    thumbnailUrl: '/images/portfolio/placeholder-8.jpg',
    videoUrl: '/videos/placeholder-8.mp4',
    description: 'Educational videos explaining complex concepts in an accessible and engaging way.',
  },
];

export const categories = [
  'All',
  'Commercial',
  'Brand',
  'Product',
  'Documentary',
  'Short Film',
  'Social Media',
  'Fashion',
  'Corporate',
  'Event',
  'Music',
  'Creative',
  'Travel',
  'Educational',
  'Explainer',
]; 