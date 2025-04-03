import React from 'react';
import PortfolioGrid from '@/components/portfolio/PortfolioGrid';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LAPIS | Portfolio',
  description: 'Explore our portfolio of creative video work.',
};

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-black text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Our Work</h1>
          <p className="text-xl md:text-2xl max-w-2xl opacity-80">
            Explore our collection of creative video projects, showcasing our expertise in visual storytelling.
          </p>
        </div>
      </section>
      
      {/* Portfolio Grid Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <PortfolioGrid />
        </div>
      </section>
    </main>
  );
} 