'use client';

import { useState } from 'react';
import '@/components/LangingHome/landing-home.css';
import { discoverPageRoot, discoverPageTypo } from '@/components/LangingHome/landingTypography';
import { JobHero, JobList } from '@/components/jobs';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  const handleJobSearch = (query: string, location: string) => {
    setSearchQuery(query);
    setSearchLocation(location);
  };

  const clearJobSearch = () => {
    setSearchQuery('');
    setSearchLocation('');
  };

  return (
    <div
      className={`${discoverPageRoot} ${discoverPageTypo} mobile-bottom-nav-offset min-h-screen overflow-x-clip bg-white pb-4 selection:bg-[#1161fe] selection:text-white md:pb-0`}
    >
      <Navbar />
      <main className="pb-2 md:pb-0">
        <JobHero onSearchSubmit={handleJobSearch} />
        <JobList
          searchQuery={searchQuery}
          searchLocation={searchLocation}
          onClearSearch={clearJobSearch}
        />
      </main>
      <Footer />
    </div>
  );
}
