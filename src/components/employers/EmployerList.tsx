'use client';

import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Star, ChevronLeft, ChevronRight, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { discoverBody, discoverHeadline, discoverMedium } from '@/components/LangingHome/landingTypography';
import {
  DEFAULT_EMPLOYERS,
  EMPLOYER_INDUSTRIES,
  EMPLOYER_TEAM_SIZES,
  ITEMS_PER_PAGE,
  type Employer,
} from './employerData';
import { GreenSparkSparkle, renderCompanyLogo } from './employerLogos';
import { getEmployerProfilePath } from './employerSlug';

interface EmployerListProps {
  searchQuery: string;
  searchNonce: number;
  onNotify: (message: string) => void;
  onClearSearch?: () => void;
}

const FILTER_CATEGORIES = [
  { value: 'All', label: 'All Categories' },
  ...EMPLOYER_INDUSTRIES.filter((i) => i !== 'Category').map((i) => ({ value: i, label: i })),
];

const FILTER_TEAM_SIZES = [
  { value: 'All', label: 'All Sizes' },
  ...EMPLOYER_TEAM_SIZES.filter((s) => s !== 'No of Employees').map((s) => ({ value: s, label: s })),
];

const SORT_OPTIONS = [
  { value: 'best-seller', label: 'Best Seller' },
  { value: 'review-count', label: 'Review Count' },
  { value: 'open-jobs', label: 'Open Jobs' },
];

const INITIAL_STARRED = DEFAULT_EMPLOYERS.reduce<Record<string, boolean>>((acc, emp) => {
  if (emp.isSaved) acc[emp.id] = true;
  return acc;
}, {});

