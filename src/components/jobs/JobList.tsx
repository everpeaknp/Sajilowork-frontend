'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Sparkles,
  Send,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import { discoverBody, discoverHeadline, discoverMedium } from '@/components/LangingHome/landingTypography';
import { type Job, generateMockJobs } from './jobListData';

const CustomLogo: React.FC<{
  type: Job['companyIconType'];
  className?: string;
}> = ({ type, className = 'h-6 w-6 text-white' }) => {
  if (type === 'wave') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M2 10s3-3 5-3 5 3 7 3 5-3 7-3M2 17s3-3 5-3 5 3 7 3 5-3 7-3" />
      </svg>
    );
  }
  if (type === 'face') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="8" cy="9" r="1.5" fill="currentColor" />
        <circle cx="16" cy="9" r="1.5" fill="currentColor" />
        <path d="M8.5 14.5c1.5 2 4.5 2 6 0" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'in') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22v-3M9 19c-1.5 0-3-1.5-3-3s1.5-3 3-3 3 1.5 3 3-1.5 3-3 3zM15 19c1.5 0 3-1.5 3-3s-1.5-3-3-3-3 1.5-3 3 1.5 3 3 3zM12 2v3M9 5C7.5 5 6 6.5 6 8s1.5 3 3 3 3-1.5 3-3-1.5-3-3-3zM15 5c1.5 0 3 1.5 3 3s-1.5 3-3 3-3-1.5-3-3 1.5-3 3-3z" />
    </svg>
  );
};

const INITIAL_JOBS = generateMockJobs();

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
}

