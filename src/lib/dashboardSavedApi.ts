import {
  mapTaskToDashboardSavedItem,
  type DashboardSavedItem,
  type SavedSubTab,
} from '@/lib/dashboardSaved';
import { getListingKind } from '@/lib/dashboardListingApi';
import { mapTaskToPublicService } from '@/lib/serviceApi';
import type { Task } from '@/types';

function mapBookmarkedTask(task: Task): DashboardSavedItem {
  const kind = getListingKind(task);
  if (kind === 'service') {
    const service = mapTaskToPublicService(task);
    return {
      id: service.id,
      slug: service.slug || service.id,
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
  return mapTaskToDashboardSavedItem(task);
}

export function filterBookmarkedTasksByTab(
  tasks: Task[],
  tab: SavedSubTab,
): DashboardSavedItem[] {
  return tasks
    .filter((task) => {
      const kind = getListingKind(task);
      if (tab === 'services') return kind === 'service';
      if (tab === 'project') return kind === 'project';
      if (tab === 'jobs') return kind === 'job';
      return kind === 'task';
    })
    .map(mapBookmarkedTask);
}
