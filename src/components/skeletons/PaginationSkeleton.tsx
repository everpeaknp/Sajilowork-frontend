'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { SkeletonBone } from './primitives';

export type PaginationSkeletonProps = {
  className?: string;
  pageCount?: number;
  showRange?: boolean;
};

export const PaginationSkeleton = memo(function PaginationSkeleton({
  className,
  pageCount = 5,
  showRange = true,
}: PaginationSkeletonProps) {
  return (
    <div
      role="presentation"
      aria-hidden
      className={cn('mt-12 flex flex-col items-center justify-center pb-4 sm:mt-16', className)}
    >
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <SkeletonBone rounded="rounded-full" className="h-9 w-9 sm:h-10 sm:w-10" />
        <div className="flex items-center gap-1 sm:gap-2">
          {Array.from({ length: pageCount }).map((_, i) => (
            <SkeletonBone key={i} rounded="rounded-full" className="h-9 w-9 sm:h-10 sm:w-10" />
          ))}
        </div>
        <SkeletonBone rounded="rounded-full" className="h-9 w-9 sm:h-10 sm:w-10" />
      </div>
      {showRange ? <SkeletonBone className="mt-4 h-4 w-48 sm:mt-4.5" /> : null}
    </div>
  );
});
