'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { getEmployerProfilePathByCompanyName } from '@/components/employers/employerSlug';
import JobCompanyLogo from './JobCompanyLogo';
import {
  getExperienceShortLabel,
  getJobLocationLabel,
  type Job,
} from './jobListData';

interface JobProfileHeroProps {
  job: Job;
  onApply?: () => void;
}

function MetaDivider() {
  return <span className="mx-2.5 hidden h-3.5 w-px bg-neutral-300 sm:inline-block" aria-hidden />;
}

export default function JobProfileHero({ job, onApply }: JobProfileHeroProps) {
  const experienceLabel = getExperienceShortLabel(job.experienceLevel);
  const locationLabel = getJobLocationLabel(job.location);

  return (
    <section className="w-full">
      <div className="relative overflow-hidden rounded-[20px] border border-neutral-200/30 bg-[#f4f3ee] shadow-sm">
        <div className="pointer-events-none absolute -left-10 -top-10 z-0 h-32 w-32 select-none rounded-full bg-[#fcd074]/90 sm:-left-12 sm:-top-12 sm:h-40 sm:w-40" />
        <div className="pointer-events-none absolute -bottom-16 -right-10 z-0 h-44 w-44 select-none rounded-full bg-[#ffb89a]/55 sm:-bottom-20 sm:-right-14 sm:h-56 sm:w-56" />

        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-[0.18]">
          <svg
            className="h-full w-full text-neutral-500"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 800 400"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path d="M-50,100 C150,150 250,50 450,180 C650,310 750,150 850,220" strokeWidth="1.5" />
            <path d="M-50,130 C150,180 250,80 450,210 C650,340 750,180 850,250" strokeWidth="1.5" />
            <path d="M-50,160 C150,210 250,110 450,240 C650,370 750,210 850,280" strokeWidth="1.5" />
            <path d="M-50,200 C200,280 300,180 500,290 C700,400 800,280 900,320" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col gap-6 px-6 py-7 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:px-10">
          <div className="flex min-w-0 flex-1 items-start gap-4 sm:items-center sm:gap-5">
            <Link
              href={getEmployerProfilePathByCompanyName(job.companyName)}
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.12)] transition-opacity hover:opacity-80 sm:h-16 sm:w-16 ${job.companyLogoBg}`}
              title={job.companyName}
            >
              <JobCompanyLogo type={job.companyIconType} className="h-7 w-7 text-white sm:h-8 sm:w-8" />
            </Link>

            <div className="min-w-0 flex-1">
              <motion.h1
                className="text-xl font-normal leading-snug tracking-tight text-black sm:text-2xl md:text-[28px]"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                {job.title}
              </motion.h1>

              <Link
                href={getEmployerProfilePathByCompanyName(job.companyName)}
                className="mt-1 inline-block text-sm font-normal text-[#45a874] transition-opacity hover:opacity-80 hover:underline"
              >
                {job.companyName}
              </Link>

              <p className="mt-1 text-sm font-normal text-[#52C47F]">{experienceLabel}</p>

              <div className="mt-3 flex flex-wrap items-center text-[13px] font-normal text-black sm:text-sm">
                <span>
                  {job.budgetLabel} {job.type}
                </span>
                <MetaDivider />
                <span className="w-full sm:w-auto">{job.duration}</span>
                <MetaDivider />
                <span className="w-full sm:w-auto">{job.expenseLevel}</span>
                <MetaDivider />
                <span className="w-full sm:w-auto">{locationLabel}</span>
              </div>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={() => onApply?.()}
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-md bg-[#1D3E35] px-6 py-3 text-sm font-normal text-white transition-colors duration-200 hover:bg-[#5bbb7b] lg:self-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            Apply For Job
            <ArrowUpRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </section>
  );
}
