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
    <div className="mt-10 w-full">
      <h3 className="mb-5 text-lg font-normal leading-tight tracking-tight text-black sm:text-xl">
        My Skills
      </h3>

      <div className="flex flex-wrap justify-start gap-3">
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
