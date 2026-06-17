'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { discoverBody, discoverHeadline, discoverMedium } from '@/components/LangingHome/landingTypography';

function QualityBadgeIcon() {
  return (
    <svg
      className="h-10 w-10 text-[#193e32]"
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <circle cx="20" cy="18" r="8" />
      <path
        d="M16.5 18l2 2 5-5"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M15 25l-2 9 7-3 7 3-2-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DollarBadgeIcon() {
  return (
    <svg
      className="h-10 w-10 text-[#193e32]"
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <rect x="12" y="10" width="16" height="20" rx="3" />
      <circle cx="20" cy="20" r="4" />
      <path d="M20 18v4M18.5 19.5h3" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SecureBadgeIcon() {
  return (
    <svg
      className="h-10 w-10 text-[#193e32]"
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path
        d="M11 14c0 0 0-4 9-6 9 2 9 6 9 6v8c0 6-9 10-9 10s-9-4-9-10v-8z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface BottomCTAProps {
  className?: string;
}

export default function BottomCTA({ className = '' }: BottomCTAProps) {
  const highlights = [
    {
      icon: QualityBadgeIcon,
      title: 'Proof of quality',
      description:
        'Check work samples, client reviews, and verified tasker profiles before you hire.',
    },
    {
      icon: DollarBadgeIcon,
      title: 'No cost until you hire',
      description:
        'Compare offers, negotiate rates, and only pay when the work is done to your satisfaction.',
    },
    {
      icon: SecureBadgeIcon,
      title: 'Safe and secure',
      description:
        'Payments are protected and your data stays private. Support is available whenever you need help.',
    },
  ];

  const floatingList = [
    'The best for every budget',
    'Quality work done quickly',
    'Protected payments, every time',
    '24/7 support',
  ];

  return (
    <section
      className={`relative w-full overflow-hidden bg-white pb-6 pt-12 sm:pt-20 ${className}`}
    >
      <div className="absolute inset-0 z-0 bg-neutral-50/50" />

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-12 xl:px-16">
        
        {/* Text Content Left */}
        <div className="py-10 pr-0 sm:pr-4 lg:py-16">
          <motion.h2
            className={`${discoverHeadline} mb-8 max-w-xl text-3xl leading-tight text-brand-dark sm:mb-12 sm:text-4xl md:text-5xl`}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            A whole world of local tasker talent at your fingertips
          </motion.h2>

          <div className="space-y-8 sm:space-y-10">
            {highlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  className="group flex items-start gap-5 sm:gap-6"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-emerald/10 text-brand-emerald transition-transform duration-300 group-hover:scale-105">
                    <div className="scale-75">
                      <Icon />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 pt-1">
                    <h3
                      className={`${discoverHeadline} mb-2 text-[17px] text-brand-dark sm:text-[19px]`}
                    >
                      {item.title}
                    </h3>
                    <p
                      className={`${discoverBody} text-[14px] leading-relaxed text-neutral-500`}
                    >
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Visual Right */}
        <div className="relative z-20 flex w-full items-center justify-end lg:mb-0">
          <div className="relative h-[400px] w-full max-w-full overflow-hidden rounded-2xl border border-neutral-100 shadow-sm sm:h-[500px] lg:h-[600px]">
            <img
              src="https://freeio-app-nextjs.vercel.app/_next/image?url=%2Fimages%2Fabout%2Fabout-10.jpg&w=1920&q=75"
              alt="Tasker working on a laptop"
              className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-brand-dark/5" />

            <motion.div
              className="absolute bottom-6 left-6 z-20 w-[min(300px,calc(100%-3rem))] rounded-2xl border border-white/20 bg-white/90 p-6 shadow-xl backdrop-blur-md sm:bottom-8 sm:left-8 sm:w-[320px] sm:p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <ul className="space-y-4">
                {floatingList.map((text, idx) => (
                  <motion.li
                    key={text}
                    className="flex items-center gap-3.5"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                  >
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-emerald text-white shadow-sm">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                    <span className={`${discoverMedium} text-[14px] text-brand-dark`}>
                      {text}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
