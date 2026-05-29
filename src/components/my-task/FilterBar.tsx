"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ArrowUpDown, Search, Clock, DollarSign, Menu } from 'lucide-react';
import { SearchFilters } from '@/types';

const CATEGORIES = [
  'Acoustic Sound Proofing', 'Advisory', 'Beauty Services', 'Bicycle Repair',
  'Boat Detailing', 'Body Art', 'Bricklayer', 'Builder',
  'Interstate Deliveries', 'Knitting / Needlecraft', 'Labour', 'Letterbox & Flyer Distribution',
  'Locksmiths', 'Market Research', 'Maternity, Childcare & Babysitting', 'Mechanic',
  'Cleaning', 'Gardening'
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
];

interface FilterBarProps {
  currentFilters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  isSidebarVisible: boolean;
  onToggleSidebar: () => void;
  isCompactSidebar?: boolean;
  onToggleCompact?: () => void;
}

export default function FilterBar({ currentFilters, onFilterChange, isCompactSidebar = false, onToggleCompact }: FilterBarProps) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Internal draft states
  const [draftCategory, setDraftCategory] = useState<string>(currentFilters.category || '');
  const [draftStatus, setDraftStatus] = useState<
    | 'draft'
    | 'open'
    | 'assigned'
    | 'funded'
    | 'in_progress'
    | 'pending_approval'
    | 'completed'
    | 'cancelled'
    | 'disputed'
    | undefined
  >(currentFilters.status);
  const [draftBudgetMin, setDraftBudgetMin] = useState(currentFilters.budget_min || 0);
  const [draftBudgetMax, setDraftBudgetMax] = useState(currentFilters.budget_max || 10000);

  const categoryRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Sync draft state when currentFilters changes
  useEffect(() => {
    setDraftCategory(currentFilters.category || '');
    setDraftStatus(currentFilters.status);
    setDraftBudgetMin(currentFilters.budget_min || 0);
    setDraftBudgetMax(currentFilters.budget_max || 10000);
  }, [currentFilters]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
      if (priceRef.current && !priceRef.current.contains(event.target as Node)) {
        setIsPriceOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCategoriesLabels = CATEGORIES.filter(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleApplyCategories = () => {
    onFilterChange({ ...currentFilters, category: draftCategory });
    setIsCategoryOpen(false);
  };

  const handleApplyPrice = () => {
    onFilterChange({ ...currentFilters, budget_min: draftBudgetMin, budget_max: draftBudgetMax });
    setIsPriceOpen(false);
  };

  const handleSortChange = (sortBy: 'newest' | 'budget_high' | 'budget_low' | 'closest') => {
    onFilterChange({ ...currentFilters, sort_by: sortBy });
    setIsSortOpen(false);
  };

  return (
    <div className="bg-white border-b border-outline-variant px-10 py-3 flex items-center relative z-[200] isolate overflow-visible">
      <div className="flex items-center gap-6 flex-nowrap">
        {/* Toggle Sidebar Button */}
        <button
          onClick={onToggleCompact}
          className="p-2 hover:bg-surface-dim rounded-lg transition-colors flex-shrink-0"
          title={isCompactSidebar ? 'Show full sidebar' : 'Show compact sidebar'}
        >
          <Menu className="w-5 h-5 text-on-surface-variant" />
        </button>

        {/* Search Input */}
        <div className="relative flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search my tasks..."
            value={currentFilters.query || ''}
            onChange={(e) => onFilterChange({ ...currentFilters, query: e.target.value })}
            className="bg-white border border-[#2f6bff]/30 focus:border-[#2f6bff]/50 shadow-sm rounded-full py-2 pl-10 pr-4 w-64 outline-none transition-all placeholder:text-on-surface-variant/60 font-sans text-[14px]"
          />
        </div>

        {/* Category Filter */}
        <div className="relative flex-shrink-0" ref={categoryRef}>
          <div
            onClick={() => {
              setIsCategoryOpen(!isCategoryOpen);
              setIsStatusOpen(false);
              setIsPriceOpen(false);
              setIsSortOpen(false);
            }}
            className={`flex items-center gap-2 font-sans text-[13px] font-semibold cursor-pointer transition-colors whitespace-nowrap ${
              isCategoryOpen ? 'text-[#2f6bff]' : 'text-black/70 hover:text-[#2f6bff]'
            }`}
          >
            Category
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
                    className="text-primary font-bold font-sans text-[14px] font-normal leading-[20px] hover:underline"
                  >
                    Clear all
                  </button>
                </div>

                <div className="relative mb-8">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <input
                    type="text"
                    placeholder="Search categories"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#f1f4f9] border border-transparent focus:border-primary/30 rounded-full py-3.5 pl-12 pr-4 outline-none transition-all placeholder:text-on-surface-variant/60"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-3 sm:gap-y-4 max-h-[300px] sm:max-h-[350px] md:max-h-[400px] overflow-y-auto px-1 mb-6 sm:mb-8 scrollbar-thin scrollbar-thumb-outline-variant">
                  {filteredCategoriesLabels.map((cat) => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group whitespace-normal">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name="category"
                          checked={draftCategory === cat}
                          onChange={() => setDraftCategory(cat)}
                          className="peer appearance-none w-5 h-5 border-2 border-outline-variant rounded bg-white checked:bg-primary checked:border-primary transition-all cursor-pointer"
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
                      <span className="font-sans text-[16px] font-normal leading-[24px] text-on-surface group-hover:text-primary transition-colors font-medium">
                        {cat}
                      </span>
                    </label>
                  ))}
                  {filteredCategoriesLabels.length === 0 && (
                    <div className="col-span-2 py-8 text-center text-on-surface-variant font-sans text-[16px] font-normal leading-[24px] italic">
                      No categories found matching "{searchQuery}"
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setIsCategoryOpen(false)}
                    className="text-primary font-bold font-sans text-[16px] font-normal leading-[24px] hover:underline px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyCategories}
                    className="text-primary font-extrabold font-sans text-[16px] font-normal leading-[24px] hover:underline px-4 py-2"
                  >
                    Apply
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Filter */}
        <div className="relative flex-shrink-0" ref={statusRef}>
          <div
            onClick={() => {
              setIsStatusOpen(!isStatusOpen);
              setIsCategoryOpen(false);
              setIsPriceOpen(false);
              setIsSortOpen(false);
            }}
            className={`flex items-center gap-2 font-sans text-[13px] font-semibold cursor-pointer transition-colors whitespace-nowrap ${
              isStatusOpen ? 'text-[#2f6bff]' : 'text-black/70 hover:text-[#2f6bff]'
            }`}
          >
            Status {currentFilters.status ? `(${STATUS_OPTIONS.find(s => s.value === currentFilters.status)?.label})` : ''}
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isStatusOpen ? 'rotate-180' : ''}`} />
          </div>

          <AnimatePresence>
            {isStatusOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-0 mt-2 w-full sm:w-[280px] md:w-[320px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-outline-variant z-[300] p-2 sm:p-3 cursor-default"
                style={{ transformOrigin: 'top left' }}
              >
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setDraftStatus(undefined);
                      onFilterChange({ ...currentFilters, status: undefined });
                      setIsStatusOpen(false);
                    }}
                    className={`w-full text-left px-5 py-4 rounded-2xl font-semibold font-sans text-[16px] font-normal leading-[24px] transition-all ${
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
                        onClick={() => {
                          setDraftStatus(option.value as any);
                          onFilterChange({ ...currentFilters, status: option.value as any });
                          setIsStatusOpen(false);
                        }}
                        className={`w-full text-left px-5 py-4 rounded-2xl font-semibold font-sans text-[16px] font-normal leading-[24px] transition-all ${
                          isSelected ? 'bg-[#f1f4f9] text-[#000d45]' : 'text-[#000d45] hover:bg-[#f1f4f9]/50'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Price Filter */}
        <div className="relative flex-shrink-0" ref={priceRef}>
          <div
            onClick={() => {
              setIsPriceOpen(!isPriceOpen);
              setIsCategoryOpen(false);
              setIsStatusOpen(false);
              setIsSortOpen(false);
            }}
            className={`flex items-center gap-2 font-sans text-[13px] font-semibold cursor-pointer transition-colors whitespace-nowrap ${
              isPriceOpen ? 'text-[#2f6bff]' : 'text-black/70 hover:text-[#2f6bff]'
            }`}
          >
            Any price
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
                        ${draftBudgetMin} - ${draftBudgetMax.toLocaleString()}
                      </span>
                    </div>

                    <div className="relative h-2 bg-[#f1f4f9] rounded-full mt-4">
                      <div
                        className="absolute h-full bg-primary rounded-full"
                        style={{
                          left: `${(draftBudgetMin / 10000) * 100}%`,
                          right: `${100 - (draftBudgetMax / 10000) * 100}%`
                        }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        value={draftBudgetMin}
                        onChange={(e) => setDraftBudgetMin(Math.min(parseFloat(e.target.value), draftBudgetMax - 100))}
                        className="absolute w-full h-full appearance-none bg-transparent pointer-events-auto cursor-pointer accent-primary"
                        style={{ zIndex: 3 }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        value={draftBudgetMax}
                        onChange={(e) => setDraftBudgetMax(Math.max(parseFloat(e.target.value), draftBudgetMin + 100))}
                        className="absolute w-full h-full appearance-none bg-transparent pointer-events-auto cursor-pointer accent-primary"
                        style={{ zIndex: 4 }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => setIsPriceOpen(false)}
                      className="text-primary font-bold font-sans text-[16px] font-normal leading-[24px] hover:underline px-4 py-2"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApplyPrice}
                      className="text-primary font-extrabold font-sans text-[16px] font-normal leading-[24px] hover:underline px-4 py-2"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sort */}
        <div className="relative flex-shrink-0" ref={sortRef}>
          <div
            onClick={() => {
              setIsSortOpen(!isSortOpen);
              setIsCategoryOpen(false);
              setIsStatusOpen(false);
              setIsPriceOpen(false);
            }}
            className={`flex items-center gap-2 font-sans text-[13px] font-semibold cursor-pointer transition-colors whitespace-nowrap ${
              isSortOpen ? 'text-[#2f6bff]' : 'text-black/70 hover:text-[#2f6bff]'
            }`}
          >
            <ArrowUpDown className="w-4 h-4" />
            Sort
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
                  ].map((option) => {
                    const Icon = option.icon;
                    const isSelected = currentFilters.sort_by === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleSortChange(option.id)}
                        className={`w-full text-left px-5 py-4 rounded-2xl font-semibold font-sans text-[16px] font-normal leading-[24px] transition-all flex items-center gap-4 ${
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
      </div>
    </div>
  );
}
