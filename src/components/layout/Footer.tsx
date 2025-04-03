'use client';

import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';

const FooterContainer = styled.footer`
  background-color: #050505;
  padding: var(--spacing-xl) 0;
`;

const FooterContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
`;

const FooterColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const FooterLogo = styled.div`
  font-size: var(--font-size-large);
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  letter-spacing: 2px;
`;

const FooterText = styled.p`
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-small);
  line-height: 1.6;
`;

const FooterHeading = styled.h3`
  font-size: var(--font-size-medium);
  margin-bottom: var(--spacing-md);
`;

const FooterLinks = styled.ul`
  list-style: none;
`;

const FooterLink = styled.li`
  margin-bottom: var(--spacing-sm);
  
  a {
    color: var(--color-text-secondary);
    transition: color var(--transition-fast);
    
    &:hover {
      color: var(--color-accent);
    }
  }
`;

const FooterBottom = styled.div`
  max-width: 1440px;
  margin: var(--spacing-lg) auto 0;
  padding: var(--spacing-lg) var(--spacing-lg) 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--spacing-md);
  }
`;

const Copyright = styled.p`
  color: var(--color-text-secondary);
  font-size: var(--font-size-small);
`;

const SocialLinks = styled.div`
  display: flex;
  gap: var(--spacing-md);
`;

const SocialLink = styled.a`
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
  
  &:hover {
    color: var(--color-accent);
  }
`;

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <FooterContent>
        <FooterColumn>
          <FooterLogo>LAPIS</FooterLogo>
          <FooterText>
            A video production agency specializing in creating immersive and engaging visual content for brands and businesses.
          </FooterText>
        </FooterColumn>
        
        <FooterColumn>
          <FooterHeading>Services</FooterHeading>
          <FooterLinks>
            <FooterLink>
              <Link href="/services/commercial">Commercial Production</Link>
            </FooterLink>
            <FooterLink>
              <Link href="/services/documentary">Documentary</Link>
            </FooterLink>
            <FooterLink>
              <Link href="/services/events">Event Coverage</Link>
            </FooterLink>
            <FooterLink>
              <Link href="/services/corporate">Corporate Videos</Link>
            </FooterLink>
          </FooterLinks>
        </FooterColumn>
        
        <FooterColumn>
          <FooterHeading>Company</FooterHeading>
          <FooterLinks>
            <FooterLink>
              <Link href="/about">About Us</Link>
            </FooterLink>
            <FooterLink>
              <Link href="/portfolio">Portfolio</Link>
            </FooterLink>
            <FooterLink>
              <Link href="/blog">Blog</Link>
            </FooterLink>
            <FooterLink>
              <Link href="/careers">Careers</Link>
            </FooterLink>
          </FooterLinks>
        </FooterColumn>
        
        <FooterColumn>
          <FooterHeading>Contact</FooterHeading>
          <FooterText>
            123 Creative Studio St.<br />
            Los Angeles, CA 90210<br />
            info@lapisproduction.com<br />
            +1 (323) 555-0123
          </FooterText>
        </FooterColumn>
      </FooterContent>
      
      <FooterBottom>
        <Copyright>© {currentYear} LAPIS. All rights reserved.</Copyright>
        <SocialLinks>
          <SocialLink href="https://instagram.com" target="_blank" aria-label="Instagram">
            Instagram
          </SocialLink>
          <SocialLink href="https://vimeo.com" target="_blank" aria-label="Vimeo">
            Vimeo
          </SocialLink>
          <SocialLink href="https://youtube.com" target="_blank" aria-label="YouTube">
            YouTube
          </SocialLink>
        </SocialLinks>
      </FooterBottom>
    </FooterContainer>
  );
}
