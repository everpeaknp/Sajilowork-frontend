'use client';

import React, { useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sprout,
  Paintbrush,
  Sparkles,
  Truck,
  Wrench,
  PenTool,
  FileText,
  Hammer,
} from 'lucide-react';
import { CATEGORIES } from './mockData';
import { landingHeadline, landingHeadlineSm } from '@/components/LangingHome/landingTypography';

interface CategoryCarouselProps {
  onSelectCategory: (categoryName: string) => void;
}

const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sprout,
  Paintbrush,
  Sparkles,
  Truck,
  Wrench,
  PenTool,
  FileText,
  Hammer,
};

export default function CategoryCarousel({ onSelectCategory }: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -250, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 250, behavior: 'smooth' });
  };

  return (
    <div className="w-full border-y border-blue-100/50 bg-[#E7F0FF] py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 text-left sm:px-6 lg:px-8">
        {/* Header with Navigation arrows */}
        <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 pr-2">
            <h2 className={`${landingHeadline} text-lg text-[#03113c] sm:text-2xl`}>
              Our top categories
            </h2>
            <p className="mt-1 text-xs font-medium text-gray-600 sm:text-sm">
              Find the exact help you need on tasknepal right now.
            </p>
          </div>

          {/* Scrolling slide buttons — hidden on xs; swipe to scroll */}
          <div className="hidden shrink-0 items-center space-x-2 sm:flex">
            <button
              type="button"
              onClick={scrollLeft}
              className="p-1.5 rounded-full border border-blue-200/60 bg-white hover:bg-gray-50 hover:border-blue-400 transition cursor-pointer text-gray-700 active:scale-90 shadow-2xs"
              aria-label="Scroll categories left"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              onClick={scrollRight}
              className="p-1.5 rounded-full border border-blue-200/60 bg-white hover:bg-gray-50 hover:border-blue-400 transition cursor-pointer text-gray-700 active:scale-90 shadow-2xs"
              aria-label="Scroll categories right"
            >
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Horizontal List viewport — edge-to-edge scroll on mobile */}
        <div className="-mx-4 sm:mx-0">
          <div
            ref={scrollRef}
            className="flex items-center gap-3 overflow-x-auto overscroll-x-contain px-4 pb-2 no-scrollbar snap-x snap-mandatory sm:gap-3.5 sm:px-0"
          >
          {CATEGORIES.map((cat) => {
            const IconComponent = IconMap[cat.iconName] || Wrench;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.name)}
                className="flex min-h-11 shrink-0 snap-start cursor-pointer select-none items-center space-x-2.5 rounded-full border border-blue-100 bg-white px-4 py-2.5 text-gray-800 transition hover:border-[#005fff] hover:bg-[#005fff]/5 hover:shadow-xs active:scale-95 sm:space-x-3 sm:px-5 sm:py-3"
              >
                <div className="h-7 w-7 rounded-full bg-[#005fff]/5 flex items-center justify-center text-[#005fff] shrink-0">
                  <IconComponent className="h-4 w-4" />
                </div>
                <span className={`${landingHeadlineSm} text-xs text-gray-900`}>{cat.name}</span>
              </button>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
}

