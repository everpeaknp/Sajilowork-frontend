'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { SkeletonBone } from './primitives';

export type SearchSkeletonProps = {
  className?: string;
  variant?: 'jobs' | 'default';
  showCategory?: boolean;
};

export const SearchSkeleton = memo(function SearchSkeleton({
  className,
  variant = 'default',
  showCategory = false,
}: SearchSkeletonProps) {
  const wide = variant === 'jobs';

  return (
    <div
      role="presentation"
      aria-hidden
      className={cn('w-full', wide ? 'max-w-[760px]' : 'max-w-[560px]', className)}
    >
      <div
        className={cn(
          'flex w-full flex-col gap-2 rounded-xl border border-neutral-200/60 bg-white p-1.5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900',
          wide ? 'md:flex-row md:items-center' : 'sm:flex-row sm:items-center sm:gap-0',
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 py-1 pl-2">
          <SkeletonBone className="h-5 w-5 shrink-0" rounded="rounded-md" />
          <SkeletonBone className="h-5 flex-1 max-w-[200px]" />
        </div>
        {wide ? (
          <>
            <div className="hidden h-8 w-px bg-neutral-200 md:block dark:bg-neutral-700" />
            <div className="flex min-w-0 flex-1 items-center gap-2 py-1 pl-2 md:max-w-[220px]">
              <SkeletonBone className="h-5 w-5 shrink-0" rounded="rounded-md" />
              <SkeletonBone className="h-5 flex-1" />
            </div>
          </>
        ) : null}
        {showCategory ? (
          <>
            <div className="hidden h-8 w-px bg-neutral-200 sm:block dark:bg-neutral-700" />
            <SkeletonBone className="h-10 w-full sm:w-36" rounded="rounded-lg" />
          </>
        ) : null}
        <SkeletonBone className="h-10 w-full sm:w-24" rounded="rounded-lg" />
      </div>
    </div>
  );
});
