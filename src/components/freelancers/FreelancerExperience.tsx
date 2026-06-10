'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  buildFreelancerExperience,
  type Freelancer,
  type FreelancerExperienceItem,
} from './freelancerData';

interface FreelancerExperienceProps {
  freelancer: Freelancer;
  items?: FreelancerExperienceItem[];
}

export default function FreelancerExperience({ freelancer, items }: FreelancerExperienceProps) {
  const experienceItems = useMemo(
    () => items ?? buildFreelancerExperience(freelancer),
    [freelancer, items],
  );

  return (
    <div className="mt-10 w-full max-w-4xl">
      <h3 className="mb-8 text-xl font-normal tracking-tight text-black sm:text-2xl">
        Work & Experience
      </h3>

      <div className="flex flex-col">
        {experienceItems.map((item, idx) => (
          <motion.div
            key={item.id}
            className="relative flex items-start gap-5 sm:gap-6"
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.15 }}
          >
            <div className="relative flex w-10 shrink-0 flex-col items-center self-stretch">
              <div className="relative z-10 flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full border border-neutral-100 bg-[#EAF6F0] text-xs font-normal text-[#52C47F] shadow-sm">
                {item.badgeLetter}
              </div>
              {idx < experienceItems.length - 1 && (
                <div className="absolute bottom-0 left-1/2 top-10 w-0 -translate-x-1/2 border-l border-dashed border-[#52C47F]" />
              )}
            </div>

            <div
              className={`flex flex-col items-start pt-0.5 ${idx < experienceItems.length - 1 ? 'pb-10' : ''}`}
            >
                <div className="mb-3 select-none rounded-full bg-[#FEF1EC] px-5 py-2 text-sm font-normal text-black">
                  {item.years}
                </div>

                <h4 className="text-base font-normal leading-snug tracking-tight text-black sm:text-lg">
                  {item.role}
                </h4>

                <p className="mt-1.5 text-xs font-normal leading-none text-[#52C47F] sm:text-sm">
                  {item.company}
                </p>

                <p className="mt-4 max-w-3xl text-xs font-normal leading-relaxed text-black sm:text-sm">
                  {item.description}
                </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-14 w-full border-t border-neutral-200" />
    </div>
  );
}
