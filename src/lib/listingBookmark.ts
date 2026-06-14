import { toast } from 'sonner';
import { bookmarkService } from '@/services/bookmark.service';
import { useAuthStore } from '@/store/auth.store';

export type ListingKind = 'task' | 'job' | 'project' | 'service';

const LABELS: Record<ListingKind, { saved: string; removed: string; auth: string }> = {
  task: {
    saved: 'Task saved',
    removed: 'Removed from saved tasks',
    auth: 'Sign in to save tasks',
  },
  job: {
    saved: 'Job saved',
    removed: 'Removed from saved jobs',
    auth: 'Sign in to save jobs',
  },
  project: {
    saved: 'Project saved',
    removed: 'Removed from saved projects',
    auth: 'Sign in to save projects',
  },
  service: {
    saved: 'Service saved',
    removed: 'Removed from saved services',
    auth: 'Sign in to save services',
  },
};

export function resolveListingSlug(slug?: string | null, id?: string | number | null): string {
  const trimmed = slug?.trim();
  if (trimmed) return trimmed;
  if (id !== undefined && id !== null && String(id).trim()) return String(id).trim();
  return '';
}

export async function toggleListingBookmark(
  slug: string | undefined,
  currentlySaved: boolean,
  kind: ListingKind,
): Promise<boolean | null> {
  const resolvedSlug = resolveListingSlug(slug);
  if (!resolvedSlug) return null;

  if (!useAuthStore.getState().isAuthenticated) {
    toast.error(LABELS[kind].auth);
    return null;
  }

  try {
    const response = currentlySaved
      ? await bookmarkService.unbookmark(resolvedSlug)
      : await bookmarkService.bookmark(resolvedSlug);

    if (!response.success) {
      toast.error(response.message || 'Could not update bookmark');
      return null;
    }

    const next = !currentlySaved;
    toast.success(next ? LABELS[kind].saved : LABELS[kind].removed);
    return next;
  } catch {
    toast.error('Could not update bookmark');
    return null;
  }
}

export function buildBookmarkSlugSet(
  items: Array<{ slug?: string | null; id?: string | number | null; isBookmarked?: boolean; is_bookmarked?: boolean }>,
): Set<string> {
  const slugs = new Set<string>();
  for (const item of items) {
    const saved = item.isBookmarked ?? item.is_bookmarked;
    if (!saved) continue;
    const slug = resolveListingSlug(item.slug, item.id);
    if (slug) slugs.add(slug);
  }
  return slugs;
}
