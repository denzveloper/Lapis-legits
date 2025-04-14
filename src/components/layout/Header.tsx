'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const HeaderContainer = styled.header<{ $scrolled: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: var(--z-index-menu);
  padding: ${props => props.$scrolled ? 'var(--spacing-sm)' : 'var(--spacing-md)'} 0;
  background-color: ${props => props.$scrolled ? 'rgba(10, 10, 10, 0.95)' : 'transparent'};
  backdrop-filter: ${props => props.$scrolled ? 'blur(8px)' : 'none'};
  transition: all var(--transition-medium);
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  
  @media (max-width: 768px) {
    padding: 0 var(--spacing-md);
  }
`;

const Logo = styled.div`
  font-size: var(--font-size-large);
  font-weight: 700;
  letter-spacing: 2px;
  
  @media (max-width: 480px) {
    font-size: var(--font-size-medium);
  }
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

const MobileMenuButton = styled.button<{ $isOpen: boolean }>`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    color: var(--color-text-light);
    z-index: var(--z-index-menu);
    position: relative;
  }
`;

const MenuIcon = styled.div<{ $isOpen: boolean }>`
  position: relative;
  width: 24px;
  height: 2px;
  background-color: ${props => props.$isOpen ? 'transparent' : 'var(--color-text-light)'};
  transition: all 0.3s ease;
  
  &:before, &:after {
    content: '';
    position: absolute;
    width: 24px;
    height: 2px;
    background-color: var(--color-text-light);
    transition: all 0.3s ease;
  }
  
  &:before {
    transform: ${props => props.$isOpen ? 'rotate(45deg)' : 'translateY(-8px)'};
  }
  
  &:after {
    transform: ${props => props.$isOpen ? 'rotate(-45deg)' : 'translateY(8px)'};
  }
`;

const MobileMenu = styled(motion.div)`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.95);
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: var(--z-index-modal);
  }
`;

const MobileNavList = styled(motion.ul)`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  text-align: center;
`;

const MobileNavItem = styled(motion.li)`
  font-size: var(--font-size-xlarge);
  font-weight: 600;
  
  a {
    color: var(--color-text-light);
    transition: color var(--transition-fast);
    
    &:hover {
      color: var(--color-accent);
    }
  }
`;

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Prevent scrolling when menu is open
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  const menuVariants = {
    closed: {
      opacity: 0,
      y: "-100%",
      transition: {
        duration: 0.5,
        when: "afterChildren",
        staggerChildren: 0.1,
        staggerDirection: -1
      }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
        staggerDirection: 1
      }
    }
  };
  
  const itemVariants = {
    closed: { opacity: 0, y: 20 },
    open: { opacity: 1, y: 0 }
  };
  
  return (
    <HeaderContainer $scrolled={scrolled || isMenuOpen}>
      <HeaderContent>
        <Logo>
          <Link href="/">LAPIS</Link>
        </Logo>
        
        <Nav>
          <NavList>
            <NavItem>
              <Link href="/our-work">Our Work</Link>
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
        
        <MobileMenuButton 
          $isOpen={isMenuOpen} 
          onClick={toggleMenu} 
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          <MenuIcon $isOpen={isMenuOpen} />
        </MobileMenuButton>
      </HeaderContent>
      
      <AnimatePresence>
        {isMenuOpen && (
          <MobileMenu
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
          >
            <MobileNavList>
              <MobileNavItem variants={itemVariants}>
                <Link href="/our-work" onClick={closeMenu}>
                  Our Work
                </Link>
              </MobileNavItem>
              <MobileNavItem variants={itemVariants}>
                <Link href="/#services" onClick={closeMenu}>
                  Services
                </Link>
              </MobileNavItem>
              <MobileNavItem variants={itemVariants}>
                <Link href="/#about" onClick={closeMenu}>
                  About
                </Link>
              </MobileNavItem>
              <MobileNavItem variants={itemVariants}>
                <Link href="/#contact" onClick={closeMenu}>
                  Contact
                </Link>
              </MobileNavItem>
            </MobileNavList>
          </MobileMenu>
        )}
      </AnimatePresence>
    </HeaderContainer>
  );
}
