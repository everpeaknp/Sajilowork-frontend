'use client';

import { motion } from 'motion/react';
import { Star, MapPin, Calendar } from 'lucide-react';
import { formatFreelancerRating } from '@/lib/freelancerProfileFromApi';
import type { Freelancer } from './freelancerData';

interface FreelancerProfileHeroProps {
  freelancer: Freelancer;
}

export default function FreelancerProfileHero({ freelancer }: FreelancerProfileHeroProps) {
  const ringParts = freelancer.ringColor.split(' ');

  return (
    <div className="relative mb-8 flex min-h-[220px] w-full items-stretch overflow-hidden rounded-[24px] border border-neutral-200/20 bg-[#FEF0EA] shadow-sm sm:min-h-[240px] lg:min-h-[280px]">
      <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-0 select-none">
        <svg
          viewBox="0 0 120 400"
          className="h-full w-[100px] text-[#fcd074] sm:w-[135px] md:w-[170px] lg:w-[210px]"
          fill="currentColor"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path d="M 0 0 Q 110 200 0 400 L 0 400 L 0 0 Z" />
        </svg>
      </div>

      <div className="pointer-events-none absolute bottom-0 right-0 z-0 select-none">
        <svg
          viewBox="0 0 200 200"
          className="h-[120px] w-[120px] text-[#F4B393]/90 sm:h-[160px] sm:w-[160px] md:h-[200px] md:w-[200px] lg:h-[240px] lg:w-[240px]"
          fill="currentColor"
          aria-hidden
        >
          <path d="M 200 200 L 0 200 C 60 140 140 60 200 0 Z" />
        </svg>
      </div>

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-[0.15] mix-blend-overlay">
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

      <div className="relative z-10 flex w-full flex-col justify-center px-10 py-10 text-left sm:px-20 md:px-24 lg:px-32">
        <motion.h1
          className="mb-6 max-w-4xl text-xl font-normal leading-tight tracking-tight text-black sm:text-2xl md:text-3xl lg:text-4xl"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {freelancer.headline}
        </motion.h1>

        <motion.div
          className="flex items-center gap-4 sm:gap-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="relative shrink-0 select-none">
            <div
              className={`flex h-[68px] w-[68px] items-center justify-center overflow-hidden rounded-full border-2 p-1 shadow-sm sm:h-[76px] sm:w-[76px] ${ringParts.join(' ')}`}
            >
              <img
                src={freelancer.avatar}
                alt={freelancer.name}
                className="h-full w-full rounded-full bg-neutral-100 object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {freelancer.availableNow ? (
              <span className="absolute bottom-0.5 right-0.5 inline-block h-3 w-3 rounded-full border-2 border-white bg-[#52C47F] shadow-sm sm:h-3.5 sm:w-3.5" />
            ) : null}
          </div>

          <div className="flex flex-col">
            <h2 className="text-sm font-normal leading-tight tracking-tight text-black sm:text-base md:text-lg">
              {freelancer.name}
            </h2>
            <p className="mt-0.5 text-xs font-normal text-black sm:text-sm">{freelancer.role}</p>

            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-normal leading-none text-black sm:gap-x-6 sm:text-xs">
              <div className="flex select-none items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 stroke-[1.5]" />
                <span className="font-normal text-black">
                  {formatFreelancerRating(freelancer.rating, freelancer.reviews)}
                </span>
                <span className="font-normal text-black">({freelancer.reviews} reviews)</span>
              </div>

              <div className="flex items-center gap-1 text-black">
                <MapPin className="h-3.5 w-3.5 stroke-[2.2] text-neutral-400" />
                <span className="font-normal text-black">{freelancer.location}</span>
              </div>

              <div className="flex items-center gap-1 text-black">
                <Calendar className="h-3.5 w-3.5 stroke-[2.2] text-neutral-400" />
                <span className="font-normal text-black">{freelancer.memberSince}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
