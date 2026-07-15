'use client';

import type { Project } from './projectListData';

interface ProjectSkillsRequiredProps {
  project: Project;
}

export default function ProjectSkillsRequired({ project }: ProjectSkillsRequiredProps) {
  return (
    <section className="border-t border-neutral-200 pt-10 dark:border-neutral-800">
      <h2 className="mb-5 text-xl font-normal tracking-tight text-black sm:text-2xl dark:text-stone-100">
        Skills Required
      </h2>
      <div className="flex flex-wrap gap-3">
        {project.skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-[#ffede8] px-5 py-2.5 text-sm font-normal tracking-tight text-black dark:bg-neutral-800 dark:text-stone-200"
          >
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
}
