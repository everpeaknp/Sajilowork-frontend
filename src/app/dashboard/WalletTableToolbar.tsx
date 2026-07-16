'use client';

import { Filter, Search } from 'lucide-react';

export type WalletTableFilterOption = {
  value: string;
  label: string;
};

const DEFAULT_FILTER_OPTIONS: WalletTableFilterOption[] = [
  { value: 'All', label: 'All Statuses' },
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
];

interface WalletTableToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  filterStatus: string;
  onFilterChange: (value: string) => void;
  filterOptions?: WalletTableFilterOption[];
  filterLabel?: string;
  hidePrimaryFilter?: boolean;
  secondaryFilterStatus?: string;
  onSecondaryFilterChange?: (value: string) => void;
  secondaryFilterOptions?: WalletTableFilterOption[];
  secondaryFilterLabel?: string;
}

const FILTER_SHELL_CLASS =
  'flex w-full items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs sm:w-auto dark:border-neutral-700 dark:bg-neutral-900';

const FILTER_SELECT_CLASS =
  'max-w-[220px] cursor-pointer border-none bg-white p-0 font-bold text-neutral-800 outline-none focus:outline-none focus:ring-0 dark:bg-neutral-900 dark:text-stone-100 dark:[color-scheme:dark]';

const FILTER_OPTION_CLASS = 'bg-white text-neutral-800 dark:bg-neutral-900 dark:text-stone-100';

export default function WalletTableToolbar({
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  filterStatus,
  onFilterChange,
  filterOptions = DEFAULT_FILTER_OPTIONS,
  filterLabel = 'Payment Status:',
  hidePrimaryFilter = false,
  secondaryFilterStatus,
  onSecondaryFilterChange,
  secondaryFilterOptions,
  secondaryFilterLabel = 'Status:',
}: WalletTableToolbarProps) {
  return (
    <div className="mx-auto mb-5 flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex w-full items-center rounded-xl border border-neutral-200/80 bg-white px-3.5 shadow-sm sm:w-[260px] dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full border-0 bg-transparent py-3 text-xs font-normal text-neutral-800 outline-none placeholder:text-neutral-400 focus:outline-none focus:ring-0 dark:bg-transparent dark:text-stone-100 dark:placeholder:text-neutral-500"
        />
        <Search className="ml-1.5 h-4 w-4 shrink-0 text-neutral-400" strokeWidth={2} />
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
        {!hidePrimaryFilter ? (
          <div className={FILTER_SHELL_CLASS}>
            <Filter className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
            <span className="shrink-0 font-normal text-neutral-500 dark:text-neutral-400">
              {filterLabel}
            </span>
            <select
              value={filterStatus}
              onChange={(e) => onFilterChange(e.target.value)}
              className={FILTER_SELECT_CLASS}
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value} className={FILTER_OPTION_CLASS}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        {secondaryFilterOptions && onSecondaryFilterChange ? (
          <div className={FILTER_SHELL_CLASS}>
            <Filter className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
            <span className="shrink-0 font-normal text-neutral-500 dark:text-neutral-400">
              {secondaryFilterLabel}
            </span>
            <select
              value={secondaryFilterStatus ?? 'all'}
              onChange={(e) => onSecondaryFilterChange(e.target.value)}
              className={FILTER_SELECT_CLASS}
            >
              {secondaryFilterOptions.map((option) => (
                <option key={option.value} value={option.value} className={FILTER_OPTION_CLASS}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>
    </div>
  );
}
