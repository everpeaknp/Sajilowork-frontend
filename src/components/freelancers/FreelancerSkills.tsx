'use client';

import { useMemo } from 'react';
import { buildFreelancerSkills, type Freelancer } from './freelancerData';

interface FreelancerSkillsProps {
  freelancer: Freelancer;
  skills?: string[];
}

export default function FreelancerSkills({ freelancer, skills }: FreelancerSkillsProps) {
  const skillItems = useMemo(
    () => skills ?? buildFreelancerSkills(freelancer),
    [freelancer, skills],
  );

  if (skills !== undefined && skillItems.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 w-full">
      <h3 className="mb-5 text-lg font-normal leading-tight tracking-tight text-black sm:text-xl dark:text-stone-100">
        My Skills
      </h3>

      <div className="flex flex-wrap justify-start gap-3">
        {skillItems.map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-[#ffede8] px-5 py-2.5 text-sm font-normal tracking-tight text-black dark:bg-neutral-800 dark:text-stone-200"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
