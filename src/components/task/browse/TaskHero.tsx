'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search as SearchIcon } from 'lucide-react';
import {
  discoverBody,
  discoverHeadline,
  discoverMedium,
} from '@/components/LangingHome/landingTypography';

const SUGGESTIONS_DATABASE = [
  'Furniture assembly',
  'House cleaning',
  'Moving help',
  'Gardening',
  'Handyman',
  'Delivery',
  'Painting',
  'Plumbing repair',
  'Electrical work',
  'Deep cleaning',
];

const MAIN_PORTRAIT =
  'https://freeio-app-nextjs.vercel.app/_next/image?url=%2Fimages%2Fabout%2Fhome6-hero-img-1.png&w=1200&q=75';

interface SearchBoxProps {
  onSearchSubmit?: (query: string, location: string) => void;
}

function SearchBox({ onSearchSubmit }: SearchBoxProps) {
  const [query, setQuery] = useState('');
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

  const performSearch = (selectedQuery: string) => {
    setQuery(selectedQuery);
    setIsFocused(false);
    onSearchSubmit?.(selectedQuery, '');
    document.getElementById('custom-task-board-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="relative z-20 w-full max-w-[560px]">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`relative z-30 flex w-full flex-col gap-2 rounded-[12px] border bg-white p-1.5 shadow-sm transition-all duration-300 sm:flex-row sm:items-center sm:gap-0 ${
            isFocused ? 'border-neutral-300 ring-2 ring-[#52C47F]/10' : 'border-neutral-200/40'
          }`}
        >
          <div className="flex min-w-0 flex-1 items-center py-1">
            <div className="pl-3.5 pr-2.5 text-neutral-500">
              <SearchIcon className="h-5 w-5 stroke-[1.8]" />
            </div>
            <input
              id="task-search"
              type="text"
              className={`${discoverBody} w-full min-w-0 flex-1 border-none bg-transparent py-2 text-[15px] text-neutral-900 outline-none placeholder:text-neutral-500 focus:ring-0`}
              placeholder="Search tasks by title, skill, or location"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            />
          </div>

          <motion.button
            type="submit"
            className={`${discoverMedium} flex w-full shrink-0 cursor-pointer items-center justify-center rounded-[8px] bg-[#52C47F] px-9 py-[11px] text-[14.5px] text-white transition-all duration-200 hover:bg-[#49b071] sm:ml-2 sm:w-auto`}
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
                  Suggested task searches
                </div>
                {suggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`${discoverBody} flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-50`}
                    onMouseDown={() => performSearch(item)}
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

interface TaskHeroProps {
  className?: string;
  onSearchSubmit?: (query: string, location: string) => void;
}

export default function TaskHero({ className = '', onSearchSubmit }: TaskHeroProps) {
  return (
    <section className={`select-none bg-white px-4 pb-6 pt-6 sm:px-6 sm:pb-6 sm:pt-8 lg:px-8 ${className}`}>
      <div className="mx-auto w-full max-w-7xl">
        <div className="relative flex min-h-[280px] w-full items-stretch overflow-hidden rounded-2xl border border-neutral-200/40 bg-[#fbf2ed] shadow-sm sm:min-h-[350px] sm:rounded-[24px] lg:min-h-[420px]">
          <div className="pointer-events-none absolute -left-16 -top-10 z-0 hidden h-44 w-44 select-none rounded-full bg-[#fcd074] sm:block sm:-left-20 sm:-top-12 sm:h-56 sm:w-56 lg:-left-24 lg:-top-16 lg:h-64 lg:w-64" />

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

          <div className="relative z-10 grid w-full grid-cols-1 items-stretch gap-6 px-4 pb-0 pt-8 sm:gap-8 sm:pl-24 sm:pr-12 sm:pt-10 md:pl-28 md:pr-16 lg:grid-cols-12 lg:pb-0 lg:pl-36 lg:pr-16 lg:pt-12">
            <div className="flex flex-col justify-center pb-4 text-left sm:pb-10 lg:col-span-8 lg:pb-12">
              <motion.h1
                className={`${discoverHeadline} mb-2 text-2xl font-bold leading-tight tracking-tight text-black sm:text-3xl md:text-[42px]`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Tasks List
              </motion.h1>

              <motion.p
                className={`${discoverBody} mb-6 max-w-xl text-xs font-normal leading-relaxed text-neutral-700 sm:mb-8 sm:text-sm md:text-base`}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Browse local tasks and find work near you — from cleaning and delivery to repairs and more.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <SearchBox onSearchSubmit={onSearchSubmit} />
              </motion.div>
            </div>

            <div className="relative mt-2 flex h-[180px] w-full max-w-full items-end justify-center self-end overflow-hidden select-none sm:mt-4 sm:h-[240px] sm:justify-end lg:absolute lg:bottom-0 lg:right-6 lg:col-span-4 lg:mt-0 lg:h-[min(400px,92%)] lg:max-w-[42%] lg:justify-center xl:right-10">
              <motion.img
                src={MAIN_PORTRAIT}
                alt="Tasker illustration"
                className="relative z-10 block h-full max-w-full w-auto object-contain object-bottom drop-shadow-md"
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
