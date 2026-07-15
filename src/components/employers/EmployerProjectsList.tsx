'use client';

import type { EmployerListingCard } from '@/lib/employerApi';
import { useMemo, useState } from 'react';
import { Star } from 'lucide-react';
import { renderEmployerBrandLogo } from './employerLogos';

interface Project extends EmployerListingCard {
  logoColor: string;
  isSparked?: boolean;
}

interface EmployerProjectsListProps {
  employerName?: string;
  logoColor?: string;
  logoUrl?: string;
  logoText?: string;
  projects?: EmployerListingCard[];
  onProjectSelect?: (project: EmployerListingCard) => void;
  triggerNotification?: (msg: string) => void;
}

export default function EmployerProjectsList({
  employerName = '',
  logoColor = 'serif-m',
  logoUrl,
  logoText,
  projects: projectsProp,
  onProjectSelect,
  triggerNotification,
}: EmployerProjectsListProps) {
  const [sparkedIds, setSparkedIds] = useState<Record<string, boolean>>({});

  const projects = useMemo(() => {
    const source = projectsProp ?? [];

    return source.map((project) => ({
      ...project,
      logoColor,
      isSparked: sparkedIds[project.id] ?? false,
    }));
  }, [logoColor, projectsProp, sparkedIds]);

  const handleSparkToggle = (id: string, title: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSparkedIds((prev) => {
      const nextState = !prev[id];
      triggerNotification?.(
        nextState
          ? `Project successfully saved to your favorites: "${title}"`
          : `Removed "${title}" from saved projects.`,
      );
      return { ...prev, [id]: nextState };
    });
  };

  return (
    <div className="space-y-4" id="employer-projects-section">
      <h3 className="select-none text-xl font-normal tracking-tight text-black dark:text-stone-100">Projects</h3>

      {projects.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">No open projects posted yet.</p>
      ) : null}

      <div className="space-y-3">
        {projects.map((proj) => (
          <div
            key={proj.id}
            id={`project-card-${proj.id}`}
            onClick={() => onProjectSelect?.(proj)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onProjectSelect?.(proj);
            }}
            role="button"
            tabIndex={0}
            className="group flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:shadow-sm sm:p-5 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 dark:hover:shadow-none"
          >
            <div className="flex min-w-0 items-center gap-4">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full">
                {renderEmployerBrandLogo(proj.logoColor, employerName, logoUrl, logoText)}
              </div>
              <div className="min-w-0">
                <h4 className="truncate text-sm font-semibold text-neutral-900 sm:text-base dark:text-stone-100">
                  {proj.title}
                </h4>
                <p className="mt-1 text-xs text-neutral-500 sm:text-sm dark:text-neutral-400">
                  {proj.budget} · {proj.duration} · {proj.locationType}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => handleSparkToggle(proj.id, proj.title, e)}
              className="shrink-0 cursor-pointer rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-amber-500 dark:hover:bg-neutral-800"
              aria-label={proj.isSparked ? 'Unsave project' : 'Save project'}
            >
              <Star
                className={`h-5 w-5 ${proj.isSparked ? 'fill-amber-400 text-amber-400' : ''}`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
