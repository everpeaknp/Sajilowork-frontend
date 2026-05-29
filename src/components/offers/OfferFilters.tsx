'use client';

/**
 * OfferFilters Component
 * 
 * Filter and sort controls for offer list
 */

import { Filter, SortAsc, X } from 'lucide-react';

type FilterStatus = 'all' | 'pending' | 'accepted' | 'rejected';
type SortOption = 'amount' | '-amount' | 'created_at' | '-created_at' | 'rating' | '-rating';

interface OfferFiltersProps {
  filterStatus: FilterStatus;
  sortBy: SortOption;
  minAmount?: number;
  maxAmount?: number;
  onFilterStatusChange: (status: FilterStatus) => void;
  onSortByChange: (sort: SortOption) => void;
  onMinAmountChange: (amount: number | undefined) => void;
  onMaxAmountChange: (amount: number | undefined) => void;
  onReset: () => void;
}

export function OfferFilters({
  filterStatus,
  sortBy,
  minAmount,
  maxAmount,
  onFilterStatusChange,
  onSortByChange,
  onMinAmountChange,
  onMaxAmountChange,
  onReset,
}: OfferFiltersProps) {
  const hasActiveFilters = filterStatus !== 'all' || minAmount !== undefined || maxAmount !== undefined || sortBy !== '-created_at';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <div className="flex gap-1">
            {(['all', 'pending', 'accepted', 'rejected'] as FilterStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => onFilterStatusChange(status)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors capitalize ${
                  filterStatus === status
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Amount Range */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Amount:</span>
          <input
            type="number"
            placeholder="Min"
            value={minAmount || ''}
            onChange={(e) => onMinAmountChange(e.target.value ? Number(e.target.value) : undefined)}
            className="w-24 px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <span className="text-gray-500">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxAmount || ''}
            onChange={(e) => onMaxAmountChange(e.target.value ? Number(e.target.value) : undefined)}
            className="w-24 px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 ml-auto">
          <SortAsc className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as SortOption)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="-created_at">Newest First</option>
            <option value="created_at">Oldest First</option>
            <option value="amount">Lowest Price</option>
            <option value="-amount">Highest Price</option>
            <option value="-rating">Highest Rated</option>
            <option value="rating">Lowest Rated</option>
          </select>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            <X className="h-4 w-4" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
