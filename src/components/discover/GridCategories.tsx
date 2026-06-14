'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { discoverBody, discoverHeadline, discoverMedium } from '@/components/LangingHome/landingTypography';

interface Category {
  id: string;
  title: string;
  skillsCount: string;
  image: string;
}

const CATEGORIES_DATA: Category[] = [
  {
    id: 'cat-1',
    title: 'Development & IT',
    skillsCount: '240+ taskers',
    image:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'cat-2',
    title: 'Design & Creative',
    skillsCount: '180+ taskers',
    image:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'cat-3',
    title: 'Digital Marketing',
    skillsCount: '95+ taskers',
    image:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'cat-4',
    title: 'Writing & Translation',
    skillsCount: '120+ taskers',
    image:
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'cat-5',
    title: 'Music & Audio',
    skillsCount: '60+ taskers',
    image:
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'cat-6',
    title: 'Video & Animation',
    skillsCount: '75+ taskers',
    image:
      'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'cat-7',
    title: 'Engineering & Architecture',
    skillsCount: '110+ taskers',
    image:
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'cat-8',
    title: 'Finance & Accounting',
    skillsCount: '85+ taskers',
    image:
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=300',
  },
];

interface GridCategoriesProps {
  className?: string;
  onSelectGridCategory?: (categoryTitle: string) => void;
  onCategoryClick?: (categoryTitle: string) => void;
}

export default function GridCategories({
  className = '',
  onSelectGridCategory,
  onCategoryClick,
}: GridCategoriesProps) {
  const handleCategoryClick = (title: string) => {
    onCategoryClick?.(title);
    onSelectGridCategory?.(title);
  };

  return (
    <section
      className={`overflow-hidden bg-white px-4 py-12 sm:px-6 sm:py-16 md:px-8 lg:px-12 xl:px-16 ${className}`}
      style={{ backgroundColor: '#ffffff' }}
    >
      <div className="mx-auto w-full max-w-7xl bg-white">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2
              className={`${discoverHeadline} mb-2 text-2xl leading-tight text-[#131118] sm:text-3xl`}
            >
              Browse talent by category
            </h2>
            <p className={`${discoverBody} text-sm text-[#5e586c] sm:text-base`}>
              Get inspiration from hundreds of local skills and services
            </p>
          </div>

          <motion.button
            type="button"
            onClick={() => handleCategoryClick('All')}
            className={`${discoverMedium} group flex cursor-pointer items-center gap-1.5 self-start whitespace-nowrap text-left text-xs text-[#131118] transition-colors hover:text-emerald-700 sm:self-auto sm:text-sm`}
            whileHover={{ x: 2 }}
          >
            <span>All Categories</span>
            <ArrowRight className="h-4 w-4 stroke-[1.5] transition-transform group-hover:translate-x-1" />
          </motion.button>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-10 md:gap-y-12 lg:grid-cols-4">
          {CATEGORIES_DATA.map((cat, idx) => (
            <motion.button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat.title)}
              className="group flex cursor-pointer items-center gap-4 text-left"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              whileHover={{ y: -2 }}
            >
              <div className="relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-lg bg-white shadow-sm">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex min-w-0 flex-col justify-center">
                <h3
                  className={`${discoverBody} truncate text-sm text-[#131118] transition-colors group-hover:text-emerald-700 sm:text-base`}
                >
                  {cat.title}
                </h3>
                <span
                  className={`${discoverBody} mt-0.5 text-xs tracking-wide text-[#a49faf]`}
                >
                  {cat.skillsCount}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
