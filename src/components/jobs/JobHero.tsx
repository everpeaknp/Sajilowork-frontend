'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search as SearchIcon, ChevronDown } from 'lucide-react';
import {
  discoverBody,
  discoverHeadline,
  discoverMedium,
} from '@/components/LangingHome/landingTypography';

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

const MAIN_PORTRAIT =
  'https://freeio-app-nextjs.vercel.app/_next/image?url=%2Fimages%2Fabout%2Fhome6-hero-img-1.png&w=1200&q=75';

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
          <div className="flex min-w-[200px] flex-1 items-center py-1 md:py-0">
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

          <div className="relative flex min-w-[180px] items-center py-2 pr-2 md:py-0">
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
            className={`${discoverMedium} mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#1D3E35] px-8 py-3 text-sm text-white transition-all duration-200 hover:bg-[#152e27] md:mt-0 md:text-base`}
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
    <section className={`select-none bg-white px-4 pb-12 pt-8 sm:px-6 lg:px-8 ${className}`}>
      <div className="mx-auto w-full max-w-7xl">
        <div className="relative flex min-h-[350px] w-full items-stretch overflow-hidden rounded-[24px] border border-neutral-200/40 bg-[#f6f5f0] shadow-sm sm:min-h-[380px] lg:min-h-[420px]">
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-0 select-none">
            <svg
              viewBox="0 0 120 400"
              className="h-full w-[100px] text-[#fcd074] sm:w-[130px] md:w-[160px] lg:w-[200px]"
              fill="currentColor"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path d="M 0 0 Q 110 200 0 400 L 0 400 L 0 0 Z" />
            </svg>
          </div>

          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-[0.22] mix-blend-overlay">
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
              <path
                d="M-20,50 C180,80 270,10 470,120 C670,230 770,90 870,140"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            </svg>
          </div>

          <div className="relative z-10 grid w-full grid-cols-1 items-stretch gap-8 pb-0 pl-12 pr-6 pt-10 sm:pl-24 sm:pr-12 md:pl-28 md:pr-16 lg:grid-cols-12 lg:pb-0 lg:pl-36 lg:pr-16 lg:pt-12">
            <div className="flex flex-col justify-center pb-10 text-left lg:col-span-8 lg:pb-12">
              <motion.h1
                className={`${discoverHeadline} mb-2 text-3xl font-bold leading-tight tracking-tight text-[#131118] sm:text-4xl md:text-[42px]`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Job List
              </motion.h1>

              <motion.p
                className={`${discoverBody} mb-8 max-w-xl text-xs font-normal leading-relaxed text-[#5e586c] sm:text-sm md:text-base`}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                All the Lorem Ipsum generators on the Internet tend to repeat.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <SearchBox onSearchSubmit={onSearchSubmit} />
              </motion.div>
            </div>

            <div className="relative mt-4 flex h-[240px] w-full items-end justify-end self-end select-none sm:h-[300px] lg:absolute lg:bottom-0 lg:right-6 lg:col-span-4 lg:mt-0 lg:h-[min(400px,92%)] lg:max-w-[42%] lg:justify-center xl:right-10">
              <motion.img
                src={MAIN_PORTRAIT}
                alt="Designer illustrator working on tablet screen"
                className="relative z-10 block h-full w-auto object-contain object-bottom drop-shadow-md"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                referrerPolicy="no-referrer"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
