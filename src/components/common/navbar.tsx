"use client";

import {
  Bell,
  MessageSquare,
  HelpCircle,
  Menu,
  X,
  Settings,
  LogOut,
  ClipboardList,
  Briefcase,
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTaskerDashboardNavOptional } from '@/context/TaskerDashboardNavContext';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocket } from '@/hooks/useWebSocket';
import { TASK_BROWSE_PATH, TASK_MAP_PATH } from '@/lib/taskBrowsePath';
import { JOB_BROWSE_PATH, JOB_MAP_PATH } from '@/lib/jobBrowsePath';
import { PROJECT_MAP_PATH } from '@/lib/projectBrowsePath';
import { SERVICE_MAP_PATH } from '@/lib/serviceBrowsePath';
import { dashboardMessageConversationHref, DASHBOARD_MESSAGES_PATH } from '@/lib/dashboardChat';
import {
  buildNotificationWebSocketUrl,
  isWebSocketsEnabled,
} from '@/lib/notificationWebSocket';
import { cn } from '@/lib/utils';
import { notificationService, taskService, chatService } from '@/services';
import UserAvatar from '@/components/common/UserAvatar';
import SiteBrand from '@/components/common/SiteBrand';
import RouteListingBreadcrumbs from '@/components/seo/RouteListingBreadcrumbs';
import AccountRoleMode from '@/components/common/AccountRoleMode';
import ThemeMenuToggle from '@/components/common/ThemeMenuToggle';
import { useSiteSettings } from '@/providers';
import { isConfirmModalTarget } from '@/app/dashboard/DeleteConfirmModal';
import type { Conversation, Notification as NotificationType, PaginatedResponse } from '@/types';
import { normalizeNotificationCurrency } from '@/lib/nepalLocale';
import {
  landingBody,
  landingHeadline,
  landingHeadlineSm,
} from '@/components/LangingHome/landingTypography';

const navPanelTitleClass = `${landingHeadlineSm} text-sm text-gray-900 dark:text-stone-100`;

function extractList<T>(data: PaginatedResponse<T> | T[] | null | undefined): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}

function conversationDisplayName(conv: Conversation, currentUserId?: string): string {
  const other = conv.other_participant;
  if (other) {
    return (
      other.full_name ||
      `${other.first_name || ''} ${other.last_name || ''}`.trim() ||
      other.email ||
      'User'
    );
  }
  const otherParticipant = conv.participants?.find(
    (p) => String(p.id) !== String(currentUserId)
  );
  if (otherParticipant) {
    return (
      otherParticipant.full_name ||
      `${otherParticipant.first_name || ''} ${otherParticipant.last_name || ''}`.trim() ||
      'User'
    );
  }
  return 'Conversation';
}

function profileImageForConversation(conv: Conversation, currentUserId?: string): string | undefined {
  if (conv.other_participant?.profile_image) {
    return conv.other_participant.profile_image;
  }
  const other = conv.participants?.find((p) => String(p.id) !== String(currentUserId));
  return other?.profile_image;
}

function getNotificationHref(notification: NotificationType): string {
  if (notification.action_url?.startsWith('/')) {
    return notification.action_url;
  }

  const data = notification.data as Record<string, unknown> | undefined;
  const listingKind = typeof data?.listing_kind === 'string' ? data.listing_kind : undefined;

  if (notification.notification_type === 'message_received') {
    const convId = data?.conversation_id ?? data?.conversation;
    if (convId) return dashboardMessageConversationHref(String(convId));
    return DASHBOARD_MESSAGES_PATH;
  }

  if (
    notification.notification_type === 'new_bid' ||
    notification.notification_type === 'counter_offer' ||
    notification.notification_type === 'bid_message' ||
    notification.notification_type === 'bid_received' ||
    notification.notification_type === 'bid_accepted' ||
    notification.notification_type === 'bid_rejected' ||
    notification.notification_type === 'bid_withdrawn' ||
    notification.notification_type === 'task_assigned' ||
    notification.notification_type === 'task_started' ||
    notification.notification_type === 'task_progress_updated' ||
    notification.notification_type === 'task_completion_requested' ||
    notification.notification_type === 'task_approved' ||
    notification.notification_type === 'task_completed' ||
    notification.notification_type === 'task_cancelled' ||
    notification.notification_type === 'revision_requested' ||
    notification.notification_type === 'task_status_update'
  ) {
    if (listingKind === 'project') return '/dashboard/projects';
    if (listingKind === 'job') return '/dashboard/jobs';
    if (listingKind === 'service') return '/dashboard/orders';
    return '/my-tasks';
  }

  if (notification.notification_type === 'task_created') {
    if (listingKind === 'project') return '/dashboard/projects';
    if (listingKind === 'job') return '/dashboard/jobs';
    if (listingKind === 'service') return '/dashboard/services';
    return '/task';
  }

  if (notification.notification_type === 'review_received') {
    return '/discover';
  }

  if (
    notification.notification_type === 'payment_received' ||
    notification.notification_type === 'payment_sent' ||
    notification.notification_type === 'payment_succeeded' ||
    notification.notification_type === 'payment_failed' ||
    notification.notification_type === 'payout_processed'
  ) {
    return '/dashboard/statements';
  }

  return '/my-tasks';
}

