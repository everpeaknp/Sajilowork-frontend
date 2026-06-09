'use client';

import { useMemo, useState } from 'react';
import { GreenSparkSparkle, renderCompanyLogo } from './employerLogos';

interface JobListing {
  id: string;
  title: string;
  company: string;
  budget: string;
  duration: string;
  level: string;
  locationType: string;
  logoColor: string;
  isSaved?: boolean;
}

interface EmployerJobsAtProps {
  employerName?: string;
  logoColor?: string;
  jobsLive?: number;
  addedToday?: number;
  onJobSelect?: (jobTitle: string) => void;
  triggerNotification?: (msg: string) => void;
}

function buildDefaultJobs(employerName: string, logoColor: string): JobListing[] {
  const logoVariants = [logoColor, 'monkey-face', 'cursive-in', 'linked-loops'];

  return [
    {
      id: 'job-1',
      title: 'Website Designer Required For Directory Theme',
      company: employerName,
      budget: '$125k–$135k Hourly',
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
      budget: '$125k–$135k Hourly',
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
      budget: '$125k–$135k Hourly',
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
      budget: '$125k–$135k Hourly',
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
  jobsLive = 2022,
  addedToday = 293,
  onJobSelect,
  triggerNotification,
}: EmployerJobsAtProps) {
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});

  const jobs = useMemo(
    () =>
      buildDefaultJobs(employerName, logoColor).map((job) => ({
        ...job,
        isSaved: savedIds[job.id] ?? job.isSaved ?? false,
      })),
    [employerName, logoColor, savedIds],
  );

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
          {jobsLive.toLocaleString()} jobs live – {addedToday} added today
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            role="button"
            tabIndex={0}
            onClick={() => onJobSelect?.(job.title)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onJobSelect?.(job.title);
            }}
            className="group relative flex w-full cursor-pointer flex-col rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-gray-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full [&_svg]:h-12 [&_svg]:w-12">
                  {renderCompanyLogo(job.logoColor, job.company)}
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
