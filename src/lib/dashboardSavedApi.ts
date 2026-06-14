import {
  mapJobToDashboardSavedItem,
  mapProjectToDashboardSavedItem,
  mapTaskToDashboardSavedItem,
  resolveOwnerAvatarFromTask,
  savedListingImage,
  type DashboardSavedItem,
  type SavedSubTab,
} from '@/lib/dashboardSaved';
import { getListingKind } from '@/lib/dashboardListingApi';
import { mapTaskToPublicJob } from '@/lib/jobApi';
import { mapTaskToPublicProject } from '@/lib/projectApi';
import { mapTaskToPublicService } from '@/lib/serviceApi';
import { resolveListingSlug } from '@/lib/listingBookmark';
import type { Task } from '@/types';

function mapBookmarkedTask(task: Task): DashboardSavedItem {
  const kind = getListingKind(task);

  if (kind === 'service') {
    const service = mapTaskToPublicService(task);
    return {
      id: String(service.id),
      slug: resolveListingSlug(service.slug, service.id),
      kind: 'service',
      category: service.category,
      title: service.title,
      rating: service.rating,
      reviewsCount: service.reviews,
      image: service.image,
      authorName: service.author.name,
      authorAvatar: service.author.avatar,
      price: service.startingPrice ?? service.budget,
      budgetType: 'fixed',
    };
  }

  if (kind === 'job') {
    const job = mapTaskToPublicJob(task);
    const rating = Number(task.owner_rating ?? 0);
    const reviewsCount = task.bids_count ?? task.bid_count ?? 0;
    return {
      ...mapJobToDashboardSavedItem(job),
      rating: Number.isFinite(rating) && rating > 0 ? rating : 0,
      reviewsCount: Number.isFinite(reviewsCount) ? reviewsCount : 0,
      image: savedListingImage(task),
      authorAvatar: job.ownerAvatarUrl || resolveOwnerAvatarFromTask(task),
    };
  }

  if (kind === 'project') {
    const project = mapTaskToPublicProject(task);
    const rating = Number(task.owner_rating ?? 0);
    const reviewsCount = task.bids_count ?? task.bid_count ?? 0;
    return {
      ...mapProjectToDashboardSavedItem(project),
      rating: Number.isFinite(rating) && rating > 0 ? rating : 0,
      reviewsCount: Number.isFinite(reviewsCount) ? reviewsCount : 0,
      image: savedListingImage(task),
      authorAvatar: project.ownerAvatarUrl || resolveOwnerAvatarFromTask(task),
    };
  }

  return mapTaskToDashboardSavedItem(task);
}

export function filterBookmarkedTasksByTab(
  tasks: Task[],
  tab: SavedSubTab,
): DashboardSavedItem[] {
  const items: DashboardSavedItem[] = [];

  for (const task of tasks) {
    const kind = getListingKind(task);
    const matchesTab =
      (tab === 'services' && kind === 'service') ||
      (tab === 'project' && kind === 'project') ||
      (tab === 'jobs' && kind === 'job') ||
      (tab === 'task' && kind === 'task');

    if (!matchesTab) continue;

    try {
      items.push(mapBookmarkedTask(task));
    } catch (error) {
      console.error('Failed to map bookmarked listing', task.slug || task.id, error);
    }
  }

  return items;
}
