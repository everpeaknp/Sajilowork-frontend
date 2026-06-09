import React from 'react';
import { MapPin, Calendar, Clock, Edit, Trash2 } from 'lucide-react';
import UserAvatar from '@/components/common/UserAvatar';
import { formatNPR } from '@/lib/nepalLocale';
import { formatMyTaskStatusLabel } from '@/lib/taskUtils';

interface TaskCardProps {
  id?: string;
  slug?: string;
  key?: React.Key;
  title: string;
  /** Raw API status for color mapping, e.g. `open` */
  status: string;
  /** Human-readable status, e.g. "Posted" */
  statusLabel?: string;
  location: string;
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
      <div className="relative flex flex-1 flex-col">
      {/* Title + actions + price */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="flex-1 min-w-0 font-sans text-base sm:text-[17px] font-bold leading-snug text-white line-clamp-2 break-words [overflow-wrap:anywhere] group-hover:text-white/90 transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-1 shrink-0">
          {hasActions && (
            <div className="flex items-center gap-0.5 mr-1">
              {onEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors"
                  title="Edit task"
                  aria-label="Edit task"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="p-1.5 rounded-lg text-white/80 hover:text-red-200 hover:bg-white/15 transition-colors"
                  title="Delete task"
                  aria-label="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          <p className="font-sans text-base sm:text-lg font-bold text-white leading-snug">
            {formatNPR(price)}
          </p>
        </div>
      </div>

      {/* Location, date, time */}
      <div className="flex flex-col gap-2 sm:gap-2.5 mb-4 min-w-0">
        <div className="flex items-center gap-2 min-w-0 text-white/85">
          <MapPin className="w-4 h-4 shrink-0 stroke-[1.5]" aria-hidden />
          <span className="font-sans text-sm leading-5 truncate">{location}</span>
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
