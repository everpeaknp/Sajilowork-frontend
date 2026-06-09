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
  MapPin,
  FileText,
  ArrowUpRight,
  Calendar,
} from 'lucide-react';
import { discoverBody, discoverHeadline, discoverMedium } from '@/components/LangingHome/landingTypography';
import {
  type Project,
  generateMockProjects,
  locationDisplay,
} from './projectListData';

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

const INITIAL_PROJECTS = generateMockProjects();

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

export default function ProjectList() {
  const [projects] = useState<Project[]>(INITIAL_PROJECTS);

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

  const [applyingProject, setApplyingProject] = useState<Project | null>(null);
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [customCoverLetter, setCustomCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [alertText, setAlertText] = useState<string | null>(null);

  const sortMenuRef = useRef<HTMLDivElement>(null);

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
  ]);

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

  const filteredProjectsList = useMemo(() => {
    let result = [...projects];

    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (selectedSalary !== 'All') {
      if (selectedSalary === '0-1500') {
        result = result.filter((p) => p.budgetMax < 1500);
      } else if (selectedSalary === '1500-2500') {
        result = result.filter((p) => p.budgetMax >= 1500 && p.budgetMax <= 2500);
      } else if (selectedSalary === '2500-4000') {
        result = result.filter((p) => p.budgetMax >= 2500 && p.budgetMax <= 4000);
      } else if (selectedSalary === '4000+') {
        result = result.filter((p) => p.budgetMin >= 4000);
      }
    }

    if (selectedType !== 'All') {
      result = result.filter((p) => p.type === selectedType);
    }

    if (selectedLevel !== 'All') {
      result = result.filter((p) => p.experienceLevel === selectedLevel);
    }

    if (selectedLocation !== 'All') {
      result = result.filter((p) => p.location === selectedLocation);
    }

    if (selectedSkill !== 'All') {
      result = result.filter((p) => p.skills.includes(selectedSkill));
    }

    if (selectedLanguage !== 'All') {
      result = result.filter((_p, idx) => {
        const lang = idx % 3 === 0 ? 'English' : idx % 3 === 1 ? 'Hindi' : 'Nepali';
        return lang === selectedLanguage;
      });
    }

    if (sortBy === 'budget-high') {
      result.sort((a, b) => b.budgetMax - a.budgetMax);
    } else if (sortBy === 'duration-low') {
      result.sort((a, b) => a.duration.localeCompare(b.duration));
    } else {
      result.sort((a, b) => a.id.localeCompare(b.id));
    }

    return result;
  }, [
    projects,
    selectedCategory,
    selectedSalary,
    selectedType,
    selectedLevel,
    selectedLocation,
    selectedLanguage,
    selectedSkill,
    sortBy,
  ]);

  const itemsPerPage = 8;
  const totalProjects = filteredProjectsList.length;
  const totalPages = Math.max(1, Math.ceil(totalProjects / itemsPerPage));
  const startIdx = totalProjects === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalProjects);

  const paginatedProjectsList = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProjectsList.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProjectsList, currentPage]);

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

  const handleApplyFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || !candidateEmail.trim()) {
      alert('Please specify your name and email to submit application.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setApplyingProject(null);
      setCandidateName('');
      setCandidateEmail('');
      setCustomCoverLetter('');
      triggerAlert(`Successfully submitted application proposal for ${applyingProject?.title}!`);
    }, 1200);
  };

  const resetAllFilters = () => {
    setSelectedCategory('All');
    setSelectedSalary('All');
    setSelectedType('All');
    setSelectedLevel('All');
    setSelectedLocation('All');
    setSelectedLanguage('All');
    setSelectedSkill('All');
    triggerAlert('All filters have been reset.');
  };

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedSalary !== 'All' ||
    selectedType !== 'All' ||
    selectedLevel !== 'All' ||
    selectedLocation !== 'All' ||
    selectedLanguage !== 'All' ||
    selectedSkill !== 'All';

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
              className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-xl border border-[#52C47F]/25 bg-[#1D3E35] px-6 py-3.5 text-white shadow-xl"
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
            <div className="mb-5 flex min-h-[40px] items-center justify-between">
              <p className={`${discoverBody} text-base font-medium text-neutral-800`}>
                <span className={`${discoverMedium} font-bold text-neutral-900`}>{totalProjects}</span>{' '}
                services available
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

            {filteredProjectsList.length === 0 ? (
              <div className="w-full rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-16 text-center">
                <AlertCircle className="mx-auto mb-3 h-10 w-10 text-neutral-300" />
                <span className={`${discoverHeadline} mb-1 block text-lg font-bold text-[#1D3E35]`}>
                  No matching listings found
                </span>
                <p className={`${discoverBody} mx-auto mb-6 max-w-sm text-xs text-neutral-500`}>
                  There are no available opportunities matching your category and filtered specifications.
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
                    const jobNum = parseInt(project.id.replace('job-', ''), 10);
                    return (
                      <motion.div
                        layout
                        key={project.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.25 }}
                        className="relative box-border flex w-full shrink-0 flex-col justify-between rounded-[8px] border border-neutral-200/90 bg-white p-6 transition-all duration-300 hover:shadow-[0_4px_14px_rgba(0,0,0,0.05)] lg:h-[248px] lg:min-h-[248px] lg:max-h-[248px] lg:w-full lg:flex-row"
                      >
                        <div className="flex min-w-0 flex-1 gap-5">
                          <div className="relative shrink-0 select-none">
                            <div
                              className={`flex h-[52px] w-[52px] items-center justify-center rounded-full text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] ${project.companyLogoBg}`}
                            >
                              <CustomLogo type={project.companyIconType} className="h-6 w-6 text-white" />
                            </div>
                            {project.verified && (
                              <div
                                className="absolute right-0.5 top-0.5 flex h-[14px] w-[14px] items-center justify-center rounded-full border-2 border-white bg-[#52C47F] shadow-xs"
                                title="Verified Employer"
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h3
                                onClick={() => setApplyingProject(project)}
                                className={`${discoverBody} cursor-pointer truncate text-[18.5px] !font-normal leading-snug text-black transition-colors hover:text-[#52C47F] hover:underline`}
                              >
                                {project.title}
                              </h3>
                            </div>

                            <div
                              className={`${discoverBody} mt-1.5 flex flex-wrap items-center text-[13px] font-normal text-neutral-700`}
                            >
                              <span className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 stroke-[1.6] text-neutral-500" />
                                {locationDisplay(project.location)}
                              </span>
                              <span className="mx-3.5 select-none font-light text-neutral-300">|</span>
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4 stroke-[1.6] text-neutral-500" />
                                {project.id === 'job-1'
                                  ? '2 hours ago'
                                  : `${(jobNum % 3) + 2} hours ago`}
                              </span>
                              <span className="mx-3.5 select-none font-light text-neutral-300">|</span>
                              <span className="flex items-center gap-1.5">
                                <FileText className="h-4 w-4 stroke-[1.6] text-neutral-500" />
                                {project.id === 'job-1' || project.id === 'job-2'
                                  ? '1 Received'
                                  : 'None sent'}
                              </span>
                            </div>

                            <p
                              className={`${discoverBody} mb-4 mt-3.5 max-w-[620px] text-[13.5px] font-normal leading-relaxed text-black`}
                            >
                              {project.description}
                            </p>

                            <div className="flex flex-wrap gap-1.5 pt-0.5 select-none">
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

                        <div className="relative mt-4 shrink-0 border-t border-neutral-100 pt-5 md:mt-0 md:self-stretch md:border-0 md:pt-0">
                          <div
                            className="absolute -left-8 top-0 bottom-0 hidden w-px bg-neutral-200 md:block lg:-left-10"
                            aria-hidden
                          />

                          <div className="flex min-w-[240px] flex-col items-end justify-center gap-6 py-1.5 md:py-2 lg:min-w-[260px]">
                            <div className="w-full text-right">
                              <span className={`${discoverBody} block text-[21px] font-normal leading-none tracking-tight text-black`}>
                                {project.budgetLabel}
                              </span>
                              <span className={`${discoverBody} mt-1.5 block text-[13px] font-normal text-neutral-700`}>
                                {project.type} Rate
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setApplyingProject(project)}
                              className={`${discoverBody} group/btn relative flex w-full min-w-[250px] cursor-pointer items-center justify-center overflow-hidden rounded-[6px] bg-[#ebf8f2] px-12 py-3.5 text-[16px] font-normal text-[#52C47F] transition-colors duration-300 hover:text-white md:min-w-[250px]`}
                            >
                              <span
                                aria-hidden
                                className="absolute inset-0 origin-bottom-left scale-0 bg-[#113E30] transition-transform duration-300 ease-out group-hover/btn:scale-100"
                              />
                              <span className="relative z-10 flex items-center justify-center gap-2.5">
                                <span>Send Proposal</span>
                                <ArrowUpRight className="h-4.5 w-4.5 shrink-0 stroke-[2.5] text-current transition-colors duration-300" />
                              </span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            {filteredProjectsList.length > 0 && (
              <div className="flex flex-col items-center justify-center pb-4 pt-8">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-35"
                    title="Previous Page"
                  >
                    <ChevronLeft className="h-4.5 w-4.5" />
                  </button>
                  <div className="flex items-center gap-1.5">{renderPageNumbers()}</div>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-35"
                    title="Next Page"
                  >
                    <ChevronRight className="h-4.5 w-4.5" />
                  </button>
                </div>
                <div className={`${discoverBody} mt-3.5 select-none text-[13.5px] font-medium text-zinc-400`}>
                  Showing {startIdx} – {endIdx} of {totalProjects} jobs available
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {applyingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D3E35]/20 p-4 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 15 }}
              className="w-full max-w-xl overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-[#1D3E35] p-6 text-white">
                <button
                  type="button"
                  onClick={() => setApplyingProject(null)}
                  className="absolute right-5 top-5 cursor-pointer rounded-full border-none bg-white/10 p-1.5 text-white/75 outline-none transition-all hover:bg-white/15 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="mb-2.5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white">
                    <CustomLogo type={applyingProject.companyIconType} className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className={`${discoverMedium} block text-xs font-bold text-[#52C47F]`}>
                      Active Contract Role
                    </span>
                    <span className={`${discoverBody} block text-xs text-white/80`}>
                      Posted by {applyingProject.companyName} • {applyingProject.location}
                    </span>
                  </div>
                </div>

                <h3 className={`${discoverHeadline} mb-2 text-lg font-bold tracking-tight sm:text-xl`}>
                  {applyingProject.title}
                </h3>

                <div className={`${discoverMedium} mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-white/80`}>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5 text-[#52C47F]" />
                    {applyingProject.type}
                  </span>
                  <span>•</span>
                  <span>{applyingProject.experienceLevel}</span>
                  <span>•</span>
                  <span>{applyingProject.budgetLabel} Value</span>
                </div>
              </div>

              <form onSubmit={handleApplyFormSubmit} className="max-h-[60vh] space-y-4 overflow-y-auto p-6">
                <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                  <span className={`${discoverMedium} mb-1.5 block text-xs font-bold text-[#1D3E35]`}>
                    Core Specifications
                  </span>
                  <p className={`${discoverBody} mb-3 text-xs leading-relaxed text-neutral-600`}>
                    {applyingProject.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {applyingProject.skills.map((skill) => (
                      <span
                        key={skill}
                        className={`${discoverMedium} rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-neutral-600`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <span className={`${discoverMedium} mt-2 block border-b border-gray-100 pb-1 text-xs font-bold uppercase tracking-wider text-neutral-400`}>
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
                      className={`${discoverBody} w-full rounded-lg border border-gray-200 bg-neutral-50/50 px-3 py-2 text-xs outline-none transition-all focus:border-[#52C47F]`}
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
                      className={`${discoverBody} w-full rounded-lg border border-gray-200 bg-neutral-50/50 px-3 py-2 text-xs outline-none transition-all focus:border-[#52C47F]`}
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
                        const skillsStr = applyingProject.skills.slice(0, 3).join(', ');
                        setCustomCoverLetter(
                          `Dear Team at ${applyingProject.companyName},\n\nI was immediately drawn to your opening for the ${applyingProject.title}. With structured expertise in ${skillsStr}, I specialize in completing high-fidelity visual assets, modern responsiveness frameworks, and clean modular development.\n\nI would love the opportunity to discuss potential solutions with your team. Let me know best times to connect!`
                        );
                        triggerAlert('Injected tailored introduction!');
                      }}
                      className={`${discoverMedium} flex cursor-pointer select-none items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#52C47F] hover:underline`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Auto-tailor Letter
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={customCoverLetter}
                    onChange={(e) => setCustomCoverLetter(e.target.value)}
                    placeholder="Describe your credentials, previous experience, and proposed workflow strategies here..."
                    className={`${discoverBody} w-full resize-none rounded-lg border border-gray-200 bg-neutral-50/50 px-3 py-2 text-xs outline-none transition-all focus:border-[#52C47F]`}
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setApplyingProject(null)}
                    className={`${discoverMedium} flex-1 cursor-pointer rounded-lg border border-gray-200 bg-white py-2.5 text-center text-xs font-bold text-neutral-600 transition-all hover:border-black hover:text-black`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`${discoverMedium} flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#1D3E35] py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#52C47F] disabled:opacity-50`}
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
