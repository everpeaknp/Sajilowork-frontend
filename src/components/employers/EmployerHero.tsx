'use client';

import type { FormEvent } from 'react';
import { Search } from 'lucide-react';
import HeroImage from '@/components/ui/hero-image';
import MarketplaceHeroBreadcrumbs from '@/components/marketplace/MarketplaceHeroBreadcrumbs';
import { MARKETPLACE_HERO_IMAGE } from '@/lib/placeholderImages';

interface EmployerHeroProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearchSubmit: (e: FormEvent) => void;
}

export default function EmployerHero({ searchQuery, onSearchQueryChange, onSearchSubmit }: EmployerHeroProps) {
  return (
    <section className="select-none bg-white px-4 pb-8 pt-8 sm:px-6 lg:px-8 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-7xl">
        <div
          id="employer-banner-box"
          className="relative flex min-h-[200px] w-full flex-col overflow-hidden rounded-[24px] border border-neutral-200/40 bg-[#f6f5f0] shadow-sm sm:min-h-[240px] md:min-h-[260px] dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none"
        >
          <MarketplaceHeroBreadcrumbs
            serpKey="employers"
            sectionPath="/employers"
            variant="light"
          />

          <div className="relative z-10 flex w-full flex-1 flex-col justify-center space-y-5 px-6 pb-6 pt-11 sm:px-8 sm:pb-8 sm:pt-12 md:max-w-[58%] md:px-10 md:pb-10 md:pt-12">
            <div className="space-y-1.5">
              <h1
                className="text-3xl font-black leading-none tracking-tight text-[#193E32] sm:text-4xl dark:text-stone-100"
                id="employer-title-label"
              >
                Employer List
              </h1>
              <p className="max-w-lg text-xs font-medium leading-relaxed text-neutral-500 sm:text-sm dark:text-neutral-400">
                Explore and filter premium tech platforms, design agencies, and verified global business leaders.
              </p>
            </div>

            <form
              onSubmit={onSearchSubmit}
              className="flex w-full max-w-2xl flex-col items-stretch gap-2 rounded-2xl border border-neutral-200/80 bg-white p-2 shadow-md sm:flex-row sm:items-center dark:border-neutral-700 dark:bg-neutral-950"
            >
              <div className="flex flex-1 items-center gap-2 px-3">
                <Search className="h-4 w-4 shrink-0 text-neutral-400" strokeWidth={2.5} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchQueryChange(e.target.value)}
                  placeholder="What company are you looking for?"
                  className="w-full border-none bg-transparent py-2.5 text-xs font-medium text-neutral-800 outline-none placeholder:text-neutral-400 focus:outline-none focus:ring-0 sm:text-sm dark:text-stone-100 dark:placeholder:text-neutral-500"
                />
              </div>

              <button
                type="submit"
                className="shrink-0 cursor-pointer rounded-xl bg-[#1C3F35] px-6 py-3 text-center text-xs font-bold text-white shadow-sm transition-all hover:bg-[#153129]"
              >
                Search
              </button>
            </form>
          </div>

          {/* Flush to bottom of hero (no bottom padding) */}
          <div className="relative z-10 mt-2 flex h-[130px] w-full items-end justify-center self-end overflow-hidden select-none sm:h-[160px] md:absolute md:bottom-0 md:right-4 md:mt-0 md:h-[min(200px,92%)] md:max-w-[36%] md:justify-end lg:right-8 xl:right-10">
            <HeroImage
              src={MARKETPLACE_HERO_IMAGE}
              alt="Employers and hiring professionals"
              className="block h-full max-w-full w-auto object-contain object-bottom drop-shadow-lg"
              width={480}
              height={560}
              priority
            />
          </div>

          <div className="pointer-events-none absolute left-0 top-0 h-48 w-24 -translate-x-12 rounded-full bg-emerald-400/10 blur-xl" />
          <div
            className="pointer-events-none absolute bottom-0 left-0 h-20 w-32 bg-amber-300/20"
            style={{ borderRadius: '0 100% 0 0' }}
          />
        </div>
      </div>
    </section>
  );
}
