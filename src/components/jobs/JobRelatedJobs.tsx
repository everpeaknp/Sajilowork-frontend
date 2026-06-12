'use client';

import type { MouseEvent } from 'react';
import Link from 'next/link';
import { discoverBody } from '@/components/LangingHome/landingTypography';
import JobCompanyLogo from './JobCompanyLogo';
import { getJobDetailPath } from './jobSlug';
import {
  getJobLocationLabel,
  type Job,
} from './jobListData';
import { getJobsLiveSubtitle } from '@/lib/jobApi';
import { toggleJobSaved, useSavedJobIds } from './jobBookmarks';

interface JobRelatedJobsProps {
  job: Job;
  relatedJobs?: Job[];
}

function MetaDivider() {
  return <span className="mx-2 text-neutral-300" aria-hidden>|</span>;
}

export default function JobRelatedJobs({ job, relatedJobs = [] }: JobRelatedJobsProps) {
  const related = relatedJobs;
  const savedJobIds = useSavedJobIds();

  const toggleStar = (jobId: string, e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleJobSaved(jobId);
  };

  if (related.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="text-lg font-normal tracking-tight text-black sm:text-xl">Related Jobs</h2>
      <p className="mt-1 text-sm font-light text-neutral-500">
        {getJobsLiveSubtitle(related.length > 0 ? related.length + 1 : 1)}
      </p>

      <ul className={`${discoverBody} mt-6 list-none space-y-4 p-0`}>
        {related.map((relatedJob) => {
          const isStarred = savedJobIds.includes(relatedJob.id);
          const locationLabel = getJobLocationLabel(relatedJob.location);

          return (
            <li key={relatedJob.id}>
              <Link
                href={getJobDetailPath(relatedJob)}
                className="group block rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.12)] ${relatedJob.companyLogoBg}`}
                  >
                    <JobCompanyLogo type={relatedJob.companyIconType} className="h-6 w-6 text-white" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[15px] font-normal leading-snug text-black transition-colors group-hover:text-[#45a874]">
                        {relatedJob.title}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => toggleStar(relatedJob.id, e)}
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
                          isStarred
                            ? 'border-amber-300 bg-amber-50 text-amber-500'
                            : 'border-[#45a874]/25 bg-white text-[#45a874] hover:bg-[#45a874]/5'
                        }`}
                        aria-label={isStarred ? 'Remove bookmark' : 'Bookmark job'}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className={`h-3.5 w-3.5 ${isStarred ? 'fill-amber-500 text-amber-500' : 'text-[#45a874]'}`}
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </button>
                    </div>

                    <p className="mt-1.5 text-sm font-normal text-[#45a874]">{relatedJob.companyName}</p>

                    <div className="mt-2 flex flex-wrap items-center text-xs font-light text-neutral-500 sm:text-[13px]">
                      <span>
                        {relatedJob.budgetLabel} {relatedJob.type}
                      </span>
                      <MetaDivider />
                      <span>{relatedJob.duration}</span>
                      <MetaDivider />
                      <span>{relatedJob.expenseLevel}</span>
                      <MetaDivider />
                      <span>{locationLabel}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
