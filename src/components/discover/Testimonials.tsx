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
      'The interface of TaskNepal is incredibly intuitive and clean. We hired three talented developers in less than a week, and all of them delivered exceptional quality.',
    author: 'David Lee',
    role: 'Chief Technology Officer, Stripe',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120',
  },
  {
    id: 3,
    quote:
      'Fantastic support, secure escrow payment flow, and access to top-tier global talent. TaskNepal has completely reformed our remote team workflow.',
    author: 'Marcus Aurelius',
    role: 'Operations Lead, Nike',
    avatar:
      'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=120&h=120',
  },
  {
    id: 4,
    quote:
      "I've been working as a freelance UI/UX designer on TaskNepal for two years, and the steady stream of high-quality clients has allowed me to double my income.",
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
  const [activeId, setActiveId] = useState<number>(1);

  const currentTestimonial =
    testimonials.find((item) => item.id === activeId) || testimonials[0];

  return (
    <section
      id="testimonials-section"
      className={`flex select-none flex-col items-center justify-center overflow-hidden bg-white px-4 py-12 text-center sm:px-8 sm:py-24 lg:px-12 xl:px-16 ${className}`}
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 sm:mb-8">
          <motion.h2
            id="testimonials-title"
            className={`${discoverHeadline} mb-2.5 text-2xl text-[#131118] sm:text-3xl lg:text-[40px]`}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Testimonials
          </motion.h2>
          <motion.p
            id="testimonials-subtitle"
            className={`${discoverBody} mx-auto max-w-xl text-sm text-neutral-500 sm:text-base`}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Interdum et malesuada fames ac ante ipsum
          </motion.p>
        </div>

        <motion.div
          id="testimonials-quote-icon"
          className="mb-2 mt-4 flex h-10 select-none items-center justify-center font-serif text-7xl leading-[0] text-[#4bbb80] sm:mt-6 sm:h-12 sm:text-8xl"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          aria-hidden
        >
          “
        </motion.div>

        <div className="relative mx-auto mb-10 flex min-h-[140px] max-w-4xl items-center justify-center overflow-hidden px-4 sm:min-h-[120px] sm:px-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={activeId}
              className={`${discoverMedium} text-center text-lg leading-[1.45] tracking-tight text-[#131118] sm:text-xl md:text-2xl lg:text-[28px]`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              {currentTestimonial.quote}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="mb-10 flex h-14 flex-col justify-center sm:mb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center"
            >
              <h4 className={`${discoverMedium} text-sm tracking-wide text-[#131118] sm:text-[15px]`}>
                {currentTestimonial.author}
              </h4>
              <p className={`${discoverBody} mt-1 text-xs text-neutral-400 sm:text-[13px]`}>
                {currentTestimonial.role}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div
          id="testimonials-avatars-nav"
          className="mt-4 flex items-center justify-center gap-3 overflow-x-auto px-2 pb-1 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0"
        >
          {testimonials.map((item) => (
            <button
              id={`testimonial-avatar-btn-${item.id}`}
              key={item.id}
              type="button"
              onClick={() => setActiveId(item.id)}
              className="group relative focus:outline-none focus:ring-0"
              aria-label={`View testimonial from ${item.author}`}
              aria-pressed={activeId === item.id}
            >
              <div
                className={`flex items-center justify-center rounded-full p-1 transition-all duration-300 ${
                  activeId === item.id
                    ? 'scale-[1.15] border-2 border-[#4bbb80]'
                    : 'scale-100 border-2 border-transparent hover:scale-[1.08]'
                }`}
              >
                <img
                  src={item.avatar}
                  alt={item.author}
                  referrerPolicy="no-referrer"
                  className={`h-9 w-9 rounded-full object-cover shadow-sm transition-all duration-300 sm:h-11 sm:w-11 ${
                    activeId === item.id
                      ? 'grayscale-0'
                      : 'grayscale-[20%] hover:grayscale-0'
                  }`}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
