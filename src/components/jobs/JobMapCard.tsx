'use client';

import { Briefcase, MapPin } from 'lucide-react';
import EmployerAvatarCircle from '@/components/employers/EmployerAvatarCircle';
import JobCompanyLogo from '@/components/jobs/JobCompanyLogo';
import { discoverBody, discoverMedium } from '@/components/LangingHome/landingTypography';
import { useRoadDistanceLabel } from '@/hooks/useRoadDistanceLabel';
import HeroCardDecor from '@/components/task/HeroCardDecor';
import { cn } from '@/lib/utils';
import type { Job } from './jobListData';

interface JobMapCardProps {
  job: Job;
  coordinates?: [number, number] | null;
  userCenter?: [number, number] | null;
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
}

function locationLabel(job: Job): string {
  if (job.city?.trim()) return job.city.trim();
  return job.location;
}

export default function JobMapCard({
  job,
  coordinates,
  userCenter,
  onClick,
  isActive = false,
  className = '',
}: JobMapCardProps) {
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
        'rounded-[20px] border border-neutral-200/40 bg-[#fbf2ed] p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900',
        'transition-all duration-300 sm:rounded-[24px] sm:p-5',
        isActive
          ? 'border-[#52C47F]/50 ring-2 ring-[#52C47F]/25 shadow-[0_4px_14px_rgba(82,196,127,0.12)]'
          : 'hover:border-neutral-300/60 hover:shadow-[0_4px_14px_rgba(0,0,0,0.06)] active:scale-[0.995] dark:hover:border-neutral-700',
        className,
      )}
    >
      <HeroCardDecor accentPosition="bottom-right" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3
            className={cn(
              discoverBody,
              'min-h-[2.75rem] flex-1 min-w-0 text-base font-normal leading-snug text-black line-clamp-2 break-words [overflow-wrap:anywhere] transition-colors group-hover:text-[#52C47F] dark:text-stone-100 sm:min-h-[3.125rem] sm:text-[17px]',
            )}
          >
            {job.title}
          </h3>
          <p className={cn(discoverMedium, 'shrink-0 text-right text-base font-bold leading-snug text-[#52C47F] sm:text-lg')}>
            {job.budgetLabel}
          </p>
        </div>

        <div className="mb-4 flex min-w-0 flex-col gap-2 sm:gap-2.5">
          <div className="flex min-h-[20px] min-w-0 items-center justify-between gap-3 text-neutral-700 dark:text-neutral-300">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 stroke-[1.6] text-neutral-500" aria-hidden />
              <span className={cn(discoverBody, 'truncate text-sm leading-5')}>{locationLabel(job)}</span>
            </div>
            {distanceLabel ? (
              <span className={cn(discoverBody, 'shrink-0 whitespace-nowrap text-right text-xs text-neutral-500')}>
                {distanceLabel}
              </span>
            ) : distanceLoading ? (
              <span className="shrink-0 text-xs text-neutral-400">…</span>
            ) : null}
          </div>
          <div className="flex min-w-0 items-center gap-2 text-neutral-700 dark:text-neutral-300">
            <Briefcase className="h-4 w-4 shrink-0 stroke-[1.6] text-neutral-500" aria-hidden />
            <span className={cn(discoverBody, 'truncate text-sm leading-5')}>
              {job.type} · {job.experienceLevel}
            </span>
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-neutral-200/60 pt-3 dark:border-neutral-800">
          <div className="min-w-0">
            <p className={cn(discoverMedium, 'truncate text-sm font-semibold text-[#45a874]')}>{job.companyName}</p>
            <p className={cn(discoverBody, 'mt-0.5 truncate text-xs text-neutral-500')}>{job.category}</p>
          </div>
          <EmployerAvatarCircle
            name={job.employerLogoText || job.companyName}
            avatarUrl={job.ownerAvatarUrl}
            avatarBg={job.companyLogoBg}
            verified={job.verified}
            sizeClass="h-10 w-10"
            textClass="text-xs font-semibold"
            useDemoIcon={!job.slug}
            iconType={job.companyIconType}
            renderIcon={(type, className) => <JobCompanyLogo type={type} className={className} />}
          />
        </div>
      </div>
    </div>
  );
}
