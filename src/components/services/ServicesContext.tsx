import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Service, ServiceCategory, serviceCategories, services } from '@/data/servicesData';

interface ServicesContextType {
  services: Service[];
  categories: ServiceCategory[];
  selectedCategory: string | null;
  activeService: Service | null;
  setSelectedCategory: (categoryId: string | null) => void;
  setActiveService: (service: Service | null) => void;
  getServicesByCategory: (categoryId: string) => Service[];
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

interface ServicesProviderProps {
  children: ReactNode;
}

export const ServicesProvider: React.FC<ServicesProviderProps> = ({ children }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(serviceCategories[0]?.id || null);
  const [activeService, setActiveService] = useState<Service | null>(null);

  const getServicesByCategory = (categoryId: string): Service[] => {
    return services.filter(service => service.categoryId === categoryId);
  };

  const value = {
    services,
    categories: serviceCategories,
    selectedCategory,
    activeService,
    setSelectedCategory,
    setActiveService,
    getServicesByCategory
  };

  return (
    <ServicesContext.Provider value={value}>
      {children}
    </ServicesContext.Provider>
  );
};

export const useServices = (): ServicesContextType => {
  const context = useContext(ServicesContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return context;
}; 