'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  buildFreelancerAwards,
  type Freelancer,
  type FreelancerAwardItem,
} from './freelancerData';

interface FreelancerAwardsProps {
  freelancer: Freelancer;
  items?: FreelancerAwardItem[];
}

export default function FreelancerAwards({ freelancer, items }: FreelancerAwardsProps) {
  const awardItems = useMemo(
    () => items ?? buildFreelancerAwards(freelancer),
    [freelancer, items],
  );

  if (items !== undefined && awardItems.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 w-full max-w-4xl">
      <h3 className="mb-8 text-xl font-normal tracking-tight text-black sm:text-2xl dark:text-stone-100">
        Awards and Certificates
      </h3>

      <div className="flex flex-col gap-10">
        {awardItems.map((item, idx) => (
          <motion.div
            key={item.id}
            className="flex flex-col items-start"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.15 }}
          >
            <div className="mb-3 select-none rounded-full bg-[#FEF1EC] px-5 py-2 text-sm font-normal text-black dark:bg-neutral-800 dark:text-stone-200">
              {item.years}
            </div>

            <h4 className="text-base font-normal leading-snug tracking-tight text-black sm:text-lg dark:text-stone-100">
              {item.title}
            </h4>

            <p className="mt-1.5 text-xs font-normal leading-none text-[#52C47F] sm:text-sm">
              {item.authority}
            </p>

            <p className="mt-4 max-w-3xl text-xs font-normal leading-relaxed text-black sm:text-sm dark:text-neutral-300">
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-14 w-full border-t border-neutral-200 dark:border-neutral-800" />
    </div>
  );
}
