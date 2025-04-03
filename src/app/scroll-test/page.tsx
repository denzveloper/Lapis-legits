'use client';

import React from 'react';
import ScrollVideoTest from '../../components/ScrollVideoTest';
import Link from 'next/link';

const ScrollTestPage: React.FC = () => {
  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link 
          href="/"
          style={{
            display: 'inline-block',
            padding: '0.5rem 1rem',
            backgroundColor: '#333',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          ← Back to Home
        </Link>
        <h1>Scroll Video Hook Test</h1>
        <p>Scroll down to see how the useScrollVideo hook tracks scroll position and element visibility.</p>
      </div>
      
      {/* Section with different heights and colors to test the hook */}
      <ScrollVideoTest backgroundColor="#f8d7da" />
      <ScrollVideoTest height="150vh" backgroundColor="#d1ecf1" />
      <ScrollVideoTest backgroundColor="#d4edda" />
      <ScrollVideoTest height="200vh" backgroundColor="#fff3cd" />
      
      <div style={{ 
        padding: '2rem', 
        margin: '2rem 0', 
        backgroundColor: '#e9ecef',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h2>Test Complete</h2>
        <p>You've reached the end of the scroll test.</p>
        <Link 
          href="/"
          style={{
            display: 'inline-block',
            padding: '0.5rem 1rem',
            backgroundColor: '#333',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            marginTop: '1rem'
          }}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ScrollTestPage; 