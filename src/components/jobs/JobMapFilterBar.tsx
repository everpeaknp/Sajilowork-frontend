'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpDown,
  Briefcase,
  ChevronDown,
  DollarSign,
  MapPin,
  Menu,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import FilterDropdownPanel, { FilterPanelActions } from '@/components/common/FilterDropdownPanel';
import { useMobileFilterBodyLock } from '@/lib/filterBarMobile';
import {
  type JobMapFilters,
  type JobMapSalaryFilter,
  type JobMapSort,
} from '@/lib/jobMapFilters';
import { requestUserGeolocation } from '@/lib/userGeolocation';
import { landingBody, landingHeadlineSm } from '@/components/LangingHome/landingTypography';

const JOB_CATEGORIES = [
  'All',
  'Design & Creative',
  'Development & IT',
  'Writing & Translation',
  'Digital Marketing',
  'Video & Animation',
  'Finance & Accounting',
];

const SALARY_OPTIONS: { value: JobMapSalaryFilter; label: string }[] = [
  { value: 'All', label: 'All salaries' },
  { value: '0-50k', label: 'Under Rs. 50k' },
  { value: '50k-100k', label: 'Rs. 50k – 1 Lac' },
  { value: '100k-150k', label: 'Rs. 1 – 1.5 Lac' },
  { value: '150k+', label: 'Rs. 1.5 Lac+' },
];

const JOB_TYPE_OPTIONS = ['All', 'Hourly', 'Fixed Price', 'Contract', 'Full Time'];

const LEVEL_OPTIONS = ['All', 'Intern', 'Entry Level', 'Intermediate', 'Expert'];

const SORT_OPTIONS: { value: JobMapSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'best-seller', label: 'Most applications' },
  { value: 'budget-high', label: 'Highest salary' },
  { value: 'closest', label: 'Nearest' },
];

