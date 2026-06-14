'use client';

import React from 'react';
import { motion } from 'motion/react';
import { discoverBody, discoverHeadline } from '@/components/LangingHome/landingTypography';

function PostJobIcon() {
  return (
    <svg
      className="h-12 w-12 text-[#99f6e4] transition-transform duration-300 hover:scale-105"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="5" y="12" width="38" height="24" rx="2" />
      <line x1="5" y1="28" x2="43" y2="28" strokeWidth="1.5" />
      <line x1="16" y1="36" x2="32" y2="36" strokeWidth="2" />
      <line x1="20" y1="36" x2="20" y2="40" strokeWidth="1.5" />
      <line x1="28" y1="36" x2="28" y2="40" strokeWidth="1.5" />
      <line x1="12" y1="40" x2="36" y2="40" strokeWidth="2" />
      <circle cx="16" cy="20" r="3" strokeWidth="1.5" />
      <path d="M11 25.5c0-1.5 2-2.5 5-2.5s5 1 5 2.5" strokeWidth="1.5" />
      <line x1="26" y1="18" x2="37" y2="18" strokeWidth="1.5" />
      <line x1="26" y1="22" x2="34" y2="22" strokeWidth="1.5" />
    </svg>
  );
}

function ChooseTaskersIcon() {
  return (
    <svg
      className="h-12 w-12 text-[#99f6e4] transition-transform duration-300 hover:scale-105"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="24" cy="15" r="5" strokeWidth="1.5" />
      <path d="M14 28c0-4.5 4.5-6 10-6s10 1.5 10 6v3H14v-3z" strokeWidth="1.5" />
      <path
        d="M34 12l2.5 2.5L42 9"
        stroke="#45a874"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="6" y="6" width="36" height="36" rx="3" strokeWidth="1.2" strokeDasharray="3 3" />
      <line x1="16" y1="36" x2="32" y2="36" strokeWidth="1.5" />
    </svg>
  );
}

function PaySafelyIcon() {
  return (
    <svg
      className="h-12 w-12 text-[#99f6e4] transition-transform duration-300 hover:scale-105"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="6" y="11" width="36" height="24" rx="2" strokeWidth="1.5" />
      <line x1="6" y1="18" x2="42" y2="18" strokeWidth="1.5" />
      <rect x="11" y="24" width="7" height="5" rx="1" fill="currentColor" strokeWidth="0" opacity="0.4" />
      <circle cx="33" cy="26" r="2" strokeWidth="1.5" />
      <path
        d="M20 28.5c0 0 0 4 4 6.5 4-2.5 4-6.5 4-6.5v-2l-4-1.5-4 1.5v2z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg
      className="h-12 w-12 text-[#99f6e4] transition-transform duration-300 hover:scale-105"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="24" cy="18" r="7" strokeWidth="1.5" />
      <path d="M14 18c0-5.5 4.5-10 10-10s10 4.5 10 10" strokeWidth="1.5" />
      <rect x="12" y="16" width="3" height="5" rx="1" strokeWidth="1.5" />
      <rect x="33" y="16" width="3" height="5" rx="1" strokeWidth="1.5" />
      <path d="M33 21c0 2-2 3.5-5 3.5" strokeWidth="1.5" />
      <path d="M11 38c0-4.5 5.5-6.5 13-6.5s13 2 13 6.5" strokeWidth="1.5" />
    </svg>
  );
}

interface WorkflowProps {
  className?: string;
  title?: string;
  subtitle?: string;
}

export default function Workflow({
  className = '',
  title = 'Need something done?',
  subtitle = 'Post a task, compare offers, and pay securely when the job is done.',
}: WorkflowProps) {
  const steps = [
    {
      icon: PostJobIcon,
      title: 'Post a task',
      description:
        'It’s free and easy. Add a title, describe what you need, and set your budget or location.',
    },
    {
      icon: ChooseTaskersIcon,
      title: 'Choose taskers',
      description:
        'Review offers from verified locals, compare ratings, and pick the best person for the job.',
    },
    {
      icon: PaySafelyIcon,
      title: 'Pay safely',
      description:
        'Funds are held securely until you’re happy with the work. Release payment when the task is complete.',
    },
    {
      icon: HelpIcon,
      title: 'We’re here to help',
      description:
        'Our support team can help with disputes, payments, and getting your task back on track.',
    },
  ];

  return (
    <section
      className={`overflow-hidden bg-[#1a3f34] px-4 py-10 sm:px-6 sm:py-12 lg:px-12 lg:py-14 xl:px-16 ${className}`}
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8 md:mb-10">
          <motion.h2
            className={`${discoverHeadline} mb-3 text-2xl text-white sm:text-3xl lg:text-[40px]`}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {title}
          </motion.h2>
          <motion.p
            className={`${discoverBody} max-w-xl text-xs text-white/90 sm:text-sm`}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {subtitle}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12 lg:grid-cols-4 lg:gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <motion.div
                key={step.title}
                className="flex flex-col items-start text-left"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <div className="mb-6 text-emerald-300">
                  <IconComponent />
                </div>

                <h3
                  className={`${discoverHeadline} mb-3 text-lg tracking-normal text-white sm:text-xl`}
                >
                  {step.title}
                </h3>

                <p className={`${discoverBody} max-w-sm text-xs leading-relaxed text-white/85 sm:text-sm`}>
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
