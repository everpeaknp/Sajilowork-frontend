"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, SlidersHorizontal, ArrowUpDown, Search, Clock, Target, DollarSign, Menu } from 'lucide-react';
import { SearchFilters, Category } from '@/types';
import { hasActiveFilters } from '@/lib/taskFilters';
import { formatBudgetRange, formatNPR } from '@/lib/nepalLocale';
import { toast } from 'sonner';

const DEFAULT_LOCATION = '';
const DEFAULT_BUDGET_MAX = 10000;

interface FilterBarProps {
  currentFilters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  categories?: Category[];
  isSidebarVisible: boolean;
  onToggleSidebar: () => void;
  isCompactSidebar?: boolean;
  onToggleCompact?: () => void;
}

export default function FilterBar({
  currentFilters,
  onFilterChange,
  categories = [],
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
  const [draftDistance, setDraftDistance] = useState(currentFilters.distance_km ?? 50);
  const [draftBudgetMin, setDraftBudgetMin] = useState(currentFilters.budget_min ?? 0);
  const [draftBudgetMax, setDraftBudgetMax] = useState(currentFilters.budget_max ?? DEFAULT_BUDGET_MAX);
  const [draftStatus, setDraftStatus] = useState<SearchFilters['status']>(currentFilters.status);

  const categoryRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const otherFiltersRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const categoryLabels = categories.length > 0
    ? categories.map((c) => c.name)
    : [];

  useEffect(() => {
    setDraftCategory(currentFilters.category || '');
    setDraftWorkType(currentFilters.work_type || currentFilters.location_type || 'flexible');
    setDraftLocation(currentFilters.location || DEFAULT_LOCATION);
    setDraftDistance(currentFilters.distance_km ?? 50);
    setDraftBudgetMin(currentFilters.budget_min ?? 0);
    setDraftBudgetMax(currentFilters.budget_max ?? DEFAULT_BUDGET_MAX);
    setDraftStatus(currentFilters.status);
  }, [currentFilters]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setIsLocationOpen(false);
      }
      if (priceRef.current && !priceRef.current.contains(event.target as Node)) {
        setIsPriceOpen(false);
      }
      if (otherFiltersRef.current && !otherFiltersRef.current.contains(event.target as Node)) {
        setIsOtherFiltersOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCategoryLabels = categoryLabels.filter((cat) =>
    cat.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

  const requestUserLocation = useCallback((): Promise<{ lat: number; lng: number } | null> => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return Promise.resolve(null);
    }
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
      );
    });
  }, []);

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
      const coords = await requestUserLocation();
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
      const coords = await requestUserLocation();
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

  return (
    <div className="bg-white border-b border-outline-variant px-10 py-3 flex items-center relative z-[200] isolate overflow-visible">
      <div className="flex items-center gap-6 flex-nowrap flex-1 min-w-0">
        <button
          onClick={onToggleCompact}
          className="p-2 hover:bg-surface-dim rounded-lg transition-colors flex-shrink-0"
          title={isCompactSidebar ? 'Show full sidebar' : 'Show compact sidebar'}
        >
          <Menu className="w-5 h-5 text-on-surface-variant" />
        </button>

        <div className="relative flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
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
            className="bg-white border border-[#2f6bff]/30 focus:border-[#2f6bff]/50 shadow-sm rounded-full py-2 pl-10 pr-4 w-64 outline-none transition-all placeholder:text-on-surface-variant/60 font-sans text-[14px]"
          />
        </div>

        <div className="relative flex-shrink-0" ref={categoryRef}>
          <div
            onClick={() => {
              setIsCategoryOpen(!isCategoryOpen);
              setIsLocationOpen(false);
              setIsPriceOpen(false);
              setIsOtherFiltersOpen(false);
              setIsSortOpen(false);
            }}
            className={`flex items-center gap-2 font-sans text-[13px] font-semibold cursor-pointer transition-colors whitespace-nowrap ${
              isCategoryOpen || currentFilters.category
                ? 'text-[#2f6bff]'
                : 'text-black/70 hover:text-[#2f6bff]'
            }`}
          >
            {currentFilters.category ? currentFilters.category : 'Category'}
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
          </div>

          <AnimatePresence>
            {isCategoryOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-0 mt-2 w-full sm:w-[550px] md:w-[600px] lg:w-[650px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-outline-variant z-[300] p-4 sm:p-6 md:p-8 cursor-default max-h-[80vh] overflow-y-auto"
                style={{ transformOrigin: 'top left' }}
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[11px] font-bold text-on-surface-variant tracking-wider uppercase">All Categories</span>
                  <button
                    onClick={() => setDraftCategory('')}
                    className="text-primary font-bold font-sans text-[14px] hover:underline"
                  >
                    Clear all
                  </button>
                </div>

                <div className="relative mb-8">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <input
                    type="text"
                    placeholder="Search categories"
                    value={categorySearchQuery}
                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                    className="w-full bg-[#f1f4f9] border border-transparent focus:border-primary/30 rounded-full py-3.5 pl-12 pr-4 outline-none transition-all placeholder:text-on-surface-variant/60"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-3 sm:gap-y-4 max-h-[300px] sm:max-h-[350px] md:max-h-[400px] overflow-y-auto px-1 mb-6 sm:mb-8 scrollbar-thin scrollbar-thumb-outline-variant">
                  {filteredCategoryLabels.map((cat) => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group whitespace-normal">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name="category"
                          checked={draftCategory === cat}
                          onChange={() => setDraftCategory(cat)}
                          className="peer appearance-none w-5 h-5 border-2 border-outline-variant rounded-full bg-white checked:bg-primary checked:border-primary transition-all cursor-pointer"
                        />
                        <svg
                          className="absolute w-3 h-3 text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="4"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="font-sans text-[16px] text-on-surface group-hover:text-primary transition-colors font-medium">
                        {cat}
                      </span>
                    </label>
                  ))}
                  {filteredCategoryLabels.length === 0 && (
                    <div className="col-span-2 py-8 text-center text-on-surface-variant font-sans text-[16px] italic">
                      {categoryLabels.length === 0
                        ? 'Loading categories…'
                        : `No categories found matching "${categorySearchQuery}"`}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setIsCategoryOpen(false)}
                    className="text-primary font-bold font-sans text-[16px] hover:underline px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyCategories}
                    className="text-primary font-extrabold font-sans text-[16px] hover:underline px-4 py-2"
                  >
                    Apply
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative flex-shrink-0" ref={locationRef}>
          <div
            onClick={() => {
              setIsLocationOpen(!isLocationOpen);
              setIsCategoryOpen(false);
              setIsPriceOpen(false);
              setIsOtherFiltersOpen(false);
              setIsSortOpen(false);
            }}
            className={`flex items-center gap-2 font-sans text-[13px] font-semibold cursor-pointer transition-colors whitespace-nowrap ${
              isLocationOpen || locationActive ? 'text-[#2f6bff]' : 'text-black/70 hover:text-[#2f6bff]'
            }`}
          >
            Location
            {currentFilters.work_type && currentFilters.work_type !== 'flexible' && (
              <span className="text-[11px] font-normal opacity-80">
                ({currentFilters.work_type === 'in_person' ? 'In person' : 'Remote'})
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isLocationOpen ? 'rotate-180' : ''}`} />
          </div>

          <AnimatePresence>
            {isLocationOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-0 mt-2 w-full sm:w-[350px] md:w-[400px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-outline-variant z-[300] p-4 sm:p-6 md:p-8 cursor-default"
                style={{ transformOrigin: 'top left' }}
              >
                <div className="space-y-8">
                  <div>
                    <h4 className="text-[11px] font-bold text-on-surface-variant tracking-wider uppercase mb-4">To be done</h4>
                    <div className="grid grid-cols-3 gap-2 bg-[#f1f4f9] p-1 rounded-2xl">
                      {(['in_person', 'remote', 'flexible'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setDraftWorkType(type)}
                          className={`py-3 rounded-xl font-bold font-sans text-[14px] transition-all capitalize ${
                            draftWorkType === type ? 'bg-[#000d45] text-white shadow-md' : 'text-on-surface hover:bg-white/50'
                          }`}
                        >
                          {type.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-bold text-on-surface-variant tracking-wider uppercase mb-4">Suburb or city</h4>
                    <input
                      type="text"
                      placeholder="e.g. Kathmandu, Lalitpur"
                      value={draftLocation}
                      onChange={(e) => setDraftLocation(e.target.value)}
                      className="w-full bg-[#f1f4f9] border border-transparent focus:border-primary/30 rounded-2xl py-4 px-6 outline-none transition-all font-semibold text-[#000d45]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-[11px] font-bold text-on-surface-variant tracking-wider uppercase">Distance</h4>
                      <span className="font-bold text-[#000d45]">
                        {draftDistance >= 100 ? 'Any distance' : `${draftDistance} km`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={draftDistance}
                      onChange={(e) => setDraftDistance(parseFloat(e.target.value))}
                      className="w-full h-2 bg-[#f1f4f9] rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <p className="text-xs text-on-surface-variant mt-2">
                      Uses your browser location when applied (for distance and “closest” sort).
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => setIsLocationOpen(false)}
                      className="text-primary font-bold font-sans text-[16px] hover:underline px-4 py-2"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => void handleApplyLocation()}
                      className="text-primary font-extrabold font-sans text-[16px] hover:underline px-4 py-2"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative flex-shrink-0" ref={priceRef}>
          <div
            onClick={() => {
              setIsPriceOpen(!isPriceOpen);
              setIsCategoryOpen(false);
              setIsLocationOpen(false);
              setIsOtherFiltersOpen(false);
            }}
            className={`flex items-center gap-2 font-sans text-[13px] font-semibold cursor-pointer transition-colors whitespace-nowrap ${
              isPriceOpen || priceActive ? 'text-[#2f6bff]' : 'text-black/70 hover:text-[#2f6bff]'
            }`}
          >
            {priceActive
              ? formatBudgetRange(
                  currentFilters.budget_min ?? 0,
                  currentFilters.budget_max ?? DEFAULT_BUDGET_MAX
                )
              : 'Any price'}
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isPriceOpen ? 'rotate-180' : ''}`} />
          </div>

          <AnimatePresence>
            {isPriceOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-0 mt-2 w-full sm:w-[350px] md:w-[400px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-outline-variant z-[300] p-4 sm:p-6 md:p-8 cursor-default"
                style={{ transformOrigin: 'top left' }}
              >
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[11px] font-bold text-on-surface-variant tracking-wider uppercase mb-8">Task Price</h4>
                    <div className="text-center mb-8">
                      <span className="text-2xl font-bold text-[#000d45]">
                        {formatBudgetRange(draftBudgetMin, draftBudgetMax)}
                      </span>
                    </div>

                    <div className="relative h-2 bg-[#f1f4f9] rounded-full mt-4">
                      <div
                        className="absolute h-full bg-primary rounded-full"
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
                        className="absolute w-full h-full appearance-none bg-transparent pointer-events-auto cursor-pointer accent-primary"
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
                        className="absolute w-full h-full appearance-none bg-transparent pointer-events-auto cursor-pointer accent-primary"
                        style={{ zIndex: 4 }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => setIsPriceOpen(false)}
                      className="text-primary font-bold font-sans text-[16px] hover:underline px-4 py-2"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApplyPrice}
                      className="text-primary font-extrabold font-sans text-[16px] hover:underline px-4 py-2"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative flex-shrink-0" ref={otherFiltersRef}>
          <div
            onClick={() => {
              setIsOtherFiltersOpen(!isOtherFiltersOpen);
              setIsCategoryOpen(false);
              setIsLocationOpen(false);
              setIsPriceOpen(false);
            }}
            className={`flex items-center gap-2 font-sans text-[13px] font-semibold cursor-pointer transition-colors whitespace-nowrap ${
              isOtherFiltersOpen || currentFilters.status ? 'text-[#2f6bff]' : 'text-black/70 hover:text-[#2f6bff]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            More filters
          </div>

          <AnimatePresence>
            {isOtherFiltersOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-2 w-full sm:w-[350px] md:w-[400px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-outline-variant z-[300] p-4 sm:p-6 md:p-8 cursor-default"
                style={{ transformOrigin: 'top right' }}
              >
                <div className="space-y-8">
                  <div>
                    <h4 className="text-[11px] font-bold text-on-surface-variant tracking-wider uppercase mb-8">Other Filters</h4>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-[#000d45] font-sans text-[16px]">Open tasks only</p>
                          <p className="text-on-surface-variant font-sans text-[14px]">Show only open tasks</p>
                        </div>
                        <button
                          onClick={() => setDraftStatus(draftStatus === 'open' ? undefined : 'open')}
                          className={`w-12 h-6 rounded-full transition-all relative ${draftStatus === 'open' ? 'bg-primary' : 'bg-outline-variant'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${draftStatus === 'open' ? 'left-7' : 'left-1'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-[#000d45] font-sans text-[16px]">Assigned tasks only</p>
                          <p className="text-on-surface-variant font-sans text-[14px]">Show only assigned tasks</p>
                        </div>
                        <button
                          onClick={() => setDraftStatus(draftStatus === 'assigned' ? undefined : 'assigned')}
                          className={`w-12 h-6 rounded-full transition-all relative ${draftStatus === 'assigned' ? 'bg-primary' : 'bg-outline-variant'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${draftStatus === 'assigned' ? 'left-7' : 'left-1'}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => setIsOtherFiltersOpen(false)}
                      className="text-primary font-bold font-sans text-[16px] hover:underline px-4 py-2"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApplyOtherFilters}
                      className="text-primary font-extrabold font-sans text-[16px] hover:underline px-4 py-2"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative flex-shrink-0" ref={sortRef}>
          <div
            onClick={() => {
              setIsSortOpen(!isSortOpen);
              setIsCategoryOpen(false);
              setIsLocationOpen(false);
              setIsPriceOpen(false);
              setIsOtherFiltersOpen(false);
            }}
            className={`flex items-center gap-2 font-sans text-[13px] font-semibold cursor-pointer transition-colors whitespace-nowrap ${
              isSortOpen || sortLabel ? 'text-[#2f6bff]' : 'text-black/70 hover:text-[#2f6bff]'
            }`}
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortLabel || 'Sort'}
          </div>

          <AnimatePresence>
            {isSortOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-2 w-full sm:w-[280px] md:w-[320px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-outline-variant z-[300] p-2 sm:p-3 cursor-default"
                style={{ transformOrigin: 'top right' }}
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
                        onClick={() => void handleSortChange(option.id)}
                        className={`w-full text-left px-5 py-4 rounded-2xl font-semibold font-sans text-[16px] transition-all flex items-center gap-4 ${
                          isSelected ? 'bg-[#f1f4f9] text-[#000d45]' : 'text-[#000d45] hover:bg-[#f1f4f9]/50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-[#000d45]' : 'text-on-surface-variant'}`} />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {hasActiveFilters(currentFilters) && (
          <button
            onClick={handleClearAll}
            className="text-primary font-semibold font-sans text-[13px] hover:underline whitespace-nowrap flex-shrink-0"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
