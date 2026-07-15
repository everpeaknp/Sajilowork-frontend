'use client';

import { motion } from 'motion/react';
import { discoverBody, discoverHeadline } from '@/components/LangingHome/landingTypography';
import HeroImage from '@/components/ui/hero-image';
import MarketplaceHeroBreadcrumbs from '@/components/marketplace/MarketplaceHeroBreadcrumbs';
import { FREELANCER_HERO_PORTRAIT } from './freelancerData';

export default function FreelancerHero() {
  return (
    <section className="select-none bg-white px-4 pb-8 pt-8 sm:px-6 lg:px-8 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-7xl">
        <div className="relative flex min-h-[180px] w-full items-stretch overflow-hidden rounded-[24px] bg-[#FEF0EA] shadow-sm sm:min-h-[220px] lg:min-h-[280px] dark:bg-neutral-900 dark:shadow-none">
          <MarketplaceHeroBreadcrumbs
            serpKey="freelancers"
            sectionPath="/freelancers"
            variant="light"
          />

          <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-0 select-none">
            <svg
              viewBox="0 0 120 400"
              className="h-full w-[100px] text-[#fcd074] sm:w-[135px] md:w-[170px] lg:w-[210px] dark:text-amber-700/40"
              fill="currentColor"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path d="M 0 0 Q 110 200 0 400 L 0 400 L 0 0 Z" />
            </svg>
          </div>

          <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-0 select-none">
            <svg
              viewBox="0 0 120 400"
              className="h-full w-[100px] text-[#F4B393] sm:w-[135px] md:w-[170px] lg:w-[210px] dark:text-orange-900/35"
              fill="currentColor"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path d="M 120 0 Q 10 200 120 400 L 120 0 Z" />
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

          <div className="relative z-10 grid w-full grid-cols-1 items-center gap-8 py-6 pl-12 pr-12 pt-6 sm:pl-24 sm:pr-24 md:pl-28 md:pr-28 lg:grid-cols-12 lg:pb-0 lg:pl-36 lg:pr-36 lg:pt-8">
            <div className="flex flex-col justify-center py-4 text-left lg:col-span-7">
              <motion.h1
                className={`${discoverHeadline} mb-2 text-2xl font-normal leading-tight tracking-tight text-black sm:text-3xl md:text-[38px] dark:text-stone-100`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Freelancer List
              </motion.h1>

              <motion.p
                className={`${discoverBody} max-w-xl text-xs leading-relaxed tracking-tight text-black/70 sm:text-sm md:text-base dark:text-neutral-300`}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                All the Lorem Ipsum generators on the Internet tend to repeat.
              </motion.p>
            </div>

            <div className="relative mt-2 flex h-[140px] w-full items-end justify-end self-end select-none sm:h-[180px] lg:col-span-5 lg:mt-0 lg:h-[250px] xl:h-[280px]">
              <motion.div
                className="relative z-10 h-full"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <HeroImage
                  src={FREELANCER_HERO_PORTRAIT}
                  alt="Freelancer professional portrait"
                  className="block h-full w-auto object-contain object-bottom"
                  width={480}
                  height={560}
                  priority
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
