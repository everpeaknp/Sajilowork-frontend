'use client';

import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Project } from './projectListData';
import { getProjectDetailPath } from './projectSlug';
import { resolveListingSlug, toggleListingBookmark } from '@/lib/listingBookmark';

interface ProjectShareSaveActionsProps {
  project: Project;
  className?: string;
}

const circleClass =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 transition-colors group-hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-stone-200 dark:group-hover:border-neutral-600';

export default function ProjectShareSaveActions({
  project,
  className,
}: ProjectShareSaveActionsProps) {
  const slug = resolveListingSlug(project.slug, project.id);
  const [isSaved, setIsSaved] = useState(Boolean(project.isBookmarked));
  const [shareLoading, setShareLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    setIsSaved(Boolean(project.isBookmarked));
  }, [project.isBookmarked, project.id]);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}${getProjectDetailPath(project)}`;
  }, [project]);

  const handleShare = async () => {
    if (!shareUrl) return;

    setShareLoading(true);
    const shareTitle = project.title;
    const shareText = `Check out this project: ${shareTitle}`;

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
        toast.success('Project link copied to clipboard');
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Project link copied to clipboard');
      } catch {
        toast.error('Could not share this project');
      }
    } finally {
      setShareLoading(false);
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const next = await toggleListingBookmark(slug, isSaved, 'project');
      if (next !== null) setIsSaved(next);
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
        aria-label="Share project"
      >
        <span className={circleClass}>
          {shareLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
          )}
        </span>
        <span className="hidden text-sm font-normal text-neutral-900 sm:inline dark:text-stone-100">Share</span>
      </button>

      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={saveLoading}
        className="group flex cursor-pointer items-center gap-2.5 outline-none transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={isSaved ? 'Remove saved project' : 'Save project'}
        aria-pressed={isSaved}
      >
        <span className={circleClass}>
          {saveLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart
              className={`h-4 w-4 ${isSaved ? 'fill-neutral-900 text-neutral-900 dark:fill-stone-100 dark:text-stone-100' : ''}`}
              strokeWidth={1.5}
            />
          )}
        </span>
        <span className="hidden text-sm font-normal text-neutral-900 sm:inline dark:text-stone-100">Save</span>
      </button>
    </div>
  );
}
