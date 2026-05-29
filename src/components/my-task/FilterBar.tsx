"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ArrowUpDown, Search, Clock, DollarSign, Menu } from 'lucide-react';
import { SearchFilters } from '@/types';
import {
  type MyTasksFilterId,
  MY_TASKS_STATUS_FILTERS,
} from '@/lib/taskUtils';
import { formatBudgetRange } from '@/lib/nepalLocale';
import { useMobileFilterBodyLock } from '@/lib/filterBarMobile';
import FilterDropdownPanel, { FilterPanelActions } from '@/components/common/FilterDropdownPanel';

const DEFAULT_BUDGET_MAX = 10000;

const CATEGORIES = [
  'Acoustic Sound Proofing', 'Advisory', 'Beauty Services', 'Bicycle Repair',
  'Boat Detailing', 'Body Art', 'Bricklayer', 'Builder',
  'Interstate Deliveries', 'Knitting / Needlecraft', 'Labour', 'Letterbox & Flyer Distribution',
  'Locksmiths', 'Market Research', 'Maternity, Childcare & Babysitting', 'Mechanic',
  'Cleaning', 'Gardening',
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'open', label: 'Posted' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'funded', label: 'Funded' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'pending_approval', label: 'Pending approval' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'disputed', label: 'Disputed' },
] as const;

export type MyTaskStatusTabsConfig = {
  active: MyTasksFilterId;
  onChange: (id: MyTasksFilterId) => void;
  counts: Record<MyTasksFilterId, number>;
};

interface FilterBarProps {
  currentFilters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  isSidebarVisible: boolean;
  onToggleSidebar: () => void;
  isCompactSidebar?: boolean;
  onToggleCompact?: () => void;
  /** Horizontal status tabs (All tasks, Posted, …) instead of the Status dropdown */
  statusTabs?: MyTaskStatusTabsConfig;
}

