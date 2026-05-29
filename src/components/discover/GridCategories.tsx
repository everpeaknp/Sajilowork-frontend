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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 w-full text-left">
      {/* Sleek, Premium Header */}
      <div className="mb-10 max-w-3xl">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#005fff] mb-2.5 block">
          Professional Services
        </span>
        <h2
          className={`${landingHeadline} text-3xl sm:text-4xl text-[#03113c] leading-tight`}
        >
          Explore specialized services
        </h2>
        <p className="text-[13px] sm:text-[14px] text-gray-500 mt-2.5 leading-relaxed font-medium max-w-2xl">
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
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
      >
        {GRID_CATEGORIES.map((grid) => {
          const IconComponent = IconMap[grid.iconName] || Compass;

          return (
            <motion.button
              key={grid.id}
              variants={itemVariants}
              type="button"
              onClick={() => onSelectGridCategory(grid.name)}
              className="group relative bg-[#F3F3F7] rounded-2xl p-4 hover:bg-[#EAEAEF] transition-all duration-300 cursor-pointer text-center flex flex-col items-center justify-center h-[115px] select-none overflow-hidden focus:outline-hidden focus:ring-2 focus:ring-[#005fff]/40"
            >
              {/* Centered Modern Icon (Pure Black, No white background) */}
              <div className="text-black transition-all duration-300 group-hover:scale-110 mb-2.5 shrink-0">
                <IconComponent className="h-6 w-6" />
              </div>

              {/* Centered Title (Pure Black) */}
              <div className="w-full">
                <h3
                  className={`${landingHeadlineSm} text-xs sm:text-sm text-black leading-tight group-hover:text-[#005fff] transition-colors duration-200`}
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

