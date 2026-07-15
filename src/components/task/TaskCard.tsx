'use client';

import React from 'react';
import { MapPin, Calendar, Clock } from 'lucide-react';
import UserAvatar from '@/components/common/UserAvatar';
import { discoverBody, discoverMedium } from '@/components/LangingHome/landingTypography';
import { formatNPR } from '@/lib/nepalLocale';
import { useRoadDistanceLabel } from '@/hooks/useRoadDistanceLabel';
import { cn } from '@/lib/utils';
import HeroCardDecor from '@/components/task/HeroCardDecor';

interface TaskCardProps {
  id?: number;
  key?: React.Key;
  title: string;
  status: string;
  /** Human-readable status, e.g. "Open" */
  statusLabel?: string;
  location: string;
  /** Task map coordinates for road-distance label */
  coordinates?: [number, number] | null;
  /** User location for road-distance label */
  userCenter?: [number, number] | null;
  /** Optional sync distance (straight-line); hook may refine to road distance */
  distanceLabel?: string | null;
  price: number;
  /** ISO date or Date for "On Fri, 29 May" */
  dueDate?: string | Date | null;
  /** Shown next to clock icon — defaults to "Anytime" */
  timeLabel?: string;
  offerCount?: number;
  /** When true, footer shows offer count only (no status label). Used on /task browse. */
  showOffersOnly?: boolean;
  user: {
    name: string;
    avatar: string;
    rating?: number;
    verified?: boolean;
  };
  onClick?: () => void;
  /** Selected state (e.g. sidebar card opened) */
  isActive?: boolean;
  className?: string;
}

function formatStatusLabel(status: string): string {
  switch (status) {
    case 'open':
      return 'Open';
    case 'draft':
      return 'Draft';
    case 'assigned':
      return 'Assigned';
    case 'in_progress':
      return 'In progress';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'disputed':
      return 'Disputed';
    default:
      return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

function formatDueDateLabel(dueDate?: string | Date | null): string {
  if (!dueDate) return 'Flexible date';
  try {
    const d = dueDate instanceof Date ? dueDate : new Date(dueDate);
    if (Number.isNaN(d.getTime())) return 'Flexible date';
    const formatted = d.toLocaleDateString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    return `On ${formatted}`;
  } catch {
    return 'Flexible date';
  }
}

function offerLabel(count: number): string {
  if (count <= 0) return 'No offers yet';
  return `${count} ${count === 1 ? 'offer' : 'offers'}`;
}

function statusTextClass(status: string): string {
  switch (status) {
    case 'open':
      return 'text-[#52C47F]';
    case 'assigned':
    case 'in_progress':
      return 'text-emerald-700';
    case 'completed':
      return 'text-purple-600';
    case 'cancelled':
    case 'disputed':
      return 'text-red-600';
    default:
      return 'text-neutral-700';
  }
}

export default function TaskCard({
  title,
  status,
  statusLabel,
  location,
  coordinates,
  userCenter,
  distanceLabel: distanceLabelProp,
  price,
  dueDate,
  timeLabel = 'Anytime',
  offerCount = 0,
  showOffersOnly = false,
  user,
  onClick,
  isActive = false,
  className = '',
}: TaskCardProps) {
  const displayStatus = statusLabel || formatStatusLabel(status);
  const dateLabel = formatDueDateLabel(dueDate);
  const { label: hookDistanceLabel, loading: distanceLoading } = useRoadDistanceLabel(
    userCenter,
    coordinates,
  );
  const distanceLabel = hookDistanceLabel ?? distanceLabelProp ?? null;

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
        {/* Title + price */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3
            className={cn(
              discoverBody,
              'min-h-[2.75rem] flex-1 min-w-0 text-base font-normal leading-snug text-black line-clamp-2 break-words [overflow-wrap:anywhere] transition-colors group-hover:text-[#52C47F] dark:text-stone-100 sm:min-h-[3.125rem] sm:text-[17px]',
            )}
          >
            {title}
          </h3>
          <div className="shrink-0 text-right">
            <p className={cn(discoverMedium, 'text-base font-bold leading-snug text-[#52C47F] sm:text-lg')}>
              {formatNPR(price)}
            </p>
          </div>
        </div>

        {/* Location, date, time */}
        <div className="mb-4 flex min-w-0 flex-col gap-2 sm:gap-2.5">
          <div className="flex min-h-[20px] min-w-0 items-center justify-between gap-3 text-neutral-700 dark:text-neutral-300">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 stroke-[1.6] text-neutral-500" aria-hidden />
              <span className={cn(discoverBody, 'truncate text-sm leading-5')}>{location}</span>
            </div>
            <span
              className={cn(
                discoverBody,
                'min-w-[4.5rem] shrink-0 text-right text-xs leading-5 whitespace-nowrap text-neutral-500 sm:text-sm',
              )}
            >
              {distanceLabel ?? (distanceLoading ? '…' : '')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
            <Calendar className="h-4 w-4 shrink-0 stroke-[1.6] text-neutral-500" aria-hidden />
            <span className={cn(discoverBody, 'text-sm leading-5')}>{dateLabel}</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
            <Clock className="h-4 w-4 shrink-0 stroke-[1.6] text-neutral-500" aria-hidden />
            <span className={cn(discoverBody, 'text-sm leading-5')}>{timeLabel}</span>
          </div>
        </div>

        {/* Status, offers, avatar */}
        <div className="mt-auto flex items-center justify-between gap-3 overflow-visible pt-2 pr-0.5 pb-0.5 min-w-0">
          <div className="flex min-w-0 flex-col gap-0.5">
            {showOffersOnly ? (
              <span className={cn(discoverMedium, 'text-sm font-semibold leading-5 text-neutral-700 dark:text-neutral-300 sm:text-[15px]')}>
                {offerLabel(offerCount)}
              </span>
            ) : (
              <>
                <span
                  className={cn(
                    discoverMedium,
                    'text-sm font-semibold leading-5 sm:text-[15px]',
                    statusTextClass(status),
                  )}
                >
                  {displayStatus}
                </span>
                {offerCount > 0 && (
                  <span className={cn(discoverBody, 'text-xs leading-4 text-neutral-500')}>
                    {offerCount} {offerCount === 1 ? 'offer' : 'offers'}
                  </span>
                )}
              </>
            )}
          </div>
          <UserAvatar
            src={user.avatar}
            alt={user.name}
            name={user.name}
            size="md"
            verified={user.verified}
            className="shrink-0 ring-2 ring-white/80"
          />
        </div>
      </div>
    </div>
  );
}