export default function JobList({ className = '' }: JobListProps) {
  const [jobs] = useState<Job[]>(INITIAL_JOBS);
  const [starredIds, setStarredIds] = useState<Record<string, boolean>>({ 'job-1': true });
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSalary, setSelectedSalary] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [sortBy, setSortBy] = useState('best-seller');
  const [currentPage, setCurrentPage] = useState(1);
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [customCoverLetter, setCustomCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [alertText, setAlertText] = useState<string | null>(null);
  const filterRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedSalary, selectedType, selectedLevel, sortBy]);

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

  const toggleStar = (jobId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setStarredIds((prev) => {
      const updated = { ...prev, [jobId]: !prev[jobId] };
      triggerAlert(
        updated[jobId] ? 'Added to your visual bookmarks list.' : 'Removed from visual bookmarks.'
      );
      return updated;
    });
  };

  const filteredJobsList = useMemo(() => {
    let result = [...jobs];

    if (selectedCategory !== 'All') {
      result = result.filter((j) => j.category === selectedCategory);
    }
    if (selectedSalary !== 'All') {
      if (selectedSalary === '0-50k') result = result.filter((j) => j.budgetMax < 50000);
      else if (selectedSalary === '50k-100k')
        result = result.filter((j) => j.budgetMax >= 50000 && j.budgetMax <= 100000);
      else if (selectedSalary === '100k-150k')
        result = result.filter((j) => j.budgetMax > 100000 && j.budgetMax <= 150000);
      else if (selectedSalary === '150k+') result = result.filter((j) => j.budgetMin >= 150000);
    }
    if (selectedType !== 'All') {
      result = result.filter((j) => j.type === selectedType);
    }
    if (selectedLevel !== 'All') {
      result = result.filter((j) => j.experienceLevel === selectedLevel);
    }

    if (sortBy === 'budget-high') {
      result.sort((a, b) => b.budgetMax - a.budgetMax);
    } else if (sortBy === 'duration-low') {
      result.sort((a, b) => a.duration.localeCompare(b.duration));
    } else {
      result.sort((a, b) => a.id.localeCompare(b.id));
    }

    return result;
  }, [jobs, selectedCategory, selectedSalary, selectedType, selectedLevel, sortBy]);

  const itemsPerPage = 16;
  const totalJobs = filteredJobsList.length;
  const totalPages = Math.max(1, Math.ceil(totalJobs / itemsPerPage));
  const startIdx = totalJobs === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalJobs);

  const paginatedJobsList = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredJobsList.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredJobsList, currentPage]);

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedSalary !== 'All' ||
    selectedType !== 'All' ||
    selectedLevel !== 'All';

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedSalary('All');
    setSelectedType('All');
    setSelectedLevel('All');
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
          className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[15px] font-medium transition-all ${
            isCurrent ? 'bg-[#45a874] font-medium text-white' : 'text-neutral-700 hover:bg-neutral-50'
          }`}
        >
          {p}
        </button>
      );
    });
  };

  const handleApplyFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || !candidateEmail.trim()) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      const title = applyingJob?.title;
      setApplyingJob(null);
      setCandidateName('');
      setCandidateEmail('');
      setCustomCoverLetter('');
      triggerAlert(`Successfully submitted application proposal for ${title}!`);
    }, 1200);
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
              className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-2xl border border-[#45a874]/20 bg-[#193e32] px-6 py-4 text-white shadow-xl"
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

        {filteredJobsList.length === 0 ? (
          <div className="mt-2 w-full rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-20 text-center">
            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-neutral-300" />
            <span className={`${discoverHeadline} mb-1 block text-lg text-[#193e32]`}>
              No matching listings
            </span>
            <p className={`${discoverBody} mx-auto mb-6 max-w-sm text-xs text-neutral-500`}>
              There are no available opportunities matching your category and level filters.
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
                const isStarred = !!starredIds[job.id];
                return (
                  <motion.div
                    layout
                    key={job.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="group relative flex min-h-[300px] cursor-pointer flex-col justify-between rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:border-gray-300 hover:shadow-[0_12px_28px_rgba(0,0,0,0.02)]"
                    onClick={() => setApplyingJob(job)}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className={`flex h-[54px] w-[54px] items-center justify-center rounded-full text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.12)] ${job.companyLogoBg}`}
                          >
                            <CustomLogo type={job.companyIconType} />
                          </div>
                          <span className="ml-3.5 text-[14px] font-medium text-[#45a874] hover:underline">
                            {job.companyName}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => toggleStar(job.id, e)}
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
                      <h3
                        className={`${discoverBody} mb-4.5 mt-6 text-[18px] font-normal leading-[1.35] tracking-tight text-black transition-colors group-hover:text-[#45a874]`}
                      >
                        {job.title}
                      </h3>
                      <div className={`${discoverBody} mb-6 flex items-center text-[13px] font-normal text-black`}>
                        <span>
                          {job.budgetLabel} {job.type}
                        </span>
                        <span className="mx-2 text-neutral-300">|</span>
                        <span>{job.duration}</span>
                      </div>
                    </div>
                    <div className={`${discoverBody} mt-auto flex select-none items-center text-[13px] font-normal text-black`}>
                      <div className="mr-2 h-3.5 w-px bg-black" />
                      <span>{job.expenseLevel}</span>
                      <span className="mx-2 text-neutral-300">|</span>
                      <span>{locationLabel(job.location)}</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {filteredJobsList.length > 0 && (
          <div className="mt-16 flex flex-col items-center justify-center pb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-200 text-neutral-700 transition-colors hover:border-gray-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
                title="Previous Page"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </button>
              <div className="flex items-center gap-2">{renderPageNumbers()}</div>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-200 text-neutral-700 transition-colors hover:border-gray-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
                title="Next Page"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className={`${discoverBody} mt-4.5 text-[14.5px] font-normal tracking-wide text-zinc-500`}>
              {startIdx} – {endIdx} of {totalJobs === 320 ? '300+' : totalJobs} jobs available
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {applyingJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#193e32]/20 p-4 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 15 }}
              className="w-full max-w-xl overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-[#193e32] p-6 text-white">
                <button
                  type="button"
                  onClick={() => setApplyingJob(null)}
                  className="absolute right-5 top-5 cursor-pointer rounded-full bg-white/10 p-1.5 text-white/75 transition-all hover:bg-white/15 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="mb-2.5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                    <CustomLogo type={applyingJob.companyIconType} className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className={`${discoverMedium} block text-xs font-bold text-[#45a874]`}>
                      Active Contract Role
                    </span>
                    <span className={`${discoverBody} block text-xs text-white/80`}>
                      Posted by {applyingJob.companyName} • {locationLabel(applyingJob.location)}
                    </span>
                  </div>
                </div>
                <h3 className={`${discoverHeadline} mb-2 text-lg font-bold tracking-tight sm:text-xl`}>
                  {applyingJob.title}
                </h3>
                <div className={`${discoverMedium} mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-white/80`}>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5 text-[#45a874]" />
                    {applyingJob.type}
                  </span>
                  <span>•</span>
                  <span>{applyingJob.experienceLevel}</span>
                  <span>•</span>
                  <span>{applyingJob.budgetLabel} Value</span>
                </div>
              </div>

              <form onSubmit={handleApplyFormSubmit} className="max-h-[60vh] space-y-4 overflow-y-auto p-6">
                <div className="rounded-xl border border-gray-150 bg-neutral-50 p-4">
                  <span className={`${discoverMedium} mb-1.5 block text-xs font-bold text-[#193e32]`}>
                    Core Specifications
                  </span>
                  <p className={`${discoverBody} mb-3 text-xs leading-relaxed text-neutral-600`}>
                    {applyingJob.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {applyingJob.skills.map((skill) => (
                      <span
                        key={skill}
                        className={`${discoverMedium} rounded-md border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-neutral-600`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <span className={`${discoverMedium} mt-2 block border-b border-gray-100 pb-1 text-xs font-black uppercase tracking-wider text-neutral-400`}>
                  Submit Proposal
                </span>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={`${discoverMedium} mb-1 block text-xs font-bold text-gray-500`}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      placeholder="Jane Doe"
                      className={`${discoverBody} w-full rounded-lg border border-gray-200 bg-neutral-50/50 px-3 py-2 text-xs outline-none transition-all focus:border-[#45a874]`}
                    />
                  </div>
                  <div>
                    <label className={`${discoverMedium} mb-1 block text-xs font-bold text-gray-500`}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={candidateEmail}
                      onChange={(e) => setCandidateEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className={`${discoverBody} w-full rounded-lg border border-gray-200 bg-neutral-50/50 px-3 py-2 text-xs outline-none transition-all focus:border-[#45a874]`}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className={`${discoverMedium} text-xs font-bold text-gray-500`}>
                      Introduction / Cover Letter
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const skillsStr = applyingJob.skills.slice(0, 3).join(', ');
                        setCustomCoverLetter(
                          `Dear Team at ${applyingJob.companyName},\n\nI was immediately drawn to your opening for the ${applyingJob.title}. With structured expertise in ${skillsStr}, I specialize in completing high-fidelity visual assets, modern responsiveness frameworks, and clean modular development.\n\nI would love the opportunity to discuss potential solutions with your team. Let me know best times to connect!`
                        );
                        triggerAlert('Injected tailored introduction!');
                      }}
                      className={`${discoverMedium} flex cursor-pointer select-none items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#45a874] hover:underline`}
                    >
                      <Sparkles className="h-3 w-3" />
                      Auto-tailor Letter
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={customCoverLetter}
                    onChange={(e) => setCustomCoverLetter(e.target.value)}
                    placeholder="Describe your credentials, previous experience, and proposed workflow strategies here..."
                    className={`${discoverBody} w-full resize-none rounded-lg border border-gray-200 bg-neutral-50/50 px-3 py-2 text-xs outline-none transition-all focus:border-[#45a874]`}
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setApplyingJob(null)}
                    className={`${discoverMedium} flex-1 cursor-pointer rounded-lg border border-gray-200 bg-white py-2.5 text-center text-xs font-bold text-neutral-600 transition-all hover:border-black hover:text-black`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`${discoverMedium} flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#193e32] py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#45a874] disabled:opacity-50`}
                  >
                    {submitting ? (
                      <span className="animate-pulse">Uploading Proposal...</span>
                    ) : (
                      <>
                        <Send className="h-3 w-3" />
                        Submit Proposal
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
