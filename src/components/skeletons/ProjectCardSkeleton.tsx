'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { SkeletonBone, SKELETON_CARD_BORDER } from './primitives';

export type ProjectCardSkeletonProps = {
  className?: string;
  compact?: boolean;
  showActions?: boolean;
};

export const ProjectCardSkeleton = memo(function ProjectCardSkeleton({
  className,
  compact = false,
  showActions = true,
}: ProjectCardSkeletonProps) {
  return (
    <div
      role="presentation"
      aria-hidden
      className={cn(
        'box-border flex w-full shrink-0 flex-col overflow-hidden rounded-xl p-4 sm:p-6 lg:h-[248px] lg:min-h-[248px] lg:max-h-[248px] lg:flex-row lg:items-stretch',
        SKELETON_CARD_BORDER,
        className,
      )}
    >
      <div className="flex min-h-0 min-w-0 flex-1 gap-3 sm:gap-5">
        <SkeletonBone rounded="rounded-full" className="h-12 w-12 shrink-0" />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden">
          <SkeletonBone className="h-5 w-2/3 max-w-md" />
          <div className="flex flex-wrap gap-2">
            <SkeletonBone className="h-3.5 w-24" />
            <SkeletonBone className="h-3.5 w-20" />
            <SkeletonBone className="h-3.5 w-28" />
          </div>
          <div className="space-y-2">
            <SkeletonBone className="h-3.5 w-full max-w-lg" />
            <SkeletonBone className="h-3.5 w-4/5 max-w-md" />
          </div>
          {!compact ? (
            <div className="mt-auto flex max-h-[34px] flex-wrap gap-1.5 overflow-hidden">
              <SkeletonBone rounded="rounded-full" className="h-7 w-16" />
              <SkeletonBone rounded="rounded-full" className="h-7 w-20" />
              <SkeletonBone rounded="rounded-full" className="h-7 w-14" />
            </div>
          ) : null}
        </div>
      </div>
      {showActions ? (
        <div className="relative mt-4 shrink-0 border-t border-neutral-100 pt-4 dark:border-neutral-800 sm:pt-5 lg:mt-0 lg:flex lg:w-auto lg:self-stretch lg:border-0 lg:border-l lg:border-neutral-200 lg:pl-8 lg:pt-0 dark:lg:border-neutral-700">
          <div className="flex h-full w-full min-w-0 flex-col items-stretch justify-between gap-4 sm:items-end lg:min-w-[260px]">
            <SkeletonBone className="h-6 w-28 sm:ml-auto" />
            <SkeletonBone rounded="rounded-lg" className="h-9 w-32 sm:ml-auto" />
          </div>
        </div>
      ) : null}
    </div>
  );
});
