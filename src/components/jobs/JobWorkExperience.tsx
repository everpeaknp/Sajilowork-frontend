'use client';

import { ArrowUpRight } from 'lucide-react';
import { discoverBody } from '@/components/LangingHome/landingTypography';
import { getJobWorkExperience, type Job } from './jobListData';

interface JobWorkExperienceProps {
  job: Job;
  onApply?: () => void;
}

export default function JobWorkExperience({ job, onApply }: JobWorkExperienceProps) {
  const items = getJobWorkExperience(job);

  return (
    <section className="mt-10 sm:mt-14">
      <h2 className="text-base font-normal tracking-tight text-black sm:text-lg md:text-xl">Work &amp; Experience</h2>
      <ul
        className={`${discoverBody} mt-6 list-disc space-y-4 pl-5 text-sm font-light leading-[1.75] text-neutral-600 marker:text-black sm:text-[15px]`}
      >
        {items.map((item, index) => (
          <li key={index} className="pl-1">
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <button
          type="button"
          onClick={() => onApply?.()}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1D3E35] px-6 py-3.5 text-sm font-normal text-white transition-colors duration-200 hover:bg-[#5bbb7b]"
        >
          Apply For Job
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
