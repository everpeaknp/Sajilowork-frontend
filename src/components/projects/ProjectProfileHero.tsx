'use client';

import { motion } from 'motion/react';
import { Calendar, Eye, MapPin } from 'lucide-react';
import { getProjectMeta, type Project } from './projectListData';

const HERO_ILLUSTRATION =
  'https://freeio-app-nextjs.vercel.app/_next/image?url=%2Fimages%2Fabout%2Fhome6-hero-img-1.png&w=1200&q=75';

interface ProjectProfileHeroProps {
  project: Project;
}

export default function ProjectProfileHero({ project }: ProjectProfileHeroProps) {
  const meta = getProjectMeta(project);

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

      <div className="relative z-10 grid w-full grid-cols-1 items-center gap-4 px-8 py-5 sm:px-12 md:px-16 lg:grid-cols-12 lg:gap-4 lg:px-20 lg:py-6">
        <div className="flex flex-col justify-center lg:col-span-7 lg:pr-4">
          <motion.h1
            className="max-w-2xl text-2xl font-normal leading-tight tracking-tight text-black sm:text-3xl md:text-[34px]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {project.title}
          </motion.h1>

          <motion.div
            className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-normal text-black sm:gap-x-6"
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
