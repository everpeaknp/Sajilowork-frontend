'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ChevronDown, Search as SearchIcon } from 'lucide-react';
import {
  FREELANCER_LOCATION_OPTIONS,
  FREELANCER_SUGGESTIONS,
  POPULAR_FREELANCER_TAGS,
} from './freelancerData';

interface FreelancerSearchBoxProps {
  onSearchSubmit?: (query: string, location: string) => void;
}

export default function FreelancerSearchBox({ onSearchSubmit }: FreelancerSearchBoxProps) {
  const [query, setQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearch, setLastSearch] = useState('');

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const filtered = FREELANCER_SUGGESTIONS.filter((item) =>
      item.toLowerCase().includes(query.toLowerCase()),
    ).slice(0, 5);
    setSuggestions(filtered);
  }, [query]);

  const performSearch = (selectedQuery: string, selectedLoc: string) => {
    const combinedQuery = selectedLoc
      ? `${selectedQuery} in ${selectedLoc}`.trim()
      : selectedQuery;

    setQuery(selectedQuery);
    setLocationQuery(selectedLoc);
    setLastSearch(combinedQuery || 'Design & Creative');
    setHasSearched(true);
    setIsFocused(false);

    onSearchSubmit?.(selectedQuery, selectedLoc);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    performSearch(query, locationQuery);
  };

  const handleTagClick = (tag: string) => {
    performSearch(tag, locationQuery);
  };

  return (
    <div className="relative z-20 w-full max-w-[760px]">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`relative z-30 flex w-full flex-col items-stretch rounded-xl border bg-white p-1.5 shadow-md transition-all duration-300 md:flex-row md:items-center dark:border-neutral-700 dark:bg-neutral-950 ${
            isFocused ? 'border-neutral-300 ring-2 ring-[#1D3E35]/5' : 'border-neutral-200/40'
          }`}
        >
          <div className="flex min-w-[200px] flex-1 items-center py-1 md:py-0">
            <div className="pl-3 pr-2 text-neutral-400">
              <SearchIcon className="h-5 w-5 stroke-[2]" />
            </div>
            <input
              id="freelancer-market-search"
              type="text"
              className="w-full flex-1 border-none bg-transparent py-2.5 text-sm font-normal text-neutral-800 outline-none placeholder:text-neutral-400 focus:ring-0 md:text-base dark:text-stone-100 dark:placeholder:text-neutral-500"
              placeholder="What are you looking for?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            />
          </div>

          <div className="mx-2 hidden h-8 w-px self-center bg-neutral-200 md:block dark:bg-neutral-700" />

          <div className="relative flex min-w-[180px] items-center py-2 pr-2 md:py-0">
            <select
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="w-full cursor-pointer appearance-none border-none bg-transparent px-3 py-2 pr-8 text-sm font-normal text-neutral-700 outline-none focus:ring-0 md:text-base dark:text-neutral-300 dark:[color-scheme:dark]"
            >
              {FREELANCER_LOCATION_OPTIONS.map((opt) => (
                <option key={opt.value || 'all'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-neutral-400" />
          </div>

          <motion.button
            type="submit"
            className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#1D3E35] px-8 py-3 text-white transition-all duration-200 hover:bg-[#152e27] md:mt-0"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <span className="text-sm font-medium md:text-base">Search</span>
          </motion.button>
        </div>

        <AnimatePresence>
          {isFocused && suggestions.length > 0 ? (
            <motion.div
              className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-2">
                <div className="px-3 py-1 text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Matching Talented Skills
                </div>
                {suggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-neutral-700 transition-colors hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    onMouseDown={() => performSearch(item, locationQuery)}
                  >
                    <SearchIcon className="h-4 w-4 stroke-[1.5] text-[#52C47F]" />
                    <span className="text-sm font-normal">{item}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs opacity-90">
        <span className="mr-1 text-xs font-normal leading-relaxed text-neutral-500 dark:text-neutral-400">
          Popular Searches:
        </span>
        <div className="flex flex-wrap items-center gap-x-1.5">
          {POPULAR_FREELANCER_TAGS.map((tag, idx) => (
            <span key={tag} className="inline-flex items-center">
              <button
                type="button"
                onClick={() => handleTagClick(tag)}
                className="cursor-pointer text-xs font-medium text-neutral-600 underline underline-offset-2 transition-all duration-200 hover:text-black dark:text-neutral-400 dark:hover:text-stone-100"
              >
                {tag}
              </button>
              {idx < POPULAR_FREELANCER_TAGS.length - 1 ? (
                <span className="mr-0.5 text-neutral-400">,</span>
              ) : null}
            </span>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {hasSearched ? (
          <motion.div
            className="relative z-20 mt-5 flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-3.5 text-[#1D3E35] dark:border-neutral-700 dark:bg-neutral-900 dark:text-stone-100"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1D3E35]/10 text-[#1D3E35] dark:bg-emerald-950/50 dark:text-emerald-300">
                <Sparkles className="h-4 w-4 animate-pulse" />
              </div>
              <p className="text-xs font-normal sm:text-sm">
                Found top-rated professionals for{' '}
                <span className="font-medium">&quot;{lastSearch}&quot;</span>!
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setHasSearched(false);
                setQuery('');
                setLocationQuery('');
                onSearchSubmit?.('', '');
              }}
              className="cursor-pointer text-xs font-medium text-neutral-500 underline transition-colors hover:text-black dark:text-neutral-400 dark:hover:text-stone-100"
            >
              Clear filter
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
