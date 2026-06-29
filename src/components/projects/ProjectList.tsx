'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  MapPin,
  FileText,
  ArrowUpRight,
  Calendar,
} from 'lucide-react';
import { discoverBody, discoverHeadline, discoverMedium } from '@/components/LangingHome/landingTypography';
import {
  type Project,
  formatProjectLocation,
  locationDisplay,
} from './projectListData';
import { searchBrowseProjects } from '@/lib/listingSearchApi';
import { resolveEmployerProfileHref } from '@/components/employers/employerSlug';
import EmployerAvatarCircle from '@/components/employers/EmployerAvatarCircle';
import { getProjectDetailPath } from './projectSlug';
import { MarketplaceBrowseRowListSkeleton } from '@/components/common/MarketplaceBrowseSkeletons';

const CustomLogo: React.FC<{
  type: Project['companyIconType'];
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

function formatProjectListDate(project: Project): string {
  if (project.slug?.trim() && project.postedDate?.trim()) {
    return project.postedDate;
  }
  const jobNum = parseInt(project.id.replace('job-', ''), 10);
  if (project.id === 'job-1') return '2 hours ago';
  if (!Number.isNaN(jobNum)) return `${(jobNum % 3) + 2} hours ago`;
  return 'Recently posted';
}

function formatProposalsLabel(project: Project): string {
  if (project.slug?.trim()) {
    const count = project.ownerReviews ?? 0;
    if (count === 0) return 'None received';
    if (count === 1) return '1 Received';
    return `${count} Received`;
  }
  if (project.id === 'job-1' || project.id === 'job-2') return '1 Received';
  return 'None sent';
}

const FILTER_CATEGORIES = [
  { value: 'All', label: 'All Categories' },
  { value: 'Design & Creative', label: 'Design & Creative' },
  { value: 'Development & IT', label: 'Development & IT' },
  { value: 'Writing & Translation', label: 'Writing & Translation' },
  { value: 'Digital Marketing', label: 'Digital Marketing' },
  { value: 'Video & Animation', label: 'Video & Animation' },
  { value: 'Finance & Accounting', label: 'Finance & Accounting' },
];

const FILTER_TYPES = [
  { value: 'All', label: 'All Project Types' },
  { value: 'Hourly', label: 'Hourly' },
  { value: 'Fixed Price', label: 'Fixed Price' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Full Time', label: 'Full Time' },
];

const FILTER_SALARIES = [
  { value: 'All', label: 'All Rates' },
  { value: '0-1500', label: 'Under Rs. 1,500 / hr' },
  { value: '1500-2500', label: 'Rs. 1,500 – 2,500 / hr' },
  { value: '2500-4000', label: 'Rs. 2,500 – 4,000 / hr' },
  { value: '4000+', label: 'Rs. 4,000+ / hr' },
];

const POPULAR_SKILLS = [
  { value: 'All', label: 'All Skills' },
  { value: 'Figma', label: 'Figma' },
  { value: 'Sketch', label: 'Sketch' },
  { value: 'HTML5', label: 'HTML5' },
  { value: 'Swift', label: 'Swift' },
  { value: 'Webflow', label: 'Webflow' },
];

const FILTER_LOCATIONS = [
  { value: 'All', label: 'All Locations' },
  { value: 'Remote', label: 'Remote' },
  { value: 'Hybrid', label: 'Hybrid' },
  { value: 'In-office', label: 'In-office' },
];

const FILTER_LANGUAGES = [
  { value: 'All', label: 'All Languages' },
  { value: 'English', label: 'English' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Nepali', label: 'Nepali' },
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
  { value: 'duration-low', label: 'Urgent Jobs' },
];

interface ProjectListProps {
  searchQuery?: string;
  searchLocation?: string;
  onClearSearch?: () => void;
  initialProjects?: Project[];
  initialTotal?: number;
}

export default function ProjectList({
  searchQuery = '',
  searchLocation = '',
  onClearSearch,
  initialProjects,
  initialTotal = 0,
}: ProjectListProps) {
  const hasInitialData = Boolean(initialProjects?.length);
  const [projects, setProjects] = useState<Project[]>(initialProjects ?? []);
  const [loadingProjects, setLoadingProjects] = useState(!hasInitialData);
  const [totalProjects, setTotalProjects] = useState(initialTotal);
  const itemsPerPage = 8;

  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    category: false,
    type: false,
    price: false,
    skills: false,
    location: false,
    language: false,
    english: false,
  });

  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSalary, setSelectedSalary] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [sortBy, setSortBy] = useState('best-seller');
  const [currentPage, setCurrentPage] = useState(1);
  const [alertText, setAlertText] = useState<string | null>(null);

  const sortMenuRef = useRef<HTMLDivElement>(null);
  const skipInitialFetchRef = useRef(hasInitialData);

  const isDefaultBrowse =
    !searchQuery.trim() &&
    !searchLocation.trim() &&
    selectedCategory === 'All' &&
    selectedSalary === 'All' &&
    selectedType === 'All' &&
    selectedLevel === 'All' &&
    selectedLocation === 'All' &&
    selectedLanguage === 'All' &&
    selectedSkill === 'All' &&
    sortBy === 'best-seller' &&
    currentPage === 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategory,
    selectedSalary,
    selectedType,
    selectedLevel,
    selectedLocation,
    selectedLanguage,
    selectedSkill,
    sortBy,
    searchQuery,
    searchLocation,
  ]);

  useEffect(() => {
    if (skipInitialFetchRef.current && isDefaultBrowse) {
      skipInitialFetchRef.current = false;
      return;
    }

    let cancelled = false;
    setLoadingProjects(true);

    const categoryQuery = selectedCategory !== 'All' ? selectedCategory : '';
    const skillQuery = selectedSkill !== 'All' ? selectedSkill : '';
    const queryParts = [searchQuery.trim(), categoryQuery, skillQuery].filter(Boolean);

    void searchBrowseProjects({
      query: queryParts.join(' ').trim() || undefined,
      location: searchLocation.trim() || undefined,
      page: currentPage,
      page_size: itemsPerPage,
      sort_by: sortBy === 'budget-high' ? 'budget_high' : 'newest',
    })
      .then((result) => {
        if (cancelled) return;
        let items = result.items;
        if (selectedType !== 'All') {
          items = items.filter((p) => p.type === selectedType);
        }
        if (selectedLevel !== 'All') {
          items = items.filter((p) => p.experienceLevel === selectedLevel);
        }
        if (selectedLocation !== 'All') {
          items = items.filter((p) => p.location === selectedLocation);
        }
        setProjects(items);
        setTotalProjects(result.total);
      })
      .catch(() => {
        if (!cancelled) {
          setProjects([]);
          setTotalProjects(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingProjects(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    searchQuery,
    searchLocation,
    selectedCategory,
    selectedType,
    selectedLevel,
    selectedLocation,
    selectedSkill,
    sortBy,
    currentPage,
    isDefaultBrowse,
    initialProjects,
  ]);

  const totalPages = Math.max(1, Math.ceil(totalProjects / itemsPerPage));
  const startIdx = totalProjects === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalProjects);

  const paginatedProjectsList = projects;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerAlert = (text: string) => {
    setAlertText(text);
    setTimeout(() => setAlertText(null), 3500);
  };

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
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
          <span
            key={`dots-${idx}`}
            className={`${discoverBody} select-none px-2 text-sm text-neutral-400`}
          >
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
          className={`${discoverMedium} flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[14.5px] transition-all ${
            isCurrent
              ? 'bg-[#52C47F] font-semibold text-white'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          {p}
        </button>
      );
    });
  };

  const hasActiveSearch = Boolean(searchQuery.trim() || searchLocation.trim());
  const activeSearchLabel =
    searchQuery.trim() && searchLocation.trim()
      ? `${searchQuery.trim()} (${searchLocation.trim()})`
      : searchQuery.trim() || searchLocation.trim();

  const resetAllFilters = () => {
    setSelectedCategory('All');
    setSelectedSalary('All');
    setSelectedType('All');
    setSelectedLevel('All');
    setSelectedLocation('All');
    setSelectedLanguage('All');
    setSelectedSkill('All');
    onClearSearch?.();
    triggerAlert('All filters have been reset.');
  };

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedSalary !== 'All' ||
    selectedType !== 'All' ||
    selectedLevel !== 'All' ||
    selectedLocation !== 'All' ||
    selectedLanguage !== 'All' ||
    selectedSkill !== 'All' ||
    hasActiveSearch;

  const renderRadioFilter = (
    items: { value: string; label: string }[],
    selected: string,
    onSelect: (value: string) => void,
    square = false
  ) => (
    <div className="space-y-3 pb-4 pl-1 pt-2">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onSelect(item.value)}
          className={`${discoverBody} flex w-full cursor-pointer items-center py-2 text-left text-[15px] text-neutral-600 transition-all hover:text-black`}
        >
          <span
            className={`mr-3 flex h-4.5 w-4.5 shrink-0 items-center justify-center border transition-all ${
              square ? 'rounded-[4px]' : 'rounded-full'
            } ${selected === item.value ? 'border-[#52C47F] bg-[#eefaf2]' : 'border-neutral-300 bg-white'}`}
          >
            {selected === item.value &&
              (square ? (
                <Check className="h-3 w-3 stroke-[3] text-[#52C47F]" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-[#52C47F]" />
              ))}
          </span>
          <span className={selected === item.value ? 'font-semibold text-neutral-900' : 'text-neutral-600'}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );

  const accordionSections = [
    { key: 'category', label: 'Category', content: renderRadioFilter(FILTER_CATEGORIES, selectedCategory, setSelectedCategory) },
    { key: 'type', label: 'Project type', content: renderRadioFilter(FILTER_TYPES, selectedType, setSelectedType, true) },
    { key: 'price', label: 'Price', content: renderRadioFilter(FILTER_SALARIES, selectedSalary, setSelectedSalary) },
    {
      key: 'skills',
      label: 'Skills',
      content: (
        <div className="flex flex-wrap gap-2 pb-4 pt-2">
          {POPULAR_SKILLS.map((skill) => (
            <button
              key={skill.value}
              type="button"
              onClick={() => setSelectedSkill(skill.value)}
              className={`${discoverMedium} cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-all ${
                selectedSkill === skill.value
                  ? 'border-[#fff1ec] bg-[#fff1ec] font-semibold text-[#d48c71]'
                  : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300'
              }`}
            >
              {skill.label}
            </button>
          ))}
        </div>
      ),
    },
    { key: 'location', label: 'Location', content: renderRadioFilter(FILTER_LOCATIONS, selectedLocation, setSelectedLocation) },
    { key: 'language', label: 'Language', content: renderRadioFilter(FILTER_LANGUAGES, selectedLanguage, setSelectedLanguage) },
    { key: 'english', label: 'English Level', content: renderRadioFilter(FILTER_LEVELS, selectedLevel, setSelectedLevel) },
  ];

  return (
    <section
      id="custom-project-board-grid"
      className="w-full select-none border-b border-gray-100 bg-white px-4 pb-12 pt-0 sm:px-6 sm:pt-2 md:px-8 lg:px-12"
    >
      <div className="mx-auto w-full max-w-none">
        <AnimatePresence>
          {alertText && (
            <motion.div
              className="fixed bottom-20 left-4 right-4 z-50 flex items-center gap-3 rounded-xl border border-[#52C47F]/25 bg-[#1D3E35] px-5 py-3.5 text-white shadow-xl sm:bottom-8 sm:left-auto sm:right-8 sm:w-auto sm:px-6"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#52C47F]/20 text-white">
                <Check className="h-3.5 w-3.5 text-[#52C47F]" strokeWidth={3} />
              </div>
              <p className={`${discoverMedium} text-[13.5px] tracking-wide`}>{alertText}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-4">
          <div className="rounded-[16px] bg-white px-5 pb-5 pt-0 lg:col-span-1">
            {hasActiveFilters && (
              <div className="mb-2 flex min-h-[40px] items-center justify-end border-b border-neutral-100 pb-2">
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className={`${discoverMedium} cursor-pointer text-xs font-semibold text-[#52C47F] transition-colors hover:text-[#41a668]`}
                >
                  Clear All
                </button>
              </div>
            )}

            {accordionSections.map((section, index) => (
              <div
                key={section.key}
                className={`${index === 0 ? 'pt-0 pb-4' : 'border-b border-neutral-300 pb-5 pt-5'} ${index === accordionSections.length - 1 ? 'border-b-0 pb-0' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(section.key)}
                  className={`${discoverHeadline} flex min-h-[40px] w-full items-center justify-between py-1 text-[18px] font-semibold tracking-wide text-neutral-900 transition-colors hover:text-[#52C47F] ${index === 0 ? 'mb-0 border-b border-neutral-300 pb-4' : ''}`}
                >
                  <span>{section.label}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-neutral-400 transition-transform duration-250 ${
                      openAccordions[section.key] ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openAccordions[section.key] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      {section.content}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="space-y-5 lg:col-span-3">
            <div className="mb-5 flex min-h-[40px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className={`${discoverBody} text-sm font-medium text-neutral-800 sm:text-base`}>
                <span className={`${discoverMedium} font-bold text-neutral-900`}>{totalProjects}</span>{' '}
                projects available
              </p>

              <div className="relative flex items-center gap-1.5" ref={sortMenuRef}>
                <span className={`${discoverBody} select-none text-sm font-medium text-neutral-400`}>
                  Sort by
                </span>
                <button
                  type="button"
                  onClick={() => setSortDropdownOpen((prev) => !prev)}
                  className={`${discoverMedium} flex cursor-pointer items-center gap-1 bg-white text-sm font-semibold text-neutral-800 transition-all hover:text-black focus:outline-none`}
                >
                  <span>{SORT_OPTIONS.find((o) => o.value === sortBy)?.label}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
                </button>

                <AnimatePresence>
                  {sortDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 3 }}
                      className="absolute right-0 top-6 z-30 mt-1 w-44 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setSortBy(opt.value);
                            setSortDropdownOpen(false);
                          }}
                          className={`${discoverMedium} flex w-full items-center justify-between px-3.5 py-1.5 text-left text-xs transition-colors hover:bg-[#eefaf2]/50 ${
                            sortBy === opt.value
                              ? 'bg-[#eefaf2]/20 font-bold text-[#52C47F]'
                              : 'text-neutral-700'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {sortBy === opt.value && <Check className="h-3.5 w-3.5 text-[#52C47F]" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {hasActiveSearch ? (
              <div className="mb-4 flex flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50/80 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                <p className={`${discoverBody} text-sm text-neutral-600`}>
                  Showing project matches for{' '}
                  <span className={`${discoverMedium} text-[#1D3E35]`}>&quot;{activeSearchLabel}&quot;</span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClearSearch?.();
                    triggerAlert('Search cleared.');
                  }}
                  className={`${discoverMedium} cursor-pointer text-sm text-[#52C47F] transition-opacity hover:opacity-80`}
                >
                  Clear search
                </button>
              </div>
            ) : null}

            {loadingProjects ? (
              <MarketplaceBrowseRowListSkeleton count={4} />
            ) : paginatedProjectsList.length === 0 ? (
              <div className="w-full rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-16 text-center">
                <AlertCircle className="mx-auto mb-3 h-10 w-10 text-neutral-300" />
                <span className={`${discoverHeadline} mb-1 block text-lg font-bold text-[#1D3E35]`}>
                  No matching listings found
                </span>
                <p className={`${discoverBody} mx-auto mb-6 max-w-sm text-xs text-neutral-500`}>
                  {hasActiveSearch
                    ? 'No projects match your search. Try different keywords or clear the search.'
                    : 'There are no available opportunities matching your category and filtered specifications.'}
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className={`${discoverMedium} inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#52C47F] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#41a668]`}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {paginatedProjectsList.map((project) => {
                    const employerHref = resolveEmployerProfileHref({
                      employerSlug: project.employerSlug,
                      companyName: project.companyName,
                      allowDemoLookup: !project.slug,
                    });
                    const employerAvatar = (
                      <EmployerAvatarCircle
                        name={project.employerLogoText || project.companyName}
                        avatarUrl={project.ownerAvatarUrl}
                        avatarBg={project.companyLogoBg}
                        verified={project.verified}
                        useDemoIcon={!project.slug}
                        iconType={project.companyIconType}
                        renderIcon={(type, className) => (
                          <CustomLogo type={type} className={className} />
                        )}
                      />
                    );
                    return (
                      <motion.div
                        layout
                        key={project.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.25 }}
                      >
                        <Link
                          href={getProjectDetailPath(project)}
                          className="group relative box-border flex w-full shrink-0 cursor-pointer flex-col overflow-hidden rounded-xl border border-neutral-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-200 hover:shadow-md sm:p-6 lg:h-[248px] lg:min-h-[248px] lg:max-h-[248px] lg:w-full lg:flex-row lg:items-stretch"
                        >
                        <div className="flex min-h-0 min-w-0 flex-1 gap-3 overflow-hidden sm:gap-5">
                          {employerHref ? (
                            <Link
                              href={employerHref}
                              className="relative shrink-0 select-none transition-opacity hover:opacity-80"
                              onClick={(e) => e.stopPropagation()}
                              title={project.companyName}
                            >
                              {employerAvatar}
                            </Link>
                          ) : (
                            <div
                              className="relative shrink-0 select-none"
                              title={project.companyName}
                            >
                              {employerAvatar}
                            </div>
                          )}

                          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                            <div className="flex items-start justify-between gap-2">
                              <h3
                                className={`${discoverBody} block line-clamp-2 text-base !font-normal leading-snug text-black transition-colors group-hover:text-[#52C47F] sm:truncate sm:text-[18.5px]`}
                              >
                                {project.title}
                              </h3>
                            </div>

                            <div
                              className={`${discoverBody} mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-normal text-neutral-700 sm:gap-x-0 sm:text-[13px]`}
                            >
                              <span className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 stroke-[1.6] text-neutral-500" />
                                {formatProjectLocation(project)}
                              </span>
                              <span className="hidden select-none font-light text-neutral-300 sm:mx-3.5 sm:inline">|</span>
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4 stroke-[1.6] text-neutral-500" />
                                {formatProjectListDate(project)}
                              </span>
                              <span className="hidden select-none font-light text-neutral-300 sm:mx-3.5 sm:inline">|</span>
                              <span className="flex items-center gap-1.5">
                                <FileText className="h-4 w-4 stroke-[1.6] text-neutral-500" />
                                {formatProposalsLabel(project)}
                              </span>
                            </div>

                            <p
                              className={`${discoverBody} mb-3 mt-3 line-clamp-2 max-w-[620px] text-[13.5px] font-normal leading-relaxed text-black`}
                            >
                              {project.description}
                            </p>

                            <div className="mt-auto flex max-h-[34px] flex-wrap gap-1.5 overflow-hidden pt-0.5 select-none">
                              {project.skills.map((skill) => (
                                <button
                                  key={skill}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSkill(skill);
                                  }}
                                  className={`${discoverBody} cursor-pointer rounded-full bg-[#ffede8] px-4 py-1.5 text-[14px] font-normal text-black transition-colors hover:bg-[#ffdcd0]`}
                                >
                                  {skill}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="relative mt-4 shrink-0 border-t border-neutral-100 pt-4 sm:pt-5 lg:mt-0 lg:flex lg:w-auto lg:self-stretch lg:border-0 lg:border-l lg:border-neutral-200 lg:pl-8 lg:pt-0">
                          <div className="flex h-full w-full min-w-0 flex-col items-stretch justify-between gap-4 sm:items-end lg:min-w-[260px]">
                            <div className="w-full text-left sm:text-right">
                              <span className={`${discoverBody} block text-lg font-normal leading-none tracking-tight text-black sm:text-[21px]`}>
                                {project.budgetLabel}
                              </span>
                              <span className={`${discoverBody} mt-1.5 block text-[13px] font-normal text-neutral-700`}>
                                {project.type} Rate
                              </span>
                            </div>

                            <span
                              className={`${discoverBody} group/btn relative flex h-auto w-full shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[6px] bg-[#ebf8f2] px-8 py-2.5 text-[16px] font-normal text-[#52C47F] transition-colors duration-300 group-hover/btn:text-white lg:min-w-[250px]`}
                            >
                              <span
                                aria-hidden
                                className="absolute inset-0 origin-bottom-left scale-0 bg-[#113E30] transition-transform duration-300 ease-out group-hover/btn:scale-100"
                              />
                              <span className="relative z-10 flex items-center justify-center gap-2.5">
                                <span>Send Proposal</span>
                                <ArrowUpRight className="h-4.5 w-4.5 shrink-0 stroke-[2.5] text-current transition-colors duration-300" />
                              </span>
                            </span>
                          </div>
                        </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            {!loadingProjects && paginatedProjectsList.length > 0 && (
              <div className="flex flex-col items-center justify-center pb-4 pt-8">
                <div className="flex w-full max-w-full items-center justify-center gap-2 overflow-x-auto px-1 pb-1 sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-35 sm:h-10 sm:w-10"
                    title="Previous Page"
                  >
                    <ChevronLeft className="h-4.5 w-4.5" />
                  </button>
                  <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">{renderPageNumbers()}</div>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-35 sm:h-10 sm:w-10"
                    title="Next Page"
                  >
                    <ChevronRight className="h-4.5 w-4.5" />
                  </button>
                </div>
                <div className={`${discoverBody} mt-3 text-center text-xs font-medium text-zinc-400 sm:mt-3.5 sm:text-[13.5px]`}>
                  Showing {startIdx} – {endIdx} of {totalProjects} projects available
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </section>
  );
}
