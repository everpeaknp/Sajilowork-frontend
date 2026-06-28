'use client';

import type { EmployerListingCard } from '@/lib/employerApi';
import { useMemo, useState } from 'react';
import { GreenSparkSparkle, renderEmployerBrandLogo } from './employerLogos';

interface JobListing extends EmployerListingCard {
  logoColor: string;
  isSaved?: boolean;
}

interface EmployerJobsAtProps {
  employerName?: string;
  logoColor?: string;
  logoUrl?: string;
  logoText?: string;
  jobs?: EmployerListingCard[];
  jobsLive?: number;
  addedToday?: number;
  onJobSelect?: (job: EmployerListingCard) => void;
  triggerNotification?: (msg: string) => void;
}

export default function EmployerJobsAt({
  employerName = '',
  logoColor = 'serif-m',
  logoUrl,
  logoText,
  jobs: jobsProp,
  jobsLive,
  addedToday,
  onJobSelect,
  triggerNotification,
}: EmployerJobsAtProps) {
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});

  const jobs = useMemo(() => {
    const source = jobsProp ?? [];

    return source.map((job) => ({
      ...job,
      logoColor,
      isSaved: savedIds[job.id] ?? false,
    }));
  }, [logoColor, jobsProp, savedIds]);

  const liveCount = jobsLive ?? jobs.length;
  const todayCount = addedToday ?? 0;

  const handleSaveToggle = (id: string, title: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSavedIds((prev) => {
      const nextState = !prev[id];
      triggerNotification?.(
        nextState
          ? `Job saved: "${title}"`
          : `Removed "${title}" from saved jobs.`,
      );
      return { ...prev, [id]: nextState };
    });
  };

  return (
    <div className="space-y-4" id="employer-jobs-section">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h3 className="select-none text-xl font-normal tracking-tight text-black">Jobs at {employerName}</h3>
        <p className="text-sm text-neutral-500">
          {liveCount} open {liveCount === 1 ? 'job' : 'jobs'}
          {todayCount > 0 ? ` · ${todayCount} added today` : ''}
        </p>
      </div>

      {jobs.length === 0 ? (
        <p className="text-sm text-neutral-500">No open jobs posted yet.</p>
      ) : null}

      <div className="space-y-3">
        {jobs.map((job) => (
          <div
            key={job.id}
            onClick={() => onJobSelect?.(job)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onJobSelect?.(job);
            }}
            role="button"
            tabIndex={0}
            className="group flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:shadow-sm sm:p-5"
          >
            <div className="flex min-w-0 items-center gap-4">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full">
                {renderEmployerBrandLogo(job.logoColor, employerName, logoUrl, logoText)}
              </div>
              <div className="min-w-0">
                <h4 className="truncate text-sm font-semibold text-neutral-900 sm:text-base">
                  {job.title}
                </h4>
                <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
                  {job.budget} · {job.duration} · {job.locationType}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => handleSaveToggle(job.id, job.title, e)}
              className="shrink-0 cursor-pointer rounded-full p-2 transition-opacity hover:opacity-80"
              aria-label={job.isSaved ? 'Unsave job' : 'Save job'}
            >
              <GreenSparkSparkle />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
