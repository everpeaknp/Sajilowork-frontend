'use client';

import { memo, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type SkeletonBoneProps = {
  className?: string;
  rounded?: string;
};

export const SkeletonBone = memo(function SkeletonBone({
  className,
  rounded = 'rounded-lg',
}: SkeletonBoneProps) {
  return (
    <div
      role="presentation"
      aria-hidden
      className={cn('skeleton-shimmer', rounded, className)}
    />
  );
});

export type SkeletonSurfaceProps = {
  children: ReactNode;
  className?: string;
  label?: string;
  busy?: boolean;
};

export const SkeletonSurface = memo(function SkeletonSurface({
  children,
  className,
  label = 'Loading content',
  busy = true,
}: SkeletonSurfaceProps) {
  return (
    <div
      className={cn('skeleton-fade-in', className)}
      aria-busy={busy}
      aria-label={label}
      aria-live="polite"
    >
      {children}
    </div>
  );
});

export const SKELETON_CARD_BORDER =
  'border border-neutral-200/80 bg-white shadow-sm dark:border-neutral-700/60 dark:bg-neutral-900';
