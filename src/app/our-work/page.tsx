'use client';

import React from 'react';
import styled from 'styled-components';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PortfolioSnapSection from '@/components/portfolio/PortfolioSnapSection';

const Main = styled.main`
  width: 100%;
  min-height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text);
`;

export default function OurWorkPage() {
  return (
    <>
      <Header />
      <Main>
        <PortfolioSnapSection title="Our Work" />
      </Main>
      <Footer />
    </>
  );
} 