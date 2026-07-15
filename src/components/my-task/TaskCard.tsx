'use client';

import React from 'react';
import { MapPin, Calendar, Clock, Edit, Trash2 } from 'lucide-react';
import UserAvatar from '@/components/common/UserAvatar';
import HeroCardDecor from '@/components/task/HeroCardDecor';
import { discoverBody, discoverMedium } from '@/components/LangingHome/landingTypography';
import { formatNPR } from '@/lib/nepalLocale';
import { formatMyTaskStatusLabel } from '@/lib/taskUtils';
import { useRoadDistanceLabel } from '@/hooks/useRoadDistanceLabel';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  id?: string;
  slug?: string;
  key?: React.Key;
  title: string;
  status: string;
  statusLabel?: string;
  location: string;
  coordinates?: [number, number] | null;
  userCenter?: [number, number] | null;
  distanceLabel?: string | null;
  price: number;
  dueDate?: string | Date | null;
  timeLabel?: string;
  offerCount?: number;
  user: {
    name: string;
    avatar: string;
    rating?: number;
    verified?: boolean;
  };
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isActive?: boolean;
  className?: string;
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
  user,
  onClick,
  onEdit,
  onDelete,
  isActive = false,
  className = '',
}: TaskCardProps) {
  const displayStatus = statusLabel || formatMyTaskStatusLabel(status);
  const dateLabel = formatDueDateLabel(dueDate);
  const hasActions = Boolean(onEdit || onDelete);
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
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3
            className={cn(
              discoverBody,
              'min-h-[2.75rem] flex-1 min-w-0 text-base font-normal leading-snug text-black line-clamp-2 break-words [overflow-wrap:anywhere] transition-colors group-hover:text-[#52C47F] dark:text-stone-100 sm:min-h-[3.125rem] sm:text-[17px]',
            )}
          >
            {title}
          </h3>
          <div className="flex shrink-0 items-start gap-1">
            {hasActions ? (
              <div className="mr-1 flex items-center gap-0.5">
                {onEdit ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                    className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-white/60 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-stone-100"
                    title="Edit task"
                    aria-label="Edit task"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                ) : null}
                {onDelete ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-white/60 hover:text-red-600 dark:hover:bg-neutral-800"
                    title="Delete task"
                    aria-label="Delete task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            ) : null}
            <p className={cn(discoverMedium, 'text-base font-bold leading-snug text-[#52C47F] sm:text-lg')}>
              {formatNPR(price)}
            </p>
          </div>
        </div>

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

        <div className="mt-auto flex min-w-0 items-center justify-between gap-3 overflow-visible pt-2 pr-0.5 pb-0.5">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span
              className={cn(
                discoverMedium,
                'text-sm font-semibold leading-5 sm:text-[15px]',
                statusTextClass(status),
              )}
            >
              {displayStatus}
            </span>
            {offerCount > 0 ? (
              <span className={cn(discoverBody, 'text-xs leading-4 text-neutral-500')}>
                {offerCount} {offerCount === 1 ? 'offer' : 'offers'}
              </span>
            ) : null}
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
