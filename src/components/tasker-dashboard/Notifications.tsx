'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { TASK_BROWSE_PATH } from '@/lib/taskBrowsePath';
import {
  dashboardMessageConversationHref,
  DASHBOARD_MESSAGES_PATH,
} from '@/lib/dashboardChat';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  AlertCircle,
  Bell,
  BellOff,
  Briefcase,
  CheckCheck,
  ChevronRight,
  DollarSign,
  MessageSquare,
  RefreshCw,
  Settings,
  Star,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { notificationService } from '@/services';
import { Notification as NotificationItem } from '@/types';
import { toast } from 'sonner';
import {
  landingBody,
  landingBodyMuted,
  landingHeadline,
  landingHeadlineSm,
} from '@/components/LangingHome/landingTypography';
import { normalizeNotificationCurrency } from '@/lib/nepalLocale';

const DASHBOARD_TYPO = `${landingBody} [&_h1]:font-formula [&_h1]:font-black [&_h1]:tracking-tight [&_h2]:font-formula [&_h2]:font-extrabold [&_h2]:tracking-tight`;

type FilterTab = 'all' | 'unread';
type DateGroupKey = 'today' | 'yesterday' | 'this_week' | 'older';

const DATE_GROUP_LABELS: Record<DateGroupKey, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  this_week: 'This week',
  older: 'Earlier',
};

function getNotificationErrorMessage(error: unknown, fallback = 'Failed to load notifications') {
  const extractString = (candidate: unknown): string | null => {
    if (!candidate) return null;
    if (typeof candidate === 'string') return candidate.trim() || null;
    if (typeof candidate === 'number' || typeof candidate === 'boolean') return String(candidate);
    if (typeof candidate === 'object') {
      const obj = candidate as Record<string, unknown>;
      if (typeof obj.message === 'string' && obj.message.trim()) return obj.message.trim();
      if (typeof obj.detail === 'string' && obj.detail.trim()) return obj.detail.trim();
      for (const key of Object.keys(obj)) {
        const extracted = extractString(obj[key]);
        if (extracted) return extracted;
      }
    }
    return null;
  };

  if (!error) return fallback;
  if (typeof error === 'string') return error;
  const fromError = extractString(error);
  if (fromError) return fromError;
  return fallback;
}

function getNotificationHref(notification: NotificationItem): string {
  if (notification.action_url?.startsWith('/')) {
    return notification.action_url;
  }

  const data = notification.data as Record<string, unknown> | undefined;

  if (notification.notification_type === 'message_received') {
    const convId = data?.conversation_id ?? data?.conversation;
    if (convId) return dashboardMessageConversationHref(String(convId));
    return DASHBOARD_MESSAGES_PATH;
  }

  if (
    notification.notification_type === 'bid_received' ||
    notification.notification_type === 'bid_accepted' ||
    notification.notification_type === 'bid_rejected' ||
    notification.notification_type === 'task_assigned' ||
    notification.notification_type === 'task_completed'
  ) {
    return '/my-tasks';
  }

  if (notification.notification_type === 'review_received') {
    return '/tasker-dashboard/profile';
  }

  return '/my-tasks';
}

function getTimeAgo(dateString: string | undefined) {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString('en-NP', { month: 'short', day: 'numeric' });
}

function getDateGroup(dateString: string | undefined): DateGroupKey {
  if (!dateString) return 'older';
  const date = new Date(dateString);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  if (date >= startOfToday) return 'today';
  if (date >= startOfYesterday) return 'yesterday';
  if (date >= startOfWeek) return 'this_week';
  return 'older';
}

function getIcon(type: string) {
  switch (type) {
    case 'task_created':
    case 'task_updated':
    case 'task_assigned':
    case 'task_completed':
    case 'task_cancelled':
    case 'task_expired':
    case 'task_question':
    case 'bid_received':
    case 'bid_accepted':
    case 'bid_rejected':
      return Briefcase;
    case 'payment_received':
    case 'payment_sent':
    case 'payment_failed':
    case 'payout_processed':
      return DollarSign;
    case 'review_received':
    case 'review_response':
      return Star;
    case 'message_received':
    case 'conversation_started':
    case 'bid_message':
      return MessageSquare;
    default:
      return Bell;
  }
}

function getIconStyles(type: string) {
  switch (type) {
    case 'task_created':
    case 'task_updated':
    case 'task_assigned':
    case 'task_completed':
    case 'bid_received':
    case 'bid_accepted':
      return 'bg-emerald-50 text-emerald-600 ring-emerald-100';
    case 'bid_rejected':
    case 'task_cancelled':
    case 'task_expired':
    case 'payment_failed':
      return 'bg-red-50 text-red-600 ring-red-100';
    case 'payment_received':
    case 'payment_sent':
    case 'payout_processed':
      return 'bg-brand-emerald/10 text-brand-emerald ring-brand-emerald/15';
    case 'review_received':
    case 'review_response':
      return 'bg-amber-50 text-amber-600 ring-amber-100';
    case 'message_received':
    case 'conversation_started':
    case 'bid_message':
      return 'bg-violet-50 text-violet-600 ring-violet-100';
    default:
      return 'bg-slate-50 text-slate-600 ring-slate-100';
  }
}

