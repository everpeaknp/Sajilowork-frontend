'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search as SearchIcon, ChevronDown } from 'lucide-react';
import {
  discoverBody,
  discoverHeadline,
  discoverMedium,
} from '@/components/LangingHome/landingTypography';
import HeroImage from '@/components/ui/hero-image';
import MarketplaceHeroBreadcrumbs from '@/components/marketplace/MarketplaceHeroBreadcrumbs';
import { MARKETPLACE_HERO_IMAGE } from '@/lib/placeholderImages';

const SUGGESTIONS_DATABASE = [
  'Website Designer',
  'React Developer',
  'WordPress Specialist',
  'Mobile App Developer',
  'PHP Laravel Developer',
  'Senior Frontend Engineer',
  'UI/UX Designer',
  'Graphic Designer',
  'SEO Specialist',
  'Content Writer',
];

const LOCATION_OPTIONS = [
  { value: '', label: 'City, state, or zip' },
  { value: 'Kathmandu', label: 'Kathmandu' },
  { value: 'Lalitpur', label: 'Lalitpur' },
  { value: 'Bhaktapur', label: 'Bhaktapur' },
  { value: 'Pokhara', label: 'Pokhara' },
  { value: 'Chitwan', label: 'Chitwan' },
  { value: 'Remote', label: 'Remote' },
];

const MAIN_PORTRAIT = MARKETPLACE_HERO_IMAGE;

interface SearchBoxProps {
  onSearchSubmit?: (query: string, location: string) => void;
}

function SearchBox({ onSearchSubmit }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const filtered = SUGGESTIONS_DATABASE.filter((item) =>
      item.toLowerCase().includes(query.toLowerCase()),
    ).slice(0, 5);
    setSuggestions(filtered);
  }, [query]);

  const performSearch = (selectedQuery: string, selectedLoc: string) => {
    setQuery(selectedQuery);
    setLocationQuery(selectedLoc);
    setIsFocused(false);
    onSearchSubmit?.(selectedQuery, selectedLoc);
    document.getElementById('custom-job-board-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query, locationQuery);
  };

  return (
    <div className="relative z-20 w-full max-w-[760px]">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`relative z-30 flex w-full flex-col items-stretch rounded-xl border bg-white p-1.5 shadow-md transition-all duration-300 md:flex-row md:items-center ${
            isFocused ? 'border-neutral-300 ring-2 ring-[#1D3E35]/5' : 'border-neutral-200/40'
          }`}
        >
          <div className="flex min-w-0 flex-1 items-center py-1 md:min-w-[200px] md:py-0">
            <div className="pl-3 pr-2 text-neutral-400">
              <SearchIcon className="h-5 w-5 stroke-[2]" />
            </div>
            <input
              id="job-search"
              type="text"
              className={`${discoverBody} w-full flex-1 border-none bg-transparent py-2.5 text-sm text-neutral-800 outline-none placeholder:text-neutral-400 focus:ring-0 md:text-base`}
              placeholder="Search jobs by title, skill, or company"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            />
          </div>

          <div className="mx-2 hidden h-8 w-px self-center bg-neutral-200 md:block" />

          <div className="relative flex min-w-0 items-center border-t border-neutral-200 py-2 pr-2 pt-2 md:min-w-[180px] md:border-0 md:py-0 md:pt-0">
            <select
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className={`${discoverBody} w-full cursor-pointer appearance-none border-none bg-transparent py-2 pl-3 pr-8 text-sm text-neutral-700 outline-none focus:ring-0 md:text-base`}
            >
              {LOCATION_OPTIONS.map((opt) => (
                <option key={opt.value || 'all'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-neutral-400" />
          </div>

          <motion.button
            type="submit"
            className={`${discoverMedium} mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#1D3E35] px-6 py-3 text-sm text-white transition-all duration-200 hover:bg-[#152e27] md:mt-0 md:w-auto md:px-8 md:text-base`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Search
          </motion.button>
        </div>

        <AnimatePresence>
          {isFocused && suggestions.length > 0 && (
            <motion.div
              className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-2">
                <div
                  className={`${discoverMedium} px-3 py-1 text-xs uppercase tracking-wider text-neutral-400`}
                >
                  Suggested job searches
                </div>
                {suggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`${discoverBody} flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-50`}
                    onMouseDown={() => performSearch(item, locationQuery)}
                  >
                    <SearchIcon className="h-4 w-4 stroke-[1.5] text-[#52C47F]" />
                    {item}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}

interface JobHeroProps {
  className?: string;
  onSearchSubmit?: (query: string, location: string) => void;
}

export default function JobHero({ className = '', onSearchSubmit }: JobHeroProps) {
  return (
    <section className={`select-none bg-white px-4 pb-8 pt-6 sm:px-6 sm:pb-10 sm:pt-8 lg:px-8 ${className}`}>
      <div className="mx-auto w-full max-w-7xl">
        <div className="relative flex min-h-[200px] w-full items-stretch overflow-hidden rounded-2xl bg-[#f6f5f0] sm:min-h-[240px] sm:rounded-[24px] lg:min-h-[280px]">
          <MarketplaceHeroBreadcrumbs serpKey="jobs" sectionPath="/jobs" variant="light" />

          {/* Left wave — warm neutral instead of yellow */}
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-0 hidden select-none sm:block">
            <svg
              viewBox="0 0 120 400"
              className="h-full w-[80px] text-[#e2ddd6] sm:w-[110px] md:w-[140px]"
              fill="currentColor"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path d="M 0 0 Q 110 200 0 400 L 0 400 L 0 0 Z" />
            </svg>
          </div>

          {/* Content */}
          <div className="relative z-10 grid w-full grid-cols-1 items-stretch gap-4 px-5 pb-0 pt-11 sm:gap-6 sm:pl-20 sm:pr-10 sm:pt-12 md:pl-24 md:pr-14 lg:grid-cols-12 lg:pb-0 lg:pl-32 lg:pr-14 lg:pt-14">

            {/* Left: Text */}
            <div className="flex flex-col justify-center pb-4 lg:col-span-8 lg:pb-10">
              <motion.h1
                className={`${discoverHeadline} mb-2 text-2xl font-bold leading-tight tracking-tight text-brand-dark sm:text-3xl md:text-[38px]`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Find Your Next Job
              </motion.h1>

              <motion.p
                className={`${discoverBody} mb-5 max-w-lg text-sm leading-relaxed text-neutral-500 sm:mb-6`}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Browse hundreds of local opportunities and connect with employers in your area.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <SearchBox onSearchSubmit={onSearchSubmit} />
              </motion.div>
            </div>

            {/* Right: Image — no background shape, just clean portrait */}
            <div className="relative mt-2 flex h-[160px] w-full max-w-full items-end justify-center self-end overflow-hidden select-none sm:mt-0 sm:h-[200px] sm:justify-end lg:absolute lg:bottom-0 lg:right-6 lg:col-span-4 lg:mt-0 lg:h-[min(260px,95%)] lg:max-w-[38%] lg:justify-center xl:right-10">
              <motion.div
                className="relative z-10 h-full"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <HeroImage
                  src={MAIN_PORTRAIT}
                  alt="Professional worker"
                  className="block h-full max-w-full w-auto object-contain object-bottom"
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


