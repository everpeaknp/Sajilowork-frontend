/**
 * Role-scoped inbox helpers — employer (customer) vs freelancer (tasker).
 * Aligns with chat `view` and notifications `view` query params.
 */

export type InboxView = 'employer' | 'tasker';

export function roleToInboxView(role?: string | null): InboxView {
  return role === 'tasker' ? 'tasker' : 'employer';
}

/** Types typically for listing owners (Employer mode). */
export const EMPLOYER_NOTIFICATION_TYPES = new Set([
  'new_bid',
  'bid_received',
  'bid_withdrawn',
  'task_question',
  'task_started',
  'task_progress_updated',
  'task_completion_requested',
  'task_cancelled',
  'payment_sent',
  'payment_succeeded',
  'payment_failed',
]);

/** Types typically for freelancers (Freelancer mode). */
export const TASKER_NOTIFICATION_TYPES = new Set([
  'task_created',
  'task_assigned',
  'task_approved',
  'task_completed',
  'task_reminder',
  'revision_requested',
  'bid_accepted',
  'bid_rejected',
  'bid_counter_offer',
  'counter_offer',
  'payment_received',
  'payout_processed',
  'skill_approved',
  'document_approved',
  'document_rejected',
  'badge_earned',
]);

const SHARED_NOTIFICATION_TYPES = new Set([
  'message_received',
  'conversation_started',
  'bid_message',
  'review_received',
  'review_response',
  'mutual_review_complete',
  'user_verified',
  'system_announcement',
  'account_warning',
  'account_suspended',
  'task_updated',
  'task_status_update',
  'task_expired',
]);

export function notificationMatchesInboxView(
  notification: {
    notification_type?: string;
    data?: Record<string, unknown> | null;
  },
  view: InboxView,
): boolean {
  const type = notification.notification_type || '';
  const data = notification.data || {};
  const inboxView =
    typeof data.inbox_view === 'string' ? data.inbox_view.toLowerCase() : null;

  if (inboxView === 'employer' || inboxView === 'tasker') {
    return inboxView === view;
  }

  if (view === 'employer' && EMPLOYER_NOTIFICATION_TYPES.has(type)) return true;
  if (view === 'tasker' && TASKER_NOTIFICATION_TYPES.has(type)) return true;
  if (SHARED_NOTIFICATION_TYPES.has(type)) return true;

  // Unknown types: show in both modes so nothing is lost.
  return true;
}
