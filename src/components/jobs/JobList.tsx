'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
} from 'lucide-react';
import { discoverBody, discoverHeadline, discoverMedium } from '@/components/LangingHome/landingTypography';
import { searchBrowseJobs } from '@/lib/listingSearchApi';
import { type Job } from './jobListData';
import JobCompanyLogo from './JobCompanyLogo';
import EmployerAvatarCircle from '@/components/employers/EmployerAvatarCircle';
import { resolveEmployerProfileHref } from '@/components/employers/employerSlug';
import { getJobDetailPath } from './jobSlug';
import { MarketplaceJobGridSkeleton } from '@/components/common/MarketplaceBrowseSkeletons';
import { buildBookmarkSlugSet, resolveListingSlug, toggleListingBookmark } from '@/lib/listingBookmark';

const FILTER_CATEGORIES = [
  { value: 'All', label: 'All Categories' },
  { value: 'Design & Creative', label: 'Design & Creative' },
  { value: 'Development & IT', label: 'Development & IT' },
  { value: 'Writing & Translation', label: 'Writing & Translation' },
  { value: 'Digital Marketing', label: 'Digital Marketing' },
  { value: 'Video & Animation', label: 'Video & Animation' },
  { value: 'Finance & Accounting', label: 'Finance & Accounting' },
];

const FILTER_SALARIES = [
  { value: 'All', label: 'All Budgets' },
  { value: '0-50k', label: 'Under Rs. 50k' },
  { value: '50k-100k', label: 'Rs. 50k – 1 Lac' },
  { value: '100k-150k', label: 'Rs. 1 – 1.5 Lac' },
  { value: '150k+', label: 'Rs. 1.5 Lac+' },
];

const FILTER_TYPES = [
  { value: 'All', label: 'All Types' },
  { value: 'Hourly', label: 'Hourly' },
  { value: 'Fixed Price', label: 'Fixed Price' },
  { value: 'Contract', label: 'Contract' },
];

