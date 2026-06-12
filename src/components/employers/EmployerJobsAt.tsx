'use client';

import { formatNPR } from '@/lib/nepalLocale';
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
  /** Demo placeholder cards for static mock employer pages only */
  useMockFallback?: boolean;
  jobsLive?: number;
  addedToday?: number;
  onJobSelect?: (job: EmployerListingCard) => void;
  triggerNotification?: (msg: string) => void;
}

function buildDefaultJobs(employerName: string, logoColor: string): JobListing[] {
  const logoVariants = [logoColor, 'monkey-face', 'cursive-in', 'linked-loops'];

  return [
    {
      id: 'job-1',
      title: 'Website Designer Required For Directory Theme',
      company: employerName,
      budget: `${formatNPR(125000, { compact: true })} – ${formatNPR(135000, { compact: true })} Hourly`,
      duration: '1-5 Days',
      level: 'Expensive',
      locationType: 'Remote',
      logoColor: logoVariants[0],
      isSaved: false,
    },
    {
      id: 'job-2',
      title: 'Website Designer Required For Directory Theme',
      company: employerName,
      budget: `${formatNPR(125000, { compact: true })} – ${formatNPR(135000, { compact: true })} Hourly`,
      duration: '1-5 Days',
      level: 'Expensive',
      locationType: 'Remote',
      logoColor: logoVariants[1],
      isSaved: false,
    },
    {
      id: 'job-3',
      title: 'Website Designer Required For Directory Theme',
      company: employerName,
      budget: `${formatNPR(125000, { compact: true })} – ${formatNPR(135000, { compact: true })} Hourly`,
      duration: '1-5 Days',
      level: 'Expensive',
      locationType: 'Remote',
      logoColor: logoVariants[2],
      isSaved: false,
    },
    {
      id: 'job-4',
      title: 'Website Designer Required For Directory Theme',
      company: employerName,
      budget: `${formatNPR(125000, { compact: true })} – ${formatNPR(135000, { compact: true })} Hourly`,
      duration: '1-5 Days',
      level: 'Expensive',
      locationType: 'Remote',
      logoColor: logoVariants[3],
      isSaved: false,
    },
  ];
}

export default function EmployerJobsAt({
  employerName = 'Invision',
  logoColor = 'cursive-in',
  logoUrl,
  logoText,
  jobs: jobsProp,
  useMockFallback = false,
  jobsLive,
  addedToday,
  onJobSelect,
  triggerNotification,
}: EmployerJobsAtProps) {
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});

  const jobs = useMemo(() => {
    const source =
      jobsProp !== undefined
        ? jobsProp
        : useMockFallback
          ? buildDefaultJobs(employerName, logoColor).map(({ logoColor: color, ...rest }) => rest)
          : [];

    return source.map((job, index) => ({
      ...job,
      logoColor: jobsProp
        ? logoColor
        : (buildDefaultJobs(employerName, logoColor)[index]?.logoColor ?? logoColor),
      isSaved: savedIds[job.id] ?? false,
    }));
  }, [employerName, logoColor, jobsProp, useMockFallback, savedIds]);

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

  const displayName = employerName.split(' ')[0];

  return (
    <div className="w-full min-w-0 space-y-6" id="employer-jobs-section">
      <div className="space-y-1">
        <h3 className="text-2xl font-normal tracking-tight text-black sm:text-[28px]">
          {jobs.length} jobs at {displayName}
        </h3>
        <p className="text-sm text-neutral-400">
          {liveCount.toLocaleString()} jobs live
          {todayCount > 0 ? ` – ${todayCount} added today` : ''}
        </p>
      </div>

      {jobs.length === 0 ? (
        <p className="text-sm text-neutral-500">No open jobs posted yet.</p>
      ) : null}

      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            role="button"
            tabIndex={0}
            onClick={() => onJobSelect?.(job)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onJobSelect?.(job);
            }}
            className="group relative flex w-full cursor-pointer flex-col rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-gray-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full [&_svg]:h-12 [&_svg]:w-12">
                  {renderEmployerBrandLogo(logoColor, employerName, logoUrl, logoText)}
                </div>
                <span className="truncate text-sm font-medium text-[#45a874]">{job.company}</span>
              </div>

              <button
                type="button"
                onClick={(e) => handleSaveToggle(job.id, job.title, e)}
                className={`shrink-0 rounded-full p-1 transition-opacity hover:opacity-80 ${
                  job.isSaved ? 'opacity-100' : 'opacity-90'
                }`}
                aria-label="Save job"
                aria-pressed={job.isSaved}
              >
                <GreenSparkSparkle />
              </button>
            </div>

            <h4 className="mt-5 text-lg font-normal leading-[1.35] tracking-tight text-black transition-colors group-hover:text-[#45a874]">
              {job.title}
            </h4>

            <div className="mt-4 flex items-center text-[13px] font-normal text-black">
              <span>{job.budget}</span>
              <span className="mx-2 text-neutral-300">|</span>
              <span>{job.duration}</span>
            </div>

            <div className="mt-3 flex items-center text-[13px] font-normal text-black">
              <div className="mr-2 h-3.5 w-px bg-neutral-400" aria-hidden />
              <span>{job.level}</span>
              <span className="mx-2 text-neutral-300">|</span>
              <span>{job.locationType}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
