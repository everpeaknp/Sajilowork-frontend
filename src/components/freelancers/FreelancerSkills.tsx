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

  return (
    <div className="mt-6 w-full rounded-xl border border-neutral-200/70 bg-white p-6 shadow-sm md:p-8">
      <h3 className="mb-6 text-lg font-normal tracking-tight text-black sm:text-xl">My Skills</h3>

      <div className="flex flex-wrap gap-3">
        {skillItems.map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-[#ffede8] px-5 py-2.5 text-sm font-normal tracking-tight text-black"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
