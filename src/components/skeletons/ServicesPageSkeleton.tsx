'use client';

import { memo } from 'react';
import { SkeletonSurface } from './primitives';
import { HeroSkeleton } from './HeroSkeleton';
import { CarouselSkeleton } from './CarouselSkeleton';
import { FilterSidebarSkeleton } from './FilterSidebarSkeleton';
import { HeaderSkeleton } from './HeaderSkeleton';
import { GridSkeleton } from './GridSkeleton';
import { PaginationSkeleton } from './PaginationSkeleton';

export const ServicesPageSkeleton = memo(function ServicesPageSkeleton() {
  return (
    <SkeletonSurface label="Loading services">
      <HeroSkeleton variant="services" />
      <CarouselSkeleton count={5} />
      <section className="w-full bg-white px-4 pb-12 pt-0 sm:px-6 sm:pb-14 sm:pt-2 md:px-8 lg:px-12 dark:bg-neutral-950">
        <div className="mx-auto w-full max-w-full">
          <div className="flex flex-col gap-10 lg:flex-row">
            <FilterSidebarSkeleton variant="services" />
            <div className="flex-1">
              <HeaderSkeleton variant="browse" className="mb-6 sm:mb-8" showMapLink={false} />
              <GridSkeleton count={6} cardType="service" />
              <PaginationSkeleton showRange />
            </div>
          </div>
        </div>
      </section>
    </SkeletonSurface>
  );
});
