'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Star,
  ArrowUpRight,
  Filter,
  X,
} from 'lucide-react';
import { formatFreelancerRating } from '@/lib/freelancerProfileFromApi';
import { formatNPR } from '@/lib/nepalLocale';
import UserAvatar from '@/components/common/UserAvatar';
import type { Freelancer } from './freelancerData';
import { getFreelancerProfilePath } from './freelancerSlug';

interface FreelancerListProps {
  freelancers: Freelancer[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onInquire?: (name: string) => void;
}

const DEFAULT_SKILLS_OPTIONS = ['All', 'Figma', 'Sketch', 'HTML5', 'React', 'Node.js'];
const PRICE_OPTIONS = [
  'All',
  'Under Rs 2,000/hr',
  'Rs 2,000 – 4,000/hr',
  'Over Rs 4,000/hr',
];
const LEVEL_OPTIONS = ['All', 'Entry', 'Mid', 'Senior', 'Expert'];
const LANG_OPTIONS = ['All', 'English', 'Nepali', 'Hindi'];
const SORT_OPTIONS = ['Highest Rating', 'Rate: Low to High', 'Rate: High to Low'];

const ITEMS_PER_PAGE = 12;

function FreelancerCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col items-stretch justify-between rounded-none border border-neutral-200/55 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-col items-center text-center">
        <div className="mb-5 mt-1 h-[105px] w-[105px] rounded-full bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-4 w-28 rounded bg-neutral-100 dark:bg-neutral-800" />
        <div className="mt-2 h-3 w-20 rounded bg-neutral-100 dark:bg-neutral-800" />
        <div className="mt-2 h-3 w-24 rounded bg-neutral-100 dark:bg-neutral-800" />
        <div className="mt-4 flex gap-1.5">
          <div className="h-7 w-14 rounded-full bg-neutral-100 dark:bg-neutral-800" />
          <div className="h-7 w-14 rounded-full bg-neutral-100 dark:bg-neutral-800" />
        </div>
      </div>
      <div className="mt-5 h-10 w-full rounded bg-neutral-100 dark:bg-neutral-800" />
    </div>
  );
}

