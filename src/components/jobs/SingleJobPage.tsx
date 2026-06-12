'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import JobAbout from './JobAbout';
import JobKeyResponsibilities from './JobKeyResponsibilities';
import JobProfileHero from './JobProfileHero';
import JobRelatedJobs from './JobRelatedJobs';
import JobShareSaveActions from './JobShareSaveActions';
import JobWorkExperience from './JobWorkExperience';
import type { Job } from './jobListData';

interface SingleJobPageProps {
  job: Job;
  relatedJobs?: Job[];
  onApply?: () => void;
}

export default function SingleJobPage({ job, relatedJobs, onApply }: SingleJobPageProps) {
  return (
    <div className="select-none bg-white pb-12 pt-8 font-normal text-black antialiased [&_button]:font-normal [&_h1]:font-normal [&_h2]:font-normal [&_h3]:font-normal [&_label]:font-normal [&_p]:font-normal [&_span]:font-normal">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex justify-end">
          <JobShareSaveActions job={job} />
        </div>

        <JobProfileHero job={job} onApply={onApply} />

        <div className="mx-auto w-full max-w-3xl">
          <JobAbout job={job} />
          <JobKeyResponsibilities job={job} />
          <JobWorkExperience job={job} onApply={onApply} />
          <JobRelatedJobs job={job} relatedJobs={relatedJobs} />

          <div className="mt-14 flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-sm font-normal text-neutral-500">
              Browse more opportunities on the full jobs directory.
            </p>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 text-sm font-normal text-black transition-opacity hover:opacity-80"
            >
              Back to all jobs
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
