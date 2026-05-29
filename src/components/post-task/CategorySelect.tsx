'use client';

import { useMemo, useState } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import type { Category } from '@/types';
import { flattenCategoriesForSelect } from '@/lib/taskUtils';

type CategorySelectProps = {
  categories: Category[];
  categoriesLoaded: boolean;
  value: string;
  onChange: (categoryId: string, categoryName: string) => void;
  showError?: boolean;
  error?: string;
};

export function CategorySelect({
  categories,
  categoriesLoaded,
  value,
  onChange,
  showError,
  error,
}: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const options = useMemo(() => flattenCategoriesForSelect(categories), [categories]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.name.toLowerCase().includes(q));
  }, [options, query]);

  const selected = options.find((o) => o.id === value);

  const handlePick = (id: string, name: string) => {
    onChange(id, name);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="relative">
      <label className="mb-4 block text-[15px] font-bold text-gray-800">
        What category best fits this task?
      </label>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex min-h-[52px] w-full items-center justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-3.5 text-left shadow-sm outline-none transition-all sm:px-5 ${
          showError && error
            ? 'ring-2 ring-[#ff4d00]'
            : open
              ? 'ring-2 ring-[#0066ff]'
              : 'focus-visible:ring-2 focus-visible:ring-[#0066ff]'
        }`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span
          className={`truncate text-base sm:text-lg ${
            selected ? 'font-semibold text-gray-900' : 'font-medium text-gray-400'
          }`}
        >
          {!categoriesLoaded
            ? 'Loading categories…'
            : selected
              ? selected.name
              : 'Select a category'}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {showError && error ? (
        <p className="mt-2 text-[13px] font-bold text-[#ff4d00]">{error}</p>
      ) : null}

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-black/20 sm:bg-transparent"
            aria-label="Close category list"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-50 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl sm:absolute sm:left-0 sm:right-0 sm:top-full lg:max-h-none">
            <div className="border-b border-gray-100 p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search categories"
                  className="w-full rounded-xl bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none ring-[#0066ff] focus:ring-2"
                  autoFocus
                />
              </div>
            </div>
            <ul
              role="listbox"
              className="max-h-[min(280px,50dvh)] overflow-y-auto overscroll-contain p-2 lg:max-h-80"
            >
              {!categoriesLoaded ? (
                <li className="px-3 py-6 text-center text-sm text-gray-500">
                  Loading categories…
                </li>
              ) : filtered.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm italic text-gray-500">
                  {query.trim()
                    ? `No categories matching "${query.trim()}"`
                    : 'No categories available'}
                </li>
              ) : (
                filtered.map((option) => {
                  const isSelected = option.id === value;
                  return (
                    <li key={option.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handlePick(option.id, option.name)}
                        className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-3 text-left text-[15px] font-medium transition-colors ${
                          isSelected
                            ? 'bg-blue-50 text-[#0066ff]'
                            : 'text-gray-800 hover:bg-gray-50'
                        }`}
                      >
                        <span className="min-w-0 truncate">{option.name}</span>
                        {isSelected ? (
                          <Check className="h-4 w-4 shrink-0 stroke-[3]" />
                        ) : null}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