const mobileDropdownPanelClass =
  'fixed left-2 right-2 top-[calc(3.5rem+0.375rem)] z-[10000] max-h-[min(72dvh,28rem)] overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xl animate-in fade-in slide-in-from-top-3 duration-200 sm:left-3 sm:right-3 md:absolute md:inset-auto md:right-0 md:top-full md:mt-3 md:w-80 md:max-h-72 md:shadow-none dark:border-neutral-700 dark:bg-neutral-900';

function MobileDropdownBackdrop({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      className="fixed inset-0 top-14 z-[9998] bg-black/40 md:hidden"
      aria-label="Close menu"
      onClick={onClose}
    />
  );
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const taskerDashboardNav = useTaskerDashboardNavOptional();
  const isTaskerDashboard = pathname.startsWith('/tasker-dashboard');
  const { user, isAuthenticated, hasHydrated, logout } = useAuth();
  const { display_name: displayName, logo_url: logoUrl } = useSiteSettings();
  // After localStorage hydrate, trust last login/logout for navbar chrome immediately.
  // Session is re-confirmed in the background (isLoading) without hiding CTAs.
  const showSignedOutCtas = hasHydrated && !isAuthenticated;
  const showAuthedChrome = hasHydrated && isAuthenticated;
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  
  const [myTasksCount, setMyTasksCount] = useState(0);
  const [tasksLoading, setTasksLoading] = useState(false);

  // Refs for click outside detection
  const notificationsRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setNotificationsLoading(true);
      const response = await notificationService.getNotifications();
      if (response.success && response.data) {
        const list = extractList(response.data as PaginatedResponse<NotificationType> | NotificationType[]);
        const sorted = [...list].sort((a, b) => {
          const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
          const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
          return tb - ta;
        });
        setNotifications(sorted.slice(0, 6));
      } else {
        setNotifications([]);
      }
    } catch (error: unknown) {
      console.warn('Could not fetch notifications:', error);
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success && response.data) {
        setUnreadCount(response.data.count ?? 0);
      }
    } catch (error: unknown) {
      console.warn('Could not fetch unread count:', error);
      setUnreadCount(0);
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      setConversationsLoading(true);
      const response = await chatService.getConversations({ page_size: 8 });
      if (response.success && response.data) {
        const list = extractList(response.data);
        const sorted = [...list].sort((a, b) => {
          const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
          const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
          return tb - ta;
        });
        setConversations(sorted.slice(0, 5));
      } else {
        setConversations([]);
      }
    } catch (error: unknown) {
      console.warn('Could not fetch conversations:', error);
      setConversations([]);
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  const fetchUnreadMessagesCount = useCallback(async () => {
    try {
      const response = await chatService.getUnreadCount();
      if (response.success && response.data) {
        setUnreadMessagesCount(response.data.unread_count ?? 0);
      }
    } catch (error: unknown) {
      console.warn('Could not fetch message unread count:', error);
      setUnreadMessagesCount(0);
    }
  }, []);

  const fetchMyTasksCount = useCallback(async () => {
    try {
      setTasksLoading(true);
      const response = await taskService.getMyTasks({ listing_kind: 'task' });
      if (response.success && response.data) {
        setMyTasksCount(response.data.count ?? response.data.results?.length ?? 0);
      }
    } catch (error: unknown) {
      console.warn('Could not fetch tasks count:', error);
      setMyTasksCount(0);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  const refreshNavbarData = useCallback(() => {
    void fetchUnreadCount();
    void fetchUnreadMessagesCount();
    void fetchMyTasksCount();
  }, [fetchUnreadCount, fetchUnreadMessagesCount, fetchMyTasksCount]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void fetchNotifications();
    refreshNavbarData();
  }, [isAuthenticated, fetchNotifications, refreshNavbarData]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(refreshNavbarData, 45000);
    return () => clearInterval(interval);
  }, [isAuthenticated, refreshNavbarData]);

  const notificationWsUrl = useMemo(() => {
    if (!isAuthenticated || !isWebSocketsEnabled()) return null;
    return buildNotificationWebSocketUrl();
  }, [isAuthenticated]);

  const handleNotificationWsMessage = useCallback(
    (message: { type: string; count?: number; notification?: NotificationType }) => {
      if (message.type === 'unread_count' && typeof message.count === 'number') {
        setUnreadCount(message.count);
        return;
      }
      if (message.type === 'new_notification' && message.notification) {
        const incoming = message.notification;
        setNotifications((prev) => {
          if (prev.some((n) => n.id === incoming.id)) return prev;
          return [incoming, ...prev].slice(0, 6);
        });
        // Badge count comes from the paired unread_count event.
      }
    },
    [],
  );

  useWebSocket(notificationWsUrl, {
    enabled: Boolean(notificationWsUrl),
    onMessage: handleNotificationWsMessage,
    maxReconnectAttempts: 8,
  });

  useEffect(() => {
    if (notificationsOpen && isAuthenticated) {
      void fetchNotifications();
      void fetchUnreadCount();
    }
  }, [notificationsOpen, isAuthenticated, fetchNotifications, fetchUnreadCount]);

  useEffect(() => {
    if (messagesOpen && isAuthenticated) {
      void fetchConversations();
      void fetchUnreadMessagesCount();
    }
  }, [messagesOpen, isAuthenticated, fetchConversations, fetchUnreadMessagesCount]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
    setMessagesOpen(false);
    setProfileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isConfirmModalTarget(event.target)) return;

      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(event.target as Node)) {
        setMessagesOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllNotificationsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error: any) {
      // Silently fail - marking as read is not critical
      console.warn('Could not mark notifications as read:', error?.message || 'Unknown error');
    }
  };

  const handleNotificationClick = async (notification: NotificationType) => {
    const href = getNotificationHref(notification);

    try {
      if (!notification.is_read) {
        await notificationService.markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error: unknown) {
      console.warn('Could not mark notification as read:', error);
    }

    setNotificationsOpen(false);
    router.push(href);
  };

  const openConversation = (conversationId: string) => {
    setMessagesOpen(false);
    router.push(dashboardMessageConversationHref(conversationId));
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error: any) {
      console.warn('Logout error:', error?.message || 'Unknown error');
      // Force logout on client side even if API call fails
      router.push('/');
    }
  };

  const handleBrowseTasksClick = () => {
    router.push(TASK_BROWSE_PATH);
  };

  const handleMyTasksClick = () => {
    if (!isAuthenticated) {
      router.push('/signin?redirect=/my-tasks');
      return;
    }
    router.push('/my-tasks');
  };

  const isJobsActive =
    pathname === JOB_BROWSE_PATH ||
    pathname === JOB_MAP_PATH ||
    pathname.startsWith('/jobs/');
  const isProjectsActive =
    pathname === '/projects' ||
    pathname === PROJECT_MAP_PATH ||
    pathname.startsWith('/projects/');
  const isServicesActive =
    pathname === '/services' ||
    pathname === SERVICE_MAP_PATH ||
    pathname.startsWith('/services/');
  const isBrowseTasksActive =
    pathname === TASK_BROWSE_PATH ||
    pathname === TASK_MAP_PATH ||
    (pathname.startsWith('/task/') && !pathname.startsWith('/tasker-dashboard'));
  const isMyTasksActive =
    pathname === '/my-tasks' || pathname.startsWith('/my-tasks/');

  const navLinkClass = (active: boolean) =>
    cn(
      landingBody,
      'text-sm font-semibold tracking-tight transition cursor-pointer',
      active
        ? 'text-brand-emerald'
        : 'text-neutral-600 hover:text-brand-emerald dark:text-neutral-300 dark:hover:text-brand-emerald',
    );

  const navIconBtnClass =
    'relative rounded-full p-1.5 text-gray-600 transition hover:bg-gray-100 hover:text-brand-emerald focus:outline-none cursor-pointer min-[360px]:p-2 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-brand-emerald';

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Just now';
    
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const profileMenuItems = (
    <>
      <div className="px-3 py-3">
        <p className={`${landingHeadlineSm} text-sm text-gray-900 dark:text-stone-100`}>
          {user?.first_name} {user?.last_name}
        </p>
      </div>

      <div className="border-t border-neutral-100 dark:border-neutral-800">
        <AccountRoleMode
          variant="navbar"
          navigateToDashboard
          onSwitched={() => setProfileMenuOpen(false)}
        />
      </div>

      <div className="border-t border-neutral-100 py-1 dark:border-neutral-800">
        <button
          type="button"
          onClick={() => {
            setProfileMenuOpen(false);
            handleBrowseTasksClick();
          }}
          className="flex w-full cursor-pointer items-center space-x-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 md:hidden dark:text-stone-300 dark:hover:bg-neutral-800"
        >
          <ClipboardList className="h-4 w-4 text-gray-400" />
          <span>Browse tasks</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setProfileMenuOpen(false);
            handleMyTasksClick();
          }}
          className="flex w-full cursor-pointer items-center space-x-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 md:hidden dark:text-stone-300 dark:hover:bg-neutral-800"
        >
          <Briefcase className="h-4 w-4 text-gray-400" />
          <span>My tasks</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setProfileMenuOpen(false);
            router.push('/dashboard/settings');
          }}
          className="flex w-full cursor-pointer items-center space-x-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 dark:text-stone-300 dark:hover:bg-neutral-800"
        >
          <Settings className="h-4 w-4 text-gray-400" />
          <span>Settings</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setProfileMenuOpen(false);
            void handleLogout();
          }}
          className="flex w-full cursor-pointer items-center space-x-3 rounded-lg px-3 py-2.5 text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
    <header className={`sticky top-0 z-[9999] isolate w-full min-w-0 overflow-x-clip border-b border-transparent bg-[color-mix(in_srgb,var(--elevated)_95%,transparent)] backdrop-blur-md dark:border-neutral-800/80 ${landingBody} antialiased`}>
      <div className="mx-auto flex h-14 min-h-14 max-w-7xl items-center justify-between gap-1 px-2.5 sm:h-16 sm:gap-3 sm:px-4 md:px-6 lg:px-8">
        {/* Left section: Logo & Primary Links */}
        <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-8 md:flex-none">
          <SiteBrand
            displayName={displayName}
            logoUrl={logoUrl}
            href={isAuthenticated ? '/discover' : '/'}
            showIconFallback={false}
            size="header"
          />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-5 lg:space-x-6">
            <button
              type="button"
              onClick={handleBrowseTasksClick}
              className={navLinkClass(isBrowseTasksActive)}
              aria-current={isBrowseTasksActive ? 'page' : undefined}
            >
              Browse tasks
            </button>
            <Link
              href="/jobs"
              className={navLinkClass(isJobsActive)}
              aria-current={isJobsActive ? 'page' : undefined}
            >
              Jobs
            </Link>
            <Link
              href="/projects"
              className={navLinkClass(isProjectsActive)}
              aria-current={isProjectsActive ? 'page' : undefined}
            >
              Projects
            </Link>
            <Link
              href="/services"
              className={navLinkClass(isServicesActive)}
              aria-current={isServicesActive ? 'page' : undefined}
            >
              Services
            </Link>

            {isAuthenticated && (
              <>

              <button
                type="button"
                onClick={handleMyTasksClick}
                className={cn('relative', navLinkClass(isMyTasksActive))}
                aria-current={isMyTasksActive ? 'page' : undefined}
              >
                My tasks
                {myTasksCount > 0 && !tasksLoading && (
                  <span className="absolute -top-1.5 -right-3.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                    {myTasksCount}
                  </span>
                )}
              </button>
              </>
            )}
          </nav>
        </div>

        {/* Right section: Utilities Dashboard & Profile */}
        <div className="flex shrink-0 items-center gap-0 sm:gap-1 md:gap-3">
          {showSignedOutCtas ? (
            <>
              <ThemeMenuToggle variant="inline" />
              <Link
                href="/signin"
                className={`${landingBody} hidden sm:hidden min-h-9 items-center rounded-full px-3 text-xs font-semibold tracking-tight text-neutral-600 transition hover:bg-gray-50 hover:text-brand-emerald min-[380px]:flex sm:text-sm dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-brand-emerald`}
              >
                Sign in
              </Link>
              <div className="hidden items-center gap-3 sm:flex">
              <Link
                href="/signin"
                className={`${landingBody} text-sm font-semibold tracking-tight text-neutral-600 transition hover:text-brand-emerald dark:text-neutral-300 dark:hover:text-brand-emerald`}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className={`${landingBody} rounded-full bg-brand-dark px-4 py-2 text-sm font-semibold tracking-tight text-white transition hover:bg-brand-emerald dark:bg-brand-emerald dark:text-neutral-950 dark:hover:bg-emerald-400`}
              >
                Sign up
              </Link>
              </div>
            </>
          ) : showAuthedChrome ? (
            <>
              {/* Help button */}
              <Link
                href="/help"
                className={`${landingBody} hidden lg:flex items-center cursor-pointer space-x-1 text-sm font-medium tracking-tight text-neutral-600 hover:text-brand-emerald dark:text-neutral-300 dark:hover:text-brand-emerald`}
              >
                <HelpCircle className="h-4.5 w-4.5" />
                <span>Help</span>
              </Link>

              <ThemeMenuToggle variant="inline" />

              {/* Notifications Trigger */}
              <div
                className={`relative ${notificationsOpen ? 'z-[10000]' : ''}`}
                ref={notificationsRef}
              >
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setNotificationsOpen(!notificationsOpen);
                    setMessagesOpen(false);
                    setProfileMenuOpen(false);
                  }}
                  className={navIconBtnClass}
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5 sm:h-5 sm:w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Menu Dropdown */}
                {notificationsOpen && (
                  <>
                    <MobileDropdownBackdrop onClose={() => setNotificationsOpen(false)} />
                    <div className={mobileDropdownPanelClass}>
                    <div className="flex items-center justify-between pb-2 mb-2">
                      <h4 className={navPanelTitleClass}>Notifications</h4>
                      <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={() => void markAllNotificationsRead()}
                            className="text-[10px] font-semibold text-brand-emerald hover:underline cursor-pointer px-1"
                          >
                            Mark all read
                          </button>
                        )}
                        <button
                          onClick={() => setNotificationsOpen(false)}
                          className="cursor-pointer rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-neutral-800 dark:hover:text-stone-200"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="max-h-[min(55dvh,18rem)] space-y-3 overflow-y-auto overscroll-contain pr-1 md:max-h-72">
                      {notificationsLoading ? (
                        <div className="py-4 text-center text-sm text-gray-500 dark:text-neutral-400">Loading...</div>
                      ) : notifications.length === 0 ? (
                        <div className="py-4 text-center text-sm text-gray-500 dark:text-neutral-400">No notifications</div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`cursor-pointer rounded-lg p-2.5 text-left transition-colors ${
                              !n.is_read
                                ? 'bg-brand-emerald/10'
                                : 'hover:bg-gray-50 dark:hover:bg-neutral-800'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-semibold text-gray-900 dark:text-stone-100">{n.title}</span>
                              <span className="shrink-0 text-[10px] text-gray-500 dark:text-neutral-400">{formatTimeAgo(n.created_at)}</span>
                            </div>
                            <p className="mt-1 line-clamp-3 text-xs leading-snug text-gray-600 dark:text-neutral-400">
                              {normalizeNotificationCurrency(n.message)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  </>
                )}
              </div>

              {/* Dynamic Message Box Trigger */}
              <div className={`relative ${messagesOpen ? 'z-[10000]' : ''}`} ref={messagesRef}>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setMessagesOpen(!messagesOpen);
                    setNotificationsOpen(false);
                    setProfileMenuOpen(false);
                  }}
                  className={navIconBtnClass}
                  aria-label="Messages"
                >
                  <MessageSquare className="h-5 w-5" />
                  {unreadMessagesCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                      {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                    </span>
                  )}
                </button>

                {/* Messages Dropdown */}
                {messagesOpen && (
                  <>
                    <MobileDropdownBackdrop onClose={() => setMessagesOpen(false)} />
                    <div className={mobileDropdownPanelClass}>
                    <div className="flex items-center justify-between pb-2 mb-2">
                      <h4 className={navPanelTitleClass}>Recent Chats</h4>
                      <button
                        onClick={() => setMessagesOpen(false)}
                        className="cursor-pointer rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-neutral-800 dark:hover:text-stone-200"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="max-h-[min(55dvh,18rem)] space-y-3 overflow-y-auto overscroll-contain pr-1 md:max-h-72">
                      {conversationsLoading ? (
                        <div className="py-4 text-center text-sm text-gray-500 dark:text-neutral-400">Loading...</div>
                      ) : conversations.length === 0 ? (
                        <div className="py-4 text-center text-sm text-gray-500 dark:text-neutral-400">No messages yet</div>
                      ) : (
                        <>
                          {conversations.map((conv) => {
                            const convId = String(conv.id);
                            const hasUnread = (conv.unread_count ?? 0) > 0;
                            const preview = conv.last_message?.content || 'No messages yet';
                            const time = formatTimeAgo(
                              conv.last_message?.created_at || conv.last_message_at
                            );
                            const name = conversationDisplayName(conv, user?.id);
                            const avatar = profileImageForConversation(conv, user?.id);

                            return (
                              <div
                                key={convId}
                                onClick={() => openConversation(convId)}
                                className={`flex min-h-[4.5rem] cursor-pointer items-start space-x-3 rounded-xl p-2 text-left transition-colors ${
                                  hasUnread
                                    ? 'bg-brand-emerald/10'
                                    : 'hover:bg-gray-50 dark:hover:bg-neutral-800'
                                }`}
                              >
                                <UserAvatar
                                  src={avatar}
                                  name={name}
                                  size="md"
                                  verified={
                                    conv.other_participant?.is_verified_tasker ||
                                    conv.participants?.find(
                                      (p) => String(p.id) !== String(user?.id)
                                    )?.is_verified_tasker
                                  }
                                  className="shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-baseline justify-between gap-2">
                                    <span className="truncate text-xs font-bold text-gray-900 dark:text-stone-100">
                                      {name}
                                    </span>
                                    <span className="shrink-0 text-[9px] text-gray-400 dark:text-neutral-500">{time}</span>
                                  </div>
                                  <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-neutral-400">{preview}</p>
                                </div>
                              </div>
                            );
                          })}
                          <button
                            onClick={() => {
                              setMessagesOpen(false);
                              router.push(DASHBOARD_MESSAGES_PATH);
                            }}
                            className="w-full cursor-pointer pt-2 text-center text-xs font-bold text-brand-emerald hover:underline"
                          >
                            View all messages
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  </>
                )}
              </div>

              {/* User Profile Avatar — mobile: go to dashboard; desktop: dropdown */}
              <div className={`relative ${profileMenuOpen ? 'z-[10000]' : ''}`} ref={profileRef}>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setNotificationsOpen(false);
                    setMessagesOpen(false);
                    setProfileMenuOpen(!profileMenuOpen);
                  }}
                  className="flex items-center rounded-full focus:outline-none"
                  aria-label="Account menu"
                  aria-expanded={profileMenuOpen}
                >
                  <UserAvatar
                    src={user?.profile_image}
                    name={user ? `${user.first_name} ${user.last_name}` : 'User'}
                    size="sm"
                    verified={user?.is_verified_tasker}
                    className="transition cursor-pointer !h-9 !w-9 sm:!h-10 sm:!w-10"
                  />
                </button>

                {profileMenuOpen && (
                  <>
                    <MobileDropdownBackdrop onClose={() => setProfileMenuOpen(false)} />
                    <div className={cn(mobileDropdownPanelClass, 'md:hidden')}>
                      <div className="mb-2 flex items-center justify-between pb-2">
                        <h4 className={navPanelTitleClass}>Account</h4>
                        <button
                          type="button"
                          onClick={() => setProfileMenuOpen(false)}
                          className="cursor-pointer rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-neutral-800 dark:hover:text-stone-200"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {profileMenuItems}
                    </div>
                    <div className="absolute right-0 z-[10000] mt-3 hidden w-64 rounded-2xl border border-neutral-200/80 bg-white p-2 animate-in fade-in slide-in-from-top-3 duration-200 md:block dark:border-neutral-700 dark:bg-neutral-900">
                      {profileMenuItems}
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Briefly before localStorage hydrate */}
              <ThemeMenuToggle variant="inline" />
              <div
                className="hidden h-9 w-28 animate-pulse rounded-full bg-neutral-200 sm:block dark:bg-neutral-800"
                aria-hidden="true"
              />
            </>
          )}

          {/* Hamburger: tasker dashboard sidebar, or guest sign-in menu */}
          {(showSignedOutCtas || isTaskerDashboard) && (
            <button
              type="button"
              onClick={() => {
                if (isTaskerDashboard && taskerDashboardNav) {
                  setMobileMenuOpen(false);
                  setNotificationsOpen(false);
                  setMessagesOpen(false);
                  setProfileMenuOpen(false);
                  taskerDashboardNav.toggleMobile();
                  return;
                }
                const nextOpen = !mobileMenuOpen;
                setMobileMenuOpen(nextOpen);
                if (nextOpen) {
                  setNotificationsOpen(false);
                  setMessagesOpen(false);
                  setProfileMenuOpen(false);
                }
              }}
              className="cursor-pointer rounded-full p-2 text-gray-600 transition hover:bg-gray-100 hover:text-brand-emerald md:hidden dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-brand-emerald"
              aria-label={
                isTaskerDashboard && taskerDashboardNav?.mobileOpen
                  ? 'Close dashboard menu'
                  : isTaskerDashboard
                    ? 'Open dashboard menu'
                    : mobileMenuOpen
                      ? 'Close menu'
                      : 'Open menu'
              }
              aria-expanded={
                isTaskerDashboard && taskerDashboardNav
                  ? taskerDashboardNav.mobileOpen
                  : mobileMenuOpen
              }
            >
              {isTaskerDashboard && taskerDashboardNav ? (
                taskerDashboardNav.mobileOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )
              ) : mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Guest mobile menu only (signed-in users use icon shortcuts in the bar) */}
      {mobileMenuOpen && showSignedOutCtas && (
        <nav
          className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain border-t border-gray-100 bg-white px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden sm:px-4 dark:border-neutral-800 dark:bg-neutral-950"
          aria-label="Mobile navigation"
        >
          <div className="space-y-1">
            <Link
              href={TASK_BROWSE_PATH}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                landingBody,
                'block w-full min-h-11 rounded-xl px-4 py-3 text-left text-sm font-semibold tracking-tight transition hover:bg-gray-50 dark:hover:bg-neutral-900',
                isBrowseTasksActive ? 'text-brand-emerald' : 'text-neutral-600 dark:text-neutral-300',
              )}
            >
              Browse tasks
            </Link>
            <Link
              href="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                landingBody,
                'block w-full min-h-11 rounded-xl px-4 py-3 text-left text-sm font-semibold tracking-tight transition hover:bg-gray-50 dark:hover:bg-neutral-900',
                isJobsActive ? 'text-brand-emerald' : 'text-neutral-600 dark:text-neutral-300',
              )}
            >
              Jobs
            </Link>
            <Link
              href="/projects"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                landingBody,
                'block w-full min-h-11 rounded-xl px-4 py-3 text-left text-sm font-semibold tracking-tight transition hover:bg-gray-50 dark:hover:bg-neutral-900',
                isProjectsActive ? 'text-brand-emerald' : 'text-neutral-600 dark:text-neutral-300',
              )}
            >
              Projects
            </Link>
            <Link
              href="/services"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                landingBody,
                'block w-full min-h-11 rounded-xl px-4 py-3 text-left text-sm font-semibold tracking-tight transition hover:bg-gray-50 dark:hover:bg-neutral-900',
                isServicesActive ? 'text-brand-emerald' : 'text-neutral-600 dark:text-neutral-300',
              )}
            >
              Services
            </Link>

            <div className="my-2 h-px bg-gray-100 dark:bg-neutral-800" />

            <div className="px-1 py-1">
              <ThemeMenuToggle variant="inline" />
            </div>

            <div className="my-2 h-px bg-gray-100 dark:bg-neutral-800" />

            <Link
              href="/signin"
              onClick={() => setMobileMenuOpen(false)}
              className={`${landingBody} block w-full min-h-11 rounded-xl px-4 py-3 text-left text-sm font-semibold tracking-tight text-neutral-600 transition hover:bg-gray-50 dark:text-neutral-300 dark:hover:bg-neutral-900`}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className={`${landingBody} block w-full min-h-11 rounded-xl bg-brand-dark px-4 py-3 text-center text-sm font-semibold tracking-tight text-white transition hover:bg-brand-emerald dark:bg-brand-emerald dark:text-neutral-950 dark:hover:bg-emerald-400`}
            >
              Sign up
            </Link>
          </div>
        </nav>
      )}
    </header>
    <RouteListingBreadcrumbs />
    </>
  );
}
