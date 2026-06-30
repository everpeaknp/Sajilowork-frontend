'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search as SearchIcon } from 'lucide-react';
import {
  discoverBody,
  discoverHeadline,
  discoverMedium,
} from '@/components/LangingHome/landingTypography';
import HeroImage from '@/components/ui/hero-image';
import MarketplaceHeroBreadcrumbs from '@/components/marketplace/MarketplaceHeroBreadcrumbs';
import { loadCategories } from '@/lib/dashboardListingApi';
import { flattenCategoriesForSelect } from '@/lib/taskUtils';
import { MARKETPLACE_HERO_IMAGE } from '@/lib/placeholderImages';

type CategoryOption = { id: string; name: string };

const DEFAULT_CATEGORY_OPTION: CategoryOption = { id: 'choose-category', name: 'Choose Category' };

const FALLBACK_CATEGORY_OPTIONS: CategoryOption[] = [
  DEFAULT_CATEGORY_OPTION,
  { id: 'fallback-cleaning', name: 'Cleaning' },
  { id: 'fallback-moving', name: 'Moving & Delivery' },
  { id: 'fallback-handyman', name: 'Handyman & Repairs' },
  { id: 'fallback-garden', name: 'Garden & Outdoor' },
  { id: 'fallback-electrical', name: 'Electrical & Plumbing' },
  { id: 'fallback-design', name: 'Design & Creative' },
  { id: 'fallback-web', name: 'Web & App Design' },
];

function uniqueCategoryOptions(items: ReturnType<typeof flattenCategoriesForSelect>): CategoryOption[] {
  const seen = new Set<string>();
  const options: CategoryOption[] = [];

  for (const item of items) {
    const name = item.name.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    options.push({ id: item.id, name });
  }

  return options.sort((a, b) => a.name.localeCompare(b.name));
}

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
  'UI/UX design',
  'Logo branding',
  'Website design',
];

const MAIN_PORTRAIT = MARKETPLACE_HERO_IMAGE;

interface SearchBoxProps {
  onSearchSubmit?: (query: string, category: string) => void;
}

function SearchBox({ onSearchSubmit }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Choose Category');
  const [categories, setCategories] = useState<CategoryOption[]>(FALLBACK_CATEGORY_OPTIONS);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    void loadCategories('service')
      .then((items) => {
        if (cancelled) return;
        const options = uniqueCategoryOptions(flattenCategoriesForSelect(items));
        if (options.length > 0) {
          setCategories([DEFAULT_CATEGORY_OPTION, ...options]);
        }
      })
      .catch(() => {
        /* keep fallback list */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

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

  const performSearch = (selectedQuery: string, selectedCat?: string) => {
    const cat = selectedCat ?? category;
    setQuery(selectedQuery);
    setCategory(cat);
    setIsFocused(false);
    setIsDropdownOpen(false);
    onSearchSubmit?.(selectedQuery, cat === 'Choose Category' ? '' : cat);
    document.getElementById('available-services-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query, category);
  };

  return (
    <div className="relative z-20 w-full max-w-3xl">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`relative z-30 flex w-full flex-col items-stretch rounded-xl border bg-white p-1.5 shadow-md transition-all duration-300 sm:flex-row sm:items-center ${
            isFocused ? 'border-brand-emerald ring-2 ring-brand-emerald/10' : 'border-neutral-200/40'
          }`}
        >
          <div className="flex min-w-0 flex-1 items-center border-b border-neutral-100 py-2 sm:border-b-0 sm:py-0">
            <div className="pl-3 pr-2 text-neutral-400">
              <SearchIcon className="h-5 w-5 stroke-[2]" />
            </div>
            <input
              id="services-search"
              type="text"
              className={`${discoverBody} w-full flex-1 border-none bg-transparent py-2 text-sm text-neutral-800 outline-none placeholder:text-neutral-400 focus:ring-0 md:text-base`}
              placeholder="Search services by title, skill, or seller"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            />
          </div>

          <div className="mx-2 hidden h-8 w-px self-center bg-neutral-200 sm:block" />

          <div ref={dropdownRef} className="relative flex items-center border-b border-neutral-100 py-2 sm:border-b-0 sm:border-none sm:py-0">
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
              <div className="absolute left-0 right-0 top-[110%] z-[200] mt-1 max-h-64 overflow-y-auto rounded-xl border border-neutral-100 bg-white py-1.5 shadow-xl sm:right-auto sm:w-[260px]">
                {categories.map((catOption) => (
                  <button
                    key={catOption.id}
                    type="button"
                    onClick={() => {
                      setCategory(catOption.name);
                      setIsDropdownOpen(false);
                    }}
                    className={`${discoverBody} w-full cursor-pointer px-4 py-2.5 text-left text-sm transition-colors duration-150 ${
                      category === catOption.name
                        ? 'bg-brand-emerald/10 font-medium text-neutral-800'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    {catOption.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <motion.button
            type="submit"
            className={`${discoverMedium} mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-emerald px-6 py-3 text-sm text-white transition-all duration-200 hover:bg-[#43b06d] sm:mt-0 sm:w-auto sm:px-8 md:text-base`}
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
                  Suggested service searches
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
    </div>
  );
}

interface ServicesHeroProps {
  className?: string;
  onSearchSubmit?: (query: string, category: string) => void;
}

export default function ServicesHero({ className = '', onSearchSubmit }: ServicesHeroProps) {
  return (
    <section
      className={`relative z-30 select-none bg-white px-4 pb-6 pt-6 sm:px-6 sm:pb-6 sm:pt-8 lg:px-8 ${className}`}
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="relative flex min-h-[200px] w-full items-stretch overflow-visible rounded-2xl bg-[#1a3c34] shadow-sm sm:min-h-[240px] sm:rounded-[24px] lg:min-h-[280px]">
          <MarketplaceHeroBreadcrumbs serpKey="services" sectionPath="/services" variant="dark" />
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl sm:rounded-[24px]">
            <div className="absolute bottom-0 left-0 top-0 hidden select-none sm:block">
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

            <div className="absolute inset-0 overflow-hidden opacity-[0.12] mix-blend-overlay">
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
          </div>

          <div className="relative z-10 grid w-full grid-cols-1 items-stretch gap-4 px-5 pb-0 pt-11 sm:gap-6 sm:px-12 sm:pt-12 md:px-16 lg:grid-cols-12 lg:pb-0 lg:pt-14">
            <div className="flex flex-col justify-center pb-4 text-left sm:pb-10 lg:col-span-8 lg:pb-10">
              <motion.h1
                className={`${discoverHeadline} mb-2.5 text-2xl leading-tight text-white sm:text-3xl md:text-[38px] lg:text-[40px]`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Home &amp; local services
              </motion.h1>

              <motion.p
                className={`${discoverBody} mb-5 max-w-xl text-xs leading-relaxed text-white/90 sm:mb-6 sm:text-sm md:text-base`}
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
                <SearchBox onSearchSubmit={onSearchSubmit} />
              </motion.div>
            </div>

            <div className="relative mt-2 flex h-[160px] w-full max-w-full items-end justify-center self-end overflow-hidden select-none sm:mt-0 sm:h-[200px] lg:absolute lg:bottom-0 lg:right-6 lg:col-span-4 lg:mt-0 lg:h-[min(260px,95%)] lg:max-w-[38%] lg:justify-center xl:right-10">
              <motion.div
                className="relative z-10 h-full"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <HeroImage
                  src={MAIN_PORTRAIT}
                  alt="Local tasker ready to help"
                  className="block h-full max-w-full w-auto object-contain object-bottom drop-shadow-2xl"
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
