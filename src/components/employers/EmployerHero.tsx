'use client';

import type { FormEvent } from 'react';
import { Search } from 'lucide-react';

interface EmployerHeroProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearchSubmit: (e: FormEvent) => void;
}

export default function EmployerHero({ searchQuery, onSearchQueryChange, onSearchSubmit }: EmployerHeroProps) {
  return (
    <section className="select-none bg-white px-4 pb-8 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div
          id="employer-banner-box"
          className="relative flex h-auto flex-col items-center justify-between gap-8 overflow-hidden rounded-[24px] border border-neutral-200/40 bg-[#f6f5f0] p-6 shadow-sm sm:p-8 md:flex-row md:p-10"
        >
      <div className="relative z-10 w-full flex-1 space-y-5">
        <div className="space-y-1.5">
          <h1
            className="text-3xl font-black leading-none tracking-tight text-[#193E32] sm:text-4xl"
            id="employer-title-label"
          >
            Employer List
          </h1>
          <p className="max-w-lg text-xs font-medium leading-relaxed text-neutral-500 sm:text-sm">
            Explore and filter premium tech platforms, design agencies, and verified global business leaders.
          </p>
        </div>

        <form
          onSubmit={onSearchSubmit}
          className="flex w-full max-w-2xl flex-col items-stretch gap-2 rounded-2xl border border-neutral-200/80 bg-white p-2 shadow-md sm:flex-row sm:items-center"
        >
          <div className="flex flex-1 items-center gap-2 px-3">
            <Search className="h-4 w-4 shrink-0 text-neutral-400" strokeWidth={2.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="What company are you looking for?"
              className="w-full border-none bg-transparent py-2.5 text-xs font-medium text-neutral-800 outline-none placeholder:text-neutral-400 focus:outline-none focus:ring-0 sm:text-sm"
            />
          </div>

          <button
            type="submit"
            className="shrink-0 cursor-pointer rounded-xl bg-[#1C3F35] px-6 py-3 text-center text-xs font-bold text-white shadow-sm transition-all hover:bg-[#153129]"
          >
            Search
          </button>
        </form>
      </div>

      <div className="relative hidden h-[150px] w-full max-w-[320px] flex-shrink-0 items-center justify-center overflow-hidden sm:flex md:w-[40%]">
        <svg className="relative z-20 h-full w-full" viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <rect x="70" y="80" width="100" height="75" rx="4" fill="white" stroke="#D1D5DB" strokeWidth="1.5" />
          <line x1="70" y1="95" x2="170" y2="95" stroke="#D1D5DB" strokeWidth="1.5" />
          <circle cx="82" cy="88" r="3" fill="#EF4444" />
          <circle cx="92" cy="88" r="3" fill="#F59E0B" />
          <circle cx="102" cy="88" r="3" fill="#10B981" />
          <rect x="80" y="105" width="80" height="6" rx="2" fill="#E5E7EB" />
          <rect x="80" y="117" width="60" height="6" rx="2" fill="#E5E7EB" />
          <rect x="350" y="165" width="28" height="35" rx="4" fill="#1F2937" />
          <path d="M378,172 C386,172 386,188 378,188" stroke="#1F2937" strokeWidth="3" fill="none" />
          <circle cx="295" cy="155" r="30" fill="#FFE4E6" />
          <path d="M265,155 C265,120 325,120 325,155 Z" fill="#1F2937" />
          <circle cx="282" cy="155" r="9" stroke="#991B1B" strokeWidth="2" fill="none" />
          <circle cx="308" cy="155" r="9" stroke="#991B1B" strokeWidth="2" fill="none" />
        </svg>
      </div>

      <div className="pointer-events-none absolute left-0 top-0 h-48 w-24 -translate-x-12 rounded-full bg-emerald-400/10 blur-xl" />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-20 w-32 bg-amber-300/20"
        style={{ borderRadius: '0 100% 0 0' }}
      />
        </div>
      </div>
    </section>
  );
}
