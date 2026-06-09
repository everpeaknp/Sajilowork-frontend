'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  Star,
  CheckCircle2,
  Search as SearchIcon,
  ThumbsUp,
} from 'lucide-react';
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

interface HeroProps {
  onPostWithTitle: (title: string) => void;
}

interface SearchBoxProps {
  onSearchSubmit?: (query: string) => void;
  onPostWithTitle?: (title: string) => void;
}

function SearchBox({ onSearchSubmit, onPostWithTitle }: SearchBoxProps) {
  const [query, setQuery] = useState('');
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

  const performSearch = (selectedQuery: string) => {
    setQuery(selectedQuery);
    setLastSearch(selectedQuery);
    setHasSearched(true);
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
    onPostWithTitle?.(tag);
  };

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`flex items-center rounded-lg border bg-white p-2 shadow-sm transition-all duration-300 ${
            isFocused ? 'border-black ring-1 ring-black/5' : 'border-black'
          } relative z-30 w-full`}
        >
          <div className="pl-4 pr-3 text-black">
            <SearchIcon className="h-5 w-5 stroke-[2]" />
          </div>

          <input
            id="market-search"
            type="text"
            className={`${discoverBody} w-full flex-1 border-none bg-transparent py-2 text-base font-medium text-black outline-none placeholder:text-black focus:ring-0 md:text-lg`}
            placeholder="What do you need done?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          />

          <motion.button
            type="submit"
            className={`${discoverMedium} flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-black bg-[#193e32] px-5 py-2.5 text-white transition-all duration-200 hover:bg-neutral-900 md:px-8 md:py-3`}
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

      <AnimatePresence>
        {hasSearched && (
          <motion.div
            className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-brand-emerald/20 bg-brand-emerald/5 p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-emerald/10 text-brand-emerald">
                <Sparkles className="h-4 w-4 animate-pulse" />
              </div>
              <p className={`${discoverBody} text-sm font-medium text-neutral-700`}>
                Found top-rated taskers for{' '}
                <span className="font-medium text-brand-dark">&quot;{lastSearch}&quot;</span>!
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setHasSearched(false);
                setQuery('');
              }}
              className={`${discoverMedium} cursor-pointer text-xs text-neutral-400 underline transition-colors hover:text-brand-dark`}
            >
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GraphicSection() {
  const MAIN_PORTRAIT =
    'https://freeio-app-nextjs.vercel.app/_next/image?url=%2Fimages%2Fabout%2Fhome6-hero-img-1.png&w=1200&q=75';
  const SATELLITE_LEFT =
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200';
  const SATELLITE_TOP =
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200';
  const SATELLITE_RIGHT =
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200';

  return (
    <div
      className="relative mx-auto flex w-full max-w-2xl select-none items-end justify-center leading-none"
      id="hero-graphic"
    >
      <div className="pointer-events-none absolute inset-0 z-10">
        <motion.div
          className="absolute left-[17%] top-[21%] h-4 w-4 rounded-full border-2 border-sky-400"
          animate={{ x: [-14, 14, -14] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        <svg
          className="absolute left-[8%] top-[40%] h-12 w-20 text-emerald-600/30"
          viewBox="0 0 100 60"
          fill="none"
          aria-hidden
        >
          <path
            d="M10,35 Q35,10 50,35 T90,35"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M5,42 Q25,18 45,42 T85,42"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="3 3"
          />
        </svg>

        <motion.div
          className="absolute -top-[1.5%] right-[25%] select-none text-3xl font-medium text-rose-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          +
        </motion.div>

        <svg
          className="absolute right-[11%] top-[12%] h-12 w-16 text-purple-600/40"
          viewBox="0 0 100 60"
          fill="none"
                    aria-hidden
        >
          <path
            d="M15,10 C45,5 85,25 45,45 C25,50 10,25 35,15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        <motion.div
          className="absolute right-[21%] top-[48%] text-amber-500"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles className="h-7 w-7 fill-amber-500/15" />
        </motion.div>

        <div className="animate-spin-slow absolute bottom-[23%] left-[18%] text-2xl font-medium text-indigo-500/60">
          ★
        </div>
      </div>

      <div className="relative z-20 flex w-[108%] max-w-[620px] items-end justify-center sm:w-full lg:w-[124%] xl:w-[128%]">
        <motion.img
          src={MAIN_PORTRAIT}
          alt="Local tasker ready to help"
          className="pointer-events-none relative z-20 block h-auto w-full max-h-[min(540px,68vh)] select-none object-contain object-bottom drop-shadow-xl sm:max-h-[min(580px,71vh)] lg:max-h-[min(640px,78vh)]"
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          referrerPolicy="no-referrer"
          draggable={false}
        />
      </div>

      <motion.div
        className="absolute left-[3%] top-[30%] z-30 h-20 w-20 overflow-hidden rounded-full"
        initial={{ opacity: 0, scale: 0.8, x: -20 }}
        animate={{ opacity: 1, scale: 1, x: 0, y: [0, -8, 0] }}
        transition={{
          opacity: { duration: 0.7, delay: 0.3 },
          scale: { duration: 0.7, delay: 0.3 },
          x: { duration: 0.7, delay: 0.3 },
          y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 },
        }}
        whileHover={{ scale: 1.08 }}
      >
        <img
          src={SATELLITE_LEFT}
          alt="Tasker"
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      </motion.div>

      <motion.div
        className="absolute right-[7%] top-[5%] z-30 h-[84px] w-[84px] overflow-hidden rounded-full"
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
        transition={{
          opacity: { duration: 0.7, delay: 0.4 },
          scale: { duration: 0.7, delay: 0.4 },
          y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 },
        }}
        whileHover={{ scale: 1.08 }}
      >
        <img
          src={SATELLITE_TOP}
          alt="Tasker"
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      </motion.div>

      <motion.div
        className="absolute -right-[1%] top-[49%] z-30 h-20 w-20 overflow-hidden rounded-full"
        initial={{ opacity: 0, scale: 0.8, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0, y: [0, -8, 0] }}
        transition={{
          opacity: { duration: 0.7, delay: 0.5 },
          scale: { duration: 0.7, delay: 0.5 },
          x: { duration: 0.7, delay: 0.5 },
          y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 },
        }}
        whileHover={{ scale: 1.08 }}
      >
        <img
          src={SATELLITE_RIGHT}
          alt="Tasker"
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      </motion.div>

      <motion.div
        className="absolute -left-[5%] bottom-[28%] z-30 flex min-w-[230px] cursor-pointer flex-col justify-center rounded-none border border-neutral-100/80 bg-white py-5 pl-10 pr-8 shadow-2xl"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
        transition={{
          opacity: { duration: 0.8, delay: 0.6 },
          x: { duration: 0.8, delay: 0.6 },
          y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 },
        }}
        whileHover={{ scale: 1.03 }}
      >
        <div className="absolute -left-4 -top-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#193e32] text-[#45a874] shadow">
          <ThumbsUp className="h-4 w-4 fill-brand-emerald text-brand-emerald" />
        </div>
        <div>
          <span className={`${discoverBody} text-base font-medium leading-none text-neutral-900 md:text-lg`}>
            4.9/5
          </span>
          <span className={`${discoverBody} mt-1 block text-xs leading-tight text-neutral-500`}>
            Clients rate taskers
          </span>
        </div>
      </motion.div>

      <motion.div
        className="absolute -right-[2%] bottom-[12%] z-30 flex min-w-[210px] cursor-pointer flex-col justify-center rounded-none border border-neutral-100/80 bg-white py-5 pl-10 pr-8 shadow-2xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: [0, -8, 0] }}
        transition={{
          opacity: { duration: 0.8, delay: 0.7 },
          y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 },
        }}
        whileHover={{ scale: 1.03 }}
      >
        <div className="absolute -left-4 -top-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#193e32] text-[#45a874] shadow">
          <CheckCircle2 className="h-4 w-4 fill-brand-emerald text-brand-emerald" />
        </div>
        <div>
          <span className={`${discoverBody} text-base font-medium leading-none text-neutral-900 md:text-lg`}>
            12K+
          </span>
          <span className={`${discoverBody} mt-1 block text-xs leading-tight text-neutral-500`}>
            Tasks completed
          </span>
        </div>
      </motion.div>
    </div>
  );
}

