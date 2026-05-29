"use client";

import {
  Bell,
  MessageSquare,
  HelpCircle,
  Menu,
  X,
  PlusCircle,
  Settings,
  LogOut,
  LayoutDashboard,
  Briefcase,
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTaskerDashboardNavOptional } from '@/context/TaskerDashboardNavContext';
import { useAuth } from '@/hooks/useAuth';
import { notificationService, taskService, chatService } from '@/services';
import UserAvatar from '@/components/common/UserAvatar';
import type { Conversation, Notification as NotificationType, PaginatedResponse } from '@/types';

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

  if (notification.notification_type === 'message_received') {
    const convId = data?.conversation_id ?? data?.conversation;
    if (convId) return `/message?conversation=${convId}`;
    return '/message';
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
    return '/discover';
  }

  return '/my-tasks';
}

const mobileDropdownPanelClass =
  'fixed left-3 right-3 top-[calc(3.5rem+0.5rem)] z-[10000] max-h-[min(70dvh,28rem)] overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-xl ring-1 ring-gray-900/5 animate-in fade-in slide-in-from-top-3 duration-200 md:absolute md:inset-auto md:right-0 md:top-full md:mt-3 md:w-80 md:max-h-72';

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
  const { user, isAuthenticated, logout } = useAuth();
  
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
      const response = await taskService.getMyTasks();
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
    router.push(`/message?conversation=${conversationId}`);
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

  const handlePostTaskClick = () => {
    if (!isAuthenticated) {
      router.push('/signin?redirect=/post-task');
      return;
    }
    router.push('/post-task');
  };

  const handleBrowseTasksClick = () => {
    router.push('/task');
  };

  const handleMyTasksClick = () => {
    if (!isAuthenticated) {
      router.push('/signin?redirect=/my-tasks');
      return;
    }
    router.push('/my-tasks');
  };

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

  return (
    <header className="sticky top-0 z-[9999] isolate w-full border-b border-gray-100 bg-white">
      <div className="mx-auto flex h-14 min-h-14 max-w-7xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-3 sm:px-4 md:px-6 lg:px-8">
        {/* Left section: Logo & Primary Links */}
        <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-8 md:flex-none">
          <Link
            href={isAuthenticated ? '/discover' : '/'}
            className="flex shrink-0 items-center focus:outline-none cursor-pointer"
          >
            <span className="text-lg font-black tracking-tight text-[#005fff] antialiased sm:text-2xl">
              task<span className="text-[#03113c]">nepal</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-6">
              <button
                onClick={handlePostTaskClick}
                className="rounded-full bg-[#005fff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0047ff] cursor-pointer inline-flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <PlusCircle className="h-4 w-4" />
                Post a task
              </button>

              <button
                onClick={handleBrowseTasksClick}
                className="text-sm font-semibold transition cursor-pointer text-[#3c4a6b] hover:text-[#005fff]"
              >
                Browse tasks
              </button>

              <button
                onClick={handleMyTasksClick}
                className="relative text-sm font-semibold transition cursor-pointer text-[#3c4a6b] hover:text-[#005fff]"
              >
                My tasks
                {myTasksCount > 0 && !tasksLoading && (
                  <span className="absolute -top-1.5 -right-3.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                    {myTasksCount}
                  </span>
                )}
              </button>
            </nav>
          )}
        </div>

        {/* Right section: Utilities Dashboard & Profile */}
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-2 md:gap-5">
          {!isAuthenticated ? (
            <div className="hidden items-center gap-3 sm:flex">
              <Link
                href="/signin"
                className="text-sm font-semibold text-[#3c4a6b] transition hover:text-[#005fff]"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-[#005fff] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0047ff]"
              >
                Sign up
              </Link>
            </div>
          ) : (
            <>
              {/* Help button */}
              <div className="hidden lg:flex items-center cursor-pointer space-x-1 text-sm font-medium text-[#3c4a6b] hover:text-[#005fff]">
                <HelpCircle className="h-4.5 w-4.5" />
                <span>Help</span>
              </div>

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
                  className="relative rounded-full p-1.5 text-gray-600 transition hover:bg-gray-100 hover:text-[#005fff] focus:outline-none cursor-pointer sm:p-2"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5 sm:h-5 sm:w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Menu Dropdown */}
                {notificationsOpen && (
                  <>
                    <MobileDropdownBackdrop onClose={() => setNotificationsOpen(false)} />
                    <div className={mobileDropdownPanelClass}>
                    <div className="flex items-center justify-between border-b border-gray-150 pb-2 mb-2">
                      <h4 className="text-sm font-bold text-gray-900">Notifications</h4>
                      <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={() => void markAllNotificationsRead()}
                            className="text-[10px] font-semibold text-[#005fff] hover:underline cursor-pointer px-1"
                          >
                            Mark all read
                          </button>
                        )}
                        <button
                          onClick={() => setNotificationsOpen(false)}
                          className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="max-h-[min(55dvh,18rem)] space-y-3 overflow-y-auto overscroll-contain pr-1 md:max-h-72">
                      {notificationsLoading ? (
                        <div className="text-center py-4 text-sm text-gray-500">Loading...</div>
                      ) : notifications.length === 0 ? (
                        <div className="text-center py-4 text-sm text-gray-500">No notifications</div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-2.5 rounded-lg transition-colors cursor-pointer text-left ${
                              !n.is_read ? 'bg-[#005fff]/5 border-l-2 border-[#005fff]' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-xs font-semibold text-gray-900">{n.title}</span>
                              <span className="shrink-0 text-[10px] text-gray-500">{formatTimeAgo(n.created_at)}</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 leading-snug line-clamp-3">{n.message}</p>
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
                  className="relative rounded-full p-1.5 text-gray-600 transition hover:bg-gray-100 hover:text-[#005fff] focus:outline-none cursor-pointer sm:p-2"
                  aria-label="Messages"
                >
                  <MessageSquare className="h-5 w-5" />
                  {unreadMessagesCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
                      {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                    </span>
                  )}
                </button>

                {/* Messages Dropdown */}
                {messagesOpen && (
                  <>
                    <MobileDropdownBackdrop onClose={() => setMessagesOpen(false)} />
                    <div className={mobileDropdownPanelClass}>
                    <div className="flex items-center justify-between border-b border-gray-150 pb-2 mb-2">
                      <h4 className="text-sm font-bold text-gray-900">Recent Chats</h4>
                      <button
                        onClick={() => setMessagesOpen(false)}
                        className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="max-h-[min(55dvh,18rem)] space-y-3 overflow-y-auto overscroll-contain pr-1 md:max-h-72">
                      {conversationsLoading ? (
                        <div className="text-center py-4 text-sm text-gray-500">Loading...</div>
                      ) : conversations.length === 0 ? (
                        <div className="text-center py-4 text-sm text-gray-500">No messages yet</div>
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
                                className={`flex items-start space-x-3 p-2 rounded-xl min-h-[4.5rem] transition-colors cursor-pointer text-left ${
                                  hasUnread
                                    ? 'bg-[#005fff]/5 border-l-2 border-[#005fff]'
                                    : 'hover:bg-gray-50'
                                }`}
                              >
                                <UserAvatar
                                  src={avatar}
                                  name={name}
                                  size="md"
                                  className="shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-baseline gap-2">
                                    <span className="text-xs font-bold text-gray-900 truncate">
                                      {name}
                                    </span>
                                    <span className="text-[9px] text-gray-400 shrink-0">{time}</span>
                                  </div>
                                  <p className="text-xs text-gray-500 truncate mt-0.5">{preview}</p>
                                </div>
                              </div>
                            );
                          })}
                          <button
                            onClick={() => {
                              setMessagesOpen(false);
                              router.push('/message');
                            }}
                            className="w-full text-center text-xs font-bold text-[#005fff] hover:underline pt-2 border-t border-gray-100 cursor-pointer"
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

                    if (typeof window !== 'undefined' && window.innerWidth < 768) {
                      setProfileMenuOpen(false);
                      router.push('/tasker-dashboard');
                      return;
                    }

                    setProfileMenuOpen(!profileMenuOpen);
                  }}
                  className="flex items-center rounded-full focus:outline-none"
                  aria-label="Account menu"
                >
                  <UserAvatar
                    src={user?.profile_image}
                    name={user ? `${user.first_name} ${user.last_name}` : 'User'}
                    size="sm"
                    className="ring-2 ring-gray-100 transition hover:ring-[#005fff] cursor-pointer sm:!w-10 sm:!h-10"
                  />
                </button>

                {/* Profile Dropdown Menu (desktop only) */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-3 hidden w-64 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl ring-1 ring-gray-900/5 animate-in fade-in slide-in-from-top-3 duration-200 md:block z-[10000]">
                    {/* User Info */}
                    <div className="px-3 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          router.push('/tasker-dashboard');
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition cursor-pointer"
                      >
                        <LayoutDashboard className="h-4 w-4 text-gray-400" />
                        <span>Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          router.push('/my-tasks');
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition cursor-pointer"
                      >
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        <span>My Tasks</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          router.push('/tasker-dashboard/settings');
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition cursor-pointer"
                      >
                        <Settings className="h-4 w-4 text-gray-400" />
                        <span>Settings</span>
                      </button>

                      <div className="my-1 border-t border-gray-100" />

                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Hamburger: tasker dashboard sidebar, or guest sign-in menu */}
          {(!isAuthenticated || isTaskerDashboard) && (
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
              className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 hover:text-[#005fff] cursor-pointer md:hidden"
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
      {mobileMenuOpen && !isAuthenticated && (
        <nav
          className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain border-t border-gray-100 bg-white px-3 py-3 shadow-lg md:hidden sm:px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          aria-label="Mobile navigation"
        >
          <div className="space-y-2">
            <Link
              href="/signin"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full min-h-11 rounded-full border border-gray-200 py-3 text-center text-sm font-semibold text-[#3c4a6b] transition hover:bg-gray-50"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full min-h-11 rounded-full bg-[#005fff] py-3 text-center text-sm font-semibold text-white transition hover:bg-[#0047ff]"
            >
              Sign up
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
