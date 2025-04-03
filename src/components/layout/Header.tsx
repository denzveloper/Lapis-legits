'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { motion } from 'framer-motion';

const HeaderContainer = styled.header<{ scrolled: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: var(--z-index-menu);
  padding: ${props => props.scrolled ? 'var(--spacing-sm)' : 'var(--spacing-md)'} 0;
  background-color: ${props => props.scrolled ? 'rgba(10, 10, 10, 0.95)' : 'transparent'};
  backdrop-filter: ${props => props.scrolled ? 'blur(8px)' : 'none'};
  transition: all var(--transition-medium);
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
`;

const Logo = styled.div`
  font-size: var(--font-size-large);
  font-weight: 700;
  letter-spacing: 2px;
`;

const Nav = styled.nav`
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavList = styled.ul`
  display: flex;
  list-style: none;
  gap: var(--spacing-lg);
`;

const NavItem = styled.li`
  font-size: var(--font-size-base);
  font-weight: 500;
  
  a {
    position: relative;
    
    &:after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 0;
      height: 2px;
      background-color: var(--color-accent);
      transition: width var(--transition-fast);
    }
    
    &:hover:after {
      width: 100%;
    }
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
    font-size: var(--font-size-large);
  }
`;

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <HeaderContainer scrolled={scrolled}>
      <HeaderContent>
        <Logo>
          <Link href="/">LAPIS</Link>
        </Logo>
        
        <Nav>
          <NavList>
            <NavItem>
              <Link href="/#work">Our Work</Link>
            </NavItem>
            <NavItem>
              <Link href="/#services">Services</Link>
            </NavItem>
            <NavItem>
              <Link href="/#about">About</Link>
            </NavItem>
            <NavItem>
              <Link href="/#contact">Contact</Link>
            </NavItem>
          </NavList>
        </Nav>
        
        <MobileMenuButton aria-label="Toggle menu">
          ☰
        </MobileMenuButton>
      </HeaderContent>
    </HeaderContainer>
  );
}
