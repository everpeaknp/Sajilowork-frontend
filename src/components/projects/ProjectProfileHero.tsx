'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Calendar, Eye, MapPin } from 'lucide-react';
import EmployerAvatarCircle from '@/components/employers/EmployerAvatarCircle';
import { resolveEmployerProfileHref } from '@/components/employers/employerSlug';
import JobCompanyLogo from '@/components/jobs/JobCompanyLogo';
import { getProjectMeta, type Project } from './projectListData';
import { MARKETPLACE_HERO_IMAGE } from '@/lib/placeholderImages';

const HERO_ILLUSTRATION = MARKETPLACE_HERO_IMAGE;

interface ProjectProfileHeroProps {
  project: Project;
}

export default function ProjectProfileHero({ project }: ProjectProfileHeroProps) {
  const meta = getProjectMeta(project);
  const employerHref = resolveEmployerProfileHref({
    employerSlug: project.employerSlug,
    companyName: project.companyName,
    allowDemoLookup: !project.slug,
  });

  const employerAvatar = (
    <div className="relative shrink-0">
      <EmployerAvatarCircle
        name={project.employerLogoText || project.companyName}
        avatarUrl={project.ownerAvatarUrl}
        avatarBg={project.companyLogoBg}
        verified={project.verified}
        sizeClass="h-14 w-14 sm:h-16 sm:w-16"
        textClass="text-base font-semibold sm:text-lg"
        useDemoIcon={!project.slug}
        iconType={project.companyIconType}
        renderIcon={(type, className) => <JobCompanyLogo type={type} className={className} />}
      />
    </div>
  );

  return (
    <div className="relative flex min-h-[150px] w-full items-stretch overflow-hidden rounded-[20px] border border-neutral-200/20 bg-[#fbf2ed] shadow-sm sm:min-h-[165px] md:min-h-[175px] lg:min-h-[190px]">
      <div className="pointer-events-none absolute -left-12 -top-8 z-0 h-28 w-28 select-none rounded-full bg-[#fcd074]/80 sm:-left-14 sm:-top-9 sm:h-36 sm:w-36" />

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-[0.2] mix-blend-overlay">
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

      <div className="relative z-10 flex w-full flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:gap-4 sm:px-8 sm:py-5 md:px-12 lg:gap-5 lg:px-16 lg:py-6">
        {employerHref ? (
          <Link
            href={employerHref}
            className="shrink-0 transition-opacity hover:opacity-80"
            title={project.companyName}
          >
            {employerAvatar}
          </Link>
        ) : (
          employerAvatar
        )}

        <div className="min-w-0 flex-1 lg:pr-[min(42%,280px)]">
          <motion.h1
            className="max-w-2xl text-lg font-normal leading-snug tracking-tight text-black sm:text-2xl md:text-[28px] lg:text-[34px]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {project.title}
          </motion.h1>

          {employerHref ? (
            <Link
              href={employerHref}
              className="mt-1 inline-block text-sm font-normal text-[#45a874] transition-opacity hover:opacity-80 hover:underline"
            >
              {project.companyName}
            </Link>
          ) : (
            <p className="mt-1 text-sm font-normal text-[#45a874]">{project.companyName}</p>
          )}

          <motion.div
            className="mt-3 flex flex-col gap-2 text-xs font-normal text-black sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2 sm:text-sm md:gap-x-6"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
          >
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 stroke-[2] text-neutral-400" />
              {meta.locationLabel}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 stroke-[2] text-neutral-400" />
              {meta.postedDate}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-4 w-4 stroke-[2] text-neutral-400" />
              {meta.views.toLocaleString()} Views
            </span>
          </motion.div>
        </div>
      </div>

      <motion.img
        src={HERO_ILLUSTRATION}
        alt=""
        className="pointer-events-none absolute bottom-0 right-2 z-10 hidden h-[135px] w-auto max-w-[min(38%,260px)] object-contain object-bottom sm:right-4 sm:h-[145px] lg:block lg:right-6 lg:h-[158px] xl:h-[170px]"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        referrerPolicy="no-referrer"
        draggable={false}
      />
    </div>
  );
}
