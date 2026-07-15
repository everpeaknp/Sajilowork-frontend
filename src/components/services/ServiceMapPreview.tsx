'use client';

import { X } from 'lucide-react';
import UserAvatar from '@/components/common/UserAvatar';
import HeroCardDecor from '@/components/task/HeroCardDecor';
import {
  discoverBody,
  discoverHeadline,
  discoverMedium,
} from '@/components/LangingHome/landingTypography';
import { useRoadDistanceLabel } from '@/hooks/useRoadDistanceLabel';
import { formatServiceStartingPrice } from '@/lib/serviceApi';
import { KATHMANDU_CENTER } from '@/lib/userGeolocation';
import { cn } from '@/lib/utils';
import type { Service } from './serviceListData';
import type { Task as MapTask } from '@/components/task/types';

interface ServiceMapPreviewProps {
  service: Service;
  mapTask: MapTask;
  userCenter?: [number, number] | null;
  onClose: () => void;
  onViewService: () => void;
}

export default function ServiceMapPreview({
  service,
  mapTask,
  userCenter,
  onClose,
  onViewService,
}: ServiceMapPreviewProps) {
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
      aria-labelledby="service-map-preview-title"
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
          'rounded-[24px] border border-neutral-200/40 bg-[#fbf2ed] shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-none',
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
          <div className="mb-5 flex min-w-0 items-center gap-3 sm:mb-6">
            <UserAvatar
              src={service.author.avatar}
              alt={service.author.name}
              name={service.author.name}
              size="lg"
            />
            <div className="min-w-0 flex-1 rounded-[16px] border border-neutral-200/50 bg-white/70 px-3 py-2 backdrop-blur-[2px] dark:border-neutral-700 dark:bg-neutral-950/70">
              <span className={cn(discoverMedium, 'text-[10px] font-bold uppercase tracking-widest text-neutral-500')}>
                Starting at
              </span>
              <p className={cn(discoverHeadline, 'truncate text-xl font-bold text-[#52C47F] sm:text-2xl')}>
                {formatServiceStartingPrice(service)}
              </p>
            </div>
          </div>

          <div className="mb-5 min-w-0 space-y-1.5 sm:mb-6">
            <h4
              id="service-map-preview-title"
              className={cn(
                discoverHeadline,
                'line-clamp-3 break-words text-lg font-bold leading-tight text-black [overflow-wrap:anywhere] sm:text-xl dark:text-stone-100',
              )}
            >
              {service.title}
            </h4>
            <div className={cn(discoverBody, 'flex items-center justify-between gap-3 text-sm font-medium text-neutral-600 dark:text-neutral-400')}>
              <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                {service.category} · {service.locationLabel || service.location}
              </span>
              {roadDistanceLabel ? (
                <span className="shrink-0 whitespace-nowrap text-right text-neutral-500">{roadDistanceLabel}</span>
              ) : isDistanceLoading ? (
                <span className="shrink-0 whitespace-nowrap text-right text-neutral-400">…</span>
              ) : null}
            </div>
            <p className={cn(discoverBody, 'break-words text-sm text-neutral-600 [overflow-wrap:anywhere] dark:text-neutral-400')}>
              By{' '}
              <span className={cn(discoverMedium, 'font-semibold text-[#52C47F]')}>{service.author.name}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onViewService}
            className={cn(
              discoverMedium,
              'w-full rounded-[8px] bg-[#52C47F] py-3 text-center text-[15px] font-semibold text-white transition-colors hover:bg-[#49b071]',
            )}
          >
            View Service
          </button>
        </div>
      </div>
    </div>
  );
}
