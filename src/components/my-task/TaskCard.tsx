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
      return 'text-primary';
    case 'assigned':
    case 'in_progress':
      return 'text-blue-600';
    case 'completed':
      return 'text-purple-600';
    case 'cancelled':
    case 'disputed':
      return 'text-error';
    default:
      return 'text-on-surface-variant';
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
    ? 'bg-[#f1f4f9] border-primary/50'
    : 'bg-white border-outline-variant hover:bg-[#f1f4f9] hover:border-primary/40 active:bg-[#f1f4f9] active:border-primary/50';

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
      className={`rounded-2xl border p-4 sm:p-5 transition-colors group cursor-pointer relative flex flex-col min-w-0 w-full ${cardSurfaceClass} ${className}`.trim()}
    >
      {/* Title + actions + price */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="flex-1 min-w-0 font-sans text-base sm:text-[17px] font-bold leading-snug text-[#000d45] line-clamp-2 break-words [overflow-wrap:anywhere] group-hover:text-primary transition-colors">
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
                  className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-[#f1f4f9] transition-colors"
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
                  className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-[#f1f4f9] transition-colors"
                  title="Delete task"
                  aria-label="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          <p className="font-sans text-base sm:text-lg font-bold text-[#000d45] leading-snug">
            {formatNPR(price)}
          </p>
        </div>
      </div>

      {/* Location, date, time */}
      <div className="flex flex-col gap-2 sm:gap-2.5 mb-4 min-w-0">
        <div className="flex items-center gap-2 min-w-0 text-on-surface-variant">
          <MapPin className="w-4 h-4 shrink-0 stroke-[1.5]" aria-hidden />
          <span className="font-sans text-sm leading-5 truncate">{location}</span>
        </div>
        <div className="flex items-center gap-2 text-on-surface-variant">
          <Calendar className="w-4 h-4 shrink-0 stroke-[1.5]" aria-hidden />
          <span className="font-sans text-sm leading-5">{dateLabel}</span>
        </div>
        <div className="flex items-center gap-2 text-on-surface-variant">
          <Clock className="w-4 h-4 shrink-0 stroke-[1.5]" aria-hidden />
          <span className="font-sans text-sm leading-5">{timeLabel}</span>
        </div>
      </div>

      {/* Status, offers, avatar */}
      <div className="flex items-center justify-between gap-3 min-w-0 pt-2">
        <div className="min-w-0 flex flex-col gap-0.5">
          <span
            className={`font-sans text-sm sm:text-[15px] font-bold leading-5 ${statusTextClass(status)}`}
          >
            {displayStatus}
          </span>
          {offerCount > 0 && (
            <span className="font-sans text-xs text-on-surface-variant leading-4">
              {offerCount} {offerCount === 1 ? 'offer' : 'offers'}
            </span>
          )}
        </div>
        <UserAvatar
          src={user.avatar}
          alt={user.name}
          name={user.name}
          size="md"
          className="shrink-0"
        />
      </div>
    </div>
  );
}
