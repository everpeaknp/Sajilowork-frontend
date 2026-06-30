'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { SkeletonBone, SKELETON_CARD_BORDER } from './primitives';

export type JobCardSkeletonProps = {
  className?: string;
  compact?: boolean;
  showActions?: boolean;
};

export const JobCardSkeleton = memo(function JobCardSkeleton({
  className,
  compact = false,
  showActions = true,
}: JobCardSkeletonProps) {
  return (
    <div
      role="presentation"
      aria-hidden
      className={cn(
        'flex min-h-[260px] flex-col justify-between rounded-xl p-5 sm:min-h-[300px] sm:p-7',
        SKELETON_CARD_BORDER,
        className,
      )}
    >
      <div>
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center">
            <SkeletonBone rounded="rounded-full" className="h-[54px] w-[54px] shrink-0" />
            <SkeletonBone className="ml-3.5 h-4 w-24" />
          </div>
          {showActions ? (
            <SkeletonBone rounded="rounded-full" className="h-9 w-9 shrink-0" />
          ) : null}
        </div>
        <div className={cn('space-y-2', compact ? 'mt-4' : 'mt-5 sm:mt-6')}>
          <SkeletonBone className="h-5 w-full" />
          <SkeletonBone className="h-5 w-[82%]" />
        </div>
        <div className="mb-4 mt-4 flex flex-wrap gap-2 sm:mb-6">
          <SkeletonBone className="h-3.5 w-28" />
          <SkeletonBone className="h-3.5 w-20" />
        </div>
      </div>
      <div className="mt-auto flex flex-wrap gap-2">
        <SkeletonBone className="h-3.5 w-20" />
        <SkeletonBone className="h-3.5 w-16" />
        <SkeletonBone className="h-3.5 w-24" />
      </div>
    </div>
  );
});
