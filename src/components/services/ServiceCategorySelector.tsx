import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useServices } from './ServicesContext';

const CategorySelectorContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  
  @media (max-width: 768px) {
    margin-bottom: var(--spacing-md);
  }
`;

const CategoryButton = styled(motion.button)<{ isActive: boolean }>`
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: ${props => props.isActive ? 'var(--color-primary)' : 'transparent'};
  color: ${props => props.isActive ? 'var(--color-text-light)' : 'var(--color-text)'};
  border: 2px solid var(--color-primary);
  border-radius: 30px;
  font-size: var(--font-size-small);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.isActive ? 'var(--color-primary-dark)' : 'var(--color-primary-light)'};
    color: var(--color-text-light);
    transform: translateY(-2px);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-primary-light);
  }
  
  @media (max-width: 480px) {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-xsmall);
  }
`;

const buttonVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 * custom,
      duration: 0.4
    }
  }),
  tap: { scale: 0.95 }
};

const ServiceCategorySelector: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory } = useServices();
  
  return (
    <CategorySelectorContainer>
      {categories.map((category, index) => (
        <CategoryButton
          key={category.id}
          isActive={selectedCategory === category.id}
          onClick={() => setSelectedCategory(category.id)}
          variants={buttonVariants}
          initial="initial"
          animate="animate"
          whileTap="tap"
          custom={index}
          aria-label={`Select ${category.name} category`}
        >
          {category.name}
        </CategoryButton>
      ))}
    </CategorySelectorContainer>
  );
};

export default ServiceCategorySelector; 