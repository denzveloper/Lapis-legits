import React from 'react';

interface PlaceholderImageProps {
  title: string;
}

const PlaceholderImage: React.FC<PlaceholderImageProps> = ({ title }) => {
  // Generate a pseudorandom color based on the title
  const generateColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use a dark color palette
    const hue = hash % 360;
    return `hsl(${hue}, 60%, 35%)`;
  };

  // Generate a lighter version for gradient
  const generateLighterColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = (hash % 360);
    return `hsl(${hue}, 60%, 45%)`;
  };

  const baseColor = generateColor(title);
  const lighterColor = generateLighterColor(title);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-800">
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="0 0 100 56.25" // 16:9 aspect ratio
        preserveAspectRatio="none"
      >
        {/* Background gradient */}
        <defs>
          <linearGradient id={`grad-${title.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={baseColor} />
            <stop offset="100%" stopColor={lighterColor} />
          </linearGradient>
        </defs>
        
        {/* Background rectangle */}
        <rect
          width="100"
          height="56.25"
          fill={`url(#grad-${title.replace(/\s+/g, '-')})`}
        />
        
        {/* Abstract shapes */}
        <circle cx="75" cy="20" r="15" fill="rgba(255,255,255,0.1)" />
        <path d="M0,56.25 L30,35 L45,40 L100,10 L100,56.25 Z" fill="rgba(0,0,0,0.2)" />
      </svg>
      
      {/* Title overlay */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <p className="text-white text-center font-medium drop-shadow-md">
          {title}
        </p>
      </div>
    </div>
  );
};

export default PlaceholderImage; 