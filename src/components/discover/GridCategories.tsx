'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  Briefcase,
  Laptop,
  Hammer,
  Wrench,
  Palette,
  Camera,
  Music,
  Sprout,
  Compass,
  Sparkles,
  Truck,
  Paintbrush,
} from 'lucide-react';
import { GRID_CATEGORIES } from './mockData';
import { landingHeadline, landingHeadlineSm } from '@/components/LangingHome/landingTypography';

interface GridCategoriesProps {
  onSelectGridCategory: (name: string) => void;
}

const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase,
  Laptop,
  Hammer,
  Wrench,
  Palette,
  Camera,
  Music,
  Sprout,
  Compass,
  Sparkles,
  Truck,
  Paintbrush,
};

export default function GridCategories({ onSelectGridCategory }: GridCategoriesProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 120,
        damping: 15,
      },
    },
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 text-left sm:px-6 sm:py-16 lg:px-8">
      {/* Sleek, Premium Header */}
      <div className="mb-6 max-w-3xl sm:mb-10">
        <span className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-[#005fff] sm:mb-2.5 sm:text-[11px]">
          Professional Services
        </span>
        <h2
          className={`${landingHeadline} text-2xl leading-tight text-[#03113c] text-balance sm:text-4xl`}
        >
          Explore specialized services
        </h2>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed font-medium text-gray-500 sm:mt-2.5 sm:text-[14px]">
          From speedy everyday tasks to custom programming. Describe what you need, post for free,
          and receive responses from fully verified specialists instantly.
        </p>
      </div>

      {/* Modern Seamless Premium 6x2 Grid Layout */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4 lg:grid-cols-6"
      >
        {GRID_CATEGORIES.map((grid) => {
          const IconComponent = IconMap[grid.iconName] || Compass;

          return (
            <motion.button
              key={grid.id}
              variants={itemVariants}
              type="button"
              onClick={() => onSelectGridCategory(grid.name)}
              className="group relative flex min-h-[96px] cursor-pointer select-none flex-col items-center justify-center overflow-hidden rounded-xl bg-[#F3F3F7] p-3 text-center transition-all duration-300 hover:bg-[#EAEAEF] focus:outline-hidden focus:ring-2 focus:ring-[#005fff]/40 active:scale-[0.98] sm:min-h-[115px] sm:rounded-2xl sm:p-4"
            >
              {/* Centered Modern Icon (Pure Black, No white background) */}
              <div className="mb-2 shrink-0 text-black transition-all duration-300 group-hover:scale-110 sm:mb-2.5">
                <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>

              {/* Centered Title (Pure Black) */}
              <div className="w-full px-0.5">
                <h3
                  className={`${landingHeadlineSm} line-clamp-2 text-[11px] leading-tight text-black transition-colors duration-200 group-hover:text-[#005fff] sm:text-sm`}
                >
                  {grid.name}
                </h3>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}

