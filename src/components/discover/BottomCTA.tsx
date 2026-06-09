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
      className={`relative w-full overflow-visible bg-white pb-6 pt-12 sm:pt-20 ${className}`}
    >
      <div className="absolute bottom-6 left-0 top-12 z-0 w-full rounded-tr-[40px] bg-[#faf1ed] sm:top-20 sm:rounded-tr-[60px] lg:w-[68%] lg:rounded-tr-[80px] xl:w-[70%]" />

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-end gap-10 px-6 sm:px-8 lg:grid-cols-12 lg:items-center lg:gap-8 lg:px-12 xl:px-16">
        <div className="py-10 pr-0 sm:pr-4 lg:col-span-6 lg:py-16 lg:pr-8 xl:col-span-7">
          <motion.h2
            className={`${discoverHeadline} mb-8 max-w-xl text-3xl leading-tight text-[#131118] sm:mb-10 sm:text-4xl`}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            A whole world of local tasker talent at your fingertips
          </motion.h2>

          <div className="space-y-6 sm:space-y-8">
            {highlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  className="group flex items-start gap-4 sm:gap-5"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <div className="flex-shrink-0 transition-transform duration-300 group-hover:scale-[1.08]">
                    <Icon />
                  </div>
                  <div className="min-w-0">
                    <h3
                      className={`${discoverHeadline} mb-1 text-base text-[#131118] sm:text-lg`}
                    >
                      {item.title}
                    </h3>
                    <p
                      className={`${discoverBody} max-w-md text-xs leading-relaxed text-[#5e586c] sm:text-sm`}
                    >
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-8 h-11 sm:mt-10" aria-hidden />
        </div>

        <div className="relative z-20 flex w-full items-center justify-end overflow-visible lg:col-span-6 lg:mb-0 xl:col-span-5">
          <div className="relative h-[360px] w-full max-w-full flex-shrink-0 overflow-visible bg-neutral-100 sm:h-[440px] lg:h-[520px]">
            <img
              src="https://freeio-app-nextjs.vercel.app/_next/image?url=%2Fimages%2Fabout%2Fabout-10.jpg&w=1920&q=75"
              alt="Tasker working on a laptop"
              className="h-full w-full object-cover object-center"
              referrerPolicy="no-referrer"
            />

            <motion.div
              className="absolute left-5 top-[52%] z-20 w-[min(280px,calc(100%-2.5rem))] -translate-y-1/2 rounded-[1.75rem] bg-[#1a3c34] p-7 text-white shadow-2xl sm:left-6 sm:top-[53%] sm:w-[min(300px,calc(100%-3rem))] sm:p-8 md:left-0 md:top-[54%] md:w-[325px] md:-translate-x-1/2 md:p-10"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <ul className="space-y-5 md:space-y-6">
                {floatingList.map((text, idx) => (
                  <motion.li
                    key={text}
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                  >
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white text-[#1a3c34] shadow-md">
                      <Check className="h-3.5 w-3.5 stroke-[3.5]" />
                    </span>
                    <span className={`${discoverMedium} text-sm tracking-wide text-white sm:text-[15px]`}>
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
