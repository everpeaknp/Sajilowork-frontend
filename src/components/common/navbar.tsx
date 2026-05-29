"use client";

import { Bell, MessageSquare, HelpCircle, Menu, X, PlusCircle, Settings, LogOut, LayoutDashboard, Briefcase } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

export default function Navbar() {
  const router = useRouter();
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
    <header className="sticky top-0 z-[9999] isolate w-full bg-white overflow-visible">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left section: Logo & Primary Links */}
        <div className="flex items-center space-x-8">
          <Link
            href={isAuthenticated ? '/discover' : '/'}
            className="flex items-center space-x-1.5 focus:outline-none cursor-pointer"
          >
            {/* tasknepal brand logo */}
            <span className="text-2xl font-black text-[#005fff] tracking-tight antialiased">
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
        <div className="flex items-center space-x-5">
          {!isAuthenticated ? (
            <>
              <Link
                href="/signin"
                className="text-sm font-semibold text-[#3c4a6b] hover:text-[#005fff] transition"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-[#005fff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0047ff] shadow-sm"
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              {/* Help button */}
              <div className="hidden sm:flex items-center text-[#3c4a6b] hover:text-[#005fff] cursor-pointer text-sm font-medium space-x-1">
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
                    setNotificationsOpen(!notificationsOpen);
                    setMessagesOpen(false);
                    setProfileMenuOpen(false);
                  }}
                  className="relative p-2 rounded-full text-gray-600 hover:text-[#005fff] hover:bg-gray-100 transition focus:outline-none cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Menu Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl ring-1 ring-gray-900/5 z-[10000] animate-in fade-in slide-in-from-top-3 duration-200">
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
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
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
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-semibold text-gray-900">{n.title}</span>
                              <span className="text-[10px] text-gray-500">{formatTimeAgo(n.created_at)}</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 leading-snug">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Message Box Trigger */}
              <div className={`relative ${messagesOpen ? 'z-[10000]' : ''}`} ref={messagesRef}>
                <button
                  onClick={() => {
                    setMessagesOpen(!messagesOpen);
                    setNotificationsOpen(false);
                    setProfileMenuOpen(false);
                  }}
                  className="relative p-2 rounded-full text-gray-600 hover:text-[#005fff] hover:bg-gray-100 transition focus:outline-none cursor-pointer"
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
                  <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl ring-1 ring-gray-900/5 z-[10000] animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="flex items-center justify-between border-b border-gray-150 pb-2 mb-2">
                      <h4 className="text-sm font-bold text-gray-900">Recent Chats</h4>
                      <button
                        onClick={() => setMessagesOpen(false)}
                        className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
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
                )}
              </div>

              {/* User Profile Avatar with Dropdown */}
              <div className={`relative ${profileMenuOpen ? 'z-[10000]' : ''}`} ref={profileRef}>
                <button
                  onClick={() => {
                    setProfileMenuOpen(!profileMenuOpen);
                    setNotificationsOpen(false);
                    setMessagesOpen(false);
                  }}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <UserAvatar
                    src={user?.profile_image}
                    name={user ? `${user.first_name} ${user.last_name}` : 'User'}
                    size="md"
                    className="ring-2 ring-gray-100 hover:ring-[#005fff] transition cursor-pointer"
                  />
                </button>

                {/* Profile Dropdown Menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl ring-1 ring-gray-900/5 z-[10000] animate-in fade-in slide-in-from-top-3 duration-200">
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

          {/* Mobile Hamburger Menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-[#005fff] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white px-4 py-4 space-y-3">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handlePostTaskClick();
                }}
                className="w-full flex items-center justify-center space-x-2 rounded-full bg-[#005fff] py-3 text-sm font-bold text-white cursor-pointer shadow-sm active:scale-95"
              >
                <PlusCircle className="h-4.5 w-4.5" />
                <span>Post a task</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleBrowseTasksClick();
                }}
                className="w-full text-left font-semibold text-gray-700 py-2.5 border-b border-gray-50"
              >
                Browse tasks
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleMyTasksClick();
                }}
                className="w-full text-left font-semibold text-gray-700 py-2.5 flex justify-between items-center border-b border-gray-50"
              >
                <span>My tasks</span>
                {myTasksCount > 0 && !tasksLoading && (
                  <span className="h-5 w-5 rounded-full bg-red-500 font-bold text-white text-[11px] flex items-center justify-center">
                    {myTasksCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push('/tasker-dashboard');
                }}
                className="w-full text-left font-semibold text-gray-700 py-2.5 border-b border-gray-50"
              >
                Dashboard
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push('/tasker-dashboard/settings');
                }}
                className="w-full text-left font-semibold text-gray-700 py-2.5 border-b border-gray-50"
              >
                Settings
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left font-semibold text-red-600 py-2.5"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full block text-center py-3 text-sm font-semibold text-[#3c4a6b] border border-gray-200 rounded-full hover:bg-gray-50"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full block text-center py-3 text-sm font-semibold text-white bg-[#005fff] rounded-full hover:bg-[#0047ff]"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
