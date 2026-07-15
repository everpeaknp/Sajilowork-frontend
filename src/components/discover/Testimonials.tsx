'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  discoverBody,
  discoverHeadline,
  discoverMedium,
} from '@/components/LangingHome/landingTypography';

interface TestimonialItem {
  id: number;
  quote: string;
  author: string;
  role: string;
  avatar: string;
}

const testimonials: TestimonialItem[] = [
  {
    id: 1,
    quote:
      "Our family embarked on a remarkable bullet train journey in Japan – this hotel's convenient location made it a breeze. Agoda's pricing was fantastic.",
    author: 'Emma Johnson',
    role: 'Product Manager, Apple Inc',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120',
  },
  {
    id: 2,
    quote:
      'The interface of SajiloWork is incredibly intuitive and clean. We hired three talented developers in less than a week, and all of them delivered exceptional quality.',
    author: 'David Lee',
    role: 'Chief Technology Officer, Stripe',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120',
  },
  {
    id: 3,
    quote:
      'Fantastic support, secure escrow payment flow, and access to top-tier global talent. SajiloWork has completely reformed our remote team workflow.',
    author: 'Marcus Aurelius',
    role: 'Operations Lead, Nike',
    avatar:
      'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=120&h=120',
  },
  {
    id: 4,
    quote:
      "I've been working as a freelance UI/UX designer on SajiloWork for two years, and the steady stream of high-quality clients has allowed me to double my income.",
    author: 'Samantha R.',
    role: 'Senior Product Designer',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120&h=120',
  },
  {
    id: 5,
    quote:
      'The peace of mind knowing that payments are protected is priceless. Our project milestones were perfectly met and verified through their secure portal.',
    author: 'Alex Rivera',
    role: 'Founder, Veloce Studios',
    avatar:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120&h=120',
  },
];

interface TestimonialsProps {
  className?: string;
}

export default function Testimonials({ className = '' }: TestimonialsProps) {
  // Duplicate the array to create a seamless infinite loop
  const loopingTestimonials = [...testimonials, ...testimonials, ...testimonials];

  return (
    <section
      id="testimonials-section"
      className={`relative z-[1] flex select-none flex-col items-center justify-center bg-[#fdfdfc] px-4 py-20 sm:py-28 dark:bg-neutral-950 ${className}`}
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-12 text-center sm:mb-16">
          <motion.h2
            id="testimonials-title"
            className={`${discoverHeadline} mb-4 text-3xl text-brand-dark sm:text-4xl lg:text-[44px] dark:text-stone-100`}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Loved by Businesses & Talent
          </motion.h2>
          <motion.p
            id="testimonials-subtitle"
            className={`${discoverBody} mx-auto max-w-xl text-sm font-medium text-neutral-500 sm:text-base dark:text-neutral-400`}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Join thousands of satisfied users who trust Sajilowork for their daily tasks.
          </motion.p>
        </div>

        <div className="relative isolate w-full overflow-x-hidden overflow-y-visible">
          {/* Gradient masks to hide off-screen cards at the edges */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-20 w-24 bg-gradient-to-r from-[#fdfdfc] from-35% via-[#fdfdfc]/90 to-transparent sm:w-40 dark:from-neutral-950 dark:via-neutral-950/90"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-20 w-24 bg-gradient-to-l from-[#fdfdfc] from-35% via-[#fdfdfc]/90 to-transparent sm:w-40 dark:from-neutral-950 dark:via-neutral-950/90"
            aria-hidden
          />

          <motion.div
            className="relative z-0 flex w-max gap-6 sm:gap-8"
            animate={{
              x: ["0%", "-33.3333%"]
            }}
            transition={{
              duration: 40,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            {loopingTestimonials.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="relative z-0 flex w-[300px] shrink-0 flex-col justify-between rounded-[2rem] bg-white p-8 ring-1 ring-black/5 sm:w-[380px] dark:bg-neutral-900 dark:ring-white/10"
              >
                <div>
                  <div className="mb-6 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-5 w-5 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className={`${discoverBody} text-[15px] leading-relaxed text-brand-dark sm:text-base dark:text-stone-200`}>
                    "{item.quote}"
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-4 border-t border-neutral-100 pt-6 dark:border-neutral-800">
                  <img
                    src={item.avatar}
                    alt={item.author}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-neutral-100 dark:ring-neutral-700"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className={`${discoverHeadline} text-base text-brand-dark dark:text-stone-100`}>
                      {item.author}
                    </h4>
                    <p className={`${discoverBody} text-sm text-neutral-500 dark:text-neutral-400`}>
                      {item.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
