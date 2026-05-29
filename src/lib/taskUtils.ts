import { TOP_CATEGORIES } from '@/components/constants';
import { Category, Task, PaginatedResponse } from '@/types';

/** Status tabs on /my-tasks — matches API `task.status` (except `all`). */
export type MyTasksFilterId =
  | 'all'
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export const MY_TASKS_STATUS_FILTERS: { id: MyTasksFilterId; label: string }[] = [
  { id: 'all', label: 'All tasks' },
  { id: 'open', label: 'Posted' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'disputed', label: 'Disputed' },
];

export function formatMyTaskStatusLabel(status: string): string {
  switch (status) {
    case 'open':
      return 'Posted';
    case 'draft':
      return 'Draft';
    case 'assigned':
      return 'Assigned';
    case 'funded':
      return 'Funded';
    case 'pending_approval':
      return 'Pending approval';
    case 'in_progress':
      return 'In progress';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'disputed':
      return 'Disputed';
    default:
      return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

/** Normalize DRF paginated or plain-array task responses */
export function extractTaskList(
  data: PaginatedResponse<Task> | Task[] | null | undefined
): Task[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}

/** Normalize DRF paginated or plain-array category responses */
export function extractCategoryList(
  data: PaginatedResponse<Category> | Category[] | null | undefined
): Category[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}

/** Flat category options for selects (parent + subcategories, deduped by id). */
export function flattenCategoriesForSelect(
  categories: Category[]
): { id: string; name: string }[] {
  const byId = new Map<string, string>();
  for (const cat of categories) {
    if (cat.id && cat.name?.trim()) byId.set(String(cat.id), cat.name.trim());
    if (Array.isArray(cat.subcategories)) {
      for (const sub of cat.subcategories) {
        if (sub.id && sub.name?.trim()) byId.set(String(sub.id), sub.name.trim());
      }
    }
  }
  return [...byId.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Flat, sorted category names for filter pickers (includes subcategories). */
export function categoryFilterLabels(categories: Category[]): string[] {
  const names: string[] = [];
  for (const cat of categories) {
    if (cat.name?.trim()) names.push(cat.name.trim());
    if (Array.isArray(cat.subcategories)) {
      for (const sub of cat.subcategories) {
        if (sub.name?.trim()) names.push(sub.name.trim());
      }
    }
  }
  return [...new Set(names)].sort((a, b) => a.localeCompare(b));
}

/** Fallback labels when the categories API is empty or unavailable */
export function getFallbackCategoryNames(): string[] {
  const names = TOP_CATEGORIES.flatMap((group) => [group.title, ...group.links]);
  return [...new Set(names)].sort((a, b) => a.localeCompare(b));
}

export function getFallbackCategories(): Category[] {
  return getFallbackCategoryNames().map((name, index) => ({
    id: `fallback-${index}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    is_active: true,
  }));
}

/** Owner id from list (UUID string) or detail (nested user) serializers */
export function getTaskOwnerId(task: Task): string | undefined {
  const owner = task.owner;
  if (!owner) return undefined;
  if (typeof owner === 'object' && 'id' in owner && owner.id) {
    return String(owner.id);
  }
  return String(owner);
}

export function isCurrentUserTaskOwner(task: Task, userId: string | undefined): boolean {
  if (!userId) return false;
  const ownerId = getTaskOwnerId(task);
  return ownerId !== undefined && ownerId === String(userId);
}

export function canSubmitOfferOnTask(task: Task, userId: string | undefined): boolean {
  if (!userId) return false;
  if (isCurrentUserTaskOwner(task, userId)) return false;
  return task.status === 'open' && task.is_open !== false;
}

/** Assigned tasker id from list (UUID string) or detail (nested user) serializers */
export function getAssignedTaskerId(task: Task): string | undefined {
  const assignee = task.assigned_tasker;
  if (!assignee) return undefined;
  if (typeof assignee === 'object' && 'id' in assignee && assignee.id) {
    return String(assignee.id);
  }
  return String(assignee);
}

export function isCurrentUserAssignedTasker(
  task: Task,
  userId: string | undefined
): boolean {
  if (!userId) return false;
  const assigneeId = getAssignedTaskerId(task);
  return assigneeId !== undefined && assigneeId === String(userId);
}

export function getTaskBidCount(task: Task): number {
  return task.bid_count ?? task.bids_count ?? 0;
}

/** Merge posted + assigned task lists without duplicates */
export function mergeUserTasks(posted: Task[], assigned: Task[]): Task[] {
  const byId = new Map<string, Task>();

  for (const task of posted) {
    byId.set(String(task.id), {
      ...task,
      is_posted_by_me: true,
      is_assigned_to_me: task.is_assigned_to_me ?? false,
    });
  }

  for (const task of assigned) {
    const id = String(task.id);
    const existing = byId.get(id);
    if (existing) {
      byId.set(id, {
        ...existing,
        ...task,
        is_posted_by_me: true,
        is_assigned_to_me: true,
        bids_count: Math.max(
          getTaskBidCount(existing),
          getTaskBidCount(task)
        ),
      });
    } else {
      byId.set(id, {
        ...task,
        is_posted_by_me: false,
        is_assigned_to_me: true,
      });
    }
  }

  return Array.from(byId.values());
}

export function resolveMyTaskRoles(
  task: Task,
  userId: string | undefined
): { isOwner: boolean; isAssignee: boolean } {
  const isOwner =
    task.is_posted_by_me === true || isCurrentUserTaskOwner(task, userId);
  const isAssignee =
    task.is_assigned_to_me === true || isCurrentUserAssignedTasker(task, userId);
  return { isOwner, isAssignee };
}

/** Task is assigned and paid; tasker can begin work. */
export function isTaskReadyToStart(status: string): boolean {
  return status === 'assigned' || status === 'funded';
}

/** True when the task was posted by the current user (not assignee-only). */
export function isMyPostedTask(
  task: Task,
  userId: string | undefined
): boolean {
  return resolveMyTaskRoles(task, userId).isOwner;
}

/** Edit is allowed only on tasks you posted. */
export function canEditMyPostedTask(
  task: Task,
  userId: string | undefined
): boolean {
  if (!isMyPostedTask(task, userId)) return false;
  // Backend only allows updates while task is still editable.
  // Offers (bids) do NOT block editing, but assignment / progress does.
  if (task.assigned_tasker) return false;
  return ['draft', 'open'].includes(task.status);
}

/** Delete only for your posted tasks, and only before assignment / active work. */
export function canDeleteMyPostedTask(
  task: Task,
  userId: string | undefined
): boolean {
  if (!isMyPostedTask(task, userId)) return false;
  if (task.assigned_tasker) return false;
  return !['assigned', 'in_progress', 'completed', 'disputed'].includes(
    task.status
  );
}

/** Assigned tasker can move assigned → in progress. */
export function canTaskerStartWork(
  task: Task,
  userId: string | undefined
): boolean {
  const { isAssignee } = resolveMyTaskRoles(task, userId);
  return isAssignee && isTaskReadyToStart(task.status);
}

export function hasTaskerMarkedComplete(task: Task): boolean {
  return Boolean(task.tasker_marked_complete_at);
}

export function hasOwnerMarkedComplete(task: Task): boolean {
  return Boolean(task.owner_marked_complete_at);
}

/** Either party can confirm once while work is in progress (if they have not yet). */
export function canConfirmWorkComplete(
  task: Task,
  userId: string | undefined
): boolean {
  if (task.status !== 'in_progress') return false;
  const { isOwner, isAssignee } = resolveMyTaskRoles(task, userId);
  if (isAssignee && !hasTaskerMarkedComplete(task)) return true;
  if (isOwner && !hasOwnerMarkedComplete(task)) return true;
  return false;
}

/** @deprecated Use canConfirmWorkComplete — kept for imports */
export function canMarkTaskComplete(
  task: Task,
  userId: string | undefined
): boolean {
  return canConfirmWorkComplete(task, userId);
}

export function getCompletionStatusMessage(
  task: Task,
  userId: string | undefined
): string | null {
  if (task.status === 'completed') return null;
  const { isOwner, isAssignee } = resolveMyTaskRoles(task, userId);
  const taskerDone = hasTaskerMarkedComplete(task);
  const ownerDone = hasOwnerMarkedComplete(task);

  if (isAssignee && taskerDone && !ownerDone) {
    return 'You confirmed completion. Waiting for the poster to confirm before payment is released.';
  }
  if (isOwner && ownerDone && !taskerDone) {
    return 'You confirmed completion. Waiting for the tasker to confirm before payment is released.';
  }
  if (isOwner && taskerDone && !ownerDone) {
    return 'The tasker marked work complete. Confirm to release payment.';
  }
  if (isAssignee && ownerDone && !taskerDone) {
    return 'The poster confirmed completion. Mark your work complete to release payment.';
  }
  return null;
}

/** Cancel when poster or assigned tasker, and task is not already finished. */
export function canCancelMyTask(
  task: Task,
  userId: string | undefined
): boolean {
  const { isOwner, isAssignee } = resolveMyTaskRoles(task, userId);
  if (!isOwner && !isAssignee) return false;
  return !['completed', 'cancelled'].includes(task.status);
}

/** Task appears on /my-tasks when user posted it or is the assigned tasker. */
export function isUserInvolvedInMyTask(
  task: Task,
  userId: string | undefined
): boolean {
  if (!userId) return false;
  const { isOwner, isAssignee } = resolveMyTaskRoles(task, userId);
  return isOwner || isAssignee;
}

export function matchesMyTasksFilter(
  task: Task,
  filter: MyTasksFilterId,
  userId: string | undefined
): boolean {
  if (!isUserInvolvedInMyTask(task, userId)) return false;
  if (filter === 'all') return true;
  if (filter === 'assigned') {
    return task.status === 'assigned' || task.status === 'funded';
  }
  if (filter === 'in_progress') {
    return task.status === 'in_progress' || task.status === 'pending_approval';
  }
  return task.status === filter;
}

export function countMyTasksByFilter(
  tasks: Task[],
  userId: string | undefined
): Record<MyTasksFilterId, number> {
  const filters: MyTasksFilterId[] = MY_TASKS_STATUS_FILTERS.map((f) => f.id);
  return filters.reduce(
    (acc, filter) => {
      acc[filter] =
        filter === 'all'
          ? tasks.length
          : tasks.filter((t) => matchesMyTasksFilter(t, filter, userId)).length;
      return acc;
    },
    {} as Record<MyTasksFilterId, number>
  );
}

/** Nested poster/owner object from list or detail serializers. */
export function getTaskPosterUser(task: Task): {
  id?: string;
  username?: string | null;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  profile_image?: string;
} | null {
  const nested =
    (task.poster && typeof task.poster === 'object' ? task.poster : null) ||
    (task.owner && typeof task.owner === 'object' ? task.owner : null);
  return nested;
}

export function getTaskPosterId(task: Task): string | null {
  const nested = getTaskPosterUser(task);
  if (nested?.id) return String(nested.id);
  if (typeof task.owner === 'string') return task.owner;
  if (typeof task.poster === 'string') return task.poster;
  return null;
}

/** Slug for `/users/[slug]` — prefers username, falls back to user id. */
export function getTaskPosterProfileSlug(task: Task): string | null {
  const nested = getTaskPosterUser(task);
  if (nested?.username) return nested.username;
  return getTaskPosterId(task);
}
