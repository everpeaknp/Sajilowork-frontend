'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpDown,
  ChevronDown,
  Clock,
  DollarSign,
  MapPin,
  Menu,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import FilterDropdownPanel, { FilterPanelActions } from '@/components/common/FilterDropdownPanel';
import { useMobileFilterBodyLock } from '@/lib/filterBarMobile';
import {
  type ServiceMapBudgetFilter,
  type ServiceMapFilters,
  type ServiceMapSort,
} from '@/lib/serviceMapFilters';
import { requestUserGeolocation } from '@/lib/userGeolocation';
import { landingBody, landingHeadlineSm } from '@/components/LangingHome/landingTypography';

const SERVICE_CATEGORIES = [
  'All',
  'Design & Creative',
  'Development & IT',
  'Writing & Translation',
  'Digital Marketing',
  'Video & Animation',
  'Finance & Accounting',
];

const BUDGET_OPTIONS: { value: ServiceMapBudgetFilter; label: string }[] = [
  { value: 'All', label: 'All prices' },
  { value: 'under-5k', label: 'Under Rs. 5k' },
  { value: '5k-15k', label: 'Rs. 5k – 15k' },
  { value: '15k-30k', label: 'Rs. 15k – 30k' },
  { value: '30k+', label: 'Rs. 30k+' },
];

const DELIVERY_OPTIONS = [
  { value: 'All', label: 'Any delivery time' },
  { value: '24h', label: '24 hours' },
  { value: '3days', label: '3 days' },
  { value: '7days', label: '7 days' },
  { value: 'anytime', label: 'Flexible' },
];

const LEVEL_OPTIONS = ['All', 'New Seller', 'Level 1', 'Level 2', 'Top Rated'];

