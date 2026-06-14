'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Clock, DollarSign, Search, Target } from 'lucide-react';
import { toast } from 'sonner';
import {
  discoverBody,
  discoverHeadline,
  discoverMedium,
  landingHeadlineSm,
} from '@/components/LangingHome/landingTypography';
import { formatBudgetRange } from '@/lib/nepalLocale';
import { hasActiveFilters } from '@/lib/taskFilters';
import { categoryFilterLabels } from '@/lib/taskUtils';
import { DEFAULT_TASK_RADIUS_KM, requestUserGeolocation } from '@/lib/userGeolocation';
import type { Category, SearchFilters } from '@/types';

const DEFAULT_BUDGET_MAX = 10000;

interface TaskBrowseFilterSidebarProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  categories?: Category[];
  categoriesLoaded?: boolean;
  onClearAll?: () => void;
}

export default function TaskBrowseFilterSidebar({
  filters,
  onFilterChange,
  categories = [],
  categoriesLoaded = false,
  onClearAll,
}: TaskBrowseFilterSidebarProps) {
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    category: false,
    location: false,
    price: false,
    more: false,
    sort: false,
  });
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  const [draftWorkType, setDraftWorkType] = useState<'remote' | 'in_person' | 'flexible'>(
    filters.work_type || filters.location_type || 'flexible',
  );
  const [draftLocation, setDraftLocation] = useState(filters.location || '');
  const [draftDistance, setDraftDistance] = useState(filters.distance_km ?? DEFAULT_TASK_RADIUS_KM);
  const [draftBudgetMin, setDraftBudgetMin] = useState(filters.budget_min ?? 0);
  const [draftBudgetMax, setDraftBudgetMax] = useState(filters.budget_max ?? DEFAULT_BUDGET_MAX);
  const [draftStatus, setDraftStatus] = useState<SearchFilters['status']>(filters.status);

  const categoryLabels = categoryFilterLabels(categories);
  const filteredCategoryLabels = categoryLabels.filter((cat) =>
    cat.toLowerCase().includes(categorySearchQuery.toLowerCase()),
  );

  useEffect(() => {
    setDraftWorkType(filters.work_type || filters.location_type || 'flexible');
    setDraftLocation(filters.location || '');
    setDraftDistance(filters.distance_km ?? DEFAULT_TASK_RADIUS_KM);
    setDraftBudgetMin(filters.budget_min ?? 0);
    setDraftBudgetMax(filters.budget_max ?? DEFAULT_BUDGET_MAX);
    setDraftStatus(filters.status);
  }, [filters]);

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApplyLocation = async () => {
    const next: SearchFilters = {
      ...filters,
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
  };

  const handleApplyPrice = () => {
    onFilterChange({
      ...filters,
      budget_min: draftBudgetMin > 0 ? draftBudgetMin : undefined,
      budget_max: draftBudgetMax < DEFAULT_BUDGET_MAX ? draftBudgetMax : undefined,
    });
  };

  const handleApplyOtherFilters = () => {
    onFilterChange({ ...filters, status: draftStatus });
  };

  const handleSortChange = async (sortBy: 'newest' | 'budget_high' | 'budget_low' | 'closest') => {
    const next: SearchFilters = { ...filters, sort_by: sortBy };

    if (sortBy === 'closest') {
      const coords = await requestUserGeolocation();
      if (coords) {
        next.user_latitude = coords.lat;
        next.user_longitude = coords.lng;
      } else {
        toast.error('Location access is needed to sort by distance. Enable location in your browser.');
        return;
      }
    }

    onFilterChange(next);
  };

  const handleClearAll = () => {
    onFilterChange({});
    setCategorySearchQuery('');
    onClearAll?.();
  };

  const sortOptions = useMemo(
    () => [
      { id: 'newest' as const, label: 'Most recently posted', icon: Clock },
      { id: 'budget_high' as const, label: 'Highest price', icon: DollarSign },
      { id: 'budget_low' as const, label: 'Lowest price', icon: DollarSign },
      { id: 'closest' as const, label: 'Closest to me', icon: Target },
    ],
    [],
  );

  const activeSort = filters.sort_by || 'newest';

  const sections = [
    {
      key: 'category',
      label: 'Category',
      content: (
        <div className="pb-4 pt-2">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search categories"
              value={categorySearchQuery}
              onChange={(e) => setCategorySearchQuery(e.target.value)}
              className={`${discoverBody} w-full rounded-full bg-[#f1f4f9] py-2 pl-9 pr-3 text-sm outline-none placeholder:text-neutral-400 focus:bg-[#eef2f8]`}
            />
          </div>
          <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, category: undefined })}
              className={`${discoverBody} flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left text-[15px] transition-colors hover:bg-neutral-50 ${
                !filters.category ? 'font-semibold text-neutral-900' : 'text-neutral-600'
              }`}
            >
              <span
                className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border ${
                  !filters.category ? 'border-[#52C47F] bg-[#eefaf2]' : 'border-neutral-300'
                }`}
              >
                {!filters.category ? <span className="h-2 w-2 rounded-full bg-[#52C47F]" /> : null}
              </span>
              All categories
            </button>
            {filteredCategoryLabels.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onFilterChange({ ...filters, category: cat })}
                className={`${discoverBody} flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left text-[15px] transition-colors hover:bg-neutral-50 ${
                  filters.category === cat ? 'font-semibold text-neutral-900' : 'text-neutral-600'
                }`}
              >
                <span
                  className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border ${
                    filters.category === cat ? 'border-[#52C47F] bg-[#eefaf2]' : 'border-neutral-300'
                  }`}
                >
                  {filters.category === cat ? (
                    <span className="h-2 w-2 rounded-full bg-[#52C47F]" />
                  ) : null}
                </span>
                {cat}
              </button>
            ))}
            {filteredCategoryLabels.length === 0 ? (
              <p className={`${discoverBody} py-4 text-center text-sm italic text-neutral-400`}>
                {!categoriesLoaded
                  ? 'Loading categories…'
                  : categorySearchQuery.trim()
                    ? `No categories matching "${categorySearchQuery}"`
                    : 'No categories available'}
              </p>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      content: (
        <div className="space-y-4 pb-4 pt-2">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              To be done
            </p>
            <div className="grid grid-cols-1 gap-2 rounded-2xl bg-[#f1f4f9] p-1">
              {(['in_person', 'remote', 'flexible'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setDraftWorkType(type)}
                  className={`rounded-xl py-2.5 text-[13px] font-bold capitalize transition-all ${
                    draftWorkType === type
                      ? 'bg-[#113E30] text-white'
                      : 'text-neutral-700 hover:bg-white/50'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Suburb or city
            </p>
            <input
              type="text"
              placeholder="e.g. Kathmandu, Lalitpur"
              value={draftLocation}
              onChange={(e) => setDraftLocation(e.target.value)}
              className={`${discoverBody} w-full rounded-2xl bg-[#f1f4f9] px-4 py-3 text-sm font-semibold text-neutral-900 outline-none focus:bg-[#eef2f8]`}
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Distance
              </p>
              <span className="text-sm font-bold text-neutral-900">
                {draftDistance >= 100 ? 'Any distance' : `${draftDistance} km`}
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              value={draftDistance}
              onChange={(e) => setDraftDistance(parseFloat(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#f1f4f9] accent-[#52C47F]"
            />
            <p className={`${discoverBody} mt-2 text-xs text-neutral-500`}>
              Uses your browser location when applied (for distance and “closest” sort).
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleApplyLocation()}
            className={`${discoverMedium} w-full cursor-pointer rounded-lg bg-[#52C47F] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#49b071]`}
          >
            Apply location
          </button>
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Task price',
      content: (
        <div className="space-y-4 pb-4 pt-2">
          <div className="text-center">
            <span className={`${landingHeadlineSm} text-lg text-neutral-900`}>
              {formatBudgetRange(draftBudgetMin, draftBudgetMax)}
            </span>
          </div>
          <div className="relative mt-2 h-2 rounded-full bg-[#f1f4f9]">
            <div
              className="absolute h-full rounded-full bg-[#52C47F]"
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
              className="pointer-events-auto absolute h-full w-full cursor-pointer appearance-none bg-transparent accent-[#52C47F]"
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
              className="pointer-events-auto absolute h-full w-full cursor-pointer appearance-none bg-transparent accent-[#52C47F]"
              style={{ zIndex: 4 }}
            />
          </div>
          <button
            type="button"
            onClick={handleApplyPrice}
            className={`${discoverMedium} w-full cursor-pointer rounded-lg bg-[#52C47F] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#49b071]`}
          >
            Apply price
          </button>
        </div>
      ),
    },
    {
      key: 'more',
      label: 'More filters',
      content: (
        <div className="space-y-4 pb-4 pt-2">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className={`${discoverBody} text-[15px] font-bold text-neutral-900`}>Open tasks only</p>
              <p className={`${discoverBody} text-sm text-neutral-500`}>Show only open tasks</p>
            </div>
            <button
              type="button"
              onClick={() => setDraftStatus(draftStatus === 'open' ? undefined : 'open')}
              className={`relative h-6 w-12 shrink-0 rounded-full transition-all ${draftStatus === 'open' ? 'bg-[#52C47F]' : 'bg-neutral-200'}`}
            >
              <div
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${draftStatus === 'open' ? 'left-7' : 'left-1'}`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className={`${discoverBody} text-[15px] font-bold text-neutral-900`}>Assigned tasks only</p>
              <p className={`${discoverBody} text-sm text-neutral-500`}>Show only assigned tasks</p>
            </div>
            <button
              type="button"
              onClick={() => setDraftStatus(draftStatus === 'assigned' ? undefined : 'assigned')}
              className={`relative h-6 w-12 shrink-0 rounded-full transition-all ${draftStatus === 'assigned' ? 'bg-[#52C47F]' : 'bg-neutral-200'}`}
            >
              <div
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${draftStatus === 'assigned' ? 'left-7' : 'left-1'}`}
              />
            </button>
          </div>
          <button
            type="button"
            onClick={handleApplyOtherFilters}
            className={`${discoverMedium} w-full cursor-pointer rounded-lg bg-[#52C47F] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#49b071]`}
          >
            Apply filters
          </button>
        </div>
      ),
    },
    {
      key: 'sort',
      label: 'Sort by',
      content: (
        <div className="space-y-1 pb-4 pt-2">
          {sortOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = activeSort === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => void handleSortChange(option.id)}
                className={`${discoverBody} flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-semibold transition-all ${
                  isSelected ? 'bg-[#eefaf2] text-neutral-900' : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${isSelected ? 'text-[#52C47F]' : 'text-neutral-400'}`}
                />
                {option.label}
              </button>
            );
          })}
        </div>
      ),
    },
  ];

  return (
    <div className="rounded-[16px] bg-white px-5 pb-5 pt-0 lg:col-span-1">
      {hasActiveFilters(filters) ? (
        <div className="mb-2 flex min-h-[40px] items-center justify-end border-b border-neutral-100 pb-2">
          <button
            type="button"
            onClick={handleClearAll}
            className={`${discoverMedium} cursor-pointer text-xs font-semibold text-[#52C47F] transition-colors hover:text-[#41a668]`}
          >
            Clear all
          </button>
        </div>
      ) : null}

      {sections.map((section, index) => (
        <div
          key={section.key}
          className={`${index === 0 ? 'pt-0 pb-4' : 'border-b border-neutral-300 pb-5 pt-5'} ${index === sections.length - 1 ? 'border-b-0 pb-0' : ''}`}
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
            {openAccordions[section.key] ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                {section.content}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
