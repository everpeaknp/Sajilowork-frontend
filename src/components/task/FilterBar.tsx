"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, SlidersHorizontal, ArrowUpDown, Search, Clock, Target, DollarSign, Menu } from 'lucide-react';
import { SearchFilters, Category } from '@/types';
import { hasActiveFilters } from '@/lib/taskFilters';
import { categoryFilterLabels } from '@/lib/taskUtils';
import { formatBudgetRange } from '@/lib/nepalLocale';
import { useMobileFilterBodyLock } from '@/lib/filterBarMobile';
import FilterDropdownPanel, { FilterPanelActions } from '@/components/common/FilterDropdownPanel';
import { toast } from 'sonner';
import { DEFAULT_TASK_RADIUS_KM, requestUserGeolocation } from '@/lib/userGeolocation';
import { landingBody, landingHeadlineSm } from '@/components/LangingHome/landingTypography';

const DEFAULT_LOCATION = '';
const DEFAULT_BUDGET_MAX = 10000;

interface FilterBarProps {
  currentFilters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  categories?: Category[];
  categoriesLoaded?: boolean;
  isSidebarVisible: boolean;
  onToggleSidebar: () => void;
  isCompactSidebar?: boolean;
  onToggleCompact?: () => void;
}

export default function FilterBar({
  currentFilters,
  onFilterChange,
  categories = [],
  categoriesLoaded = false,
  isCompactSidebar = false,
  onToggleCompact,
}: FilterBarProps) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isOtherFiltersOpen, setIsOtherFiltersOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  const [draftCategory, setDraftCategory] = useState<string>(currentFilters.category || '');
  const [draftWorkType, setDraftWorkType] = useState<'remote' | 'in_person' | 'flexible'>(
    currentFilters.work_type || currentFilters.location_type || 'flexible'
  );
  const [draftLocation, setDraftLocation] = useState(currentFilters.location || DEFAULT_LOCATION);
  const [draftDistance, setDraftDistance] = useState(
    currentFilters.distance_km ?? DEFAULT_TASK_RADIUS_KM
  );
  const [draftBudgetMin, setDraftBudgetMin] = useState(currentFilters.budget_min ?? 0);
  const [draftBudgetMax, setDraftBudgetMax] = useState(currentFilters.budget_max ?? DEFAULT_BUDGET_MAX);
  const [draftStatus, setDraftStatus] = useState<SearchFilters['status']>(currentFilters.status);

  const categoryRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const otherFiltersRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const categoryLabels = categoryFilterLabels(categories);

  useEffect(() => {
    setDraftCategory(currentFilters.category || '');
    setDraftWorkType(currentFilters.work_type || currentFilters.location_type || 'flexible');
    setDraftLocation(currentFilters.location || DEFAULT_LOCATION);
    setDraftDistance(currentFilters.distance_km ?? DEFAULT_TASK_RADIUS_KM);
    setDraftBudgetMin(currentFilters.budget_min ?? 0);
    setDraftBudgetMax(currentFilters.budget_max ?? DEFAULT_BUDGET_MAX);
    setDraftStatus(currentFilters.status);
  }, [currentFilters]);

  const filteredCategoryLabels = categoryLabels.filter((cat) =>
    cat.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

  const handleApplyCategories = () => {
    onFilterChange({ ...currentFilters, category: draftCategory || undefined });
    setIsCategoryOpen(false);
  };

  const handleApplyLocation = async () => {
    const next: SearchFilters = {
      ...currentFilters,
      work_type: draftWorkType,
      location: draftLocation.trim() || undefined,
      distance_km: draftDistance,
      location_type: undefined,
    };

    if (draftDistance < 100) {
      const coords = await requestUserGeolocation();
      if (coords) {
        next.user_latitude = coords.lat;
        next.user_longitude = coords.lng;
      }
    }

    onFilterChange(next);
    setIsLocationOpen(false);
  };

  const handleApplyPrice = () => {
    onFilterChange({
      ...currentFilters,
      budget_min: draftBudgetMin > 0 ? draftBudgetMin : undefined,
      budget_max: draftBudgetMax < DEFAULT_BUDGET_MAX ? draftBudgetMax : undefined,
    });
    setIsPriceOpen(false);
  };

  const handleApplyOtherFilters = () => {
    onFilterChange({ ...currentFilters, status: draftStatus });
    setIsOtherFiltersOpen(false);
  };

  const handleSortChange = async (sortBy: 'newest' | 'budget_high' | 'budget_low' | 'closest') => {
    const next: SearchFilters = { ...currentFilters, sort_by: sortBy };

    if (sortBy === 'closest') {
      const coords = await requestUserGeolocation();
      if (coords) {
        next.user_latitude = coords.lat;
        next.user_longitude = coords.lng;
      } else {
        toast.error('Location access is needed to sort by distance. Enable location in your browser.');
        setIsSortOpen(false);
        return;
      }
    }

    onFilterChange(next);
    setIsSortOpen(false);
  };

  const handleClearAll = () => {
    onFilterChange({});
    setCategorySearchQuery('');
  };

  const priceActive =
    (currentFilters.budget_min != null && currentFilters.budget_min > 0) ||
    (currentFilters.budget_max != null && currentFilters.budget_max < DEFAULT_BUDGET_MAX);

  const locationActive =
    (currentFilters.work_type && currentFilters.work_type !== 'flexible') ||
    Boolean(currentFilters.location?.trim()) ||
    (currentFilters.distance_km != null && currentFilters.distance_km < 100);

  const sortLabel =
    currentFilters.sort_by === 'budget_high'
      ? 'Highest price'
      : currentFilters.sort_by === 'budget_low'
        ? 'Lowest price'
        : currentFilters.sort_by === 'closest'
          ? 'Closest to me'
          : currentFilters.sort_by === 'newest'
            ? 'Most recent'
            : null;

  const anyPanelOpen =
    isCategoryOpen || isLocationOpen || isPriceOpen || isOtherFiltersOpen || isSortOpen;

  useMobileFilterBodyLock(anyPanelOpen);

  const filterTriggerClass = (active: boolean) =>
    `flex min-h-[44px] touch-manipulation items-center gap-1.5 whitespace-nowrap ${landingBody} text-[13px] font-semibold transition-colors sm:gap-2 sm:min-h-0 ${
      active ? 'text-brand-emerald' : 'text-black/70 hover:text-brand-emerald dark:text-stone-300 dark:hover:text-brand-emerald'
    }`;

  return (
    <div className={`relative z-[200] border-b border-transparent bg-white dark:border-neutral-800 dark:bg-neutral-950 ${landingBody}`}>
      <div className="flex min-w-0 flex-col gap-2.5 px-3 py-2.5 sm:px-6 sm:py-3 lg:flex-row lg:items-center lg:gap-6 lg:px-10">
        <div className="flex min-w-0 items-center gap-2 lg:shrink-0">
          <button
            type="button"
            onClick={onToggleCompact}
            className="hidden shrink-0 rounded-lg p-2 transition-colors hover:bg-surface-dim dark:hover:bg-neutral-800 lg:flex"
            title={isCompactSidebar ? 'Show full sidebar' : 'Show compact sidebar'}
          >
            <Menu className="h-5 w-5 text-on-surface-variant" />
          </button>

          <div className="relative min-w-0 flex-1 lg:w-64 lg:flex-none">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={currentFilters.query || ''}
              onChange={(e) =>
                onFilterChange({
                  ...currentFilters,
                  query: e.target.value || undefined,
                })
              }
              className="w-full rounded-full bg-[#f1f4f9] py-2 pl-10 pr-4 font-body text-[14px] outline-none transition-all placeholder:text-on-surface-variant/60 focus:bg-[#eef2f8] dark:bg-neutral-800 dark:text-stone-100 dark:placeholder:text-neutral-500 dark:focus:bg-neutral-800"
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 touch-pan-x items-center gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-6 sm:pb-0.5 [&::-webkit-scrollbar]:hidden">

        <div className="relative shrink-0" ref={categoryRef}>
          <div
            onClick={() => {
              setIsCategoryOpen(!isCategoryOpen);
              setIsLocationOpen(false);
              setIsPriceOpen(false);
              setIsOtherFiltersOpen(false);
              setIsSortOpen(false);
            }}
            className={`${filterTriggerClass(Boolean(isCategoryOpen || currentFilters.category))} cursor-pointer`}
          >
            <span className="max-w-[7.5rem] truncate sm:max-w-none">
              {currentFilters.category ? currentFilters.category : 'Category'}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
          </div>

          <FilterDropdownPanel
            open={isCategoryOpen}
            onClose={() => setIsCategoryOpen(false)}
            anchorRef={categoryRef}
            title="All Categories"
            desktopClassName="sm:w-[550px] md:w-[600px] lg:max-w-[650px]"
          >
            <div className="flex flex-col min-h-0">
              <div className="mb-4 flex shrink-0 justify-end sm:hidden">
                <button
                  type="button"
                  onClick={() => setDraftCategory('')}
                  className="font-body text-[14px] font-bold text-brand-emerald hover:underline"
                >
                  Clear all
                </button>
              </div>
              <div className="mb-4 hidden shrink-0 items-center justify-between sm:flex">
                <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Pick a category
                </span>
                <button
                  type="button"
                  onClick={() => setDraftCategory('')}
                  className="font-body text-[14px] font-bold text-brand-emerald hover:underline"
                >
                  Clear all
                </button>
              </div>
              <div className="relative mb-4 shrink-0">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="text"
                  placeholder="Search categories"
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  className="w-full rounded-full bg-[#f1f4f9] py-3 pl-12 pr-4 outline-none transition-all placeholder:text-on-surface-variant/60 focus:bg-[#eef2f8] dark:bg-neutral-800 dark:text-stone-100 dark:placeholder:text-neutral-500 dark:focus:bg-neutral-800"
                />
              </div>
              <div className="grid min-h-0 grid-cols-1 gap-y-3 px-1 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-4">
                {filteredCategoryLabels.map((cat) => (
                  <label key={cat} className="group flex cursor-pointer items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="category"
                        checked={draftCategory === cat}
                        onChange={() => setDraftCategory(cat)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-full bg-[#e8edf5] transition-all checked:bg-brand-emerald"
                      />
                      <svg
                        className="pointer-events-none absolute h-3 w-3 scale-0 text-white transition-transform peer-checked:scale-100"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="4"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-body text-[15px] font-medium text-on-surface transition-colors group-hover:text-brand-emerald sm:text-[16px]">
                      {cat}
                    </span>
                  </label>
                ))}
                {filteredCategoryLabels.length === 0 && (
                  <p className="col-span-full py-6 text-center text-sm italic text-on-surface-variant sm:text-base">
                    {!categoriesLoaded
                      ? 'Loading categories…'
                      : categorySearchQuery.trim()
                        ? `No categories found matching "${categorySearchQuery}"`
                        : 'No categories available'}
                  </p>
                )}
              </div>
              <FilterPanelActions
                onCancel={() => setIsCategoryOpen(false)}
                onApply={handleApplyCategories}
              />
            </div>
          </FilterDropdownPanel>
        </div>

        <div className="relative shrink-0" ref={locationRef}>
          <div
            onClick={() => {
              setIsLocationOpen(!isLocationOpen);
              setIsCategoryOpen(false);
              setIsPriceOpen(false);
              setIsOtherFiltersOpen(false);
              setIsSortOpen(false);
            }}
            className={`${filterTriggerClass(isLocationOpen || locationActive)} cursor-pointer`}
          >
            <span className="shrink-0">Location</span>
            {currentFilters.work_type && currentFilters.work_type !== 'flexible' && (
              <span className="hidden text-[11px] font-normal opacity-80 sm:inline">
                ({currentFilters.work_type === 'in_person' ? 'In person' : 'Remote'})
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isLocationOpen ? 'rotate-180' : ''}`} />
          </div>

          <FilterDropdownPanel
            open={isLocationOpen}
            onClose={() => setIsLocationOpen(false)}
            anchorRef={locationRef}
            title="Location"
            desktopClassName="sm:w-[400px]"
          >
            <div className="space-y-5 sm:space-y-6">
              <div>
                <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  To be done
                </h4>
                <div className="grid grid-cols-1 gap-2 rounded-2xl bg-[#f1f4f9] p-1 dark:bg-neutral-800 sm:grid-cols-3">
                  {(['in_person', 'remote', 'flexible'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setDraftWorkType(type)}
                      className={`rounded-xl py-2.5 font-body text-[13px] font-bold capitalize transition-all sm:py-3 sm:text-[14px] ${
                        draftWorkType === type
                          ? 'bg-brand-dark text-white'
                          : 'text-on-surface hover:bg-white/50 dark:text-stone-200 dark:hover:bg-neutral-700/50'
                      }`}
                    >
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Suburb or city
                </h4>
                <input
                  type="text"
                  placeholder="e.g. Kathmandu, Lalitpur"
                  value={draftLocation}
                  onChange={(e) => setDraftLocation(e.target.value)}
                  className="w-full rounded-2xl bg-[#f1f4f9] px-4 py-3 font-semibold text-brand-dark outline-none transition-all focus:bg-[#eef2f8] dark:bg-neutral-800 dark:text-stone-100 dark:focus:bg-neutral-800 sm:px-6 sm:py-4"
                />
              </div>
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Distance
                  </h4>
                  <span className="font-bold text-brand-dark dark:text-stone-100">
                    {draftDistance >= 100 ? 'Any distance' : `${draftDistance} km`}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={draftDistance}
                  onChange={(e) => setDraftDistance(parseFloat(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#f1f4f9] accent-brand-emerald dark:bg-neutral-800"
                />
                <p className="mt-2 text-xs text-on-surface-variant">
                  Uses your browser location when applied (for distance and “closest” sort).
                </p>
              </div>
              <FilterPanelActions
                onCancel={() => setIsLocationOpen(false)}
                onApply={() => void handleApplyLocation()}
              />
            </div>
          </FilterDropdownPanel>
        </div>

        <div className="relative shrink-0" ref={priceRef}>
          <div
            onClick={() => {
              setIsPriceOpen(!isPriceOpen);
              setIsCategoryOpen(false);
              setIsLocationOpen(false);
              setIsOtherFiltersOpen(false);
            }}
            className={`${filterTriggerClass(isPriceOpen || priceActive)} cursor-pointer`}
          >
            <span className="max-w-[6.5rem] truncate sm:max-w-none">
              {priceActive
                ? formatBudgetRange(
                    currentFilters.budget_min ?? 0,
                    currentFilters.budget_max ?? DEFAULT_BUDGET_MAX
                  )
                : 'Any price'}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isPriceOpen ? 'rotate-180' : ''}`} />
          </div>

          <FilterDropdownPanel
            open={isPriceOpen}
            onClose={() => setIsPriceOpen(false)}
            anchorRef={priceRef}
            title="Task price"
            desktopClassName="sm:w-[400px]"
          >
            <div className="space-y-6">
              <div className="text-center">
                <span className={`${landingHeadlineSm} text-xl text-brand-dark dark:text-stone-100 sm:text-2xl`}>
                  {formatBudgetRange(draftBudgetMin, draftBudgetMax)}
                </span>
              </div>
              <div className="relative mt-2 h-2 rounded-full bg-[#f1f4f9] dark:bg-neutral-800">
                <div
                  className="absolute h-full rounded-full bg-brand-emerald"
                  style={{
                    left: `${(draftBudgetMin / DEFAULT_BUDGET_MAX) * 100}%`,
                    right: `${100 - (draftBudgetMax / DEFAULT_BUDGET_MAX) * 100}%`,
                  }}
                />
                <input
                  type="range"
                  min="0"
                  max={DEFAULT_BUDGET_MAX}
                  value={draftBudgetMin}
                  onChange={(e) =>
                    setDraftBudgetMin(Math.min(parseFloat(e.target.value), draftBudgetMax - 100))
                  }
                  className="pointer-events-auto absolute h-full w-full cursor-pointer appearance-none bg-transparent accent-brand-emerald"
                  style={{ zIndex: 3 }}
                />
                <input
                  type="range"
                  min="0"
                  max={DEFAULT_BUDGET_MAX}
                  value={draftBudgetMax}
                  onChange={(e) =>
                    setDraftBudgetMax(Math.max(parseFloat(e.target.value), draftBudgetMin + 100))
                  }
                  className="pointer-events-auto absolute h-full w-full cursor-pointer appearance-none bg-transparent accent-brand-emerald"
                  style={{ zIndex: 4 }}
                />
              </div>
              <FilterPanelActions
                onCancel={() => setIsPriceOpen(false)}
                onApply={handleApplyPrice}
              />
            </div>
          </FilterDropdownPanel>
        </div>

        <div className="relative shrink-0" ref={otherFiltersRef}>
          <div
            onClick={() => {
              setIsOtherFiltersOpen(!isOtherFiltersOpen);
              setIsCategoryOpen(false);
              setIsLocationOpen(false);
              setIsPriceOpen(false);
            }}
            className={`${filterTriggerClass(Boolean(isOtherFiltersOpen || currentFilters.status))} cursor-pointer`}
          >
            <SlidersHorizontal className="h-4 w-4 shrink-0" />
            <span className="sm:hidden">More</span>
            <span className="hidden sm:inline">More filters</span>
          </div>

          <FilterDropdownPanel
            open={isOtherFiltersOpen}
            onClose={() => setIsOtherFiltersOpen(false)}
            anchorRef={otherFiltersRef}
            title="More filters"
            align="right"
            desktopClassName="sm:w-[400px]"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-body text-[16px] font-bold text-brand-dark dark:text-stone-100">Open tasks only</p>
                  <p className="font-body text-[14px] text-on-surface-variant">Show only open tasks</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDraftStatus(draftStatus === 'open' ? undefined : 'open')}
                  className={`relative h-6 w-12 shrink-0 rounded-full transition-all ${draftStatus === 'open' ? 'bg-brand-emerald' : 'bg-outline-variant'}`}
                >
                  <div
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${draftStatus === 'open' ? 'left-7' : 'left-1'}`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-body text-[16px] font-bold text-brand-dark dark:text-stone-100">Assigned tasks only</p>
                  <p className="font-body text-[14px] text-on-surface-variant">Show only assigned tasks</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDraftStatus(draftStatus === 'assigned' ? undefined : 'assigned')}
                  className={`relative h-6 w-12 shrink-0 rounded-full transition-all ${draftStatus === 'assigned' ? 'bg-brand-emerald' : 'bg-outline-variant'}`}
                >
                  <div
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${draftStatus === 'assigned' ? 'left-7' : 'left-1'}`}
                  />
                </button>
              </div>
              <FilterPanelActions
                onCancel={() => setIsOtherFiltersOpen(false)}
                onApply={handleApplyOtherFilters}
              />
            </div>
          </FilterDropdownPanel>
        </div>

        <div className="relative shrink-0" ref={sortRef}>
          <div
            onClick={() => {
              setIsSortOpen(!isSortOpen);
              setIsCategoryOpen(false);
              setIsLocationOpen(false);
              setIsPriceOpen(false);
              setIsOtherFiltersOpen(false);
            }}
            className={`${filterTriggerClass(Boolean(isSortOpen || sortLabel))} cursor-pointer`}
          >
            <ArrowUpDown className="h-4 w-4 shrink-0" />
            <span className="max-w-[5.5rem] truncate sm:max-w-none">{sortLabel || 'Sort'}</span>
          </div>

          <FilterDropdownPanel
            open={isSortOpen}
            onClose={() => setIsSortOpen(false)}
            anchorRef={sortRef}
            title="Sort by"
            align="right"
            desktopClassName="sm:w-[320px]"
          >
            <div className="space-y-1">
              {[
                { id: 'newest' as const, label: 'Most recently posted', icon: Clock },
                { id: 'budget_high' as const, label: 'Highest price', icon: DollarSign },
                { id: 'budget_low' as const, label: 'Lowest price', icon: DollarSign },
                { id: 'closest' as const, label: 'Closest to me', icon: Target },
              ].map((option) => {
                const Icon = option.icon;
                const isSelected = (currentFilters.sort_by || 'newest') === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => void handleSortChange(option.id)}
                    className={`flex min-h-[48px] w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-body text-[15px] font-semibold transition-all sm:gap-4 sm:px-5 sm:py-4 sm:text-[16px] ${
                      isSelected ? 'bg-[#f1f4f9] text-brand-dark dark:bg-neutral-800 dark:text-stone-100' : 'text-brand-dark hover:bg-[#f1f4f9]/50 dark:text-stone-200 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 shrink-0 ${isSelected ? 'text-brand-dark dark:text-stone-100' : 'text-on-surface-variant'}`}
                    />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </FilterDropdownPanel>
        </div>

        {hasActiveFilters(currentFilters) && (
          <button
            type="button"
            onClick={handleClearAll}
            className="min-h-[44px] shrink-0 touch-manipulation whitespace-nowrap font-body text-[13px] font-semibold text-brand-emerald hover:underline sm:min-h-0"
          >
            Clear all
          </button>
        )}
        </div>
      </div>
    </div>
  );
}
