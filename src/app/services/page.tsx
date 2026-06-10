'use client';

import { useState } from 'react';
import '@/components/LangingHome/landing-home.css';
import { discoverPageRoot, discoverPageTypo } from '@/components/LangingHome/landingTypography';
import { ServicesHero, BestServices, AvailableServices } from '@/components/services';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('');

  const handleServiceSearch = (query: string, category: string) => {
    setSearchQuery(query);
    setSearchCategory(category);
  };

  const clearServiceSearch = () => {
    setSearchQuery('');
    setSearchCategory('');
  };

  return (
    <div
      className={`${discoverPageRoot} ${discoverPageTypo} mobile-bottom-nav-offset min-h-screen overflow-x-hidden bg-white selection:bg-[#1161fe] selection:text-white`}
    >
      <Navbar />
      <main className="pb-2 md:pb-0">
        <ServicesHero onSearchSubmit={handleServiceSearch} />
        <BestServices />
        <AvailableServices
          searchQuery={searchQuery}
          searchCategory={searchCategory}
          onClearSearch={clearServiceSearch}
        />
      </main>
      <Footer />
    </div>
  );
}
