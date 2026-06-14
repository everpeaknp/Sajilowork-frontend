'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import EmployerAvatarCircle from '@/components/employers/EmployerAvatarCircle';
import { resolveEmployerProfileHref } from '@/components/employers/employerSlug';
import JobCompanyLogo from './JobCompanyLogo';
import {
  getExperienceShortLabel,
  getJobLocationLabel,
  type Job,
} from './jobListData';

interface JobProfileHeroProps {
  job: Job;
  onApply?: () => void;
  isOwner?: boolean;
  editHref?: string;
}

function MetaDivider() {
  return <span className="mx-2.5 hidden h-3.5 w-px bg-neutral-300 sm:inline-block" aria-hidden />;
}

export default function JobProfileHero({ job, onApply, isOwner = false, editHref }: JobProfileHeroProps) {
  const experienceLabel = getExperienceShortLabel(job.experienceLevel);
  const locationLabel = getJobLocationLabel(job.location);
  const employerHref = resolveEmployerProfileHref({
    employerSlug: job.employerSlug,
    companyName: job.companyName,
    allowDemoLookup: true,
  });

  const employerAvatar = (
    <div className="relative shrink-0">
      <EmployerAvatarCircle
        name={job.employerLogoText || job.companyName}
        avatarUrl={job.ownerAvatarUrl}
        avatarBg={job.companyLogoBg}
        verified={job.verified}
        sizeClass="h-14 w-14 sm:h-16 sm:w-16"
        textClass="text-base font-semibold sm:text-lg"
        useDemoIcon={!job.slug}
        iconType={job.companyIconType}
        renderIcon={(type, className) => <JobCompanyLogo type={type} className={className} />}
      />
    </div>
  );

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

        <div className="relative z-10 flex flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:px-10">
          <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-5">
            {employerHref ? (
              <Link
                href={employerHref}
                className="transition-opacity hover:opacity-80"
                title={job.companyName}
              >
                {employerAvatar}
              </Link>
            ) : (
              employerAvatar
            )}

            <div className="min-w-0 flex-1">
              <motion.h1
                className="text-lg font-normal leading-snug tracking-tight text-black sm:text-2xl md:text-[28px]"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                {job.title}
              </motion.h1>

              {employerHref ? (
                <Link
                  href={employerHref}
                  className="mt-1 inline-block text-sm font-normal text-[#45a874] transition-opacity hover:opacity-80 hover:underline"
                >
                  {job.companyName}
                </Link>
              ) : (
                <p className="mt-1 text-sm font-normal text-[#45a874]">{job.companyName}</p>
              )}

              <p className="mt-1 text-sm font-normal text-[#52C47F]">{experienceLabel}</p>

              <div className="mt-3 flex flex-col gap-1 text-xs font-normal text-black sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-0 sm:text-sm">
                <span>
                  {job.budgetLabel} {job.type}
                </span>
                <MetaDivider />
                <span>{job.duration}</span>
                <MetaDivider />
                <span>{job.expenseLevel}</span>
                <MetaDivider />
                <span>{locationLabel}</span>
              </div>
            </div>
          </div>

          {isOwner && editHref ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              <Link
                href={editHref}
                className="inline-flex w-full shrink-0 items-center justify-center gap-2 self-stretch rounded-md bg-[#1D3E35] px-6 py-3 text-sm font-normal text-white transition-colors duration-200 hover:bg-[#5bbb7b] sm:w-auto sm:self-start lg:self-center"
              >
                Edit Job
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ) : (
          <motion.button
            type="button"
            onClick={() => onApply?.()}
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 self-stretch rounded-md bg-[#1D3E35] px-6 py-3 text-sm font-normal text-white transition-colors duration-200 hover:bg-[#5bbb7b] sm:w-auto sm:self-start lg:self-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            Apply For Job
            <ArrowUpRight className="h-4 w-4" />
          </motion.button>
          )}
        </div>
      </div>
    </section>
  );
}
