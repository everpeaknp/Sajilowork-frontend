import type { Conversation, Task, TaskStatus } from '@/types';

// Messaging should open once a task is accepted/assigned (and remain open while work flows),
// and close after completion/cancellation.
export const MESSAGING_ALLOWED_TASK_STATUSES: TaskStatus[] = [
  'assigned',
  'funded',
  'in_progress',
  'pending_approval',
];

export function getTaskStatusFromConversation(
  conv: Conversation | null | undefined
): TaskStatus | undefined {
  if (!conv) return undefined;

  if (conv.task_status) {
    return conv.task_status as TaskStatus;
  }

  const task = conv.task;
  if (task && typeof task === 'object' && 'status' in task) {
    return (task as Task).status;
  }

  return undefined;
}

export function isMessagingEnabledForConversation(conv: Conversation | null | undefined): boolean {
  if (!conv) return false;
  if (typeof conv.messaging_enabled === 'boolean') {
    return conv.messaging_enabled;
  }

  const status = getTaskStatusFromConversation(conv);
  if (!status) return false;
  return MESSAGING_ALLOWED_TASK_STATUSES.includes(status);
}

export function messagingDisabledReason(status?: TaskStatus): string {
  if (status === 'completed') {
    return 'This task is completed. You can view past messages but cannot send new ones.';
  }
  if (status === 'cancelled') {
    return 'This task was cancelled. You can view past messages but cannot send new ones.';
  }
  if (status === 'open' || status === 'draft') {
    return 'Messaging opens once a tasker is assigned and work is in progress.';
  }
  return 'Messaging is only available while a task is assigned and in progress.';
}
