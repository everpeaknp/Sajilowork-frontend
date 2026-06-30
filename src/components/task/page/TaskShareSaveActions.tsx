'use client';

import { useMemo, useState } from 'react';
import { ExternalLink, Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getTaskDetailPath } from '@/lib/taskPageApi';
import { resolveListingSlug, toggleListingBookmark } from '@/lib/listingBookmark';
import { cn } from '@/lib/utils';
import type { Task } from '@/types';

interface TaskShareSaveActionsProps {
  task: Task;
  onBookmarkChange?: (bookmarked: boolean) => void;
  className?: string;
}

const circleClass =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 transition-colors group-hover:border-neutral-300';

export default function TaskShareSaveActions({
  task,
  onBookmarkChange,
  className,
}: TaskShareSaveActionsProps) {
  const [isSaved, setIsSaved] = useState(Boolean(task.is_bookmarked));
  const [saveLoading, setSaveLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

  const slug = resolveListingSlug(task.slug, task.id);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}${getTaskDetailPath(task)}`;
  }, [task]);

  const handleShare = async () => {
    if (!shareUrl) return;

    setShareLoading(true);
    const shareTitle = task.title;
    const shareText = `Check out this task: ${shareTitle}`;

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        toast.success('Share dialog opened');
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Task link copied to clipboard');
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Task link copied to clipboard');
      } catch {
        toast.error('Could not share this task');
      }
    } finally {
      setShareLoading(false);
    }
  };

  const handleSave = async () => {
    if (!slug) return;

    setSaveLoading(true);
    try {
      const next = await toggleListingBookmark(slug, isSaved, 'task');
      if (next === null) return;
      setIsSaved(next);
      onBookmarkChange?.(next);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className={cn('flex w-full items-center justify-end gap-4 sm:gap-8', className)}>
      <button
        type="button"
        onClick={() => void handleShare()}
        disabled={shareLoading}
        className="group flex cursor-pointer items-center gap-2.5 outline-none transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Share task"
      >
        <span className={circleClass}>
          {shareLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
          )}
        </span>
        <span className="hidden text-sm font-normal text-neutral-900 sm:inline">Share</span>
      </button>

      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={saveLoading}
        className="group flex cursor-pointer items-center gap-2.5 outline-none transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={isSaved ? 'Remove saved task' : 'Save task'}
        aria-pressed={isSaved}
      >
        <span className={circleClass}>
          {saveLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart
              className={`h-4 w-4 ${isSaved ? 'fill-neutral-900 text-neutral-900' : ''}`}
              strokeWidth={1.5}
            />
          )}
        </span>
        <span className="hidden text-sm font-normal text-neutral-900 sm:inline">Save</span>
      </button>
    </div>
  );
}
