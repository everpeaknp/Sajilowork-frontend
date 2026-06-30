'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { SkeletonBone } from './primitives';
import { ServiceCardSkeleton } from './ServiceCardSkeleton';
import { SkeletonSurface } from './primitives';

export type CarouselSkeletonProps = {
  count?: number;
  className?: string;
  showHeader?: boolean;
};

export const CarouselSkeleton = memo(function CarouselSkeleton({
  count = 5,
  className,
  showHeader = true,
}: CarouselSkeletonProps) {
  return (
    <section
      role="presentation"
      aria-hidden
      className={cn('w-full bg-white px-4 pb-4 pt-6 sm:px-6 sm:pb-6 sm:pt-8 md:px-8 lg:px-12 dark:bg-neutral-950', className)}
    >
      {showHeader ? (
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <SkeletonBone className="h-8 w-44 sm:h-9 sm:w-52" />
            <SkeletonBone className="h-4 w-64 max-w-full" />
          </div>
          <div className="flex items-center gap-3">
            <SkeletonBone className="h-5 w-32" />
            <SkeletonBone rounded="rounded-full" className="h-8 w-8" />
            <div className="flex gap-1.5">
              <SkeletonBone rounded="rounded-full" className="h-2.5 w-2.5" />
              <SkeletonBone rounded="rounded-full" className="h-2.5 w-2.5" />
              <SkeletonBone rounded="rounded-full" className="h-2.5 w-2.5" />
            </div>
            <SkeletonBone rounded="rounded-full" className="h-8 w-8" />
          </div>
        </div>
      ) : null}
      <SkeletonSurface
        className="flex gap-6 overflow-hidden pb-4"
        label="Loading featured services"
      >
        {Array.from({ length: count }).map((_, index) => (
          <ServiceCardSkeleton
            key={index}
            className="w-full shrink-0 sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] xl:w-[calc(20%-19.2px)]"
          />
        ))}
      </SkeletonSurface>
    </section>
  );
});
