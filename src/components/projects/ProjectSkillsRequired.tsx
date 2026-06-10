'use client';

import type { Project } from './projectListData';

interface ProjectSkillsRequiredProps {
  project: Project;
}

export default function ProjectSkillsRequired({ project }: ProjectSkillsRequiredProps) {
  return (
    <section className="border-t border-black pt-10">
      <h2 className="mb-5 text-xl font-normal tracking-tight text-black sm:text-2xl">
        Skills Required
      </h2>
      <div className="flex flex-wrap gap-3">
        {project.skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-[#ffede8] px-5 py-2.5 text-sm font-normal tracking-tight text-black"
          >
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
}
