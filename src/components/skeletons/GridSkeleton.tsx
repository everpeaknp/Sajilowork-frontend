'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { SkeletonSurface } from './primitives';
import { JobCardSkeleton } from './JobCardSkeleton';
import { ServiceCardSkeleton } from './ServiceCardSkeleton';

export type GridCardType = 'job' | 'service';

export type GridSkeletonProps = {
  count?: number;
  cardType?: GridCardType;
  className?: string;
  compact?: boolean;
  showImage?: boolean;
  showActions?: boolean;
  label?: string;
};

const GRID_CLASSES: Record<GridCardType, string> = {
  job: 'grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  service: 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3',
};

export const GridSkeleton = memo(function GridSkeleton({
  count = 8,
  cardType = 'job',
  className,
  compact = false,
  showImage = true,
  showActions = true,
  label = 'Loading listings',
}: GridSkeletonProps) {
  return (
    <SkeletonSurface className={cn(GRID_CLASSES[cardType], className)} label={label}>
      {Array.from({ length: count }).map((_, index) =>
        cardType === 'job' ? (
          <JobCardSkeleton key={index} compact={compact} showActions={showActions} />
        ) : (
          <ServiceCardSkeleton
            key={index}
            compact={compact}
            showImage={showImage}
            showActions={showActions}
          />
        ),
      )}
    </SkeletonSurface>
  );
});
