'use client';

import { X } from 'lucide-react';
import EmployerAvatarCircle from '@/components/employers/EmployerAvatarCircle';
import ProjectCompanyLogo from '@/components/projects/ProjectCompanyLogo';
import HeroCardDecor from '@/components/task/HeroCardDecor';
import {
  discoverBody,
  discoverHeadline,
  discoverMedium,
} from '@/components/LangingHome/landingTypography';
import { useRoadDistanceLabel } from '@/hooks/useRoadDistanceLabel';
import { KATHMANDU_CENTER } from '@/lib/userGeolocation';
import { cn } from '@/lib/utils';
import { formatProjectLocation, type Project } from './projectListData';
import type { Task as MapTask } from '@/components/task/types';

interface ProjectMapPreviewProps {
  project: Project;
  mapTask: MapTask;
  userCenter?: [number, number] | null;
  onClose: () => void;
  onViewProject: () => void;
}

export default function ProjectMapPreview({
  project,
  mapTask,
  userCenter,
  onClose,
  onViewProject,
}: ProjectMapPreviewProps) {
  const origin = userCenter ?? ([KATHMANDU_CENTER.lat, KATHMANDU_CENTER.lng] as [number, number]);
  const { label: roadDistanceLabel, loading: isDistanceLoading } = useRoadDistanceLabel(
    origin,
    mapTask.coordinates,
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[40] flex items-end justify-center p-3 pb-[7.5rem] sm:items-center sm:p-6 sm:pb-6"
      aria-modal
      role="dialog"
      aria-labelledby="project-map-preview-title"
    >
      <button
        type="button"
        className="pointer-events-auto absolute inset-0 bg-black/20"
        aria-label="Close preview"
        onClick={onClose}
      />

      <div
        className={cn(
          discoverBody,
          'pointer-events-auto relative w-full min-w-0 max-w-[min(340px,calc(100vw-3rem))] overflow-hidden',
          'rounded-[24px] border border-neutral-200/40 bg-[#fbf2ed] shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:border-neutral-800 dark:bg-neutral-900',
        )}
      >
        <HeroCardDecor size="large" accentPosition="top-right" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full p-1.5 text-neutral-500 transition-colors hover:bg-white/60 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-stone-100"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative z-10 min-w-0 p-4 pt-7 sm:p-6 sm:pt-8">
          <div className="mb-5 flex min-w-0 gap-3 sm:mb-6 sm:gap-4">
            <EmployerAvatarCircle
              name={project.employerLogoText || project.companyName}
              avatarUrl={project.ownerAvatarUrl}
              avatarBg={project.companyLogoBg}
              verified={project.verified}
              sizeClass="h-20 w-20 sm:h-24 sm:w-24"
              textClass="text-lg font-semibold"
              useDemoIcon={!project.slug}
              iconType={project.companyIconType}
              renderIcon={(type, className) => <ProjectCompanyLogo type={type} className={className} />}
            />
            <div className="flex min-h-[80px] min-w-0 flex-1 flex-col items-center justify-center rounded-[16px] border border-neutral-200/50 bg-white/70 p-2 backdrop-blur-[2px] dark:border-neutral-700 dark:bg-neutral-800/70 sm:min-h-[96px]">
              <span
                className={cn(
                  discoverMedium,
                  'mb-1 text-[10px] font-bold uppercase tracking-widest text-neutral-500',
                )}
              >
                Budget
              </span>
              <span
                className={cn(
                  discoverHeadline,
                  'max-w-full truncate px-1 text-2xl font-bold leading-none text-[#52C47F] sm:text-3xl',
                )}
              >
                {project.budgetLabel}
              </span>
            </div>
          </div>

          <div className="mb-5 min-w-0 space-y-1.5 sm:mb-6">
            <h4
              id="project-map-preview-title"
              className={cn(
                discoverHeadline,
                'line-clamp-3 break-words text-lg font-bold leading-tight text-black [overflow-wrap:anywhere] dark:text-stone-100 sm:text-xl',
              )}
            >
              {project.title}
            </h4>
            <div
              className={cn(
                discoverBody,
                'flex items-center justify-between gap-3 text-sm font-medium text-neutral-600 dark:text-neutral-400',
              )}
            >
              <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                {project.type} · {formatProjectLocation(project)}
              </span>
              {roadDistanceLabel ? (
                <span className="shrink-0 whitespace-nowrap text-right text-neutral-500">
                  {roadDistanceLabel}
                </span>
              ) : isDistanceLoading ? (
                <span className="shrink-0 whitespace-nowrap text-right text-neutral-400">…</span>
              ) : null}
            </div>
            <p className={cn(discoverBody, 'break-words text-sm text-neutral-600 [overflow-wrap:anywhere] dark:text-neutral-400')}>
              Posted by{' '}
              <span className={cn(discoverMedium, 'font-semibold text-[#52C47F]')}>{project.companyName}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onViewProject}
            className={cn(
              discoverMedium,
              'w-full rounded-[8px] bg-[#52C47F] py-3 text-center text-[15px] font-semibold text-white transition-colors hover:bg-[#49b071]',
            )}
          >
            View Project
          </button>
        </div>
      </div>
    </div>
  );
}
