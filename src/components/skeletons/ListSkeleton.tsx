'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { SkeletonSurface } from './primitives';
import { ProjectCardSkeleton } from './ProjectCardSkeleton';
import { TaskCardSkeleton } from './TaskCardSkeleton';

export type ListCardType = 'project' | 'task';

export type ListSkeletonProps = {
  count?: number;
  cardType?: ListCardType;
  className?: string;
  compact?: boolean;
  showActions?: boolean;
  label?: string;
};

export const ListSkeleton = memo(function ListSkeleton({
  count = 4,
  cardType = 'project',
  className,
  compact = false,
  showActions = true,
  label = 'Loading listings',
}: ListSkeletonProps) {
  const Card = cardType === 'task' ? TaskCardSkeleton : ProjectCardSkeleton;

  return (
    <SkeletonSurface className={cn('space-y-4', className)} label={label}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} compact={compact} showActions={showActions} />
      ))}
    </SkeletonSurface>
  );
});
