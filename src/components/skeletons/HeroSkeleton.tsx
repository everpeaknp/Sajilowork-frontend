'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { SkeletonBone } from './primitives';
import { SearchSkeleton } from './SearchSkeleton';

export type HeroSkeletonProps = {
  className?: string;
  variant?: 'jobs' | 'projects' | 'services' | 'task';
};

export const HeroSkeleton = memo(function HeroSkeleton({
  className,
  variant = 'jobs',
}: HeroSkeletonProps) {
  const isJobs = variant === 'jobs';

  return (
    <section
      role="presentation"
      aria-hidden
      className={cn('select-none bg-white px-4 pb-8 pt-6 sm:px-6 sm:pb-10 sm:pt-8 lg:px-8 dark:bg-neutral-950', className)}
    >
      <div className="mx-auto w-full max-w-7xl">
        <div
          className={cn(
            'relative flex w-full items-stretch overflow-hidden rounded-2xl bg-[#f6f5f0] sm:rounded-[24px] dark:bg-neutral-900',
            isJobs ? 'min-h-[200px] sm:min-h-[240px] lg:min-h-[280px]' : 'min-h-[200px] sm:min-h-[220px] lg:min-h-[260px]',
          )}
        >
          <div className="relative z-10 grid w-full grid-cols-1 items-stretch gap-4 px-5 pb-0 pt-7 sm:gap-6 sm:pl-20 sm:pr-10 sm:pt-9 md:pl-24 md:pr-14 lg:grid-cols-12 lg:pb-0 lg:pl-32 lg:pr-14 lg:pt-10">
            <div className="flex flex-col justify-center pb-4 lg:col-span-8 lg:pb-10">
              <SkeletonBone className="mb-2 h-8 w-56 sm:h-9 sm:w-64 md:h-10 md:w-72" />
              <SkeletonBone className="mb-5 h-4 w-full max-w-lg sm:mb-6" />
              <SkeletonBone className="mb-5 h-4 w-4/5 max-w-md sm:mb-6" />
              <SearchSkeleton variant={isJobs ? 'jobs' : 'default'} showCategory={variant === 'services'} />
            </div>
            <div className="relative hidden lg:col-span-4 lg:block">
              <SkeletonBone className="absolute bottom-0 right-0 h-[92%] w-[88%]" rounded="rounded-tl-[2rem]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
