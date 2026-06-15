import { getMediaUrl } from '@/lib/utils';
import type { Bid, Task, User } from '@/types';

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

export function canUserViewBid(
  bid: Bid | null,
  userId: string | undefined,
  isCustomer: boolean,
): boolean {
  if (!bid || !userId) return false;
  if (isCustomer) return true;
  const taskerId = bid.tasker?.id;
  return Boolean(taskerId && String(taskerId) === String(userId));
}
