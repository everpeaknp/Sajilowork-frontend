'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import '@/components/LangingHome/landing-home.css';
import { discoverPageRoot, discoverPageTypo } from '@/components/LangingHome/landingTypography';
import { TaskHero, TaskList } from '@/components/task/browse';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import type { Task } from '@/types';

type TaskPageClientProps = {
  initialTasks?: Task[];
  initialTotal?: number;
};

function TaskBrowsePageContent({
  initialTasks,
  initialTotal,
}: Pick<TaskPageClientProps, 'initialTasks' | 'initialTotal'>) {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [categoryFromUrl, setCategoryFromUrl] = useState('');

  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    const location = searchParams.get('location') ?? '';
    const category = searchParams.get('category') ?? '';
    setSearchQuery(q);
    setSearchLocation(location);
    setCategoryFromUrl(category);

    if (q || location) {
      requestAnimationFrame(() => {
        document.getElementById('custom-task-board-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [searchParams]);

  const handleTaskSearch = (query: string, location: string) => {
    setSearchQuery(query);
    setSearchLocation(location);
  };

  const clearTaskSearch = () => {
    setSearchQuery('');
    setSearchLocation('');
    const url = new URL(window.location.href);
    url.searchParams.delete('q');
    url.searchParams.delete('location');
    window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
  };

  return (
    <main className="pb-2 md:pb-0">
      <TaskHero onSearchSubmit={handleTaskSearch} />
      <TaskList
        searchQuery={searchQuery}
        searchLocation={searchLocation}
        categoryFromUrl={categoryFromUrl}
        onClearSearch={clearTaskSearch}
        initialTasks={initialTasks}
        initialTotal={initialTotal}
      />
    </main>
  );
}

export default function TaskPageClient({ initialTasks, initialTotal }: TaskPageClientProps) {
  return (
    <div
      className={`${discoverPageRoot} ${discoverPageTypo} mobile-bottom-nav-offset min-h-screen overflow-x-clip bg-white pb-4 selection:bg-[#1161fe] selection:text-white md:pb-0 dark:bg-neutral-950 dark:selection:bg-brand-emerald`}
    >
      <Navbar />
      <Suspense
        fallback={
          <main className="pb-2 md:pb-0">
            <TaskHero />
            <TaskList initialTasks={initialTasks} initialTotal={initialTotal} />
          </main>
        }
      >
        <TaskBrowsePageContent initialTasks={initialTasks} initialTotal={initialTotal} />
      </Suspense>
      <Footer />
    </div>
  );
}
