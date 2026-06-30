'use client';

import { Briefcase, MapPin } from 'lucide-react';
import EmployerAvatarCircle from '@/components/employers/EmployerAvatarCircle';
import ProjectCompanyLogo from '@/components/projects/ProjectCompanyLogo';
import { discoverBody, discoverMedium } from '@/components/LangingHome/landingTypography';
import { useRoadDistanceLabel } from '@/hooks/useRoadDistanceLabel';
import HeroCardDecor from '@/components/task/HeroCardDecor';
import { cn } from '@/lib/utils';
import { formatProjectLocation, type Project } from './projectListData';

interface ProjectMapCardProps {
  project: Project;
  coordinates?: [number, number] | null;
  userCenter?: [number, number] | null;
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
}

export default function ProjectMapCard({
  project,
  coordinates,
  userCenter,
  onClick,
  isActive = false,
  className = '',
}: ProjectMapCardProps) {
  const { label: distanceLabel, loading: distanceLoading } = useRoadDistanceLabel(
    userCenter,
    coordinates,
  );

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        'group relative flex min-w-0 w-full cursor-pointer flex-col overflow-hidden',
        'rounded-[20px] border border-neutral-200/40 bg-[#fbf2ed] p-4 shadow-sm',
        'transition-all duration-300 sm:rounded-[24px] sm:p-5',
        isActive
          ? 'border-[#52C47F]/50 ring-2 ring-[#52C47F]/25 shadow-[0_4px_14px_rgba(82,196,127,0.12)]'
          : 'hover:border-neutral-300/60 hover:shadow-[0_4px_14px_rgba(0,0,0,0.06)] active:scale-[0.995]',
        className,
      )}
    >
      <HeroCardDecor accentPosition="bottom-right" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3
            className={cn(
              discoverBody,
              'min-h-[2.75rem] flex-1 min-w-0 text-base font-normal leading-snug text-black line-clamp-2 break-words [overflow-wrap:anywhere] transition-colors group-hover:text-[#52C47F] sm:min-h-[3.125rem] sm:text-[17px]',
            )}
          >
            {project.title}
          </h3>
          <p className={cn(discoverMedium, 'shrink-0 text-right text-base font-bold leading-snug text-[#52C47F] sm:text-lg')}>
            {project.budgetLabel}
          </p>
        </div>

        <div className="mb-4 flex min-w-0 flex-col gap-2 sm:gap-2.5">
          <div className="flex min-h-[20px] min-w-0 items-center justify-between gap-3 text-neutral-700">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 stroke-[1.6] text-neutral-500" aria-hidden />
              <span className={cn(discoverBody, 'truncate text-sm leading-5')}>
                {formatProjectLocation(project)}
              </span>
            </div>
            {distanceLabel ? (
              <span className={cn(discoverBody, 'shrink-0 whitespace-nowrap text-right text-xs text-neutral-500')}>
                {distanceLabel}
              </span>
            ) : distanceLoading ? (
              <span className="shrink-0 text-xs text-neutral-400">…</span>
            ) : null}
          </div>
          <div className="flex min-w-0 items-center gap-2 text-neutral-700">
            <Briefcase className="h-4 w-4 shrink-0 stroke-[1.6] text-neutral-500" aria-hidden />
            <span className={cn(discoverBody, 'truncate text-sm leading-5')}>
              {project.type} · {project.experienceLevel}
            </span>
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-neutral-200/60 pt-3">
          <div className="min-w-0">
            <p className={cn(discoverMedium, 'truncate text-sm font-semibold text-[#45a874]')}>
              {project.companyName}
            </p>
            <p className={cn(discoverBody, 'mt-0.5 truncate text-xs text-neutral-500')}>{project.category}</p>
          </div>
          <EmployerAvatarCircle
            name={project.employerLogoText || project.companyName}
            avatarUrl={project.ownerAvatarUrl}
            avatarBg={project.companyLogoBg}
            verified={project.verified}
            sizeClass="h-10 w-10"
            textClass="text-xs font-semibold"
            useDemoIcon={!project.slug}
            iconType={project.companyIconType}
            renderIcon={(type, className) => <ProjectCompanyLogo type={type} className={className} />}
          />
        </div>
      </div>
    </div>
  );
}
