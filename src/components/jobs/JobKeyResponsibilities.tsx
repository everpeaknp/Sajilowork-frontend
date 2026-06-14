'use client';

import { Check } from 'lucide-react';
import { discoverBody } from '@/components/LangingHome/landingTypography';
import { getJobKeyResponsibilities, type Job } from './jobListData';

interface JobKeyResponsibilitiesProps {
  job: Job;
}

export default function JobKeyResponsibilities({ job }: JobKeyResponsibilitiesProps) {
  const items = getJobKeyResponsibilities(job);

  return (
    <section className="mt-10 sm:mt-14">
      <h2 className="text-base font-normal tracking-tight text-black sm:text-lg md:text-xl">Key Responsibilities</h2>
      <ul className={`${discoverBody} mt-6 list-none space-y-5 p-0`}>
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3.5">
            <span
              className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E4F5EB]"
              aria-hidden
            >
              <Check className="h-3 w-3 text-[#52C47F]" strokeWidth={3} />
            </span>
            <p className="min-w-0 flex-1 text-sm font-light leading-[1.75] text-neutral-600 sm:text-[15px]">
              {item}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
