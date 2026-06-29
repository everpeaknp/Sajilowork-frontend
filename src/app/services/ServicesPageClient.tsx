'use client';

import { useState } from 'react';
import '@/components/LangingHome/landing-home.css';
import { discoverPageRoot, discoverPageTypo } from '@/components/LangingHome/landingTypography';
import { ServicesHero, BestServices, AvailableServices } from '@/components/services';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import type { Service } from '@/components/services/serviceListData';

type ServicesPageClientProps = {
  initialServices?: Service[];
  initialTotal?: number;
};

export default function ServicesPageClient({
  initialServices,
  initialTotal,
}: ServicesPageClientProps) {
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
      className={`${discoverPageRoot} ${discoverPageTypo} mobile-bottom-nav-offset min-h-screen overflow-x-clip bg-white pb-4 selection:bg-[#1161fe] selection:text-white md:pb-0`}
    >
      <Navbar />
      <main className="pb-2 md:pb-0">
        <ServicesHero onSearchSubmit={handleServiceSearch} />
        <BestServices />
        <AvailableServices
          searchQuery={searchQuery}
          searchCategory={searchCategory}
          onClearSearch={clearServiceSearch}
          initialServices={initialServices}
          initialTotal={initialTotal}
        />
      </main>
      <Footer />
    </div>
  );
}
