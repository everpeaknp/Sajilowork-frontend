'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { discoverBody, discoverDmSans } from '@/components/LangingHome/landingTypography';

interface StatItem {
  value: number;
  suffix: string;
  decimals: number;
  label: string;
}

const STATS: StatItem[] = [
  { value: 834, suffix: 'M', decimals: 1, label: 'Total Taskers' },
  { value: 732, suffix: 'M', decimals: 1, label: 'Positive Reviews' },
  { value: 90, suffix: 'M', decimals: 1, label: 'Orders Received' },
  { value: 236, suffix: 'M', decimals: 1, label: 'Projects Completed' },
];

interface CounterProps {
  value: number;
  suffix: string;
  decimals: number;
  durationMs?: number;
}

function Counter({ value, suffix, decimals, durationMs = 2200 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(value * eased);
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isInView, value, durationMs]);

  return (
    <span ref={ref} className={`${discoverDmSans} tabular-nums font-medium`}>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

interface DiscoverStatsProps {
  className?: string;
}

export default function DiscoverStats({ className = '' }: DiscoverStatsProps) {
  return (
    <section
      className={`bg-white px-4 pb-12 pt-4 sm:px-8 sm:pb-14 sm:pt-6 lg:px-12 xl:px-16 dark:bg-neutral-950 ${className}`}
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-y-10 md:grid-cols-4 md:gap-y-0">
        {STATS.map((stat, idx) => (
          <motion.div
            key={stat.label}
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: idx * 0.08 }}
          >
            <p
              className={`${discoverDmSans} text-2xl font-medium leading-none text-[#131118] sm:text-4xl lg:text-[42px] dark:text-stone-100`}
            >
              <Counter value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
            </p>
            <p className={`${discoverBody} mt-3 text-sm text-[#131118] sm:text-base dark:text-neutral-300`}>
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
