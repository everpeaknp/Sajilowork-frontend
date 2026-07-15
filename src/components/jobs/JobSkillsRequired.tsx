'use client';

import type { Job } from './jobListData';

interface JobSkillsRequiredProps {
  job: Job;
}

function getDisplaySkills(job: Job): string[] {
  return job.skills.map((skill) => skill.trim()).filter((skill) => skill && skill !== 'General');
}

export default function JobSkillsRequired({ job }: JobSkillsRequiredProps) {
  const skills = getDisplaySkills(job);
  if (!skills.length) return null;

  return (
    <section className="border-t border-neutral-200 pt-8 sm:pt-10 dark:border-neutral-800">
      <h2 className="mb-4 text-lg font-normal tracking-tight text-black sm:mb-5 sm:text-xl md:text-2xl dark:text-stone-100">
        Skills Required
      </h2>
      <div className="flex flex-wrap gap-3">
        {skills.map((skill) => (
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