const SORT_OPTIONS: { value: ServiceMapSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'best-seller', label: 'Best seller' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'reviews', label: 'Most reviewed' },
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
      ? 'bg-brand-light-bg font-semibold text-brand-emerald dark:bg-neutral-800'
      : 'text-brand-dark hover:bg-brand-light-bg/70 dark:text-stone-200 dark:hover:bg-neutral-800/50'
  }`;
}

interface ServiceMapFilterBarProps {
  currentFilters: ServiceMapFilters;
  onFilterChange: (filters: ServiceMapFilters) => void;
  serviceCount: number;
  isSidebarVisible: boolean;
  onToggleSidebar: () => void;
  isCompactSidebar?: boolean;
  onToggleCompact?: () => void;
}

export default function ServiceMapFilterBar({
  currentFilters,
  onFilterChange,
  serviceCount,
  isSidebarVisible,
  onToggleSidebar,
  isCompactSidebar,
  onToggleCompact,
}: ServiceMapFilterBarProps) {
  const [searchDraft, setSearchDraft] = useState(currentFilters.query ?? '');
  const [openPanel, setOpenPanel] = useState<string | null>(null);

  const [draftCategory, setDraftCategory] = useState(currentFilters.category ?? 'All');
  const [draftBudget, setDraftBudget] = useState<ServiceMapBudgetFilter>(currentFilters.budget ?? 'All');
  const [draftDelivery, setDraftDelivery] = useState(currentFilters.deliveryTime ?? 'All');
  const [draftLevel, setDraftLevel] = useState(currentFilters.level ?? 'All');
  const [draftLocation, setDraftLocation] = useState(currentFilters.location ?? '');
  const [draftDistance, setDraftDistance] = useState(currentFilters.distance_km ?? 100);
  const [draftSort, setDraftSort] = useState<ServiceMapSort>(currentFilters.sortBy ?? 'newest');

  const categoryRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const budgetRef = useRef<HTMLDivElement>(null);
  const serviceRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useMobileFilterBodyLock(openPanel !== null);

  useEffect(() => {
    setSearchDraft(currentFilters.query ?? '');
    setDraftCategory(currentFilters.category ?? 'All');
    setDraftBudget(currentFilters.budget ?? 'All');
    setDraftDelivery(currentFilters.deliveryTime ?? 'All');
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
    const next: ServiceMapFilters = {
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
    <div className="relative z-20 shrink-0 border-b border-outline-variant bg-white px-3 py-3 sm:px-4 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-dim dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 lg:hidden"
            aria-label={isSidebarVisible ? 'Hide service list' : 'Show service list'}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Search services, sellers, skills…"
              className={`${landingBody} h-10 w-full rounded-lg border border-outline-variant bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald/30 dark:border-neutral-800 dark:bg-neutral-800 dark:text-stone-100 dark:placeholder:text-neutral-500 dark:focus:bg-neutral-800`}
            />
          </div>

          {onToggleCompact ? (
            <button
              type="button"
              onClick={onToggleCompact}
              className="hidden h-10 items-center gap-1.5 rounded-lg border border-outline-variant px-3 text-sm text-on-surface-variant hover:bg-surface-dim dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 lg:inline-flex"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {isCompactSidebar ? 'Expand list' : 'Compact list'}
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={`${landingBody} text-sm text-neutral-600 dark:text-neutral-400`}>
            <span className={`${landingHeadlineSm} font-semibold text-neutral-900 dark:text-stone-100`}>{serviceCount}</span>{' '}
            {serviceCount === 1 ? 'service' : 'services'} on map
          </p>

          <div className="flex flex-wrap items-center gap-1.5">
            <div ref={categoryRef}>
              <FilterChip label={draftCategory === 'All' ? 'Category' : draftCategory} active={draftCategory !== 'All'} onClick={() => setOpenPanel(openPanel === 'category' ? null : 'category')} />
            </div>
            <div ref={locationRef}>
              <FilterChip icon={<MapPin className="h-3.5 w-3.5" />} label={draftLocation.trim() ? draftLocation : 'Location'} active={Boolean(draftLocation.trim()) || draftDistance < 100} onClick={() => setOpenPanel(openPanel === 'location' ? null : 'location')} />
            </div>
            <div ref={budgetRef}>
              <FilterChip icon={<DollarSign className="h-3.5 w-3.5" />} label={BUDGET_OPTIONS.find((o) => o.value === draftBudget)?.label ?? 'Price'} active={draftBudget !== 'All'} onClick={() => setOpenPanel(openPanel === 'budget' ? null : 'budget')} />
            </div>
            <div ref={serviceRef}>
              <FilterChip icon={<Clock className="h-3.5 w-3.5" />} label="Service filters" active={draftDelivery !== 'All' || draftLevel !== 'All'} onClick={() => setOpenPanel(openPanel === 'service' ? null : 'service')} />
            </div>
            <div ref={sortRef}>
              <FilterChip icon={<ArrowUpDown className="h-3.5 w-3.5" />} label={SORT_OPTIONS.find((o) => o.value === draftSort)?.label ?? 'Sort'} active={draftSort !== 'newest'} onClick={() => setOpenPanel(openPanel === 'sort' ? null : 'sort')} />
            </div>
          </div>
        </div>
      </div>

      <FilterDropdownPanel open={openPanel === 'category'} onClose={closePanel} anchorRef={categoryRef} title="Service category">
        <div className="max-h-56 space-y-1 overflow-y-auto">
          {SERVICE_CATEGORIES.map((cat) => (
            <button key={cat} type="button" onClick={() => setDraftCategory(cat)} className={filterOptionClass(draftCategory === cat)}>
              {cat === 'All' ? 'All categories' : cat}
            </button>
          ))}
        </div>
        <FilterPanelActions onCancel={() => { setDraftCategory(currentFilters.category ?? 'All'); closePanel(); }} onApply={() => { onFilterChange({ ...currentFilters, category: draftCategory }); closePanel(); }} />
      </FilterDropdownPanel>

      <FilterDropdownPanel open={openPanel === 'location'} onClose={closePanel} anchorRef={locationRef} title="Service location">
        <label className="mb-2 block text-xs font-medium text-neutral-500 dark:text-neutral-400">City or area</label>
        <input value={draftLocation} onChange={(e) => setDraftLocation(e.target.value)} placeholder="e.g. Kathmandu, Pokhara, Remote" className="mb-4 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-emerald dark:border-neutral-700 dark:bg-neutral-800 dark:text-stone-100 dark:placeholder:text-neutral-500" />
        <label className="mb-2 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Show services near me</label>
        <div className="space-y-1">
          {NEARBY_RADIUS_OPTIONS.map((opt) => (
            <button key={opt.value} type="button" onClick={() => setDraftDistance(opt.value)} className={filterOptionClass(draftDistance === opt.value)}>
              {opt.label}
            </button>
          ))}
        </div>
        <FilterPanelActions onCancel={() => { setDraftLocation(currentFilters.location ?? ''); setDraftDistance(currentFilters.distance_km ?? 100); closePanel(); }} onApply={() => void applyLocation()} />
      </FilterDropdownPanel>

      <FilterDropdownPanel open={openPanel === 'budget'} onClose={closePanel} anchorRef={budgetRef} align="right" desktopClassName="sm:w-[320px]" title="Price range">
        <div className="space-y-1">
          {BUDGET_OPTIONS.map((opt) => (
            <button key={opt.value} type="button" onClick={() => setDraftBudget(opt.value)} className={filterOptionClass(draftBudget === opt.value)}>
              {opt.label}
            </button>
          ))}
        </div>
        <FilterPanelActions onCancel={() => { setDraftBudget(currentFilters.budget ?? 'All'); closePanel(); }} onApply={() => { onFilterChange({ ...currentFilters, budget: draftBudget }); closePanel(); }} />
      </FilterDropdownPanel>

      <FilterDropdownPanel open={openPanel === 'service'} onClose={closePanel} anchorRef={serviceRef} align="right" desktopClassName="sm:w-[320px]" title="Delivery & seller level">
        <p className="mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">Delivery time</p>
        <div className="mb-4 space-y-1">
          {DELIVERY_OPTIONS.map((opt) => (
            <button key={opt.value} type="button" onClick={() => setDraftDelivery(opt.value)} className={filterOptionClass(draftDelivery === opt.value)}>
              {opt.label}
            </button>
          ))}
        </div>
        <p className="mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">Seller level</p>
        <div className="space-y-1">
          {LEVEL_OPTIONS.map((level) => (
            <button key={level} type="button" onClick={() => setDraftLevel(level)} className={filterOptionClass(draftLevel === level)}>
              {level === 'All' ? 'All levels' : level}
            </button>
          ))}
        </div>
        <FilterPanelActions
          onCancel={() => { setDraftDelivery(currentFilters.deliveryTime ?? 'All'); setDraftLevel(currentFilters.level ?? 'All'); closePanel(); }}
          onApply={() => { onFilterChange({ ...currentFilters, deliveryTime: draftDelivery, level: draftLevel }); closePanel(); }}
        />
      </FilterDropdownPanel>

      <FilterDropdownPanel open={openPanel === 'sort'} onClose={closePanel} anchorRef={sortRef} align="right" desktopClassName="sm:w-[320px]" title="Sort services">
        <div className="space-y-1">
          {SORT_OPTIONS.map((opt) => (
            <button key={opt.value} type="button" onClick={() => setDraftSort(opt.value)} className={filterOptionClass(draftSort === opt.value)}>
              {opt.label}
            </button>
          ))}
        </div>
        <FilterPanelActions onCancel={() => { setDraftSort(currentFilters.sortBy ?? 'newest'); closePanel(); }} onApply={() => { onFilterChange({ ...currentFilters, sortBy: draftSort }); closePanel(); }} />
      </FilterDropdownPanel>
    </div>
  );
}

function FilterChip({ label, active, onClick, icon }: { label: string; active?: boolean; onClick: () => void; icon?: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex max-w-[11rem] items-center gap-1 truncate rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
        active
          ? 'border-brand-emerald/40 bg-brand-emerald/10 text-brand-emerald'
          : 'border-outline-variant bg-white text-on-surface-variant hover:bg-surface-dim dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800'
      }`}
    >
      {icon}
      <span className="truncate">{label}</span>
      <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
    </button>
  );
}
