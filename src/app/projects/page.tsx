'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import '@/components/LangingHome/landing-home.css';
import { discoverPageRoot, discoverPageTypo } from '@/components/LangingHome/landingTypography';
import { Hero, ProjectList } from '@/components/projects';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';

function ProjectsPageContent() {
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
        document.getElementById('custom-project-board-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [searchParams]);

  const handleProjectSearch = (query: string, location: string) => {
    setSearchQuery(query);
    setSearchLocation(location);
  };

  const clearProjectSearch = () => {
    setSearchQuery('');
    setSearchLocation('');
    const url = new URL(window.location.href);
    url.searchParams.delete('q');
    url.searchParams.delete('location');
    window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
  };

  return (
    <main className="pb-2 md:pb-0">
      <Hero onSearchSubmit={handleProjectSearch} />
      <ProjectList
        searchQuery={searchQuery}
        searchLocation={searchLocation}
        onClearSearch={clearProjectSearch}
      />
    </main>
  );
}

export default function ProjectsPage() {
  return (
    <div
      className={`${discoverPageRoot} ${discoverPageTypo} mobile-bottom-nav-offset min-h-screen overflow-x-hidden bg-white selection:bg-[#1161fe] selection:text-white`}
    >
      <Navbar />
      <Suspense
        fallback={
          <main className="pb-2 md:pb-0">
            <Hero />
            <ProjectList />
          </main>
        }
      >
        <ProjectsPageContent />
      </Suspense>
      <Footer />
    </div>
  );
}