const NEARBY_RADIUS_OPTIONS = [
  { value: 5, label: '5 km' },
  { value: 15, label: '15 km' },
  { value: 30, label: '30 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: 'Anywhere in Nepal' },
];

function filterOptionClass(selected: boolean): string {
  return `w-full rounded-lg px-3 py-2.5 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-emerald/30 ${
    selected
      ? 'bg-brand-light-bg font-semibold text-brand-emerald'
      : 'text-brand-dark hover:bg-brand-light-bg/70'
  }`;
}

interface JobMapFilterBarProps {
  currentFilters: JobMapFilters;
  onFilterChange: (filters: JobMapFilters) => void;
  jobCount: number;
  isSidebarVisible: boolean;
  onToggleSidebar: () => void;
  isCompactSidebar?: boolean;
  onToggleCompact?: () => void;
}

export default function JobMapFilterBar({
  currentFilters,
  onFilterChange,
  jobCount,
  isSidebarVisible,
  onToggleSidebar,
  isCompactSidebar,
  onToggleCompact,
}: JobMapFilterBarProps) {
  const [searchDraft, setSearchDraft] = useState(currentFilters.query ?? '');
  const [openPanel, setOpenPanel] = useState<string | null>(null);

  const [draftCategory, setDraftCategory] = useState(currentFilters.category ?? 'All');
  const [draftSalary, setDraftSalary] = useState<JobMapSalaryFilter>(currentFilters.salary ?? 'All');
  const [draftJobType, setDraftJobType] = useState(currentFilters.jobType ?? 'All');
  const [draftLevel, setDraftLevel] = useState(currentFilters.level ?? 'All');
  const [draftLocation, setDraftLocation] = useState(currentFilters.location ?? '');
  const [draftDistance, setDraftDistance] = useState(currentFilters.distance_km ?? 100);
  const [draftSort, setDraftSort] = useState<JobMapSort>(currentFilters.sortBy ?? 'newest');

  const categoryRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const salaryRef = useRef<HTMLDivElement>(null);
  const jobRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const barRef = useRef<HTMLDivElement>(null);
  useMobileFilterBodyLock(openPanel !== null);

  useEffect(() => {
    setSearchDraft(currentFilters.query ?? '');
    setDraftCategory(currentFilters.category ?? 'All');
    setDraftSalary(currentFilters.salary ?? 'All');
    setDraftJobType(currentFilters.jobType ?? 'All');
    setDraftLevel(currentFilters.level ?? 'All');
    setDraftLocation(currentFilters.location ?? '');
    setDraftDistance(currentFilters.distance_km ?? 100);
    setDraftSort(currentFilters.sortBy ?? 'newest');
  }, [currentFilters]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = searchDraft.trim();
      if ((currentFilters.query ?? '') === next) return;
      onFilterChange({ ...currentFilters, query: next || undefined });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchDraft, currentFilters, onFilterChange]);

  const closePanel = () => setOpenPanel(null);

  const applyLocation = async () => {
    const next: JobMapFilters = {
      ...currentFilters,
      location: draftLocation.trim() || undefined,
      distance_km: draftDistance,
    };
    if (draftDistance < 100) {
      const coords = await requestUserGeolocation();
      if (coords) {
        next.user_latitude = coords.lat;
        next.user_longitude = coords.lng;
        next.sortBy = 'closest';
      }
    }
    onFilterChange(next);
    closePanel();
  };

  return (
    <div ref={barRef} className="relative z-20 shrink-0 border-b border-outline-variant bg-white px-3 py-3 dark:border-neutral-800 dark:bg-neutral-950 sm:px-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-dim dark:border-neutral-700 dark:hover:bg-neutral-800 lg:hidden"
            aria-label={isSidebarVisible ? 'Hide job list' : 'Show job list'}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Search jobs, companies, skills…"
              className={`${landingBody} h-10 w-full rounded-lg border border-outline-variant bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-stone-100`}
            />
          </div>

          {onToggleCompact ? (
            <button
              type="button"
              onClick={onToggleCompact}
              className="hidden h-10 items-center gap-1.5 rounded-lg border border-outline-variant px-3 text-sm text-on-surface-variant hover:bg-surface-dim dark:border-neutral-700 dark:hover:bg-neutral-800 lg:inline-flex"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {isCompactSidebar ? 'Expand list' : 'Compact list'}
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={`${landingBody} text-sm text-neutral-600 dark:text-neutral-400`}>
            <span className={`${landingHeadlineSm} font-semibold text-neutral-900 dark:text-stone-100`}>{jobCount}</span>{' '}
            {jobCount === 1 ? 'job' : 'jobs'} on map
          </p>

          <div className="flex flex-wrap items-center gap-1.5">
            <div ref={categoryRef}>
              <FilterChip
                label={draftCategory === 'All' ? 'Category' : draftCategory}
                active={draftCategory !== 'All'}
                onClick={() => setOpenPanel(openPanel === 'category' ? null : 'category')}
              />
            </div>
            <div ref={locationRef}>
              <FilterChip
                icon={<MapPin className="h-3.5 w-3.5" />}
                label={draftLocation.trim() ? draftLocation : 'Location'}
                active={Boolean(draftLocation.trim()) || draftDistance < 100}
                onClick={() => setOpenPanel(openPanel === 'location' ? null : 'location')}
              />
            </div>
            <div ref={salaryRef}>
              <FilterChip
                icon={<DollarSign className="h-3.5 w-3.5" />}
                label={SALARY_OPTIONS.find((o) => o.value === draftSalary)?.label ?? 'Salary'}
                active={draftSalary !== 'All'}
                onClick={() => setOpenPanel(openPanel === 'salary' ? null : 'salary')}
              />
            </div>
            <div ref={jobRef}>
              <FilterChip
                icon={<Briefcase className="h-3.5 w-3.5" />}
                label="Job filters"
                active={draftJobType !== 'All' || draftLevel !== 'All'}
                onClick={() => setOpenPanel(openPanel === 'job' ? null : 'job')}
              />
            </div>
            <div ref={sortRef}>
              <FilterChip
                icon={<ArrowUpDown className="h-3.5 w-3.5" />}
                label={SORT_OPTIONS.find((o) => o.value === draftSort)?.label ?? 'Sort'}
                active={draftSort !== 'newest'}
                onClick={() => setOpenPanel(openPanel === 'sort' ? null : 'sort')}
              />
            </div>
          </div>
        </div>
      </div>

      <FilterDropdownPanel
        open={openPanel === 'category'}
        onClose={closePanel}
        anchorRef={categoryRef}
        title="Job category"
      >
        <div className="max-h-56 space-y-1 overflow-y-auto">
          {JOB_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setDraftCategory(cat)}
              className={filterOptionClass(draftCategory === cat)}
            >
              {cat === 'All' ? 'All categories' : cat}
            </button>
          ))}
        </div>
        <FilterPanelActions
          onCancel={() => {
            setDraftCategory(currentFilters.category ?? 'All');
            closePanel();
          }}
          onApply={() => {
            onFilterChange({ ...currentFilters, category: draftCategory });
            closePanel();
          }}
        />
      </FilterDropdownPanel>

      <FilterDropdownPanel
        open={openPanel === 'location'}
        onClose={closePanel}
        anchorRef={locationRef}
        title="Job location"
      >
        <label className="mb-2 block text-xs font-medium text-neutral-500">City or area</label>
        <input
          value={draftLocation}
          onChange={(e) => setDraftLocation(e.target.value)}
          placeholder="e.g. Kathmandu, Pokhara, Remote"
          className="mb-4 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-emerald"
        />
        <label className="mb-2 block text-xs font-medium text-neutral-500">Show jobs near me</label>
        <div className="space-y-1">
          {NEARBY_RADIUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDraftDistance(opt.value)}
              className={filterOptionClass(draftDistance === opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <FilterPanelActions
          onCancel={() => {
            setDraftLocation(currentFilters.location ?? '');
            setDraftDistance(currentFilters.distance_km ?? 100);
            closePanel();
          }}
          onApply={() => void applyLocation()}
        />
      </FilterDropdownPanel>

      <FilterDropdownPanel
        open={openPanel === 'salary'}
        onClose={closePanel}
        anchorRef={salaryRef}
        align="right"
        desktopClassName="sm:w-[320px]"
        title="Salary range"
      >
        <div className="space-y-1">
          {SALARY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDraftSalary(opt.value)}
              className={filterOptionClass(draftSalary === opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <FilterPanelActions
          onCancel={() => {
            setDraftSalary(currentFilters.salary ?? 'All');
            closePanel();
          }}
          onApply={() => {
            onFilterChange({ ...currentFilters, salary: draftSalary });
            closePanel();
          }}
        />
      </FilterDropdownPanel>

      <FilterDropdownPanel
        open={openPanel === 'job'}
        onClose={closePanel}
        anchorRef={jobRef}
        align="right"
        desktopClassName="sm:w-[320px]"
        title="Job type & level"
      >
        <p className="mb-2 text-xs font-medium text-neutral-500">Job type</p>
        <div className="mb-4 space-y-1">
          {JOB_TYPE_OPTIONS.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setDraftJobType(type)}
              className={filterOptionClass(draftJobType === type)}
            >
              {type === 'All' ? 'All types' : type}
            </button>
          ))}
        </div>
        <p className="mb-2 text-xs font-medium text-neutral-500">Experience level</p>
        <div className="space-y-1">
          {LEVEL_OPTIONS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setDraftLevel(level)}
              className={filterOptionClass(draftLevel === level)}
            >
              {level === 'All' ? 'All levels' : level}
            </button>
          ))}
        </div>
        <FilterPanelActions
          onCancel={() => {
            setDraftJobType(currentFilters.jobType ?? 'All');
            setDraftLevel(currentFilters.level ?? 'All');
            closePanel();
          }}
          onApply={() => {
            onFilterChange({ ...currentFilters, jobType: draftJobType, level: draftLevel });
            closePanel();
          }}
        />
      </FilterDropdownPanel>

      <FilterDropdownPanel
        open={openPanel === 'sort'}
        onClose={closePanel}
        anchorRef={sortRef}
        align="right"
        desktopClassName="sm:w-[320px]"
        title="Sort jobs"
      >
        <div className="space-y-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDraftSort(opt.value)}
              className={filterOptionClass(draftSort === opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <FilterPanelActions
          onCancel={() => {
            setDraftSort(currentFilters.sortBy ?? 'newest');
            closePanel();
          }}
          onApply={() => {
            onFilterChange({ ...currentFilters, sortBy: draftSort });
            closePanel();
          }}
        />
      </FilterDropdownPanel>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex max-w-[11rem] items-center gap-1 truncate rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
        active
          ? 'border-brand-emerald/40 bg-brand-emerald/10 text-brand-emerald'
          : 'border-outline-variant bg-white text-on-surface-variant hover:bg-surface-dim dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800'
      }`}
    >
      {icon}
      <span className="truncate">{label}</span>
      <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
    </button>
  );
}