export default function FreelancerList({
  freelancers,
  loading = false,
  error = null,
  onRetry,
  onInquire,
}: FreelancerListProps) {
  const [selectedSkills, setSelectedSkills] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedLang, setSelectedLang] = useState('All');
  const [sortBy, setSortBy] = useState('Highest Rating');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const skillsOptions = useMemo(() => {
    const tags = new Set<string>();
    for (const freelancer of freelancers) {
      for (const tag of freelancer.tags) {
        if (tag && tag !== 'General') tags.add(tag);
      }
    }
    const dynamic = Array.from(tags).sort((a, b) => a.localeCompare(b));
    return dynamic.length > 0 ? ['All', ...dynamic] : DEFAULT_SKILLS_OPTIONS;
  }, [freelancers]);

  const locationOptions = useMemo(() => {
    const cities = new Set<string>();
    for (const freelancer of freelancers) {
      const city = freelancer.location?.trim();
      if (city && city !== '—' && city.toLowerCase() !== 'remote') {
        cities.add(city);
      }
    }
    const dynamic = Array.from(cities).sort((a, b) => a.localeCompare(b));
    const base = ['All', 'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan', 'Remote'];
    const merged = [...base];
    for (const city of dynamic) {
      if (!merged.some((item) => item.toLowerCase() === city.toLowerCase())) {
        merged.push(city);
      }
    }
    return merged;
  }, [freelancers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [freelancers]);

  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdown(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const toggleDropdown = (label: string) => {
    setActiveDropdown((prev) => (prev === label ? null : label));
  };

  const filteredFreelancers = useMemo(() => {
    let result = [...freelancers];

    if (selectedSkills !== 'All') {
      result = result.filter((f) => f.tags.includes(selectedSkills));
    }

    if (selectedPrice !== 'All') {
      if (selectedPrice === 'Under Rs 2,000/hr') {
        result = result.filter((f) => f.rate < 2000);
      } else if (selectedPrice === 'Rs 2,000 – 4,000/hr') {
        result = result.filter((f) => f.rate >= 2000 && f.rate <= 4000);
      } else if (selectedPrice === 'Over Rs 4,000/hr') {
        result = result.filter((f) => f.rate > 4000);
      }
    }

    if (selectedLocation !== 'All') {
      result = result.filter(
        (f) => f.location.toLowerCase() === selectedLocation.toLowerCase(),
      );
    }

    if (selectedLevel !== 'All') {
      result = result.filter((f) => f.level === selectedLevel);
    }

    if (selectedLang !== 'All') {
      result = result.filter((f) => f.languages.includes(selectedLang));
    }

    if (sortBy === 'Highest Rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'Rate: Low to High') {
      result.sort((a, b) => a.rate - b.rate);
    } else if (sortBy === 'Rate: High to Low') {
      result.sort((a, b) => b.rate - a.rate);
    }

    return result;
  }, [
    freelancers,
    selectedSkills,
    selectedPrice,
    selectedLocation,
    selectedLevel,
    selectedLang,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredFreelancers.length / ITEMS_PER_PAGE));
  const normalizedCurrentPage = Math.min(currentPage, totalPages);

  const paginatedFreelancers = useMemo(() => {
    const startIndex = (normalizedCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredFreelancers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredFreelancers, normalizedCurrentPage]);

  const currentStartNum = (normalizedCurrentPage - 1) * ITEMS_PER_PAGE + 1;
  const currentEndNum = Math.min(normalizedCurrentPage * ITEMS_PER_PAGE, filteredFreelancers.length);

  const pageRange = useMemo(() => {
    const delta = 2;
    const range: (number | string)[] = [1];

    if (normalizedCurrentPage > 1 + delta) {
      range.push('...');
    }

    const start = Math.max(2, normalizedCurrentPage - delta);
    const end = Math.min(totalPages - 1, normalizedCurrentPage + delta);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    if (normalizedCurrentPage < totalPages - delta) {
      range.push('...');
    }

    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  }, [normalizedCurrentPage, totalPages]);

  const hasActiveFilters =
    selectedSkills !== 'All' ||
    selectedPrice !== 'All' ||
    selectedLocation !== 'All' ||
    selectedLevel !== 'All' ||
    selectedLang !== 'All';

  const resetAllFilters = () => {
    setSelectedSkills('All');
    setSelectedPrice('All');
    setSelectedLocation('All');
    setSelectedLevel('All');
    setSelectedLang('All');
    setSortBy('Highest Rating');
    setCurrentPage(1);
  };

  const renderFilterDropdown = (
    label: string,
    value: string,
    options: string[],
    onSelect: (opt: string) => void,
  ) => (
    <div className="relative">
      <button
        type="button"
        onClick={() => toggleDropdown(label)}
        className={`flex items-center gap-2.5 rounded-none border px-4.5 py-2.5 text-sm font-normal tracking-tight text-black transition-all dark:text-stone-100 ${
          value !== 'All'
            ? 'border-emerald-500 bg-[#EAF6F0] text-black dark:bg-emerald-950/50'
            : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600'
        }`}
      >
        <span>
          {label}: {value}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-neutral-400 transition-transform duration-200 ${
            activeDropdown === label ? 'rotate-180 text-neutral-600' : ''
          }`}
        />
      </button>
      {activeDropdown === label && (
        <div className="absolute left-0 z-40 mt-1.5 w-48 rounded-none border border-neutral-200 bg-white py-1.5 shadow-lg outline-none dark:border-neutral-700 dark:bg-neutral-900">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onSelect(opt);
                setCurrentPage(1);
                setActiveDropdown(null);
              }}
              className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm font-normal tracking-tight transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800 ${
                value === opt ? 'bg-emerald-50/40 text-black dark:bg-emerald-950/40 dark:text-stone-100' : 'text-black dark:text-stone-100'
              }`}
            >
              <span>{opt}</span>
              {value === opt && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <section className="w-full select-none bg-white px-4 py-6 sm:px-6 md:px-8 lg:px-12 dark:bg-neutral-950">
      <div className="w-full max-w-none">
        <div className="mb-8 mt-4 flex flex-col items-start justify-between gap-4 pb-6 md:flex-row md:items-center">
          <div className="flex flex-wrap gap-2.5" onClick={(e) => e.stopPropagation()}>
            {renderFilterDropdown('Skills', selectedSkills, skillsOptions, setSelectedSkills)}
            {renderFilterDropdown('Price', selectedPrice, PRICE_OPTIONS, setSelectedPrice)}
            {renderFilterDropdown(
              'Location',
              selectedLocation,
              locationOptions,
              setSelectedLocation,
            )}
            {renderFilterDropdown('Level', selectedLevel, LEVEL_OPTIONS, setSelectedLevel)}
            {renderFilterDropdown('Languages', selectedLang, LANG_OPTIONS, setSelectedLang)}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="flex cursor-pointer items-center gap-1.5 rounded-none px-3.5 py-2 text-sm font-normal tracking-tight text-rose-600 transition-all hover:bg-rose-50/60 hover:text-rose-700"
              >
                <X className="h-3.5 w-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div
            className="flex items-center gap-2.5 self-end md:self-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('SortBy')}
                className="flex cursor-pointer items-center gap-1.5 text-xs font-normal tracking-tight text-black dark:text-stone-100"
              >
                <span>Sort by {sortBy}</span>
                <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
              </button>
              {activeDropdown === 'SortBy' && (
                <div className="absolute right-0 z-40 mt-1.5 w-52 rounded-none border border-neutral-200 bg-white py-1.5 shadow-lg outline-none dark:border-neutral-700 dark:bg-neutral-900">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setSortBy(opt);
                        setCurrentPage(1);
                        setActiveDropdown(null);
                      }}
                      className={`flex w-full items-center justify-between px-4 py-2 text-left text-xs font-normal tracking-tight transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800 ${
                        sortBy === opt ? 'bg-emerald-50/40 text-black dark:bg-emerald-950/40 dark:text-stone-100' : 'text-black dark:text-stone-100'
                      }`}
                    >
                      <span>{opt}</span>
                      {sortBy === opt && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-[24px] border border-red-200/80 bg-red-50/70 p-12 text-center shadow-sm dark:border-red-900/50 dark:bg-red-950/30">
            <h3 className="text-sm font-normal tracking-tight text-red-800 dark:text-red-300">{error}</h3>
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="mt-4 cursor-pointer rounded-none border border-red-200 bg-white px-4.5 py-2 text-xs font-normal tracking-tight text-red-700 transition-all hover:bg-red-50 dark:border-red-800 dark:bg-neutral-900 dark:text-red-300 dark:hover:bg-red-950/40"
              >
                Retry
              </button>
            ) : null}
          </div>
        ) : null}

        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                <FreelancerCardSkeleton key={`freelancer-skeleton-${index}`} />
              ))}
            </div>
          ) : error ? null : paginatedFreelancers.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 },
                },
              }}
            >
              {paginatedFreelancers.map((fl) => (
                <motion.div
                  key={fl.id}
                  layoutId={`fl-card-${fl.id}`}
                  className="flex flex-col items-stretch justify-between rounded-none border border-neutral-200/55 bg-white p-6 text-black transition-all duration-300 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900 dark:text-stone-100 dark:hover:shadow-none"
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ y: -4 }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-5 mt-1 select-none">
                      <UserAvatar
                        src={fl.avatar || undefined}
                        name={fl.name}
                        alt={fl.name}
                        size="xl"
                        className="h-[105px] w-[105px] select-none text-3xl"
                      />
                      {fl.availableNow && (
                        <span className="absolute bottom-1 right-2.5 inline-block h-3.5 w-3.5 rounded-full border-2 border-white bg-[#52C47F] shadow-sm dark:border-neutral-900" />
                      )}
                    </div>

                    <h3 className="text-base font-normal leading-tight tracking-tight text-black dark:text-stone-100">
                      {fl.name}
                    </h3>

                    <p className="mt-1 text-xs font-normal tracking-tight text-black/60 dark:text-neutral-400">
                      {fl.role}
                    </p>

                    <div className="mt-2 flex select-none items-center justify-center gap-1 text-xs font-normal text-black/60 dark:text-neutral-400">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="ml-0.5 text-black dark:text-stone-100">
                        {formatFreelancerRating(fl.rating, fl.reviews)}
                      </span>
                      <span>({fl.reviews} reviews)</span>
                    </div>

                    <div className="mt-4 flex min-h-[30px] w-full flex-wrap items-center justify-center gap-1.5">
                      {fl.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[#ffede8] px-3.5 py-2 text-xs font-normal tracking-tight text-black dark:bg-neutral-800 dark:text-stone-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="grid grid-cols-3 gap-0.5 select-none py-5 text-center text-[10px] font-normal uppercase tracking-tight text-black/50 dark:text-neutral-500">
                      <div>
                        <span className="capitalize">Location</span>
                        <div className="mt-1 text-[12px] font-normal normal-case tracking-tight text-black dark:text-stone-100">
                          {fl.location}
                        </div>
                      </div>
                      <div>
                        <span className="capitalize">Rate</span>
                        <div className="mt-1 text-[12px] font-normal normal-case tracking-tight text-black dark:text-stone-100">
                          {formatNPR(fl.rate)}/hr
                        </div>
                      </div>
                      <div>
                        <span className="capitalize">Job Success</span>
                        <div className="mt-1 text-[12px] font-normal normal-case tracking-tight text-black dark:text-stone-100">
                          %{fl.jobSuccess}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={getFreelancerProfilePath(fl)}
                      className="mt-5 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-none border border-neutral-200 bg-neutral-50 py-3.5 text-xs font-normal tracking-tight text-black transition-all hover:border-[#5bbb7b] hover:bg-[#5bbb7b] hover:text-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-stone-100"
                    >
                      <span>View Profile</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="rounded-[24px] border border-dashed border-neutral-200/80 bg-neutral-50/70 p-16 text-center shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                <Filter className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-normal tracking-tight text-black dark:text-stone-100">
                No freelancers match those search criteria
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-xs font-normal leading-relaxed tracking-tight text-black/60 dark:text-neutral-400">
                Try clearing some parameters or filters like Skills/Location above to view other
                talented professionals in the community.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-4 cursor-pointer rounded-none border border-neutral-200 bg-neutral-50 px-4.5 py-2 text-xs font-normal tracking-tight text-black transition-all hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-stone-100 dark:hover:bg-neutral-700"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && filteredFreelancers.length > 0 && (
          <div className="mt-12.5 flex flex-col items-center justify-center pt-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={normalizedCurrentPage === 1}
                className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-all hover:bg-neutral-50 hover:text-black dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-stone-100 ${
                  normalizedCurrentPage === 1 ? 'pointer-events-none opacity-35' : ''
                }`}
                title="Previous page"
              >
                <ChevronLeft className="h-4 w-4 stroke-[2]" />
              </button>

              <div className="flex items-center gap-1">
                {pageRange.map((pg, index) => {
                  if (pg === '...') {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="flex h-10 w-10 select-none items-center justify-center font-mono text-xs font-normal tracking-tight text-black/40 dark:text-neutral-500"
                      >
                        ...
                      </span>
                    );
                  }

                  const isCurrent = pg === normalizedCurrentPage;
                  return (
                    <button
                      key={`page-btn-${pg}`}
                      type="button"
                      onClick={() => setCurrentPage(pg as number)}
                      className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-xs font-normal tracking-tight transition-all ${
                        isCurrent
                          ? 'scale-105 bg-[#52C47F] text-white shadow-sm'
                          : 'text-black/50 hover:text-black dark:text-neutral-400 dark:hover:text-stone-100'
                      }`}
                    >
                      {pg}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={normalizedCurrentPage === totalPages}
                className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-all hover:bg-neutral-50 hover:text-black dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-stone-100 ${
                  normalizedCurrentPage === totalPages ? 'pointer-events-none opacity-35' : ''
                }`}
                title="Next page"
              >
                <ChevronRight className="h-4 w-4 stroke-[2]" />
              </button>
            </div>

            <p className="mt-4 text-center text-xs font-normal tracking-tight text-black/60 dark:text-neutral-400">
              {currentStartNum} – {currentEndNum} of {filteredFreelancers.length}+ freelancers
              available
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
