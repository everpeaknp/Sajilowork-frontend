'use client';

import { useMemo, useState } from 'react';
import { ExternalLink, Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Service } from './serviceListData';
import { getServiceDetailPath } from './serviceSlug';
import { toggleServiceSaved, useSavedServiceIds } from './serviceBookmarks';

interface ServiceShareSaveActionsProps {
  service: Service;
}

const circleClass =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 transition-colors group-hover:border-neutral-300';

export default function ServiceShareSaveActions({ service }: ServiceShareSaveActionsProps) {
  const savedServiceIds = useSavedServiceIds();
  const isSaved = savedServiceIds.includes(service.id);
  const [shareLoading, setShareLoading] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}${getServiceDetailPath(service)}`;
  }, [service]);

  const handleShare = async () => {
    if (!shareUrl) return;

    setShareLoading(true);
    const shareTitle = service.title;
    const shareText = `Check out this service: ${shareTitle}`;

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
        toast.success('Service link copied to clipboard');
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Service link copied to clipboard');
      } catch {
        toast.error('Could not share this service');
      }
    } finally {
      setShareLoading(false);
    }
  };

  const handleSave = () => {
    const next = toggleServiceSaved(service.id);
    toast.success(next ? 'Service saved' : 'Removed from saved services');
  };

  return (
    <div className="flex items-center gap-8">
      <button
        type="button"
        onClick={() => void handleShare()}
        disabled={shareLoading}
        className="group flex cursor-pointer items-center gap-2.5 outline-none transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Share service"
      >
        <span className={circleClass}>
          {shareLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
          )}
        </span>
        <span className="text-sm font-normal text-neutral-900">Share</span>
      </button>

      <button
        type="button"
        onClick={handleSave}
        className="group flex cursor-pointer items-center gap-2.5 outline-none transition-opacity hover:opacity-80"
        aria-label={isSaved ? 'Remove saved service' : 'Save service'}
        aria-pressed={isSaved}
      >
        <span className={circleClass}>
          <Heart
            className={`h-4 w-4 ${isSaved ? 'fill-neutral-900 text-neutral-900' : ''}`}
            strokeWidth={1.5}
          />
        </span>
        <span className="text-sm font-normal text-neutral-900">Save</span>
      </button>
    </div>
  );
}
