import React from 'react';
import Link from 'next/link';
import { PortfolioItem } from '@/data/portfolioData';

interface PortfolioNavigationProps {
  currentCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  portfolioItems: PortfolioItem[];
}

const PortfolioNavigation: React.FC<PortfolioNavigationProps> = ({
  currentCategory,
  onCategoryChange,
  categories,
  portfolioItems,
}) => {
  // Calculate count of items per category
  const getCategoryCount = (category: string): number => {
    if (category === 'All') {
      return portfolioItems.length;
    }
    return portfolioItems.filter(item => item.category.includes(category)).length;
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Projects</h2>
        <Link href="/" className="text-sm font-medium hover:underline">
          Back to Home
        </Link>
      </div>
      
      {/* Category filter */}
      <div className="overflow-x-auto pb-2">
        <div className="flex flex-nowrap md:flex-wrap gap-2 min-w-max md:min-w-0">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-4 py-2 rounded-full text-sm transition-colors whitespace-nowrap flex items-center ${
                currentCategory === category
                  ? 'bg-black text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              aria-pressed={currentCategory === category}
            >
              <span>{category}</span>
              <span className={`ml-2 inline-flex items-center justify-center w-5 h-5 text-xs rounded-full ${
                currentCategory === category ? 'bg-white text-black' : 'bg-gray-200 text-gray-700'
              }`}>
                {getCategoryCount(category)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioNavigation; 