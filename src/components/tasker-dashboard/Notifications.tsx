'use client';

import { motion } from 'motion/react';
import { Bell, CheckCircle2, AlertCircle, MessageSquare, DollarSign, Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { notificationService } from '@/services';
import { Notification as NotificationType } from '@/types';
import { toast } from 'sonner';

export default function Notifications() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const getNotificationErrorMessage = (error: any, fallback = 'Failed to load notifications') => {
    const extractString = (candidate: any): string | null => {
      if (!candidate) return null;
      if (typeof candidate === 'string') return candidate.trim() || null;
      if (typeof candidate === 'number' || typeof candidate === 'boolean') return String(candidate);
      if (typeof candidate === 'object') {
        if (typeof candidate.message === 'string' && candidate.message.trim().length > 0) return candidate.message.trim();
        if (typeof candidate.detail === 'string' && candidate.detail.trim().length > 0) return candidate.detail.trim();
        if (candidate.message && typeof candidate.message !== 'string') return extractString(candidate.message);
        if (candidate.detail && typeof candidate.detail !== 'string') return extractString(candidate.detail);
        const keys = Object.keys(candidate);
        for (const key of keys) {
          const extracted = extractString(candidate[key]);
          if (extracted) return extracted;
        }
      }
      return null;
    };

    if (!error) return fallback;
    if (typeof error === 'string') return error;
    const fromError = extractString(error);
    if (fromError) return fromError;
    if (typeof error?.toString === 'function') {
      const toStringValue = error.toString();
      if (typeof toStringValue === 'string' && toStringValue.trim().length > 0 && toStringValue !== '[object Object]') {
        return toStringValue;
      }
    }
    return fallback;
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications(
        filter === 'unread' ? { is_read: false } : undefined
      );

      if (response.success && response.data) {
        // Handle both array and paginated response formats
        const notificationsData = Array.isArray(response.data) 
          ? response.data 
          : (response.data as any).results || [];
        setNotifications(notificationsData);
      } else {
        // If no data, set empty array
        setNotifications([]);
      }
    } catch (error: any) {
      const errorMessage = getNotificationErrorMessage(error);
      const isThrottled = error?.status === 429 || /throttled/i.test(errorMessage);
      const logFn = isThrottled ? console.warn : console.error;

      logFn(isThrottled ? '⚠️ Notifications rate limited:' : 'Failed to fetch notifications:', errorMessage);
      logFn('Failed notifications raw error:', error);
      toast[isThrottled ? 'warning' : 'error'](isThrottled ? 'Notifications are rate limited. Showing cached values.' : errorMessage);
      // Set empty array on error to prevent filter errors
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'task_created':
      case 'task_updated':
      case 'task_assigned':
      case 'task_completed':
      case 'task_cancelled':
      case 'task_expired':
      case 'task_question':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'payment_received':
      case 'payment_sent':
      case 'payment_failed':
      case 'payout_processed':
        return <DollarSign className="w-5 h-5" />;
      case 'review_received':
      case 'review_response':
        return <Star className="w-5 h-5" />;
      case 'message_received':
      case 'conversation_started':
      case 'bid_message':
        return <MessageSquare className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'task_created':
      case 'task_updated':
      case 'task_assigned':
      case 'task_completed':
      case 'task_cancelled':
      case 'task_expired':
      case 'task_question':
        return 'bg-green-50 text-green-600';
      case 'payment_received':
      case 'payment_sent':
      case 'payment_failed':
      case 'payout_processed':
        return 'bg-blue-50 text-primary';
      case 'review_received':
      case 'review_response':
        return 'bg-yellow-50 text-yellow-600';
      case 'message_received':
      case 'conversation_started':
      case 'bid_message':
        return 'bg-purple-50 text-purple-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // Notification IDs are UUIDs; do not coerce to number.
      await notificationService.markAsRead(id);
      setNotifications(Array.isArray(notifications) 
        ? notifications.map(n => n.id === id ? { ...n, is_read: true } : n)
        : []
      );
      toast.success('Notification marked as read');
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(Array.isArray(notifications) 
        ? notifications.map(n => ({ ...n, is_read: true }))
        : []
      );
      toast.success('All notifications marked as read');
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark all as read');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      // Notification IDs are UUIDs; do not coerce to number.
      await notificationService.deleteNotification(id);
      setNotifications(Array.isArray(notifications) 
        ? notifications.filter(n => n.id !== id)
        : []
      );
      toast.success('Notification deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete notification');
    }
  };

  const getTimeAgo = (dateString: string | undefined) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = filter === 'unread' 
    ? (Array.isArray(notifications) ? notifications.filter(n => !n.is_read) : [])
    : (Array.isArray(notifications) ? notifications : []);

  const unreadCount = Array.isArray(notifications) 
    ? notifications.filter(n => !n.is_read).length 
    : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-4xl"
    >
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-1 w-10 bg-primary rounded-full" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Updates</span>
            </div>
            <h1 className="text-4xl font-black text-blue-950 uppercase tracking-tighter">Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm font-bold text-primary hover:opacity-80 transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-gray-100">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              "px-6 py-3 font-bold text-sm transition-all relative",
              filter === 'all'
                ? "text-blue-950"
                : "text-gray-400 hover:text-gray-600"
            )}
          >
            All
            {filter === 'all' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={cn(
              "px-6 py-3 font-bold text-sm transition-all relative flex items-center gap-2",
              filter === 'unread'
                ? "text-blue-950"
                : "text-gray-400 hover:text-gray-600"
            )}
          >
            Unread
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-primary text-white text-xs font-black rounded-full">
                {unreadCount}
              </span>
            )}
            {filter === 'unread' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>
      </header>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-500 font-medium">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
              <Bell className="w-10 h-10 text-gray-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-950 mb-2">No notifications</h3>
              <p className="text-gray-500">You're all caught up!</p>
            </div>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "group bg-white p-6 rounded-3xl border transition-all hover:shadow-lg hover:shadow-blue-900/5",
                notification.is_read
                  ? "border-gray-100"
                  : "border-primary/20 bg-blue-50/30"
              )}
            >
              <div className="flex gap-4">
                {/* Icon */}
                <div className={cn(
                  "flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center",
                  getIconColor(notification.notification_type)
                )}>
                  {getIcon(notification.notification_type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-lg font-black text-blue-950">
                      {notification.title}
                    </h3>
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-gray-600 font-medium mb-3 leading-relaxed">
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400">
                      {getTimeAgo(notification.created_at)}
                    </span>
                    <div className="flex items-center gap-3">
                      {notification.action_url && (
                        <a
                          href={notification.action_url}
                          onClick={() => {
                            if (!notification.is_read) void markAsRead(notification.id);
                          }}
                          className="text-xs font-bold text-blue-950 hover:text-primary transition-colors"
                        >
                          View
                        </a>
                      )}
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs font-bold text-primary hover:opacity-80 transition-colors"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Unread Indicator */}
                {!notification.is_read && (
                  <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2" />
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
