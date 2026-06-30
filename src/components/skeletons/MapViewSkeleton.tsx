'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { SkeletonBone, SkeletonSurface } from './primitives';

export type MapViewSkeletonProps = {
  className?: string;
  /** Show faux marker pins */
  showMarkers?: boolean;
};

function MapMarkerBone({
  className,
  labelWidth = 'w-14',
}: {
  className?: string;
  labelWidth?: string;
}) {
  return (
    <div className={cn('absolute flex flex-col items-center gap-1', className)}>
      <SkeletonBone className={cn('h-6', labelWidth)} rounded="rounded-full" />
      <SkeletonBone className="h-3 w-3" rounded="rounded-full" />
    </div>
  );
}

export const MapViewSkeleton = memo(function MapViewSkeleton({
  className,
  showMarkers = true,
}: MapViewSkeletonProps) {
  return (
    <SkeletonSurface
      className={cn('relative h-full w-full overflow-hidden bg-surface-dim', className)}
      label="Loading map"
    >
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(rgb(203 213 225 / 0.45) 1px, transparent 1px),
            linear-gradient(90deg, rgb(203 213 225 / 0.45) 1px, transparent 1px)
          `,
          backgroundSize: '72px 72px',
        }}
        aria-hidden
      />

      <div
        className="absolute inset-0 bg-gradient-to-br from-slate-100/80 via-surface-dim to-slate-200/60"
        aria-hidden
      />

      <div
        className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-emerald/5 ring-1 ring-brand-emerald/10"
        aria-hidden
      />

      {showMarkers ? (
        <>
          <MapMarkerBone className="left-[22%] top-[30%]" labelWidth="w-16" />
          <MapMarkerBone className="left-[48%] top-[22%]" labelWidth="w-20" />
          <MapMarkerBone className="left-[62%] top-[38%]" labelWidth="w-[4.5rem]" />
          <MapMarkerBone className="left-[34%] top-[52%]" labelWidth="w-14" />
          <MapMarkerBone className="left-[70%] top-[58%]" labelWidth="w-16" />
          <MapMarkerBone className="left-[18%] top-[64%]" labelWidth="w-[4.25rem]" />
        </>
      ) : null}

      <div className="absolute bottom-[7.5rem] right-4 flex flex-col gap-2 lg:bottom-5">
        <SkeletonBone className="h-10 w-10" rounded="rounded-xl" />
      </div>

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-neutral-200/80 bg-white/90 px-4 py-2 shadow-sm backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/90">
        <SkeletonBone className="h-4 w-4" rounded="rounded-full" />
        <SkeletonBone className="h-3.5 w-28" />
      </div>
    </SkeletonSurface>
  );
});
