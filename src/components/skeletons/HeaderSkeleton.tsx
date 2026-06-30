'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { SkeletonBone } from './primitives';

export type HeaderSkeletonVariant = 'jobs' | 'browse';

export type HeaderSkeletonProps = {
  variant?: HeaderSkeletonVariant;
  className?: string;
  showMapLink?: boolean;
  filterCount?: number;
};

export const HeaderSkeleton = memo(function HeaderSkeleton({
  variant = 'jobs',
  className,
  showMapLink = true,
  filterCount = 4,
}: HeaderSkeletonProps) {
  return (
    <div
      role="presentation"
      aria-hidden
      className={cn(
        'relative z-30 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pb-2 sm:pb-4',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
        {variant === 'jobs' ? (
          <div className="flex flex-wrap items-center gap-2">
            {Array.from({ length: filterCount }).map((_, i) => (
              <SkeletonBone
                key={i}
                className="h-10 w-[88px] sm:h-11 sm:w-[100px]"
                rounded="rounded-xl"
              />
            ))}
          </div>
        ) : null}
        <SkeletonBone className="h-5 w-36" />
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
        {showMapLink ? <SkeletonBone className="h-5 w-28" /> : null}
        <div className="flex items-center gap-1.5">
          <SkeletonBone className="h-4 w-12" />
          <SkeletonBone className="h-5 w-24" />
        </div>
      </div>
    </div>
  );
});
