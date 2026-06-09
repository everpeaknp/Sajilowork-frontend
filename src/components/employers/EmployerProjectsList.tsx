'use client';

import { useMemo, useState } from 'react';
import { Star } from 'lucide-react';
import { renderCompanyLogo } from './employerLogos';

interface Project {
  id: string;
  title: string;
  company: string;
  budget: string;
  duration: string;
  level: string;
  locationType: string;
  logoColor: string;
  isSparked?: boolean;
}

interface EmployerProjectsListProps {
  employerName?: string;
  logoColor?: string;
  onProjectSelect?: (projectTitle: string) => void;
  triggerNotification?: (msg: string) => void;
}

function buildDefaultProjects(employerName: string, logoColor: string): Project[] {
  return [
    {
      id: 'proj-1',
      title: 'Website Designer Required For Directory Theme',
      company: employerName,
      budget: '$125k–$135k Hourly',
      duration: '1-5 Days',
      level: 'Expensive',
      locationType: 'Remote',
      logoColor,
      isSparked: false,
    },
    {
      id: 'proj-2',
      title: 'UI/UX Specialist Needed for Mobile SaaS App Layouts',
      company: employerName,
      budget: '$95k–$120k Hourly',
      duration: '2-4 Weeks',
      level: 'Intermediate',
      locationType: 'Remote',
      logoColor,
      isSparked: true,
    },
    {
      id: 'proj-3',
      title: 'Front-End Developer for Integration Kit',
      company: employerName,
      budget: '$110k–$130k Hourly',
      duration: '1-5 Days',
      level: 'Expensive',
      locationType: 'Remote',
      logoColor,
      isSparked: false,
    },
  ];
}

export default function EmployerProjectsList({
  employerName = 'Mailchimp',
  logoColor = 'monkey-face',
  onProjectSelect,
  triggerNotification,
}: EmployerProjectsListProps) {
  const [sparkedIds, setSparkedIds] = useState<Record<string, boolean>>({ 'proj-2': true });

  const projects = useMemo(
    () =>
      buildDefaultProjects(employerName, logoColor).map((project) => ({
        ...project,
        isSparked: sparkedIds[project.id] ?? project.isSparked ?? false,
      })),
    [employerName, logoColor, sparkedIds],
  );

  const handleSparkToggle = (id: string, title: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSparkedIds((prev) => {
      const nextState = !prev[id];
      triggerNotification?.(
        nextState
          ? `Project successfully saved to your favorites: "${title}"`
          : `Removed "${title}" from saved projects.`,
      );
      return { ...prev, [id]: nextState };
    });
  };

  return (
    <div className="space-y-4" id="employer-projects-section">
      <h3 className="select-none text-xl font-normal tracking-tight text-black">Projects</h3>

      <div className="space-y-3">
        {projects.map((proj) => (
          <div
            key={proj.id}
            id={`project-card-${proj.id}`}
            onClick={() => onProjectSelect?.(proj.title)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onProjectSelect?.(proj.title);
            }}
            role="button"
            tabIndex={0}
            className="group relative flex cursor-pointer flex-col items-start justify-between gap-4 rounded-2xl border border-neutral-100 bg-white p-5 transition-all duration-300 hover:border-emerald-500 hover:shadow-md sm:flex-row sm:items-center"
          >
            <div className="flex items-center gap-4">
              <div className="shrink-0 transition-transform duration-300 group-hover:scale-105">
                {renderCompanyLogo(proj.logoColor, proj.company)}
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-normal leading-[1.35] tracking-tight text-black transition-colors group-hover:text-[#45a874] sm:text-base">
                  {proj.title}
                </h4>
                <p className="text-xs font-medium tracking-tight text-[#45a874]">{proj.company}</p>
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-1.5 text-[11px] font-normal text-black">
                  <span className="whitespace-nowrap">{proj.budget}</span>
                  <span className="text-neutral-200">|</span>
                  <span className="whitespace-nowrap">{proj.duration}</span>
                  <span className="text-neutral-200">|</span>
                  <span className="whitespace-nowrap">{proj.level}</span>
                  <span className="text-neutral-200">|</span>
                  <span className="whitespace-nowrap">{proj.locationType}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => handleSparkToggle(proj.id, proj.title, e)}
              className="group/spark absolute right-4 top-4 rounded-full p-2.5 transition-colors hover:bg-emerald-50 sm:relative sm:right-auto sm:top-auto"
              aria-label="Save project"
              aria-pressed={proj.isSparked}
              id={`btn-spark-${proj.id}`}
            >
              <Star
                strokeWidth={2}
                className={`h-5 w-5 transition-transform group-hover/spark:scale-110 ${
                  proj.isSparked
                    ? 'fill-emerald-500 text-emerald-500 animate-pulse'
                    : 'text-emerald-400'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