const FILTER_LEVELS = [
  { value: 'All', label: 'All Levels' },
  { value: 'Entry Level', label: 'Entry Level' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Expert', label: 'Expert' },
];

const SORT_OPTIONS = [
  { value: 'best-seller', label: 'Best Seller' },
  { value: 'budget-high', label: 'Highest Budget' },
  { value: 'duration-low', label: 'Urgent (1-5 Days)' },
];

interface JobListProps {
  className?: string;
  searchQuery?: string;
  searchLocation?: string;
  onClearSearch?: () => void;
}

export default function JobList({
  className = '',
  searchQuery = '',
  searchLocation = '',
  onClearSearch,
}: JobListProps) {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);
  const [savedSlugs, setSavedSlugs] = useState<Set<string>>(new Set());
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSalary, setSelectedSalary] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [sortBy, setSortBy] = useState('best-seller');
  const [currentPage, setCurrentPage] = useState(1);
  const [alertText, setAlertText] = useState<string | null>(null);
  const filterRowRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 16;

  function salaryRange(): { min_budget?: number; max_budget?: number } {
    switch (selectedSalary) {
      case '0-50k':
        return { max_budget: 50000 };
      case '50k-100k':
        return { min_budget: 50000, max_budget: 100000 };
      case '100k-150k':
        return { min_budget: 100001, max_budget: 150000 };
      case '150k+':
        return { min_budget: 150000 };
      default:
        return {};
    }
  }

  useEffect(() => {
    let cancelled = false;
    setLoadingJobs(true);

    const categoryQuery = selectedCategory !== 'All' ? selectedCategory : '';
    const queryParts = [searchQuery.trim(), categoryQuery].filter(Boolean);

    void searchBrowseJobs({
      query: queryParts.join(' ').trim() || undefined,
      location: searchLocation.trim() || undefined,
      page: currentPage,
      page_size: itemsPerPage,
      sort_by: sortBy === 'budget-high' ? 'budget_high' : 'newest',
      ...salaryRange(),
    })
      .then((result) => {
        if (cancelled) return;
        let items = result.items;
        if (selectedType !== 'All') {
          items = items.filter((j) => j.type === selectedType);
        }
        if (selectedLevel !== 'All') {
          items = items.filter((j) => j.experienceLevel === selectedLevel);
        }
        setJobs(items);
        setTotalJobs(result.total);
        setSavedSlugs(buildBookmarkSlugSet(items));
      })
      .catch(() => {
        if (!cancelled) {
          setJobs([]);
          setTotalJobs(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingJobs(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    searchQuery,
    searchLocation,
    selectedCategory,
    selectedSalary,
    selectedType,
    selectedLevel,
    sortBy,
    currentPage,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedSalary, selectedType, selectedLevel, sortBy, searchQuery, searchLocation]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRowRef.current && !filterRowRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerAlert = (text: string) => {
    setAlertText(text);
    setTimeout(() => setAlertText(null), 3500);
  };

  const handleDropdownToggle = (dropdownId: string) => {
    setOpenDropdown((prev) => (prev === dropdownId ? null : dropdownId));
  };

  const toggleStar = async (job: Job, event: React.MouseEvent) => {
    event.stopPropagation();
    const slug = resolveListingSlug(job.slug, job.id);
    const isSaved = savedSlugs.has(slug);
    const next = await toggleListingBookmark(slug, isSaved, 'job');
    if (next === null) return;
    setSavedSlugs((prev) => {
      const updated = new Set(prev);
      if (next) updated.add(slug);
      else updated.delete(slug);
      return updated;
    });
  };

  const totalPages = Math.max(1, Math.ceil(totalJobs / itemsPerPage));
  const startIdx = totalJobs === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalJobs);

  const paginatedJobsList = jobs;

  const hasActiveSearch = Boolean(searchQuery.trim() || searchLocation.trim());
  const activeSearchLabel =
    searchQuery.trim() && searchLocation.trim()
      ? `${searchQuery.trim()} (${searchLocation.trim()})`
      : searchQuery.trim() || searchLocation.trim();

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedSalary !== 'All' ||
    selectedType !== 'All' ||
    selectedLevel !== 'All' ||
    hasActiveSearch;

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedSalary('All');
    setSelectedType('All');
    setSelectedLevel('All');
    onClearSearch?.();
    triggerAlert('Filters cleared.');
  };

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }

    return pages.map((p, idx) => {
      if (p === '...') {
        return (
          <span key={`dots-${idx}`} className="select-none px-2 text-sm tracking-tight text-neutral-400">
            ...
          </span>
        );
      }
      const isCurrent = currentPage === p;
      return (
        <button
          key={`page-${p}`}
          type="button"
          onClick={() => setCurrentPage(p as number)}
          className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-sm font-medium transition-all sm:h-10 sm:w-10 sm:text-[15px] ${
            isCurrent ? 'bg-[#45a874] font-medium text-white' : 'text-neutral-700 hover:bg-neutral-50'
          }`}
        >
          {p}
        </button>
      );
    });
  };

  const locationLabel = (loc: Job['location']) =>
    loc === 'Remote' ? 'Remote' : loc === 'Hybrid' ? 'Hybrid' : 'In-office';

  return (
    <section
      id="custom-job-board-grid"
      className={`w-full select-none border-b border-gray-100 bg-white px-4 pb-12 pt-0 sm:px-6 sm:pt-2 md:px-8 lg:px-12 ${className}`}
    >
      <div className="w-full max-w-none">
        <AnimatePresence>
          {alertText && (
            <motion.div
              className="fixed bottom-20 left-4 right-4 z-50 flex items-center gap-3 rounded-2xl border border-[#45a874]/20 bg-[#193e32] px-5 py-3.5 text-white shadow-xl sm:bottom-8 sm:left-auto sm:right-8 sm:w-auto sm:px-6 sm:py-4"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#45a874] text-white">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </div>
              <p className={`${discoverMedium} text-xs tracking-wide`}>{alertText}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          ref={filterRowRef}
          className="mb-6 flex flex-col justify-between gap-4 pb-2 sm:mb-8 sm:gap-5 sm:pb-4 md:flex-row md:items-center"
        >
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
            <div className="flex w-max max-w-full flex-nowrap items-center gap-2 sm:w-auto sm:flex-wrap">
            <FilterDropdown
              id="category"
              label="Category"
              active={selectedCategory !== 'All'}
              open={openDropdown === 'category'}
              onToggle={() => handleDropdownToggle('category')}
              options={FILTER_CATEGORIES}
              selected={selectedCategory}
              onSelect={(v) => {
                setSelectedCategory(v);
                setOpenDropdown(null);
              }}
            />
            <FilterDropdown
              id="salary"
              label="Salary"
              active={selectedSalary !== 'All'}
              open={openDropdown === 'salary'}
              onToggle={() => handleDropdownToggle('salary')}
              options={FILTER_SALARIES}
              selected={selectedSalary}
              onSelect={(v) => {
                setSelectedSalary(v);
                setOpenDropdown(null);
              }}
            />
            <FilterDropdown
              id="type"
              label="Job Type"
              active={selectedType !== 'All'}
              open={openDropdown === 'type'}
              onToggle={() => handleDropdownToggle('type')}
              options={FILTER_TYPES}
              selected={selectedType}
              onSelect={(v) => {
                setSelectedType(v);
                setOpenDropdown(null);
              }}
            />
            <FilterDropdown
              id="level"
              label="Level"
              active={selectedLevel !== 'All'}
              open={openDropdown === 'level'}
              onToggle={() => handleDropdownToggle('level')}
              options={FILTER_LEVELS}
              selected={selectedLevel}
              onSelect={(v) => {
                setSelectedLevel(v);
                setOpenDropdown(null);
              }}
            />
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className={`${discoverMedium} ml-2 block cursor-pointer py-2 text-xs font-bold text-neutral-400 transition-colors hover:text-black`}
              >
                Reset
              </button>
            )}
            </div>
          </div>

          <div className="flex w-full items-center justify-between gap-1.5 md:w-auto md:justify-end md:self-auto">
            <span className={`${discoverBody} text-[13px] font-medium text-neutral-400`}>Sort by</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => handleDropdownToggle('sort')}
                className={`${discoverMedium} flex cursor-pointer items-center gap-1 text-[13px] text-neutral-800 transition-all hover:text-black focus:outline-none`}
              >
                <span>{SORT_OPTIONS.find((o) => o.value === sortBy)?.label}</span>
                <ChevronDown className="h-4 w-4 text-neutral-500" />
              </button>
              <AnimatePresence>
                {openDropdown === 'sort' && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 3 }}
                    className="absolute right-0 z-30 mt-1.5 w-48 rounded-lg border border-gray-200/90 bg-white py-1.5 shadow-lg"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSortBy(opt.value);
                          setOpenDropdown(null);
                        }}
                        className={`${discoverMedium} flex w-full cursor-pointer items-center justify-between px-3.5 py-2 text-left text-xs transition-colors hover:bg-neutral-50 ${
                          sortBy === opt.value ? 'font-semibold text-[#45a874]' : 'text-neutral-700'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {sortBy === opt.value && <Check className="h-3.5 w-3.5 text-[#45a874]" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {hasActiveSearch ? (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50/80 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <p className={`${discoverBody} text-sm text-neutral-600`}>
              Showing job matches for{' '}
              <span className={`${discoverMedium} text-[#1D3E35]`}>&quot;{activeSearchLabel}&quot;</span>
            </p>
            <button
              type="button"
              onClick={() => {
                onClearSearch?.();
                triggerAlert('Search cleared.');
              }}
              className={`${discoverMedium} cursor-pointer text-sm text-[#45a874] transition-opacity hover:opacity-80`}
            >
              Clear search
            </button>
          </div>
        ) : null}

        {loadingJobs ? (
          <MarketplaceJobGridSkeleton count={8} className="mt-2" />
        ) : paginatedJobsList.length === 0 ? (
          <div className="mt-2 w-full rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-20 text-center">
            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-neutral-300" />
            <span className={`${discoverHeadline} mb-1 block text-lg text-[#193e32]`}>
              No matching listings
            </span>
            <p className={`${discoverBody} mx-auto mb-6 max-w-sm text-xs text-neutral-500`}>
              {hasActiveSearch
                ? 'No jobs match your search. Try different keywords or clear the search.'
                : 'There are no available opportunities matching your category and level filters.'}
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className={`${discoverMedium} inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#193e32] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-neutral-800`}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {paginatedJobsList.map((job) => {
                const slug = resolveListingSlug(job.slug, job.id);
                const isStarred = savedSlugs.has(slug);
                const employerHref = resolveEmployerProfileHref({
                  employerSlug: job.employerSlug,
                  companyName: job.companyName,
                  allowDemoLookup: true,
                });
                const employerAvatar = (
                  <div className="relative shrink-0">
                    <EmployerAvatarCircle
                      name={job.employerLogoText || job.companyName}
                      avatarUrl={job.ownerAvatarUrl}
                      avatarBg={job.companyLogoBg}
                      verified={job.verified}
                      sizeClass="h-[54px] w-[54px]"
                      useDemoIcon={!job.slug}
                      iconType={job.companyIconType}
                      renderIcon={(type, className) => (
                        <JobCompanyLogo type={type} className={className} />
                      )}
                    />
                  </div>
                );
                const employerHeader = (
                  <>
                    {employerAvatar}
                    <span className="ml-3.5 min-w-0 truncate text-sm font-medium text-[#45a874] hover:underline sm:text-[14px]">
                      {job.companyName}
                    </span>
                  </>
                );
                return (
                  <motion.div
                    layout
                    key={job.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div
                      role="link"
                      tabIndex={0}
                      onClick={() => router.push(getJobDetailPath(job))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          router.push(getJobDetailPath(job));
                        }
                      }}
                      className="group relative flex min-h-[260px] cursor-pointer flex-col justify-between rounded-xl border border-neutral-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-neutral-200 hover:shadow-md sm:min-h-[300px] sm:p-7"
                    >
                    <div>
                      <div className="flex items-center justify-between">
                        {employerHref ? (
                          <Link
                            href={employerHref}
                            className="flex items-center transition-opacity hover:opacity-80"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {employerHeader}
                          </Link>
                        ) : (
                          <div className="flex items-center">{employerHeader}</div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => void toggleStar(job, e)}
                          className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border transition-all duration-300 ${
                            isStarred
                              ? 'border-amber-300 bg-amber-50 text-amber-500 shadow-sm'
                              : 'border-[#45a874]/20 bg-white text-[#45a874] hover:bg-[#45a874]/5'
                          }`}
                          title={isStarred ? 'Starred bookmark' : 'Add bookmark'}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className={`h-3.5 w-3.5 ${isStarred ? 'fill-amber-500 text-amber-500' : 'text-[#45a874]'}`}
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        </button>
                      </div>
                      <h3 className={`${discoverBody} mb-4 mt-5 line-clamp-2 text-base font-normal leading-[1.35] tracking-tight text-black transition-colors group-hover:text-[#45a874] sm:mb-4.5 sm:mt-6 sm:text-[18px]`}>
                        {job.title}
                      </h3>
                      <div className={`${discoverBody} mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-normal text-black sm:mb-6 sm:flex-nowrap sm:gap-x-0 sm:text-[13px]`}>
                        <span>
                          {job.budgetLabel} {job.type}
                        </span>
                        <span className="hidden text-neutral-300 sm:inline">|</span>
                        <span>{job.duration}</span>
                      </div>
                    </div>
                    <div className={`${discoverBody} mt-auto flex flex-wrap select-none items-center gap-x-2 gap-y-1 text-xs font-normal text-black sm:flex-nowrap sm:gap-x-0 sm:text-[13px]`}>
                      <div className="mr-2 hidden h-3.5 w-px bg-black sm:block" />
                      <span>{job.expenseLevel}</span>
                      <span className="text-neutral-300">|</span>
                      <span>{locationLabel(job.location)}</span>
                    </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {!loadingJobs && paginatedJobsList.length > 0 && (
          <div className="mt-12 flex flex-col items-center justify-center pb-4 sm:mt-16">
            <div className="flex w-full max-w-full items-center justify-center gap-2 overflow-x-auto px-1 pb-1 sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-200 text-neutral-700 transition-colors hover:border-gray-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30 sm:h-10 sm:w-10"
                title="Previous Page"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </button>
              <div className="flex shrink-0 items-center gap-1 sm:gap-2">{renderPageNumbers()}</div>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-200 text-neutral-700 transition-colors hover:border-gray-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30 sm:h-10 sm:w-10"
                title="Next Page"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className={`${discoverBody} mt-4 text-center text-[13px] font-normal tracking-wide text-zinc-500 sm:mt-4.5 sm:text-[14.5px]`}>
              {startIdx} – {endIdx} of {totalJobs === 320 ? '300+' : totalJobs} jobs available
            </div>
          </div>
        )}
      </div>

    </section>
  );
}

function FilterDropdown({
  label,
  active,
  open,
  onToggle,
  options,
  selected,
  onSelect,
}: {
  id: string;
  label: string;
  active: boolean;
  open: boolean;
  onToggle: () => void;
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`${discoverMedium} flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border bg-white px-3 py-2 text-sm shadow-sm transition-all hover:bg-neutral-50 sm:gap-2 sm:px-4.5 sm:py-2.5 sm:text-[14px] ${
          active ? 'border-brand-emerald font-semibold text-brand-emerald' : 'border-neutral-200 text-neutral-600'
        }`}
      >
        <span>{label}</span>
        <ChevronDown className="h-4 w-4 text-black" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 3 }}
            className="absolute left-0 z-30 mt-1.5 w-56 rounded-lg border border-gray-200/90 bg-white py-1.5 shadow-lg"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onSelect(opt.value)}
                className={`${discoverMedium} flex w-full cursor-pointer items-center justify-between px-3.5 py-2 text-left text-xs transition-colors hover:bg-neutral-50 ${
                  selected === opt.value ? 'font-semibold text-emerald-600' : 'text-neutral-700'
                }`}
              >
                <span>{opt.label}</span>
                {selected === opt.value && <Check className="h-3.5 w-3.5 text-emerald-600" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
