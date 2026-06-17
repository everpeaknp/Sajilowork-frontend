'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  CheckCircle2,
  Search as SearchIcon,
  ThumbsUp,
} from 'lucide-react';
import {
  discoverBody,
  discoverHeadline,
  discoverMedium,
} from '@/components/LangingHome/landingTypography';

const POPULAR_TAGS = ['Cleaning', 'Moving', 'Handyman', 'Repairs', 'Gardening', 'Electrician'];

const SUGGESTIONS_DATABASE = [
  'Home deep cleaning',
  'Furniture moving help',
  'End of lease cleaning',
  'Handyman for odd jobs',
  'TV wall mounting',
  'Garden mowing and trimming',
  'Electrician for home wiring',
  'IKEA furniture assembly',
  'Plumbing leak repair',
  'Office cleaning service',
  'Packing and loading help',
  'Painting interior walls',
];

interface HeroProps {
  onSearchSubmit?: (query: string) => void;
}

interface SearchBoxProps {
  onSearchSubmit?: (query: string) => void;
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
      item.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
    setSuggestions(filtered);
  }, [query]);

  const performSearch = (selectedQuery: string) => {
    if (!selectedQuery.trim()) return;
    setQuery(selectedQuery);
    setIsFocused(false);
    onSearchSubmit?.(selectedQuery);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    performSearch(query);
  };

  const handleTagClick = (tag: string) => {
    performSearch(tag);
  };

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`flex flex-col gap-2 rounded-lg border bg-white p-2 shadow-sm transition-all duration-300 sm:flex-row sm:items-center ${
            isFocused ? 'border-black ring-1 ring-black/5' : 'border-black'
          } relative z-30 w-full`}
        >
          <div className="flex min-w-0 flex-1 items-center">
            <div className="shrink-0 pl-3 pr-2 text-black sm:pl-4 sm:pr-3">
              <SearchIcon className="h-5 w-5 stroke-[2]" />
            </div>

            <input
              id="market-search"
              type="text"
              className={`${discoverBody} w-full min-w-0 flex-1 border-none bg-transparent py-2.5 text-base font-medium text-black outline-none placeholder:text-black focus:ring-0 sm:py-2 md:text-lg`}
              placeholder="What do you need done?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            />
          </div>

          <motion.button
            type="submit"
            className={`${discoverMedium} flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-black bg-[#193e32] px-5 py-3 text-white transition-all duration-200 hover:bg-neutral-900 sm:w-auto sm:py-2.5 md:px-8 md:py-3`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <span className="text-sm md:text-base">Search</span>
          </motion.button>
        </div>

        <AnimatePresence>
          {isFocused && suggestions.length > 0 && (
            <motion.div
              className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-xl shadow-brand-dark/10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-2.5">
                <div className={`${discoverMedium} px-3 py-1.5 text-xs uppercase tracking-wider text-neutral-400`}>
                  Popular task ideas
                </div>
                {suggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`${discoverBody} flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-neutral-700 transition-colors hover:bg-neutral-50`}
                    onMouseDown={() => performSearch(item)}
                  >
                    <SearchIcon className="h-4 w-4 stroke-[1.5] text-brand-emerald" />
                    <span className="text-sm font-medium md:text-base">{item}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <div className={`${discoverBody} mt-4 flex flex-wrap items-center gap-x-1 gap-y-1 text-xs`}>
        <span className={`${discoverMedium} mr-1.5 text-xs leading-relaxed text-neutral-500`}>
          Popular:
        </span>
        <div className="flex flex-wrap items-center">
          {POPULAR_TAGS.map((tag, idx) => (
            <React.Fragment key={tag}>
              <button
                type="button"
                onClick={() => handleTagClick(tag)}
                className={`${discoverMedium} cursor-pointer text-xs transition-all duration-200 hover:text-black ${
                  query.toLowerCase() === tag.toLowerCase()
                    ? 'text-black underline underline-offset-2'
                    : 'text-neutral-600'
                }`}
              >
                {tag}
              </button>
              {idx < POPULAR_TAGS.length - 1 && (
                <span className="mr-1.5 text-neutral-400">,</span>
              )}
            </React.Fragment>
          ))}
        </div>
          </div>
    </div>
  );
}

export default function Hero({ onSearchSubmit }: HeroProps) {
  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#f8fcf9] to-white px-4 py-20 sm:px-6 sm:py-32 lg:min-h-[calc(80dvh-4rem)] lg:px-12">
      {/* Decorative clean geometric background elements */}
      <div className="pointer-events-none absolute left-0 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-emerald/5 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[600px] w-[600px] translate-x-1/3 translate-y-1/3 rounded-full bg-amber-500/5 blur-3xl" aria-hidden />
      
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        <motion.div
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-emerald/20 bg-brand-emerald/5 px-4 py-1.5 text-sm font-medium text-brand-emerald"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Sparkles className="h-4 w-4" />
          <span>The smarter way to outsource tasks</span>
        </motion.div>

        <motion.h1
          className={`${discoverHeadline} mb-6 text-[2.25rem] leading-[1.1] text-brand-dark sm:text-5xl md:text-6xl lg:text-7xl`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          With talented <span className="relative inline-block text-brand-emerald">taskers</span>
          <br />
          get more done.
        </motion.h1>

        <motion.p
          className={`${discoverBody} mb-10 max-w-2xl text-base font-medium leading-relaxed text-neutral-500 sm:text-lg md:text-xl`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Post a task on Sajilowork and connect with verified locals for cleaning, moving,
          repairs, and more. Your to-do list, completed.
        </motion.p>

        <motion.div
          className="w-full max-w-2xl"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <SearchBox onSearchSubmit={onSearchSubmit} />
        </motion.div>

        <motion.div 
          className="mt-16 flex items-center gap-8 border-t border-neutral-100 pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <p className={`${discoverHeadline} text-2xl text-brand-dark sm:text-3xl`}>4.9/5</p>
            <p className={`${discoverBody} text-xs text-neutral-500 sm:text-sm`}>Average Client Rating</p>
          </div>
          <div className="h-12 w-px bg-neutral-200"></div>
          <div className="flex flex-col items-center gap-2 text-center">
            <p className={`${discoverHeadline} text-2xl text-brand-dark sm:text-3xl`}>12K+</p>
            <p className={`${discoverBody} text-xs text-neutral-500 sm:text-sm`}>Tasks Completed</p>
          </div>
          <div className="h-12 w-px bg-neutral-200 hidden sm:block"></div>
          <div className="hidden sm:flex flex-col items-center gap-2 text-center">
            <p className={`${discoverHeadline} text-2xl text-brand-dark sm:text-3xl`}>100%</p>
            <p className={`${discoverBody} text-xs text-neutral-500 sm:text-sm`}>Verified Professionals</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
