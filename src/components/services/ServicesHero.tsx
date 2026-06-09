'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Star, Search as SearchIcon } from 'lucide-react';
import {
  discoverBody,
  discoverHeadline,
  discoverMedium,
} from '@/components/LangingHome/landingTypography';
import { formatNPR } from '@/lib/nepalLocale';

interface TaskerProfile {
  id: string;
  name: string;
  role: string;
  rating: number;
  reviews: number;
  rate: number;
  avatar: string;
  tags: string[];
  location: string;
  availableNow: boolean;
}

const TASKERS_DATA: TaskerProfile[] = [
  {
    id: 't1',
    name: 'Sunita Gurung',
    role: 'Home Cleaning Specialist',
    rating: 4.9,
    reviews: 142,
    rate: 1200,
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    tags: ['Cleaning', 'Deep clean', 'End of lease', 'Kathmandu'],
    location: 'Kathmandu',
    availableNow: true,
  },
  {
    id: 't2',
    name: 'Rajesh Kumar',
    role: 'Furniture Moving & Packing',
    rating: 5.0,
    reviews: 218,
    rate: 1500,
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    tags: ['Moving', 'Packing', 'Furniture', 'Loader'],
    location: 'Lalitpur',
    availableNow: true,
  },
  {
    id: 't3',
    name: 'Marcus Thapa',
    role: 'Handyman & Repairs',
    rating: 4.8,
    reviews: 93,
    rate: 1800,
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    tags: ['Handyman', 'Repairs', 'Mounting', 'Fixtures'],
    location: 'Bhaktapur',
    availableNow: false,
  },
  {
    id: 't4',
    name: 'Amélie Shrestha',
    role: 'Garden & Outdoor Care',
    rating: 4.9,
    reviews: 76,
    rate: 1100,
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    tags: ['Gardening', 'Lawn', 'Trimming', 'Outdoor'],
    location: 'Pokhara',
    availableNow: true,
  },
  {
    id: 't5',
    name: 'Sven Rai',
    role: 'Electrician & Wiring',
    rating: 4.7,
    reviews: 112,
    rate: 2000,
    avatar:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150',
    tags: ['Electrician', 'Wiring', 'Repairs', 'Home'],
    location: 'Kathmandu',
    availableNow: true,
  },
];

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

const CATEGORIES = [
  'Choose Category',
  'Cleaning',
  'Moving & Delivery',
  'Handyman & Repairs',
  'Garden & Outdoor',
  'Electrical & Plumbing',
];

const MAIN_PORTRAIT =
  'https://freeio-app-nextjs.vercel.app/_next/image?url=%2Fimages%2Fabout%2Fhome6-hero-img-1.png&w=1200&q=75';

interface SearchBoxProps {
  onSearchSubmit?: (query: string) => void;
  onPostWithTitle?: (title: string) => void;
}