function groupNotifications(items: NotificationItem[]) {
  const groups: Record<DateGroupKey, NotificationItem[]> = {
    today: [],
    yesterday: [],
    this_week: [],
    older: [],
  };

  for (const item of items) {
    groups[getDateGroup(item.created_at)].push(item);
  }

  return (Object.keys(DATE_GROUP_LABELS) as DateGroupKey[]).filter(
    (key) => groups[key].length > 0,
  ).map((key) => ({ key, label: DATE_GROUP_LABELS[key], items: groups[key] }));
}

function NotificationSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 rounded-2xl border border-outline-variant bg-white p-4 animate-pulse dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-100 dark:bg-neutral-800" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 w-2/5 rounded bg-slate-100 dark:bg-neutral-800" />
            <div className="h-3 w-full rounded bg-slate-50 dark:bg-neutral-800/60" />
            <div className="h-3 w-4/5 rounded bg-slate-50 dark:bg-neutral-800/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Notifications() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async (opts?: { silent?: boolean }) => {
    try {
      if (opts?.silent) setRefreshing(true);
      else setLoading(true);

      const response = await notificationService.getNotifications(
        filter === 'unread' ? { is_read: false } : undefined,
      );

      if (response.success && response.data) {
        const notificationsData = Array.isArray(response.data)
          ? response.data
          : (response.data as { results?: NotificationItem[] }).results || [];
        setNotifications(notificationsData);
      } else {
        setNotifications([]);
      }
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      const errorMessage = getNotificationErrorMessage(error);
      const isThrottled = err?.status === 429 || /throttled/i.test(errorMessage);
      const logFn = isThrottled ? console.warn : console.error;
      logFn(isThrottled ? 'Notifications rate limited:' : 'Failed to fetch notifications:', errorMessage);
      toast[isThrottled ? 'warning' : 'error'](
        isThrottled ? 'Notifications are rate limited. Try again shortly.' : errorMessage,
      );
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = useMemo(() => {
    const list = Array.isArray(notifications) ? notifications : [];
    return filter === 'unread' ? list.filter((n) => !n.is_read) : list;
  }, [filter, notifications]);

  const groupedNotifications = useMemo(
    () => groupNotifications(filteredNotifications),
    [filteredNotifications],
  );

  const unreadCount = useMemo(
    () => (Array.isArray(notifications) ? notifications.filter((n) => !n.is_read).length : 0),
    [notifications],
  );

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        Array.isArray(prev) ? prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)) : [],
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to mark as read';
      toast.error(message);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        Array.isArray(prev) ? prev.map((n) => ({ ...n, is_read: true })) : [],
      );
      toast.success('All caught up — every notification is read.');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to mark all as read';
      toast.error(message);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => (Array.isArray(prev) ? prev.filter((n) => n.id !== id) : []));
      toast.success('Notification removed');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete notification';
      toast.error(message);
    }
  };

  const openNotification = async (notification: NotificationItem) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    router.push(getNotificationHref(notification));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(DASHBOARD_TYPO, 'max-w-3xl space-y-8 pb-20')}
    >
      <header className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className={cn(landingHeadlineSm, 'text-[10px] uppercase tracking-[0.3em] text-brand-emerald')}>
              Activity
            </p>
            <h1 className={cn(landingHeadline, 'text-2xl text-brand-dark sm:text-4xl')}>
              Notifications
            </h1>
            <p className={cn(landingBodyMuted, 'max-w-md text-sm leading-relaxed')}>
              Task updates, messages, payments, and reviews — everything that needs your attention.
            </p>
          </div>
          <Link
            href="/tasker-dashboard/settings?tab=notifications"
            className={cn(
              landingBody,
              'inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-outline-variant bg-white px-4 py-2.5 text-sm font-semibold text-brand-dark transition-colors hover:border-brand-emerald/30 hover:text-brand-emerald dark:border-neutral-800 dark:bg-neutral-900 dark:text-stone-100 dark:hover:border-brand-emerald/30',
            )}
          >
            <Settings className="h-4 w-4" />
            Preferences
          </Link>
        </div>
      </header>

      <div className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800 dark:bg-neutral-900">
        <div className="inline-flex rounded-xl bg-surface-low p-1">
          {(['all', 'unread'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={cn(
                landingBody,
                'relative rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
                filter === tab ? 'text-white' : 'text-[#6a719a] hover:text-brand-dark',
              )}
            >
              {filter === tab && (
                <motion.span
                  layoutId="notificationFilter"
                  className="absolute inset-0 rounded-lg bg-brand-emerald shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {tab === 'all' ? 'All' : 'Unread'}
                {tab === 'unread' && unreadCount > 0 ? (
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                      filter === 'unread' ? 'bg-white/20 text-white' : 'bg-brand-emerald/10 text-brand-emerald',
                    )}
                  >
                    {unreadCount}
                  </span>
                ) : null}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={markAllAsRead}
              className={cn(
                landingBody,
                'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-brand-emerald transition-colors hover:bg-brand-emerald/5',
              )}
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => fetchNotifications({ silent: true })}
            disabled={refreshing}
            className="inline-flex items-center justify-center rounded-xl border border-outline-variant p-2.5 text-brand-dark transition-colors hover:border-brand-emerald/30 hover:text-brand-emerald disabled:opacity-50"
            title="Refresh"
            aria-label="Refresh notifications"
          >
            <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
          </button>
        </div>
      </div>

      {loading ? (
        <NotificationSkeleton />
      ) : filteredNotifications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-outline-variant bg-surface-low/50 px-6 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-outline-variant dark:bg-neutral-900 dark:ring-neutral-800">
            {filter === 'unread' ? (
              <BellOff className="h-8 w-8 text-[#6a719a]" />
            ) : (
              <Bell className="h-8 w-8 text-brand-emerald/40" />
            )}
          </div>
          <h2 className={cn(landingHeadlineSm, 'mt-5 text-lg text-brand-dark')}>
            {filter === 'unread' ? 'No unread notifications' : 'Nothing here yet'}
          </h2>
          <p className={cn(landingBodyMuted, 'mx-auto mt-2 max-w-sm text-sm')}>
            {filter === 'unread'
              ? "You're all caught up. Switch to All to browse your history."
              : 'When tasks, messages, or payments need you, they will show up here.'}
          </p>
          {filter === 'unread' ? (
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={cn(
                landingBody,
                'mt-6 inline-flex items-center gap-2 rounded-full bg-brand-emerald px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90',
              )}
            >
              View all notifications
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <Link
              href={TASK_BROWSE_PATH}
              className={cn(
                landingBody,
                'mt-6 inline-flex items-center gap-2 rounded-full bg-brand-emerald px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90',
              )}
            >
              Browse tasks
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {groupedNotifications.map((group) => (
            <section key={group.key} className="space-y-3">
              <h2
                className={cn(
                  landingHeadlineSm,
                  'px-1 text-xs uppercase tracking-[0.2em] text-[#6a719a]',
                )}
              >
                {group.label}
              </h2>
              <ul className="space-y-2">
                {group.items.map((notification) => {
                  const Icon = getIcon(notification.notification_type);
                  const iconStyles = getIconStyles(notification.notification_type);

                  return (
                    <li key={notification.id}>
                      <div
                        className={cn(
                          'group relative flex gap-3 rounded-2xl border bg-white p-4 transition-all sm:gap-4 sm:p-5 dark:bg-neutral-900',
                          notification.is_read
                            ? 'border-outline-variant hover:border-brand-emerald/20 hover:shadow-sm dark:border-neutral-800'
                            : 'border-brand-emerald/25 bg-brand-emerald/[0.03] shadow-sm shadow-brand-emerald/5 dark:border-brand-emerald/30 dark:bg-brand-emerald/[0.06]',
                        )}
                      >
                        {!notification.is_read ? (
                          <span
                            className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-brand-emerald"
                            aria-hidden
                          />
                        ) : null}

                        <button
                          type="button"
                          onClick={() => openNotification(notification)}
                          className="flex min-w-0 flex-1 items-start gap-3 text-left sm:gap-4"
                        >
                          <div
                            className={cn(
                              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1',
                              iconStyles,
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1 pt-0.5">
                            <div className="flex items-start justify-between gap-3">
                              <h3
                                className={cn(
                                  landingHeadlineSm,
                                  'line-clamp-1 text-sm text-brand-dark sm:text-base dark:text-stone-100',
                                  !notification.is_read && 'text-brand-dark',
                                )}
                              >
                                {notification.title}
                              </h3>
                              <time
                                className={cn(
                                  landingBodyMuted,
                                  'shrink-0 text-[11px] font-medium tabular-nums',
                                )}
                              >
                                {getTimeAgo(notification.created_at)}
                              </time>
                            </div>
                            <p
                              className={cn(
                                landingBodyMuted,
                                'mt-1 line-clamp-2 text-sm leading-relaxed',
                              )}
                            >
                              {normalizeNotificationCurrency(notification.message)}
                            </p>
                            <span
                              className={cn(
                                landingBody,
                                'mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-emerald opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100',
                              )}
                            >
                              Open
                              <ChevronRight className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        </button>

                        <div className="flex shrink-0 flex-col gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                          {!notification.is_read ? (
                            <button
                              type="button"
                              onClick={() => markAsRead(notification.id)}
                              className="rounded-lg p-2 text-[#6a719a] transition-colors hover:bg-brand-emerald/5 hover:text-brand-emerald"
                              title="Mark as read"
                              aria-label="Mark as read"
                            >
                              <CheckCheck className="h-4 w-4" />
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => deleteNotification(notification.id)}
                            className="rounded-lg p-2 text-[#6a719a] transition-colors hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                            aria-label="Delete notification"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      {!loading && filteredNotifications.length > 0 ? (
        <p
          className={cn(
            landingBodyMuted,
            'flex items-center justify-center gap-2 text-center text-xs',
          )}
        >
          <AlertCircle className="h-3.5 w-3.5" />
          Tap a notification to open it — unread items are marked read automatically.
        </p>
      ) : null}
    </motion.div>
  );
}
