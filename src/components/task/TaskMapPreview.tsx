'use client';

import { X } from 'lucide-react';
import UserAvatar from '@/components/common/UserAvatar';
import { formatNPR } from '@/lib/nepalLocale';
import type { Task } from './types';

interface TaskMapPreviewProps {
  task: Task;
  onClose: () => void;
  onViewTask: () => void;
}

function daysUntilDue(dueDate: Date): number {
  return Math.max(0, Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

function hoursSincePosted(postedDate: Date): number {
  return Math.max(1, Math.round((Date.now() - postedDate.getTime()) / (1000 * 60 * 60)));
}

export default function TaskMapPreview({ task, onClose, onViewTask }: TaskMapPreviewProps) {
  return (
    <div
      className="absolute inset-0 z-[40] flex items-end justify-center p-3 pb-[7.5rem] pointer-events-none sm:items-center sm:p-6 sm:pb-6"
      aria-modal
      role="dialog"
      aria-labelledby="map-preview-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/20 pointer-events-auto"
        aria-label="Close preview"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-3xl shadow-2xl border border-outline-variant/40 w-full max-w-[min(340px,calc(100vw-3rem))] min-w-0 overflow-hidden pointer-events-auto font-sans">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1 rounded-full text-on-surface-variant hover:bg-surface-dim transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-4 sm:p-6 pt-7 min-w-0">
          <div className="flex gap-3 sm:gap-4 mb-6 min-w-0">
            <UserAvatar
              src={task.user.avatar}
              alt={task.user.name}
              name={task.user.name}
              size="xl"
              className="w-20 h-20 sm:w-24 sm:h-24 !rounded-2xl shrink-0"
            />
            <div
              className="flex-1 min-w-0 rounded-3xl flex flex-col items-center justify-center p-2 border border-outline-variant/30 min-h-[80px] sm:min-h-[96px]"
              style={{ backgroundColor: '#f1f4f9' }}
            >
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                EARN
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#000d45] truncate max-w-full px-1">
                {formatNPR(task.price)}
              </span>
            </div>
          </div>

          <div className="space-y-1 mb-6 sm:mb-8 min-w-0">
            <h4
              id="map-preview-title"
              className="text-lg font-bold text-[#000d45] leading-tight line-clamp-3 break-words [overflow-wrap:anywhere]"
            >
              {task.title}
            </h4>
            <p className="text-on-surface-variant text-sm font-medium break-words [overflow-wrap:anywhere]">
              Due in {daysUntilDue(task.dueDate)} days
            </p>
            <p className="text-on-surface-variant text-sm break-words [overflow-wrap:anywhere]">
              Posted by{' '}
              <span className="text-primary font-bold break-words [overflow-wrap:anywhere]">
                {task.user.name}.
              </span>{' '}
              about {hoursSincePosted(task.postedDate)} hours ago
            </p>
          </div>

          <button
            type="button"
            onClick={onViewTask}
            className="w-full py-2 text-primary font-bold text-lg hover:underline transition-all text-center"
          >
            View Task
          </button>
        </div>
      </div>
    </div>
  );
}
