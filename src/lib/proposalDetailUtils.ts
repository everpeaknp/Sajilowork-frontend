import { getMediaUrl } from '@/lib/utils';
import { resolveBidListingKind } from '@/lib/buildFreelancerCvData';
import { isCurrentUserTaskOwner, getTaskOwnerId, isTaskReadyToStart } from '@/lib/taskUtils';
import type { Bid, Task, User } from '@/types';

function hasTaskerMarkedComplete(task: Task): boolean {
  return Boolean(task.tasker_marked_complete_at);
}

function hasOwnerMarkedComplete(task: Task): boolean {
  return Boolean(task.owner_marked_complete_at);
}

export function getEmployerDisplayName(bid: Bid): string {
  return (
    bid.task_owner_business_name?.trim() ||
    bid.task_owner_name?.trim() ||
    'Employer'
  );
}

export function resolveEmployerSlug(bid: Bid, task: Task | null): string {
  const nestedTask =
    bid.task && typeof bid.task === 'object' ? (bid.task as Partial<Task>) : null;

  const ownerUsername = task?.owner_username?.trim() || nestedTask?.owner_username?.trim();
  if (ownerUsername) return ownerUsername;

  const owner = task?.owner ?? nestedTask?.owner;
  if (owner && typeof owner === 'object') {
    const username = (owner as User).username?.trim();
    if (username) return username;
    const id = (owner as User).id?.trim();
    if (id) return id;
  }

  if (typeof owner === 'string' && owner.trim()) {
    return owner.trim();
  }

  return '';
}

export function getEmployerAvatarSrc(bid: Bid, task: Task | null): string | undefined {
  const nestedTask =
    bid.task && typeof bid.task === 'object' ? (bid.task as Partial<Task>) : null;
  const logo =
    bid.task_owner_logo_url?.trim() ||
    task?.owner_logo_url?.trim() ||
    nestedTask?.owner_logo_url?.trim();
  return logo ? getMediaUrl(logo) : undefined;
}

export function getEmployerAvatarBg(bid: Bid, task: Task | null): string | undefined {
  const nestedTask =
    bid.task && typeof bid.task === 'object' ? (bid.task as Partial<Task>) : null;
  return (
    bid.task_owner_logo_color?.trim() ||
    task?.owner_logo_color?.trim() ||
    nestedTask?.owner_logo_color?.trim() ||
    undefined
  );
}

export function isServiceOrderTask(task: Task | null | undefined): boolean {
  if (!task?.requirements?.length) return false;
  for (const entry of task.requirements) {
    if (!entry || typeof entry !== 'object') continue;
    const row = entry as { type?: string; value?: string };
    if (row.type !== 'dashboard_meta' || !row.value) continue;
    try {
      const parsed = JSON.parse(row.value) as { service_order?: boolean };
      if (parsed?.service_order) return true;
    } catch {
      // ignore invalid meta
    }
  }
  return false;
}

export function isServiceOrderBid(bid: Bid, task: Task | null | undefined): boolean {
  if (resolveBidListingKind(bid) !== 'service') return false;
  if (isServiceOrderTask(task)) return true;
  const nested =
    bid.task && typeof bid.task === 'object' ? (bid.task as Task) : null;
  if (isServiceOrderTask(nested)) return true;
  return isPurchasedServiceOrder(bid, task ?? nested);
}

/** Buyer-owned order task with seller on the accepted bid (direct service purchase). */
export function isPurchasedServiceOrder(bid: Bid, task: Task | null | undefined): boolean {
  if (!task || bid.status !== 'accepted') return false;
  const sellerId = bid.tasker?.id;
  if (!sellerId) return false;
  const ownerId = getTaskOwnerId(task);
  if (!ownerId) return false;
  return String(sellerId) !== String(ownerId);
}

export function canServiceOrderSellerStart(
  bid: Bid,
  task: Task,
  userId: string | undefined,
): boolean {
  if (!isServiceOrderSeller(bid, userId)) return false;
  if (!isTaskReadyToStart(task.status)) return false;
  const assigneeId = task.assigned_tasker
    ? typeof task.assigned_tasker === 'object'
      ? (task.assigned_tasker as User).id
      : task.assigned_tasker
    : null;
  if (assigneeId && String(assigneeId) === String(userId)) return true;
  return isServiceOrderSeller(bid, userId);
}

export function isServiceOrderSeller(bid: Bid, userId: string | undefined): boolean {
  if (!userId || !bid.tasker?.id) return false;
  return String(bid.tasker.id) === String(userId);
}

export function isServiceOrderBuyer(
  bid: Bid,
  task: Task | null | undefined,
  userId: string | undefined,
): boolean {
  if (!userId || isServiceOrderSeller(bid, userId)) return false;
  const merged =
    task ?? (bid.task && typeof bid.task === 'object' ? (bid.task as Task) : null);
  if (!merged) return false;
  if (merged.is_posted_by_me) return true;
  if (isCurrentUserTaskOwner(merged, userId)) return true;
  if (isPurchasedServiceOrder(bid, merged)) {
    const ownerId = getTaskOwnerId(merged);
    return Boolean(ownerId && String(ownerId) === String(userId));
  }
  return false;
}

export function canServiceOrderPartyComplete(
  bid: Bid,
  task: Task,
  userId: string | undefined,
): boolean {
  if (task.status !== 'in_progress') return false;
  if (isServiceOrderSeller(bid, userId)) {
    return !hasTaskerMarkedComplete(task);
  }
  if (isServiceOrderBuyer(bid, task, userId)) {
    return !hasOwnerMarkedComplete(task);
  }
  return false;
}

export function canManageServiceOrderWorkflow(
  bid: Bid,
  task: Task | null | undefined,
  userId: string | undefined,
  isCustomer: boolean,
): boolean {
  if (isServiceOrderSeller(bid, userId)) return true;
  if (isServiceOrderBuyer(bid, task, userId)) return true;
  if (isCustomer && isServiceOrderBid(bid, task) && !isServiceOrderSeller(bid, userId)) {
    return true;
  }
  return false;
}

export function canUserViewBid(
  bid: Bid | null,
  userId: string | undefined,
  isCustomer: boolean,
): boolean {
  if (!bid || !userId) return false;
  const taskerId = bid.tasker?.id;
  if (taskerId && String(taskerId) === String(userId)) return true;

  const nestedTask =
    bid.task && typeof bid.task === 'object' ? (bid.task as Partial<Task>) : null;
  const owner = nestedTask?.owner;
  const ownerId =
    nestedTask?.is_posted_by_me === true
      ? userId
      : owner && typeof owner === 'object'
        ? (owner as User).id
        : typeof owner === 'string'
          ? owner
          : undefined;
  if (ownerId && String(ownerId) === String(userId)) return true;

  // Legacy: employer account browsing proposals on their listings
  if (isCustomer) return true;
  return false;
}