export default function FilterBar({
  currentFilters,
  onFilterChange,
  isCompactSidebar = false,
  onToggleCompact,
  statusTabs,
}: FilterBarProps) {
  const useStatusTabs = Boolean(statusTabs);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  const [draftCategory, setDraftCategory] = useState<string>(currentFilters.category || '');
  const [draftStatus, setDraftStatus] = useState<SearchFilters['status']>(currentFilters.status);
  const [draftBudgetMin, setDraftBudgetMin] = useState(currentFilters.budget_min ?? 0);
  const [draftBudgetMax, setDraftBudgetMax] = useState(currentFilters.budget_max ?? DEFAULT_BUDGET_MAX);

  const categoryRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraftCategory(currentFilters.category || '');
    setDraftStatus(currentFilters.status);
    setDraftBudgetMin(currentFilters.budget_min ?? 0);
    setDraftBudgetMax(currentFilters.budget_max ?? DEFAULT_BUDGET_MAX);
  }, [currentFilters]);

  const filteredCategoryLabels = CATEGORIES.filter((cat) =>
    cat.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

  const togglePanel = (panel: 'category' | 'status' | 'price' | 'sort') => {
    const next = {
      category: panel === 'category' ? !isCategoryOpen : false,
      status: panel === 'status' ? !isStatusOpen : false,
      price: panel === 'price' ? !isPriceOpen : false,
      sort: panel === 'sort' ? !isSortOpen : false,
    };
    setIsCategoryOpen(next.category);
    setIsStatusOpen(next.status);
    setIsPriceOpen(next.price);
    setIsSortOpen(next.sort);
  };

  const anyPanelOpen =
    isCategoryOpen ||
    (!useStatusTabs && isStatusOpen) ||
    isPriceOpen ||
    isSortOpen;
  useMobileFilterBodyLock(anyPanelOpen);

  const handleApplyCategories = () => {
    onFilterChange({ ...currentFilters, category: draftCategory || undefined });
    setIsCategoryOpen(false);
  };

  const handleApplyPrice = () => {
    onFilterChange({
      ...currentFilters,
      budget_min: draftBudgetMin > 0 ? draftBudgetMin : undefined,
      budget_max: draftBudgetMax < DEFAULT_BUDGET_MAX ? draftBudgetMax : undefined,
    });
    setIsPriceOpen(false);
  };

  const handleSortChange = (sortBy: 'newest' | 'budget_high' | 'budget_low' | 'closest') => {
    onFilterChange({ ...currentFilters, sort_by: sortBy });
    setIsSortOpen(false);
  };

  const priceActive =
    (currentFilters.budget_min != null && currentFilters.budget_min > 0) ||
    (currentFilters.budget_max != null && currentFilters.budget_max < DEFAULT_BUDGET_MAX);

  const statusLabel = currentFilters.status
    ? STATUS_OPTIONS.find((s) => s.value === currentFilters.status)?.label
    : null;

  const sortLabel =
    currentFilters.sort_by === 'budget_high'
      ? 'Highest price'
      : currentFilters.sort_by === 'budget_low'
        ? 'Lowest price'
        : currentFilters.sort_by === 'newest'
          ? 'Most recent'
          : null;

  const filterTriggerClass = (active: boolean) =>
    `flex min-h-[44px] touch-manipulation cursor-pointer items-center gap-1.5 whitespace-nowrap font-sans text-[13px] font-semibold transition-colors sm:min-h-0 sm:gap-2 ${
      active ? 'text-[#2f6bff]' : 'text-black/70 hover:text-[#2f6bff]'
    }`;

  return (
    <div className="relative z-[200] bg-white">
      <div className="flex min-w-0 flex-col gap-2.5 px-3 py-2.5 sm:px-6 sm:py-3 lg:flex-row lg:items-center lg:gap-6 lg:px-10">
        <div className="flex min-w-0 items-center gap-2 lg:shrink-0">
          <button
            type="button"
            onClick={onToggleCompact}
            className="hidden shrink-0 rounded-lg p-2 transition-colors hover:bg-surface-dim lg:flex"
            title={isCompactSidebar ? 'Show full sidebar' : 'Show compact sidebar'}
          >
            <Menu className="h-5 w-5 text-on-surface-variant" />
          </button>

          <div className="relative min-w-0 flex-1 lg:w-64 lg:flex-none">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search my tasks..."
              value={currentFilters.query || ''}
              onChange={(e) =>
                onFilterChange({
                  ...currentFilters,
                  query: e.target.value || undefined,
                })
              }
              className="w-full rounded-full bg-[#f1f4f9] py-2 pl-10 pr-4 font-sans text-[14px] outline-none transition-all placeholder:text-on-surface-variant/60 focus:bg-[#eef2f8]"
            />
          </div>
        </div>

        {statusTabs ? (
          <div className="flex min-w-0 touch-pan-x items-center gap-3 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden lg:min-w-0 lg:flex-1">
            {MY_TASKS_STATUS_FILTERS.map((filter) => {
              const count = statusTabs.counts[filter.id];
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => statusTabs.onChange(filter.id)}
                  className={`min-h-[44px] shrink-0 touch-manipulation whitespace-nowrap font-sans text-[13px] font-semibold transition-colors sm:min-h-0 ${
                    statusTabs.active === filter.id
                      ? 'text-[#2f6bff]'
                      : 'text-black/70 hover:text-[#2f6bff]'
                  }`}
                >
                  {filter.label}
                  {count > 0 ? ` (${count})` : ''}
                </button>
              );
            })}
          </div>
        ) : null}

        {!useStatusTabs ? (
        <div className="flex min-w-0 flex-1 touch-pan-x items-center gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-6 sm:pb-0.5 [&::-webkit-scrollbar]:hidden">
          <div className="relative shrink-0" ref={categoryRef}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => togglePanel('category')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  togglePanel('category');
                }
              }}
              className={filterTriggerClass(Boolean(isCategoryOpen || currentFilters.category))}
            >
              <span className="max-w-[7.5rem] truncate sm:max-w-none">
                {currentFilters.category || 'Category'}
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`}
              />
            </div>

            <FilterDropdownPanel
              open={isCategoryOpen}
              onClose={() => setIsCategoryOpen(false)}
              anchorRef={categoryRef}
              title="All Categories"
              desktopClassName="sm:w-[550px] md:w-[600px] lg:max-w-[650px]"
            >
              <div className="mb-4 flex shrink-0 justify-end sm:justify-between">
                <span className="hidden text-[11px] font-bold uppercase tracking-wider text-on-surface-variant sm:inline">
                  Pick a category
                </span>
                <button
                  type="button"
                  onClick={() => setDraftCategory('')}
                  className="font-sans text-[14px] font-bold text-primary hover:underline"
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
                  className="w-full rounded-full bg-[#f1f4f9] py-3 pl-12 pr-4 outline-none transition-all placeholder:text-on-surface-variant/60 focus:bg-[#eef2f8]"
                />
              </div>
              <div className="grid grid-cols-1 gap-y-3 px-1 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-4">
                {filteredCategoryLabels.map((cat) => (
                  <label key={cat} className="group flex cursor-pointer items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="my-task-category"
                        checked={draftCategory === cat}
                        onChange={() => setDraftCategory(cat)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-full bg-[#e8edf5] transition-all checked:bg-primary"
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
                    <span className="font-sans text-[15px] font-medium text-on-surface transition-colors group-hover:text-primary sm:text-[16px]">
                      {cat}
                    </span>
                  </label>
                ))}
                {filteredCategoryLabels.length === 0 && (
                  <p className="col-span-full py-6 text-center text-sm italic text-on-surface-variant sm:text-base">
                    No categories found matching &quot;{categorySearchQuery}&quot;
                  </p>
                )}
              </div>
              <FilterPanelActions
                onCancel={() => setIsCategoryOpen(false)}
                onApply={handleApplyCategories}
              />
            </FilterDropdownPanel>
          </div>

          {!useStatusTabs ? (
            <div className="relative shrink-0" ref={statusRef}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => togglePanel('status')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    togglePanel('status');
                  }
                }}
                className={filterTriggerClass(Boolean(isStatusOpen || currentFilters.status))}
              >
                <span className="max-w-[6rem] truncate sm:max-w-none">
                  {statusLabel ? statusLabel : 'Status'}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isStatusOpen ? 'rotate-180' : ''}`}
                />
              </div>

              <FilterDropdownPanel
                open={isStatusOpen}
                onClose={() => setIsStatusOpen(false)}
                anchorRef={statusRef}
                title="Status"
                desktopClassName="sm:w-[320px]"
              >
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDraftStatus(undefined);
                      onFilterChange({ ...currentFilters, status: undefined });
                      setIsStatusOpen(false);
                    }}
                    className={`flex min-h-[48px] w-full items-center rounded-2xl px-4 py-3 text-left font-sans text-[15px] font-semibold transition-all sm:px-5 sm:py-4 sm:text-[16px] ${
                      !draftStatus ? 'bg-[#f1f4f9] text-[#000d45]' : 'text-[#000d45] hover:bg-[#f1f4f9]/50'
                    }`}
                  >
                    All Status
                  </button>
                  {STATUS_OPTIONS.map((option) => {
                    const isSelected = draftStatus === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setDraftStatus(option.value);
                          onFilterChange({ ...currentFilters, status: option.value });
                          setIsStatusOpen(false);
                        }}
                        className={`flex min-h-[48px] w-full items-center rounded-2xl px-4 py-3 text-left font-sans text-[15px] font-semibold transition-all sm:px-5 sm:py-4 sm:text-[16px] ${
                          isSelected ? 'bg-[#f1f4f9] text-[#000d45]' : 'text-[#000d45] hover:bg-[#f1f4f9]/50'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </FilterDropdownPanel>
            </div>
          ) : null}

          <div className="relative shrink-0" ref={priceRef}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => togglePanel('price')}
              className={filterTriggerClass(isPriceOpen || priceActive)}
            >
              <span className="max-w-[6.5rem] truncate sm:max-w-none">
                {priceActive
                  ? formatBudgetRange(
                      currentFilters.budget_min ?? 0,
                      currentFilters.budget_max ?? DEFAULT_BUDGET_MAX
                    )
                  : 'Any price'}
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isPriceOpen ? 'rotate-180' : ''}`}
              />
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
                  <span className="text-xl font-bold text-[#000d45] sm:text-2xl">
                    {formatBudgetRange(draftBudgetMin, draftBudgetMax)}
                  </span>
                </div>
                <div className="relative h-2 rounded-full bg-[#f1f4f9]">
                  <div
                    className="absolute h-full rounded-full bg-primary"
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
                    className="pointer-events-auto absolute h-full w-full cursor-pointer appearance-none bg-transparent accent-primary"
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
                    className="pointer-events-auto absolute h-full w-full cursor-pointer appearance-none bg-transparent accent-primary"
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

          <div className="relative shrink-0" ref={sortRef}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => togglePanel('sort')}
              className={filterTriggerClass(Boolean(isSortOpen || sortLabel))}
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
                ].map((option) => {
                  const Icon = option.icon;
                  const isSelected = (currentFilters.sort_by || 'newest') === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSortChange(option.id)}
                      className={`flex min-h-[48px] w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-sans text-[15px] font-semibold transition-all sm:gap-4 sm:px-5 sm:py-4 sm:text-[16px] ${
                        isSelected ? 'bg-[#f1f4f9] text-[#000d45]' : 'text-[#000d45] hover:bg-[#f1f4f9]/50'
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 shrink-0 ${isSelected ? 'text-[#000d45]' : 'text-on-surface-variant'}`}
                      />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </FilterDropdownPanel>
          </div>
        </div>
        ) : null}
      </div>
    </div>
  );
}
