/**
 * Dashboard messaging — paths and deep links aligned with /api/v1/chat/
 */

import type { DashboardMessagesView } from '@/lib/dashboardMessages';

export const DASHBOARD_MESSAGES_PATH = '/dashboard/message';

export type MessageDeepLinkParams = {
  conversation?: string;
  bid?: string;
  task?: string;
  tasker?: string;
};

/** Build /dashboard/message URL with optional Chat API deep-link params. */
export function dashboardMessageHref(params?: MessageDeepLinkParams): string {
  const sp = new URLSearchParams();
  if (params?.conversation) sp.set('conversation', params.conversation);
  if (params?.bid) sp.set('bid', params.bid);
  if (params?.task) sp.set('task', params.task);
  if (params?.tasker) sp.set('tasker', params.tasker);
  const qs = sp.toString();
  return qs ? `${DASHBOARD_MESSAGES_PATH}?${qs}` : DASHBOARD_MESSAGES_PATH;
}

export function dashboardMessageBidHref(bidId: string, taskerId: string): string {
  return dashboardMessageHref({ bid: bidId, tasker: taskerId });
}

export function dashboardMessageTaskHref(taskId: string, taskerId: string): string {
  return dashboardMessageHref({ task: taskId, tasker: taskerId });
}

export function dashboardMessageConversationHref(conversationId: string): string {
  return dashboardMessageHref({ conversation: conversationId });
}

/** Chat API `view` query — employer vs freelancer inbox. */
export function chatInboxViewParam(
  dashboardRole: 'customer' | 'tasker',
): DashboardMessagesView {
  return dashboardRole === 'tasker' ? 'tasker' : 'employer';
}
