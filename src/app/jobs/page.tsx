'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import '@/components/LangingHome/landing-home.css';
import { discoverPageRoot, discoverPageTypo } from '@/components/LangingHome/landingTypography';
import { JobHero, JobList } from '@/components/jobs';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';

function JobsPageContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    const location = searchParams.get('location') ?? '';
    setSearchQuery(q);
    setSearchLocation(location);

    if (q || location) {
      requestAnimationFrame(() => {
        document.getElementById('custom-job-board-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [searchParams]);

  const handleJobSearch = (query: string, location: string) => {
    setSearchQuery(query);
    setSearchLocation(location);
  };

  const clearJobSearch = () => {
    setSearchQuery('');
    setSearchLocation('');
    const url = new URL(window.location.href);
    url.searchParams.delete('q');
    url.searchParams.delete('location');
    window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
  };

  return (
    <main className="pb-2 md:pb-0">
      <JobHero onSearchSubmit={handleJobSearch} />
      <JobList
        searchQuery={searchQuery}
        searchLocation={searchLocation}
        onClearSearch={clearJobSearch}
      />
    </main>
  );
}

export default function JobsPage() {
  return (
    <div
      className={`${discoverPageRoot} ${discoverPageTypo} mobile-bottom-nav-offset min-h-screen overflow-x-clip bg-white pb-4 selection:bg-[#1161fe] selection:text-white md:pb-0`}
    >
      <Navbar />
      <Suspense
        fallback={
          <main className="pb-2 md:pb-0">
            <JobHero />
            <JobList />
          </main>
        }
      >
        <JobsPageContent />
      </Suspense>
      <Footer />
    </div>
  );
}
