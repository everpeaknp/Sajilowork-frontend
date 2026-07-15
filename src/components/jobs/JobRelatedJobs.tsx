'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { discoverBody } from '@/components/LangingHome/landingTypography';
import JobCompanyLogo from './JobCompanyLogo';
import EmployerAvatarCircle from '@/components/employers/EmployerAvatarCircle';
import { getJobDetailPath } from './jobSlug';
import {
  getJobLocationLabel,
  type Job,
} from './jobListData';
import { getJobsLiveSubtitle } from '@/lib/jobApi';
import { buildBookmarkSlugSet, resolveListingSlug, toggleListingBookmark } from '@/lib/listingBookmark';

const EMPTY_RELATED_JOBS: Job[] = [];

interface JobRelatedJobsProps {
  job: Job;
  relatedJobs?: Job[];
}

function MetaDivider() {
  return <span className="mx-2 text-neutral-300 dark:text-neutral-600" aria-hidden>|</span>;
}

export default function JobRelatedJobs({ job, relatedJobs }: JobRelatedJobsProps) {
  const related = relatedJobs ?? EMPTY_RELATED_JOBS;
  const relatedSlugsKey = related
    .map((item) => resolveListingSlug(item.slug, item.id))
    .sort()
    .join('|');
  const [savedSlugs, setSavedSlugs] = useState<Set<string>>(() => buildBookmarkSlugSet(related));

  useEffect(() => {
    const jobs = relatedJobs ?? EMPTY_RELATED_JOBS;
    const next = buildBookmarkSlugSet(jobs);
    setSavedSlugs((prev) => {
      if (prev.size === next.size && [...prev].every((slug) => next.has(slug))) {
        return prev;
      }
      return next;
    });
  }, [relatedSlugsKey]);

  const toggleStar = async (relatedJob: Job, e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const slug = resolveListingSlug(relatedJob.slug, relatedJob.id);
    const isSaved = savedSlugs.has(slug);
    const next = await toggleListingBookmark(slug, isSaved, 'job');
    if (next === null) return;
    setSavedSlugs((prev) => {
      const updated = new Set(prev);
      if (next) updated.add(slug);
      else updated.delete(slug);
      return updated;
    });
  };

  if (related.length === 0) return null;

  return (
    <section className="mt-12 sm:mt-16">
      <h2 className="text-base font-normal tracking-tight text-black sm:text-lg md:text-xl dark:text-stone-100">Related Jobs</h2>
      <p className="mt-1 text-sm font-light text-neutral-500 dark:text-neutral-400">
        {getJobsLiveSubtitle(related.length > 0 ? related.length + 1 : 1)}
      </p>

      <ul className={`${discoverBody} mt-6 list-none space-y-4 p-0`}>
        {related.map((relatedJob) => {
          const slug = resolveListingSlug(relatedJob.slug, relatedJob.id);
          const isStarred = savedSlugs.has(slug);
          const locationLabel = getJobLocationLabel(relatedJob.location);

          return (
            <li key={relatedJob.id}>
              <Link
                href={getJobDetailPath(relatedJob)}
                className="group block rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] sm:p-5 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 dark:hover:shadow-none"
              >
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <EmployerAvatarCircle
                      name={relatedJob.employerLogoText || relatedJob.companyName}
                      avatarUrl={relatedJob.ownerAvatarUrl}
                      avatarBg={relatedJob.companyLogoBg}
                      verified={relatedJob.verified}
                      sizeClass="h-12 w-12"
                      useDemoIcon={!relatedJob.slug}
                      iconType={relatedJob.companyIconType}
                      renderIcon={(type, className) => (
                        <JobCompanyLogo type={type} className={className} />
                      )}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="line-clamp-2 text-sm font-normal leading-snug text-black transition-colors group-hover:text-[#45a874] sm:text-[15px] dark:text-stone-100">
                        {relatedJob.title}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => void toggleStar(relatedJob, e)}
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
                          isStarred
                            ? 'border-amber-300 bg-amber-50 text-amber-500 dark:border-amber-700 dark:bg-amber-950/40'
                            : 'border-[#45a874]/25 bg-white text-[#45a874] hover:bg-[#45a874]/5 dark:bg-neutral-900 dark:hover:bg-emerald-950/40'
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

                    <div className="mt-2 flex flex-wrap items-center text-xs font-light text-neutral-500 sm:text-[13px] dark:text-neutral-400">
                      <span>
                        {relatedJob.budgetLabel} {relatedJob.type}
                      </span>
                      <MetaDivider />
                      <span>{relatedJob.duration}</span>
                      <MetaDivider />
                      <span>{relatedJob.experienceLevel}</span>
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
