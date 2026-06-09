'use client';

import React from 'react';
import { MapPin, Calendar, Clock } from 'lucide-react';
import UserAvatar from '@/components/common/UserAvatar';
import { formatNPR } from '@/lib/nepalLocale';
import { useRoadDistanceLabel } from '@/hooks/useRoadDistanceLabel';

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
      return 'text-white';
    case 'assigned':
    case 'in_progress':
      return 'text-emerald-100';
    case 'completed':
      return 'text-purple-200';
    case 'cancelled':
    case 'disputed':
      return 'text-red-200';
    default:
      return 'text-white/90';
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
    coordinates
  );
  const distanceLabel = hookDistanceLabel ?? distanceLabelProp ?? null;

  const cardSurfaceClass = isActive
    ? 'ring-2 ring-white/40'
    : 'hover:brightness-105 active:brightness-95';

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
      className={`relative flex min-w-0 w-full cursor-pointer flex-col rounded-2xl bg-gradient-to-br from-brand-dark via-[#1e5c48] to-brand-emerald p-4 text-white shadow-lg transition-all group sm:p-5 ${cardSurfaceClass} ${className}`.trim()}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.15) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.08) 0%, transparent 40%)',
        }}
      />
      <div className="relative flex min-h-0 flex-1 flex-col">
      {/* Title + price */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="min-h-[2.75rem] flex-1 min-w-0 font-sans text-base font-bold leading-snug text-white line-clamp-2 break-words [overflow-wrap:anywhere] transition-colors group-hover:text-white/90 sm:min-h-[3.125rem] sm:text-[17px]">
          {title}
        </h3>
        <p className="font-sans text-base sm:text-lg font-bold text-white leading-snug shrink-0">
          {formatNPR(price)}
        </p>
      </div>

      {/* Location, date, time */}
      <div className="flex flex-col gap-2 sm:gap-2.5 mb-4 min-w-0">
        <div className="flex min-h-[20px] items-center justify-between gap-3 min-w-0 text-white/85">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <MapPin className="w-4 h-4 shrink-0 stroke-[1.5]" aria-hidden />
            <span className="truncate font-sans text-sm leading-5">{location}</span>
          </div>
          <span className="min-w-[4.5rem] shrink-0 text-right font-sans text-xs leading-5 whitespace-nowrap text-white/90 sm:text-sm">
            {distanceLabel ?? (distanceLoading ? '…' : '')}
          </span>
        </div>
        <div className="flex items-center gap-2 text-white/85">
          <Calendar className="w-4 h-4 shrink-0 stroke-[1.5]" aria-hidden />
          <span className="font-sans text-sm leading-5">{dateLabel}</span>
        </div>
        <div className="flex items-center gap-2 text-white/85">
          <Clock className="w-4 h-4 shrink-0 stroke-[1.5]" aria-hidden />
          <span className="font-sans text-sm leading-5">{timeLabel}</span>
        </div>
      </div>

      {/* Status, offers, avatar */}
      <div className="mt-auto flex items-center justify-between gap-3 min-w-0 overflow-visible pt-2 pr-0.5 pb-0.5">
        <div className="min-w-0 flex flex-col gap-0.5">
          {showOffersOnly ? (
            <span className="font-sans text-sm sm:text-[15px] font-bold leading-5 text-white/90">
              {offerLabel(offerCount)}
            </span>
          ) : (
            <>
              <span
                className={`font-sans text-sm sm:text-[15px] font-bold leading-5 ${statusTextClass(status)}`}
              >
                {displayStatus}
              </span>
              {offerCount > 0 && (
                <span className="font-sans text-xs text-white/75 leading-4">
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
          className="shrink-0"
        />
      </div>
      </div>
    </div>
  );
}
