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
      className={`border-t border-neutral-100 bg-white px-4 py-12 sm:px-8 sm:py-20 lg:px-12 xl:px-16 ${className}`}
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-12">
          <motion.h2
            className={`${discoverHeadline} text-2xl leading-tight text-[#131118] sm:text-3xl md:text-4xl`}
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Our Blog
          </motion.h2>
          <motion.p
            className={`${discoverBody} mt-2 text-sm text-neutral-500 sm:text-base`}
            initial={{ opacity: 0, y: -5 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Aliquam lacinia diam quis lacus euismod
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-4 lg:gap-8">
          {BLOG_POSTS.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Link
                href={post.href ?? '/blog'}
                className="group flex cursor-pointer flex-col hover:no-underline"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-neutral-100">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="mt-4 flex flex-col">
                  <span className={`${discoverBody} text-[12px] leading-none text-neutral-400 sm:text-[13px]`}>
                    {post.date}
                  </span>

                  <h3
                    className={`${discoverMedium} mt-2.5 line-clamp-2 min-h-[44px] text-[15px] leading-snug tracking-tight text-[#131118] transition-colors duration-200 group-hover:text-[#4bbb80] sm:text-[16px]`}
                  >
                    {post.title}
                  </h3>

                  <p
                    className={`${discoverBody} line-clamp-2 text-[13px] leading-relaxed text-neutral-500 sm:text-[14px]`}
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
