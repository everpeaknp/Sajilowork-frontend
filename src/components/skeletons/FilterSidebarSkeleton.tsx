'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { SkeletonBone } from './primitives';

export type FilterSidebarVariant = 'projects' | 'services' | 'task';

export type FilterSidebarSkeletonProps = {
  variant?: FilterSidebarVariant;
  sections?: number;
  className?: string;
  showSearch?: boolean;
};

const SECTION_LABELS: Record<FilterSidebarVariant, string[]> = {
  projects: ['Category', 'Project type', 'Price', 'Skills', 'Location', 'Language', 'English Level'],
  services: ['Delivery Time', 'Budget', 'Skills', 'Location', 'Speaks', 'Level'],
  task: ['Category', 'Location', 'Price', 'More filters'],
};

function AccordionSection({ showSlider }: { showSlider?: boolean }) {
  return (
    <div className="border-b border-neutral-200/80 pb-5 pt-5 first:pt-0 dark:border-neutral-700">
      <div className="mb-4 flex min-h-[40px] items-center justify-between">
        <SkeletonBone className="h-5 w-28" />
        <SkeletonBone className="h-4 w-4" rounded="rounded-sm" />
      </div>
      <div className="space-y-3 pl-1">
        {showSlider ? (
          <>
            <SkeletonBone className="h-1.5 w-full" rounded="rounded-full" />
            <div className="flex justify-between">
              <SkeletonBone className="h-3 w-16" />
              <SkeletonBone className="h-3 w-20" />
              <SkeletonBone className="h-3 w-16" />
            </div>
          </>
        ) : (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-1">
              <SkeletonBone className="h-4.5 w-4.5 shrink-0" rounded="rounded-full" />
              <SkeletonBone className="h-4 w-32" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export const FilterSidebarSkeleton = memo(function FilterSidebarSkeleton({
  variant = 'projects',
  sections,
  className,
  showSearch = false,
}: FilterSidebarSkeletonProps) {
  const labels = SECTION_LABELS[variant].slice(0, sections ?? SECTION_LABELS[variant].length);

  return (
    <div
      role="presentation"
      aria-hidden
      className={cn('w-full flex-shrink-0 rounded-2xl bg-white px-1 lg:w-[330px] dark:bg-neutral-900', className)}
    >
      {showSearch ? (
        <div className="mb-5">
          <SkeletonBone className="h-10 w-full" rounded="rounded-xl" />
        </div>
      ) : null}
      {labels.map((label) => (
        <AccordionSection
          key={label}
          showSlider={label === 'Budget' || label === 'Price'}
        />
      ))}
    </div>
  );
});
