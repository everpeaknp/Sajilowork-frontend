import type { Task as ApiTask } from '@/types';
import type { Task as MapBrowseTask } from '@/components/task/types';
import type { Task as MyTaskView } from '@/components/my-task/types';
import { getMediaUrl } from '@/lib/utils';
import { formatTaskLocationShort } from '@/lib/nepalLocale';
import { resolveMapMarkerPriceLabel } from '@/lib/mapMarkerPrice';
import {
  formatMyTaskStatusLabel,
  formatTaskDisplayTitle,
  getTaskBidCount,
  canEditMyPostedTask,
  canDeleteMyPostedTask,
  canCancelMyTask,
  getTaskPosterId,
  getTaskPosterProfileSlug,
} from '@/lib/taskUtils';

export const toCoord = (raw: unknown): number => {
  if (raw === null || raw === undefined || raw === '') return NaN;
  if (typeof raw === 'number') return raw;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : NaN;
};

export function hasValidCoordinates(task: ApiTask): boolean {
  const lat = toCoord(task.latitude);
  const lng = toCoord(task.longitude);
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

export function resolvePoster(task: ApiTask) {
  const nested =
    (task.poster && typeof task.poster === 'object' ? task.poster : null) ||
    (task.owner && typeof task.owner === 'object' ? task.owner : null);

  if (nested) {
    const name =
      `${nested.first_name || ''} ${nested.last_name || ''}`.trim() ||
      nested.full_name ||
      'Unknown';
    return {
      name,
      avatar: getMediaUrl(nested.profile_image),
      rating: nested.average_rating || 0,
      reviews: nested.total_reviews || 0,
      verified: Boolean(nested.is_verified_tasker),
    };
  }

  return {
    name: task.owner_name || 'Unknown',
    avatar: getMediaUrl(task.owner_image),
    rating: task.owner_rating || 0,
    reviews: 0,
    verified: Boolean(task.owner_is_verified),
  };
}

/** Map API task to the view model used by my-task TaskDetails. */
export function transformApiTaskToMyTaskView(
  task: ApiTask,
  userId?: string
): MyTaskView {
  const categoryName =
    typeof task.category === 'string'
      ? task.category
      : task.category?.name || 'General';

  const poster = resolvePoster(task);
  const posterId = getTaskPosterId(task);
  const posterUsername = getTaskPosterProfileSlug(task);

  let postedDate = new Date();
  let dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  try {
    if (task.created_at) {
      const parsed = new Date(task.created_at);
      if (!isNaN(parsed.getTime())) postedDate = parsed;
    }
  } catch {
    // ignore
  }

  try {
    if (task.due_date) {
      const parsed = new Date(task.due_date);
      if (!isNaN(parsed.getTime())) dueDate = parsed;
    }
  } catch {
    // ignore
  }

  const taskSlug = task.slug || String(task.id);
  const taskId = String(task.id);
  const rawStatus = task.status || 'open';

  return {
    id: taskId,
    slug: taskSlug,
    title: formatTaskDisplayTitle(task.title || 'Untitled Task'),
    status: rawStatus,
    statusLabel: formatMyTaskStatusLabel(rawStatus),
    location: formatTaskLocationShort(task),
    coordinates: [toCoord(task.latitude), toCoord(task.longitude)] as [number, number],
    price: task.budget_amount || 0,
    category: categoryName,
    workType:
      task.location_type === 'remote'
        ? 'remotely'
        : task.location_type === 'in_person'
          ? 'in-person'
          : 'all',
    postedDate,
    dueDate,
    description: task.description || '',
    hasOffers: getTaskBidCount(task) > 0,
    isAssigned:
      task.status === 'assigned' ||
      task.status === 'funded' ||
      !!task.assigned_tasker,
    canEdit: canEditMyPostedTask(task, userId),
    canDelete: canDeleteMyPostedTask(task, userId),
    canCancel: canCancelMyTask(task, userId),
    statusColor:
      task.status === 'open'
        ? 'green'
        : task.status === 'assigned'
          ? 'blue'
          : 'gray',
    posterId,
    posterUsername,
    user: {
      name: poster.name,
      avatar: poster.avatar,
      rating: poster.rating,
      verified: poster.verified,
    },
  };
}

/** Map browse markers / preview (same shape as public task map). */
export function transformMyTasksForMapBrowse(
  tasks: ApiTask[],
  userId?: string,
): MapBrowseTask[] {
  return tasks
    .filter(hasValidCoordinates)
    .map((task, browseOrder) => {
      const view = transformApiTaskToMyTaskView(task, userId);
      return {
        id: view.slug || view.id,
        slug: view.slug || view.id,
        title: view.title,
        status: view.status,
        location: view.location,
        coordinates: view.coordinates,
        price: view.price,
        priceLabel: resolveMapMarkerPriceLabel(task),
        category: view.category,
        workType: view.workType,
        postedDate: view.postedDate,
        dueDate: view.dueDate,
        description: view.description,
        hasOffers: view.hasOffers,
        isAssigned: view.isAssigned,
        statusColor: view.statusColor,
        user: view.user,
        browseOrder,
      };
    });
}
