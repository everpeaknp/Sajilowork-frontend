'use client';

import type { Job } from './jobListData';

interface JobSoftSkillsProps {
  job: Job;
}

function getDisplaySoftSkills(job: Job): string[] {
  return (job.softSkills ?? []).map((skill) => skill.trim()).filter(Boolean);
}

export default function JobSoftSkills({ job }: JobSoftSkillsProps) {
  const softSkills = getDisplaySoftSkills(job);
  if (!softSkills.length) return null;

  return (
    <section className="mt-8 sm:mt-10">
      <h2 className="mb-4 text-lg font-normal tracking-tight text-black sm:mb-5 sm:text-xl md:text-2xl dark:text-stone-100">
        Soft Skills
      </h2>
      <div className="flex flex-wrap gap-3">
        {softSkills.map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-[#ffede8] px-4 py-2 text-sm font-normal tracking-tight text-black sm:px-5 sm:py-2.5 dark:bg-neutral-800 dark:text-stone-200"
          >
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
}
