'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { SkeletonBone, SKELETON_CARD_BORDER } from './primitives';

export type ServiceCardSkeletonProps = {
  className?: string;
  compact?: boolean;
  showImage?: boolean;
  showActions?: boolean;
};

export const ServiceCardSkeleton = memo(function ServiceCardSkeleton({
  className,
  compact = false,
  showImage = true,
  showActions = true,
}: ServiceCardSkeletonProps) {
  return (
    <div
      role="presentation"
      aria-hidden
      className={cn(
        'flex min-w-0 flex-col justify-between overflow-hidden rounded-xl',
        SKELETON_CARD_BORDER,
        className,
      )}
    >
      {showImage ? (
        <SkeletonBone rounded="rounded-none" className="aspect-[1.18/1] w-full flex-shrink-0" />
      ) : null}
      <div className={cn('flex flex-1 flex-col justify-between', compact ? 'p-4' : 'p-5 sm:p-6')}>
        <div className="space-y-2.5">
          <SkeletonBone className="h-3 w-16" />
          <SkeletonBone className="h-4 w-full" />
          <SkeletonBone className="h-4 w-[80%]" />
          <div className="flex items-center gap-1">
            <SkeletonBone className="h-3 w-3" rounded="rounded-sm" />
            <SkeletonBone className="h-3.5 w-10" />
            <SkeletonBone className="h-3.5 w-8" />
          </div>
        </div>
        {showActions ? (
          <div className="mt-5 flex items-center justify-between border-t border-neutral-200/80 pt-4 dark:border-neutral-700">
            <div className="flex min-w-0 items-center gap-2">
              <SkeletonBone rounded="rounded-full" className="h-7 w-7 shrink-0" />
              <SkeletonBone className="h-3 w-20" />
            </div>
            <div className="shrink-0 space-y-1 text-right">
              <SkeletonBone className="ml-auto h-2.5 w-14" />
              <SkeletonBone className="ml-auto h-4 w-20" />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
});