export default function EmployerList({ searchQuery, searchNonce, onNotify, onClearSearch }: EmployerListProps) {
  const router = useRouter();
  const [employers] = useState<Employer[]>(DEFAULT_EMPLOYERS);
  const [starredIds, setStarredIds] = useState<Record<string, boolean>>(INITIAL_STARRED);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTeamSize, setSelectedTeamSize] = useState('All');
  const [sortBy, setSortBy] = useState('best-seller');
  const [currentPage, setCurrentPage] = useState(1);
  const filterRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchNonce, selectedCategory, selectedTeamSize, sortBy, searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: globalThis.MouseEvent) {
      if (filterRowRef.current && !filterRowRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDropdownToggle = (dropdownId: string) => {
    setOpenDropdown((prev) => (prev === dropdownId ? null : dropdownId));
  };

  const toggleStar = (employerId: string, event: MouseEvent) => {
    event.stopPropagation();
    setStarredIds((prev) => {
      const updated = { ...prev, [employerId]: !prev[employerId] };
      onNotify(updated[employerId] ? 'Employer saved to your list.' : 'Employer removed from saved list.');
      return updated;
    });
  };

  const filteredEmployers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    let result = employers.filter((emp) => {
      const matchesSearch =
        !query ||
        emp.name.toLowerCase().includes(query) ||
        emp.tagline.toLowerCase().includes(query) ||
        emp.industry.toLowerCase().includes(query) ||
        emp.description.toLowerCase().includes(query) ||
        emp.location.toLowerCase().includes(query);

      const matchesCategory = selectedCategory === 'All' || emp.industry === selectedCategory;
      const matchesTeamSize = selectedTeamSize === 'All' || emp.teamSize === selectedTeamSize;

      return matchesSearch && matchesCategory && matchesTeamSize;
    });

    if (sortBy === 'review-count') {
      result = [...result].sort((a, b) => b.reviewCount - a.reviewCount);
    } else if (sortBy === 'open-jobs') {
      result = [...result].sort((a, b) => b.openJobs - a.openJobs);
    } else {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [employers, searchQuery, selectedCategory, selectedTeamSize, sortBy]);

  const totalItems = filteredEmployers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const startIdx = totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIdx = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  const paginatedEmployers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEmployers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredEmployers, currentPage]);

  const hasActiveFilters =
    selectedCategory !== 'All' || selectedTeamSize !== 'All' || Boolean(searchQuery);

  const resetFilters = () => {
    onClearSearch?.();
    setSelectedCategory('All');
    setSelectedTeamSize('All');
    setSortBy('best-seller');
    onNotify('Filters cleared.');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.getElementById('employer-page-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
          onClick={() => handlePageChange(p as number)}
          className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[15px] font-medium transition-all ${
            isCurrent ? 'bg-[#45a874] font-medium text-white' : 'text-neutral-700 hover:bg-neutral-50'
          }`}
        >
          {p}
        </button>
      );
    });
  };

  const handleCardClick = (emp: Employer) => {
    router.push(getEmployerProfilePath(emp));
  };

  return (
    <section className="w-full select-none border-b border-gray-100 bg-white px-4 pb-12 pt-0 sm:px-6 sm:pt-2 md:px-8 lg:px-12">
      <div className="w-full max-w-none">
        <div
          ref={filterRowRef}
          className="mb-8 flex flex-col justify-between gap-5 pb-4 md:flex-row md:items-center"
        >
          <div className="flex flex-wrap items-center gap-2">
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
              id="team-size"
              label="Team Size"
              active={selectedTeamSize !== 'All'}
              open={openDropdown === 'team-size'}
              onToggle={() => handleDropdownToggle('team-size')}
              options={FILTER_TEAM_SIZES}
              selected={selectedTeamSize}
              onSelect={(v) => {
                setSelectedTeamSize(v);
                setOpenDropdown(null);
              }}
            />
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className={`${discoverMedium} ml-2 block cursor-pointer py-2 text-xs font-bold text-neutral-400 transition-colors hover:text-black`}
              >
                Reset
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-1.5 self-end md:self-auto">
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
                {openDropdown === 'sort' ? (
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
                        {sortBy === opt.value ? <Check className="h-3.5 w-3.5 text-[#45a874]" /> : null}
                      </button>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {filteredEmployers.length === 0 ? (
          <div className="mt-2 w-full rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-20 text-center">
            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-neutral-300" />
            <span className={`${discoverHeadline} mb-1 block text-lg text-[#193e32]`}>No matching employers</span>
            <p className={`${discoverBody} mx-auto mb-6 max-w-sm text-xs text-neutral-500`}>
              There are no companies matching your category, team size, or search filters.
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
              {paginatedEmployers.map((emp) => {
                const isStarred = !!starredIds[emp.id];
                return (
                  <motion.div
                    layout
                    key={emp.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleCardClick(emp)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleCardClick(emp);
                    }}
                    className="group relative flex min-h-[200px] cursor-pointer flex-col rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-gray-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full">
                          {renderCompanyLogo(emp.logoColor, emp.name)}
                        </div>
                        <span className={`${discoverMedium} truncate text-[15px] font-semibold text-neutral-900`}>
                          {emp.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => toggleStar(emp.id, e)}
                        className={`shrink-0 cursor-pointer rounded-full p-1 transition-opacity hover:opacity-80 ${
                          isStarred ? 'opacity-100' : 'opacity-90'
                        }`}
                        title={isStarred ? 'Saved' : 'Save employer'}
                        aria-pressed={isStarred}
                      >
                        <GreenSparkSparkle />
                      </button>
                    </div>

                    <div className={`${discoverBody} mt-6 flex items-center gap-1.5 text-[14px]`}>
                      <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
                      <span className="font-medium text-neutral-900">{emp.rating.toFixed(1)}</span>
                      <span className="text-neutral-400">({emp.reviewCount} reviews)</span>
                    </div>

                    <div className={`${discoverBody} mt-5 flex items-center text-[14px] text-neutral-500`}>
                      <span>{emp.location}</span>
                      <span className="mx-3 h-3.5 w-px bg-neutral-300" aria-hidden />
                      <span className="font-medium text-[#2563eb]">Open {emp.openJobs} Jobs</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {filteredEmployers.length > 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center pb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-200 text-neutral-700 transition-colors hover:border-gray-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
                title="Previous Page"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </button>
              <div className="flex items-center gap-2">{renderPageNumbers()}</div>
              <button
                type="button"
                onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-200 text-neutral-700 transition-colors hover:border-gray-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
                title="Next Page"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className={`${discoverBody} mt-4.5 text-[14.5px] font-normal tracking-wide text-zinc-500`}>
              {startIdx} – {endIdx} of {totalItems} employers available
            </div>
          </div>
        ) : null}
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
        className={`${discoverMedium} flex cursor-pointer items-center gap-2 rounded-lg border bg-white px-4.5 py-2.5 text-[14.5px] transition-all hover:bg-neutral-50 ${
          active ? 'border-black font-bold text-black' : 'border-black/30 text-black'
        }`}
      >
        <span>{label}</span>
        <ChevronDown className="h-4 w-4 text-black" />
      </button>
      <AnimatePresence>
        {open ? (
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
                {selected === opt.value ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : null}
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