export default function Hero({ onPostWithTitle }: HeroProps) {
  const router = useRouter();
  const [activeSearch, setActiveSearch] = useState('');
  const [filteredTaskers, setFilteredTaskers] = useState<TaskerProfile[]>(TASKERS_DATA);

  const handleSearchSubmit = (query: string) => {
    setActiveSearch(query);
    if (!query.trim()) {
      setFilteredTaskers(TASKERS_DATA);
      return;
    }

    const searchLow = query.toLowerCase();
    const filtered = TASKERS_DATA.filter((tasker) => {
      return (
        tasker.name.toLowerCase().includes(searchLow) ||
        tasker.role.toLowerCase().includes(searchLow) ||
        tasker.tags.some((tag) => tag.toLowerCase().includes(searchLow))
      );
    });
    setFilteredTaskers(filtered);
  };

  return (
    <section className="relative flex min-h-[calc(100vh-64px)] flex-col justify-start overflow-hidden bg-white px-6 pb-0 pt-4 sm:px-8 sm:pt-6 lg:px-12 lg:pt-8 xl:px-16">
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-0 w-[32%] bg-[#faf7ee] sm:w-[30%] lg:w-[28%]"
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col">
        <div className="grid flex-1 grid-cols-1 items-end gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="mt-4 flex flex-col justify-start self-start text-left sm:mt-5 lg:col-span-7 lg:mt-0 lg:translate-y-2 lg:justify-center lg:self-center">
            <motion.h1
              className={`${discoverHeadline} mb-6 text-3xl leading-[1.15] text-brand-dark sm:text-4xl md:text-5xl lg:text-[46px] xl:text-[54px]`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              With talented <span className="relative inline-block text-brand-emerald">taskers</span>
              <br />
              get more done.
            </motion.h1>

            <motion.p
              className={`${discoverBody} mb-8 max-w-lg text-sm font-medium leading-relaxed text-neutral-500 sm:text-base md:text-lg`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Post a task on TaskNepal and connect with verified locals for cleaning, moving,
              repairs, and more.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <SearchBox
                onSearchSubmit={handleSearchSubmit}
                onPostWithTitle={onPostWithTitle}
              />
            </motion.div>
          </div>

          <div className="relative flex w-full items-end lg:col-span-5 lg:self-end">
            <GraphicSection />
          </div>
        </div>

        <AnimatePresence>
          {activeSearch && (
            <motion.div
              className="mt-20 border-t border-neutral-200/60 pt-12"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            >
              <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h3 className={`${discoverHeadline} text-2xl text-brand-dark`}>
                    Available verified taskers
                  </h3>
                  <p className={`${discoverBody} mt-1 text-sm text-neutral-500`}>
                    Showing matches for{' '}
                    <span className="font-medium text-brand-dark">&quot;{activeSearch}&quot;</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSearchSubmit('')}
                  className={`${discoverMedium} flex cursor-pointer items-center gap-1.5 text-sm text-brand-emerald transition-colors hover:text-brand-dark`}
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
                      className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm transition-all duration-350 hover:border-brand-emerald/30 hover:shadow-xl"
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                      whileHover={{ y: -4 }}
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
                                className={`${discoverMedium} flex items-center gap-1.5 text-base leading-tight text-neutral-800`}
                              >
                                {tasker.name}
                                {tasker.availableNow && (
                                  <span
                                    className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500"
                                    title="Available now"
                                  />
                                )}
                              </h4>
                              <span className={`${discoverBody} text-xs font-medium text-neutral-400`}>
                                {tasker.location}
                              </span>
                            </div>
                          </div>

                          <div className={`${discoverMedium} flex items-center gap-1 rounded-lg bg-neutral-50 px-2.5 py-1 text-sm text-neutral-700`}>
                            <Star className="h-3.5 w-3.5 fill-[#fbbf24] text-[#fbbf24]" />
                            <span>{tasker.rating}</span>
                          </div>
                        </div>

                        <p className={`${discoverMedium} mb-3 text-base text-[#134937]`}>
                          {tasker.role}
                        </p>

                        <div className="mb-5 flex flex-wrap gap-1.5">
                          {tasker.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`${discoverBody} rounded-lg border border-neutral-200/50 bg-brand-light-bg px-2.5 py-1 text-xs font-medium text-neutral-600`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-4">
                        <div>
                          <span className={`${discoverBody} block text-xs font-medium text-neutral-400`}>
                            Starting rate
                          </span>
                          <span className={`${discoverMedium} text-lg text-neutral-800`}>
                            {formatNPR(tasker.rate)}/hr
                    </span>
                        </div>
                          <button
                            type="button"
                          onClick={() => router.push('/users')}
                          className={`${discoverMedium} cursor-pointer rounded-xl bg-brand-dark px-4 py-2.5 text-xs text-white transition-colors duration-200 hover:bg-brand-emerald sm:text-sm`}
                        >
                          View taskers
                          </button>
                      </div>
                    </motion.div>
                      ))}
                  </div>
              ) : (
                <motion.div
                  className="rounded-2xl border border-dashed border-neutral-200 bg-white p-12 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className={`${discoverBody} mb-2 font-medium text-neutral-500`}>
                    No taskers match that query yet.
                  </p>
                  <p className={`${discoverBody} text-xs text-neutral-400`}>
                    Try Cleaning, Moving, Handyman, Repairs, or post your task to get offers.
                  </p>
                  <button
                    type="button"
                    onClick={() => onPostWithTitle(activeSearch)}
                    className={`${discoverMedium} mt-4 cursor-pointer rounded-full bg-brand-dark px-5 py-2.5 text-sm text-white hover:bg-brand-emerald`}
                  >
                    Post this task
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </section>
  );
}
