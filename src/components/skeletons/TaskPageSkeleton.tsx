'use client';

import { memo } from 'react';
import { SkeletonSurface } from './primitives';
import { HeroSkeleton } from './HeroSkeleton';
import { HeaderSkeleton } from './HeaderSkeleton';
import { FilterSidebarSkeleton } from './FilterSidebarSkeleton';
import { ListSkeleton } from './ListSkeleton';
import { PaginationSkeleton } from './PaginationSkeleton';

export const TaskPageSkeleton = memo(function TaskPageSkeleton() {
  return (
    <SkeletonSurface label="Loading tasks">
      <HeroSkeleton variant="task" />
      <section className="w-full border-b border-gray-100 bg-white px-4 pb-12 pt-0 sm:px-6 sm:pt-2 md:px-8 lg:px-12 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mx-auto w-full max-w-none">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-4">
            <FilterSidebarSkeleton variant="task" showSearch className="lg:col-span-1" />
            <div className="space-y-5 lg:col-span-3">
              <HeaderSkeleton variant="browse" className="mb-5" showMapLink />
              <ListSkeleton count={4} cardType="task" />
              <PaginationSkeleton />
            </div>
          </div>
        </div>
      </section>
    </SkeletonSurface>
  );
});
