'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  discoverBody,
  discoverHeadline,
  discoverMedium,
} from '@/components/LangingHome/landingTypography';

interface BlogPost {
  id: number;
  image: string;
  date: string;
  title: string;
  description: string;
  href?: string;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    image:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=600',
    date: 'December 2, 2022',
    title: 'Start an online business and work from home',
    description: 'A complete guide to starting a small business online',
  },
  {
    id: 2,
    image:
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=600',
    date: 'December 2, 2022',
    title: 'Front becomes an official Instagram Marketing Partner',
    description: 'A complete guide to starting a small business online',
  },
  {
    id: 3,
    image:
      'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&q=80&w=600',
    date: 'December 2, 2022',
    title: 'Start an online business and work from home right now',
    description: 'A complete guide to starting a small business online',
  },
  {
    id: 4,
    image:
      'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&q=80&w=600',
    date: 'December 2, 2022',
    title: 'Start an online business and work from home with complete guide.',
    description: 'A complete guide to starting a small business online',
  },
];

interface OurBlogProps {
  className?: string;
}

export default function OurBlog({ className = '' }: OurBlogProps) {
  return (
    <section
      id="blog-section"
      className={`border-t border-neutral-100 bg-white px-4 py-16 sm:px-8 sm:py-24 lg:px-12 xl:px-16 ${className}`}
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-14">
          <motion.h2
            className={`${discoverHeadline} text-3xl leading-tight text-brand-dark sm:text-4xl lg:text-[40px]`}
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Insights & Guides
          </motion.h2>
          <motion.p
            className={`${discoverBody} mt-3 text-base text-neutral-500`}
            initial={{ opacity: 0, y: -5 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Tips and stories to help you get more done on Sajilowork
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {BLOG_POSTS.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="h-full"
            >
              <Link
                href={post.href ?? '/blog'}
                className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-neutral-200 hover:shadow-md hover:no-underline"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                  <div className="absolute inset-0 bg-brand-dark/0 transition-colors duration-300 group-hover:bg-brand-dark/5 z-10"></div>
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <span className={`${discoverMedium} text-[11px] uppercase tracking-wider text-brand-emerald`}>
                    {post.date}
                  </span>

                  <h3
                    className={`${discoverHeadline} mt-3 line-clamp-2 text-[17px] leading-snug text-brand-dark transition-colors duration-200 group-hover:text-brand-emerald`}
                  >
                    {post.title}
                  </h3>

                  <p
                    className={`${discoverBody} mt-3 line-clamp-2 text-sm leading-relaxed text-neutral-500`}
                  >
                    {post.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
