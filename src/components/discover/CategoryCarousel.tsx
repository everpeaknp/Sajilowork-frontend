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
    <div className="w-full bg-[#E7F0FF] py-10 border-y border-blue-100/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-left">
        {/* Header with Navigation arrows */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`${landingHeadline} text-xl sm:text-2xl text-[#03113c]`}>
              Our top categories
            </h2>
            <p className="text-xs text-gray-600 mt-1 font-medium">
              Find the exact help you need on Airtasker right now.
            </p>
          </div>

          {/* Scrolling slide buttons */}
          <div className="flex items-center space-x-2">
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

        {/* Horizontal List viewport */}
        <div
          ref={scrollRef}
          className="flex items-center space-x-3.5 overflow-x-auto no-scrollbar pb-2.5 snap-x"
        >
          {CATEGORIES.map((cat) => {
            const IconComponent = IconMap[cat.iconName] || Wrench;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.name)}
                className="snap-start flex items-center space-x-3 rounded-full border border-blue-100 hover:border-[#005fff] hover:bg-[#005fff]/5 transition px-5 py-3 cursor-pointer select-none bg-white text-gray-800 hover:shadow-xs active:scale-95 shrink-0"
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
  );
}

