'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Star, Search as SearchIcon } from 'lucide-react';
import {
  discoverBody,
  discoverHeadline,
  discoverMedium,
} from '@/components/LangingHome/landingTypography';
import { formatNPR } from '@/lib/nepalLocale';

interface Freelancer {
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

const FREELANCERS_DATA: Freelancer[] = [
  {
    id: 'f1',
    name: 'Elena Rostova',
    role: 'UI/UX Designer',
    rating: 4.9,
    reviews: 142,
    rate: 2500,
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    tags: ['Figma', 'Mobile UI', 'Web Performance', 'Designer'],
    location: 'Kathmandu',
    availableNow: true,
  },
  {
    id: 'f2',
    name: 'Rajesh Kumar',
    role: 'React Web Developer',
    rating: 5.0,
    reviews: 218,
    rate: 3200,
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    tags: ['React', 'TypeScript', 'Next.js', 'Web', 'Developer'],
    location: 'Lalitpur',
    availableNow: true,
  },
  {
    id: 'f3',
    name: 'Marcus Thorne',
    role: 'Senior Frontend Engineer',
    rating: 4.8,
    reviews: 93,
    rate: 3800,
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    tags: ['Vite', 'TailwindCSS', 'Node.js', 'Senior', 'Engineer'],
    location: 'Bhaktapur',
    availableNow: false,
  },
  {
    id: 'f4',
    name: 'Amélie Laurent',
    role: 'iOS Swift Developer',
    rating: 4.9,
    reviews: 76,
    rate: 3400,
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    tags: ['SwiftUI', 'CoreData', 'Combine', 'IOS', 'Developer'],
    location: 'Pokhara',
    availableNow: true,
  },
  {
    id: 'f5',
    name: 'Sven Gieler',
    role: 'PHP Laravel Architect',
    rating: 4.7,
    reviews: 112,
    rate: 2800,
    avatar:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150',
    tags: ['PHP', 'Laravel', 'MySQL', 'Web', 'Developer'],
    location: 'Kathmandu',
    availableNow: true,
  },
];

const SUGGESTIONS_DATABASE = [
  'UI/UX Designer',
  'React Web Developer',
  'WordPress Specialist',
  'iOS Swift Developer',
  'PHP Laravel Architect',
  'Senior Frontend Engineer',
  'Senior Backend Engineer',
  'Graphic Designer',
  'Logo Branding specialist',
  'Mobile App Developer (Flutter/React Native)',
  'SEO & Content Strategist',
  'AI & Machine Learning Engineer',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query, locationQuery);
  };

  const clearSearch = () => {
    setHasSearched(false);
    setQuery('');
    setLocationQuery('');
    onSearchSubmit?.('', '');
  };

  return (
    <div className="relative z-20 w-full max-w-[560px]">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`relative z-30 flex w-full items-center rounded-[12px] border bg-white p-1.5 shadow-sm transition-all duration-300 ${
            isFocused ? 'border-neutral-300 ring-2 ring-[#52C47F]/10' : 'border-neutral-200/40'
          }`}
        >
          <div className="flex flex-1 items-center py-1">
            <div className="pl-3.5 pr-2.5 text-neutral-500">
              <SearchIcon className="h-5 w-5 stroke-[1.8]" />
            </div>
            <input
              id="project-search"
              type="text"
              className={`${discoverBody} w-full flex-1 border-none bg-transparent py-2 text-[15px] text-neutral-900 outline-none placeholder:text-neutral-500 focus:ring-0`}
              placeholder="What are you looking for?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            />
          </div>

          <motion.button
            type="submit"
            className={`${discoverMedium} ml-2 flex cursor-pointer items-center justify-center rounded-[8px] bg-[#52C47F] px-9 py-[11px] text-[14.5px] text-white transition-all duration-200 hover:bg-[#49b071]`}
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
                  Matching Talented Skills
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

      <AnimatePresence>
        {hasSearched && (
          <motion.div
            className="relative z-20 mt-5 flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-3.5 text-[#1D3E35]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1D3E35]/10 text-[#1D3E35]">
                <Sparkles className="h-4 w-4 animate-pulse" />
              </div>
              <p className={`${discoverBody} text-xs sm:text-sm`}>
                Found top-rated professionals for{' '}
                <span className={`${discoverMedium}`}>&quot;{lastSearch}&quot;</span>!
              </p>
            </div>
            <button
              type="button"
              onClick={clearSearch}
              className={`${discoverMedium} cursor-pointer text-xs text-neutral-500 underline transition-colors hover:text-black`}
            >
              Clear filter
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface HeroProps {
  className?: string;
}

export default function Hero({ className = '' }: HeroProps) {
  const [activeSearch, setActiveSearch] = useState('');
  const [filteredFreelancers, setFilteredFreelancers] = useState<Freelancer[]>(FREELANCERS_DATA);

  const handleSearchSubmit = (query: string, location: string = '') => {
    const active = query && location ? `${query} (${location})` : query || location;
    setActiveSearch(active);

    if (!query.trim() && !location.trim()) {
      setFilteredFreelancers(FREELANCERS_DATA);
      return;
    }

    const searchLow = query.toLowerCase();
    const locLow = location.toLowerCase();

    setFilteredFreelancers(
      FREELANCERS_DATA.filter((freelancer) => {
        const matchSearch =
          !query.trim() ||
          freelancer.name.toLowerCase().includes(searchLow) ||
          freelancer.role.toLowerCase().includes(searchLow) ||
          freelancer.tags.some((tag) => tag.toLowerCase().includes(searchLow));
        const matchLoc =
          !location.trim() || freelancer.location.toLowerCase().includes(locLow);
        return matchSearch && matchLoc;
      })
    );
  };

  return (
    <section className={`select-none bg-white px-4 pb-4 pt-8 sm:px-6 sm:pb-6 lg:px-8 ${className}`}>
      <div className="mx-auto w-full max-w-7xl">
        <div className="relative flex min-h-[350px] w-full items-stretch overflow-hidden rounded-[24px] border border-neutral-200/40 bg-[#fbf2ed] shadow-sm sm:min-h-[380px] lg:min-h-[420px]">
          <div className="pointer-events-none absolute -left-16 -top-10 z-0 h-44 w-44 select-none rounded-full bg-[#fcd074] sm:-left-20 sm:-top-12 sm:h-56 sm:w-56 lg:-left-24 lg:-top-16 lg:h-64 lg:w-64" />

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
                className={`${discoverHeadline} mb-2 text-3xl font-bold leading-tight tracking-tight text-black sm:text-4xl md:text-[42px]`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Projects List
              </motion.h1>

              <motion.p
                className={`${discoverBody} mb-8 max-w-xl text-xs font-normal leading-relaxed text-neutral-700 sm:text-sm md:text-base`}
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
                <SearchBox onSearchSubmit={handleSearchSubmit} />
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
                    Available Qualified Matches
                  </h3>
                  <p className={`${discoverBody} mt-1 text-sm text-neutral-500`}>
                    Showing matches for{' '}
                    <span className={`${discoverMedium} text-[#1D3E35]`}>
                      &quot;{activeSearch}&quot;
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSearchSubmit('', '')}
                  className={`${discoverMedium} flex cursor-pointer items-center gap-1.5 text-sm text-[#1D3E35] transition-opacity hover:opacity-80`}
                >
                  Clear search filters
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {filteredFreelancers.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredFreelancers.map((f, index) => (
                    <motion.div
                      key={f.id}
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
                              src={f.avatar}
                              alt={f.name}
                              className="h-12 w-12 rounded-full border border-neutral-100 object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <h4
                                className={`${discoverHeadline} flex items-center gap-1.5 text-base leading-tight text-neutral-800`}
                              >
                                {f.name}
                                {f.availableNow && (
                                  <span
                                    className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500"
                                    title="Available now"
                                  />
                                )}
                              </h4>
                              <span className={`${discoverBody} text-xs text-neutral-400`}>
                                {f.location}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`${discoverMedium} flex items-center gap-1 rounded-lg bg-neutral-50 px-2.5 py-1 text-sm text-neutral-700`}
                          >
                            <Star className="h-3.5 w-3.5 fill-[#fbbf24] text-[#fbbf24]" />
                            {f.rating}
                          </div>
                        </div>

                        <p className={`${discoverHeadline} mb-3 text-base text-[#1D3E35]`}>
                          {f.role}
                        </p>

                        <div className="mb-5 flex flex-wrap gap-1.5">
                          {f.tags.map((t) => (
                            <span
                              key={t}
                              className={`${discoverBody} rounded-md border border-neutral-100 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-600`}
                            >
                              {t}
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
                            {formatNPR(f.rate)}/hr
                          </span>
                        </div>
                        <button
                          type="button"
                          className={`${discoverMedium} cursor-pointer rounded-lg bg-[#1D3E35] px-4 py-2.5 text-xs text-white transition-colors duration-200 hover:bg-neutral-900 sm:text-sm`}
                        >
                          Apply/Inquire
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
                    No qualified listings match that search query.
                  </p>
                  <p className={`${discoverBody} text-xs text-neutral-400`}>
                    Try searching for &quot;Designer&quot;, &quot;Developer&quot;, &quot;Web&quot;,
                    &quot;IOS&quot;, or &quot;Engineer&quot;.
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