function SearchBox({ onSearchSubmit, onPostWithTitle }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Choose Category');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearch, setLastSearch] = useState('');

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

  const performSearch = (selectedQuery: string, selectedCat?: string) => {
    const cat = selectedCat ?? category;
    const combinedQuery =
      cat !== 'Choose Category' ? `${selectedQuery} in ${cat}`.trim() : selectedQuery;

    setQuery(selectedQuery);
    setLastSearch(combinedQuery || 'local services');
    setHasSearched(true);
    setIsFocused(false);
    setIsDropdownOpen(false);

    onSearchSubmit?.(selectedQuery || cat);
    if (selectedQuery) onPostWithTitle?.(selectedQuery);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query, category);
  };

  const handleTagClick = (tag: string) => {
    performSearch(tag);
    onPostWithTitle?.(tag);
  };

  const clearSearch = () => {
    setHasSearched(false);
    setQuery('');
    setCategory('Choose Category');
    onSearchSubmit?.('');
  };

  return (
    <div className="relative z-20 w-full max-w-3xl">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`relative z-30 flex w-full flex-col items-stretch rounded-xl border bg-white p-1.5 shadow-md transition-all duration-300 sm:flex-row sm:items-center ${
            isFocused ? 'border-brand-emerald ring-2 ring-brand-emerald/10' : 'border-neutral-200/40'
          }`}
        >
          <div className="flex min-w-[200px] flex-1 items-center border-b border-neutral-100 py-2 sm:border-b-0 sm:py-0">
            <div className="pl-3 pr-2 text-neutral-400">
              <SearchIcon className="h-5 w-5 stroke-[2]" />
            </div>
            <input
              id="services-search"
              type="text"
              className={`${discoverBody} w-full flex-1 border-none bg-transparent py-2 text-sm text-neutral-800 outline-none placeholder:text-neutral-400 focus:ring-0 md:text-base`}
              placeholder="What are you looking for?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            />
          </div>

          <div className="mx-2 hidden h-8 w-px self-center bg-neutral-200 sm:block" />

          <div className="relative flex items-center border-b border-neutral-100 py-2 sm:border-b-0 sm:border-none sm:py-0">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`${discoverBody} flex w-full cursor-pointer select-none items-center justify-between px-3 py-2 text-left text-sm text-neutral-500 hover:text-neutral-800 sm:w-[180px]`}
            >
              <span className="truncate">{category}</span>
              <svg
                className={`ml-1.5 h-4 w-4 flex-shrink-0 text-neutral-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-[110%] z-50 mt-1 overflow-hidden rounded-xl border border-neutral-100 bg-white py-1.5 shadow-xl sm:right-auto sm:w-[220px]">
                {CATEGORIES.map((catOption) => (
                  <button
                    key={catOption}
                    type="button"
                    onClick={() => {
                      setCategory(catOption);
                      setIsDropdownOpen(false);
                    }}
                    className={`${discoverBody} w-full cursor-pointer px-4 py-2.5 text-left text-sm transition-colors duration-150 ${
                      category === catOption
                        ? 'bg-brand-emerald/10 font-medium text-neutral-800'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    {catOption}
                  </button>
                ))}
              </div>
            )}
          </div>

          <motion.button
            type="submit"
            className={`${discoverMedium} mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-emerald px-8 py-3 text-sm text-white transition-all duration-200 hover:bg-[#43b06d] sm:mt-0 md:text-base`}
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
                  Matching services
                </div>
                {suggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`${discoverBody} flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-50`}
                    onMouseDown={() => performSearch(item)}
                  >
                    <SearchIcon className="h-4 w-4 stroke-[1.5] text-brand-emerald" />
                    {item}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <div className={`${discoverBody} mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs opacity-90`}>
        <span className="mr-1 font-normal leading-relaxed text-white/70">Popular searches:</span>
        <div className="flex flex-wrap items-center gap-x-1.5">
          {POPULAR_TAGS.map((tag, idx) => (
            <React.Fragment key={tag}>
              <button
                type="button"
                onClick={() => handleTagClick(tag)}
                className={`${discoverMedium} cursor-pointer text-xs text-white/95 underline underline-offset-2 transition-all duration-200 hover:text-white`}
              >
                {tag}
              </button>
              {idx < POPULAR_TAGS.length - 1 && <span className="mr-0.5 text-white/40">,</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {hasSearched && (
          <motion.div
            className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-white/20 bg-white/10 p-3.5 text-white backdrop-blur-md"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-brand-emerald">
                <Sparkles className="h-4 w-4 animate-pulse" />
              </div>
              <p className={`${discoverBody} text-xs text-white sm:text-sm`}>
                Found top-rated taskers for{' '}
                <span className={`${discoverMedium} text-white`}>&quot;{lastSearch}&quot;</span>!
              </p>
            </div>
            <button
              type="button"
              onClick={clearSearch}
              className={`${discoverMedium} cursor-pointer text-xs text-white/70 underline transition-colors hover:text-white`}
            >
              Clear filter
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ServicesHeroProps {
  className?: string;
  onPostWithTitle?: (title: string) => void;
}

export default function ServicesHero({ className = '', onPostWithTitle }: ServicesHeroProps) {
  const [activeSearch, setActiveSearch] = useState('');
  const [filteredTaskers, setFilteredTaskers] = useState<TaskerProfile[]>(TASKERS_DATA);

  const handleSearchSubmit = (query: string) => {
    setActiveSearch(query);
    if (!query.trim()) {
      setFilteredTaskers(TASKERS_DATA);
      return;
    }

    const searchLow = query.toLowerCase();
    setFilteredTaskers(
      TASKERS_DATA.filter(
        (tasker) =>
          tasker.name.toLowerCase().includes(searchLow) ||
          tasker.role.toLowerCase().includes(searchLow) ||
          tasker.tags.some((tag) => tag.toLowerCase().includes(searchLow))
      )
    );
  };

  return (
    <section
      className={`select-none bg-white px-4 pb-4 pt-8 sm:px-6 sm:pb-6 lg:px-8 ${className}`}
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="relative flex min-h-[350px] w-full overflow-hidden rounded-[24px] bg-[#1a3c34] shadow-sm sm:min-h-[380px] lg:min-h-[420px]">
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-0 select-none">
            <svg
              viewBox="0 0 120 400"
              className="h-full w-[100px] text-[#ffc554] sm:w-[130px] md:w-[160px] lg:w-[200px]"
              fill="currentColor"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path d="M 0 0 Q 110 200 0 400 L 0 400 L 0 0 Z" />
            </svg>
          </div>

          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-[0.12] mix-blend-overlay">
            <svg
              className="h-full w-full text-white"
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

          <div className="relative z-10 grid w-full grid-cols-1 items-end gap-8 px-6 pt-10 pb-0 sm:px-12 sm:pt-12 md:px-16 lg:grid-cols-12 lg:pb-0 lg:pt-12">
            <div className="flex flex-col justify-center pb-10 pl-3 text-left sm:pb-12 sm:pl-5 md:pl-6 lg:col-span-8 lg:pb-12 lg:pl-8">
              <motion.h1
                className={`${discoverHeadline} mb-2.5 text-3xl leading-tight text-white sm:text-4xl md:text-5xl`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Home &amp; local services
              </motion.h1>

              <motion.p
                className={`${discoverBody} mb-8 max-w-xl text-xs leading-relaxed text-white/90 sm:text-sm md:text-base`}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Find verified taskers for cleaning, moving, repairs, and everyday jobs across
                Nepal.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <SearchBox onSearchSubmit={handleSearchSubmit} onPostWithTitle={onPostWithTitle} />
              </motion.div>
            </div>

            <div className="relative mt-0 flex h-[220px] w-full items-end justify-center self-end select-none sm:h-[280px] lg:absolute lg:bottom-0 lg:right-6 lg:col-span-4 lg:h-[min(400px,92%)] lg:w-auto lg:max-w-[42%] xl:right-10">
              <motion.img
                src={MAIN_PORTRAIT}
                alt="Local tasker ready to help"
                className="relative z-10 block h-full w-auto max-w-none object-contain object-bottom drop-shadow-2xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                referrerPolicy="no-referrer"
                draggable={false}
              />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {activeSearch && (
            <motion.div
              className="mt-14 border-t border-neutral-100 pt-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            >
              <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h3 className={`${discoverHeadline} text-xl text-neutral-800`}>
                    Available verified taskers
                  </h3>
                  <p className={`${discoverBody} mt-1 text-sm text-neutral-500`}>
                    Showing matches for{' '}
                    <span className={`${discoverMedium} text-[#1a3c34]`}>&quot;{activeSearch}&quot;</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSearchSubmit('')}
                  className={`${discoverMedium} flex cursor-pointer items-center gap-1.5 text-sm text-brand-emerald transition-colors hover:text-[#43b06d]`}
                >
                  Clear filter and show all
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {filteredTaskers.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTaskers.map((tasker, index) => (
                    <motion.div
                      key={tasker.id}
                      className="flex flex-col justify-between rounded-xl border border-neutral-200/50 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md"
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                      whileHover={{ y: -3 }}
                    >
                      <div>
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={tasker.avatar}
                              alt={tasker.name}
                              className="h-12 w-12 rounded-full border border-neutral-100 object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <h4
                                className={`${discoverHeadline} flex items-center gap-1.5 text-base leading-tight text-neutral-800`}
                              >
                                {tasker.name}
                                {tasker.availableNow && (
                                  <span
                                    className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500"
                                    title="Available now"
                                  />
                                )}
                              </h4>
                              <span className={`${discoverBody} text-xs text-neutral-400`}>
                                {tasker.location}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`${discoverMedium} flex items-center gap-1 rounded-lg bg-neutral-50 px-2.5 py-1 text-sm text-neutral-700`}
                          >
                            <Star className="h-3.5 w-3.5 fill-[#fbbf24] text-[#fbbf24]" />
                            {tasker.rating}
                          </div>
                        </div>

                        <p className={`${discoverHeadline} mb-3 text-base text-[#1a3c34]`}>
                          {tasker.role}
                        </p>

                        <div className="mb-5 flex flex-wrap gap-1.5">
                          {tasker.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`${discoverBody} rounded-md border border-neutral-100 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-600`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-4">
                        <div>
                          <span className={`${discoverBody} block text-xs text-neutral-400`}>
                            Starting rate
                          </span>
                          <span className={`${discoverHeadline} text-lg text-neutral-800`}>
                            {formatNPR(tasker.rate)}/hr
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onPostWithTitle?.(tasker.role)}
                          className={`${discoverMedium} cursor-pointer rounded-lg bg-[#1a3c34] px-4 py-2.5 text-xs text-white transition-colors duration-200 hover:bg-neutral-900 sm:text-sm`}
                        >
                          Hire tasker
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  className="rounded-xl border border-dashed border-neutral-200 bg-white p-12 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className={`${discoverMedium} mb-2 text-neutral-500`}>
                    No taskers match that query yet.
                  </p>
                  <p className={`${discoverBody} text-xs text-neutral-400`}>
                    Try searching for Cleaning, Moving, Handyman, Repairs, or Electrician.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
