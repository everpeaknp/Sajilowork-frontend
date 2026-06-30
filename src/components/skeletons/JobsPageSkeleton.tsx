'use client';

import { memo } from 'react';
import { SkeletonSurface } from './primitives';
import { HeroSkeleton } from './HeroSkeleton';
import { HeaderSkeleton } from './HeaderSkeleton';
import { GridSkeleton } from './GridSkeleton';
import { PaginationSkeleton } from './PaginationSkeleton';

export const JobsPageSkeleton = memo(function JobsPageSkeleton() {
  return (
    <SkeletonSurface label="Loading jobs">
      <HeroSkeleton variant="jobs" />
      <section className="w-full border-b border-gray-100 bg-white px-4 pb-12 pt-0 sm:px-6 sm:pt-2 md:px-8 lg:px-12 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="w-full max-w-none">
          <HeaderSkeleton variant="jobs" className="mb-6 sm:mb-8" showMapLink />
          <GridSkeleton count={8} cardType="job" className="relative z-0 mt-2" />
          <PaginationSkeleton />
        </div>
      </section>
    </SkeletonSurface>
  );
});
