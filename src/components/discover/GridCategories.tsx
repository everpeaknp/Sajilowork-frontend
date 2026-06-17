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
      className={`overflow-hidden bg-[#fafaf9] px-4 py-16 sm:px-6 sm:py-24 md:px-8 lg:px-12 xl:px-16 ${className}`}
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <motion.h2
              className={`${discoverHeadline} mb-3 text-3xl leading-tight text-brand-dark sm:text-4xl`}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Browse talent by category
            </motion.h2>
            <motion.p 
              className={`${discoverBody} text-base text-neutral-500`}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Get inspiration from hundreds of local skills and services
            </motion.p>
          </div>

          <motion.button
            type="button"
            onClick={() => handleCategoryClick('All')}
            className={`${discoverMedium} group flex cursor-pointer items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm text-brand-dark shadow-sm ring-1 ring-neutral-200 transition-all hover:bg-neutral-50 hover:shadow-md hover:ring-neutral-300`}
            initial={{ opacity: 0, x: 15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span>View All Categories</span>
            <ArrowRight className="h-4 w-4 stroke-[1.5] transition-transform group-hover:translate-x-1" />
          </motion.button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES_DATA.map((cat, idx) => (
            <motion.button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat.title)}
              className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-neutral-100 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-neutral-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <div className="relative h-32 w-full overflow-hidden bg-neutral-100">
                <div className="absolute inset-0 z-10 bg-brand-dark/5 transition-colors duration-300 group-hover:bg-transparent"></div>
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex w-full flex-col p-5">
                <h3
                  className={`${discoverHeadline} text-[17px] text-brand-dark transition-colors group-hover:text-brand-emerald`}
                >
                  {cat.title}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                  <span
                    className={`${discoverBody} text-[13px] font-medium text-neutral-500`}
                  >
                    {cat.skillsCount}
                  </span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-50 text-neutral-400 transition-colors duration-300 group-hover:bg-brand-emerald group-hover:text-white">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
