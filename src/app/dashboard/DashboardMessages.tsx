'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
  type FormEvent,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Search, ArrowUpRight, ChevronLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { chatService } from '@/services/chat.service';
import { useAuthStore } from '@/store/auth.store';
import { useMultiConversationWebSocket } from '@/hooks/useMultiConversationWebSocket';
import { useChatTyping } from '@/hooks/useChatTyping';
import type { WebSocketMessage } from '@/hooks/useWebSocket';
import type { Conversation, Message, PaginatedResponse } from '@/types';
import {
  getTaskStatusFromConversation,
  isMessagingEnabledForConversation,
  messagingDisabledReason,
} from '@/lib/chatMessaging';
import { formatChatApiError } from '@/lib/chatErrors';
import { isWebSocketsEnabled } from '@/lib/chatWebSocket';
import {
  DASHBOARD_MESSAGES_PATH,
  dashboardMessageHref,
  chatInboxViewParam,
} from '@/lib/dashboardChat';
import {
  dashboardMessagesViewForRole,
  emptyMessagesMessage,
  otherParticipantRoleLabel,
} from '@/lib/dashboardMessages';
import { useDashboardSidebarRole } from './DashboardRoleSwitchContext';
import {
  DASHBOARD_MESSAGES_HEIGHT,
  DASHBOARD_PAGE_ROOT,
} from './dashboardResponsive';

const MY_AVATAR_FALLBACK =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
const BADGE_COLORS = ['#27AE60', '#2D9CDB', '#F2994A', '#EB5757', '#52C47F'];

interface Contact {
  id: string;
  name: string;
  role: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  badgeColor?: string;
  online: boolean;
}

interface UiMessage {
  id: string;
  sender: 'me' | 'them';
  senderName: string;
  senderAvatar: string;
  text: string;
  time: string;
}

type PersonConversationGroup = {
  key: string;
  name: string;
  avatar?: string;
  conversations: Conversation[];
  latest: Conversation;
  totalUnread: number;
};

function extractList<T>(data: PaginatedResponse<T> | T[] | null | undefined): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}

function conversationKey(conv: Conversation): string | null {
  const id = conv.id;
  if (id == null || id === '') return null;
  return String(id);
}

function dedupeConversations(list: Conversation[]): Conversation[] {
  const seen = new Set<string>();
  const out: Conversation[] = [];
  for (const conv of list) {
    const key = conversationKey(conv);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push({ ...conv, id: key });
  }
  return out;
}

function otherParticipantKey(conv: Conversation, currentUserId?: string): string | null {
  const other = conv.other_participant;
  if (other?.id != null && other.id !== '') return String(other.id);
  const otherParticipant = conv.participants?.find(
    (p) => String(p.id) !== String(currentUserId),
  );
  if (otherParticipant?.id != null && otherParticipant.id !== '') {
    return String(otherParticipant.id);
  }
  return null;
}

function conversationActivityTime(conv: Conversation): number {
  const raw = conv.last_message?.created_at || conv.last_message_at || conv.updated_at;
  if (!raw) return 0;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function sortConversationsByActivity(list: Conversation[]): Conversation[] {
  return [...list].sort((a, b) => conversationActivityTime(b) - conversationActivityTime(a));
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
    (p) => String(p.id) !== String(currentUserId),
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
  const other = conv.other_participant;
  if (other?.profile_image) return other.profile_image;
  return conv.participants?.find((p) => String(p.id) !== String(currentUserId))?.profile_image;
}

function groupSubtitle(group: PersonConversationGroup, messagesView: 'employer' | 'tasker'): string {
  const titles = group.conversations
    .map((c) => c.task_title?.trim())
    .filter((t): t is string => Boolean(t));
  const unique = [...new Set(titles)];
  const roleLabel = otherParticipantRoleLabel(messagesView);
  if (unique.length === 0) return roleLabel;
  if (unique.length === 1) return `${roleLabel} · ${unique[0]}`;
  return `${roleLabel} · ${unique.length} listings`;
}

function groupConversationsByPerson(
  list: Conversation[],
  currentUserId?: string,
): PersonConversationGroup[] {
  const byPerson = new Map<string, Conversation[]>();

  for (const conv of list) {
    const personKey = otherParticipantKey(conv, currentUserId);
    if (!personKey) continue;
    const bucket = byPerson.get(personKey) ?? [];
    bucket.push(conv);
    byPerson.set(personKey, bucket);
  }

  const groups: PersonConversationGroup[] = [];
  for (const [key, convs] of byPerson) {
    const sorted = sortConversationsByActivity(convs);
    const latest = sorted[0];
    if (!latest) continue;
    groups.push({
      key,
      name: conversationDisplayName(latest, currentUserId),
      avatar: profileImageForConversation(latest, currentUserId),
      conversations: sorted,
      latest,
      totalUnread: sorted.reduce((sum, c) => sum + (c.unread_count || 0), 0),
    });
  }

  return groups.sort(
    (a, b) => conversationActivityTime(b.latest) - conversationActivityTime(a.latest),
  );
}

function formatMessageTime(iso?: string): string {
  if (!iso) return '';
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return '';
  }
}

function sortMessages(msgs: Message[]): Message[] {
  return [...msgs].sort((a, b) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    return ta - tb;
  });
}

function messagesHref(
  basePath: string,
  params?: Record<string, string | null | undefined>,
): string {
  if (basePath === DASHBOARD_MESSAGES_PATH) {
    return dashboardMessageHref({
      conversation: params?.conversation ?? undefined,
      bid: params?.bid ?? undefined,
      task: params?.task ?? undefined,
      tasker: params?.tasker ?? undefined,
    });
  }
  const sp = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value != null && value !== '') sp.set(key, value);
    }
  }
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function groupToContact(
  group: PersonConversationGroup,
  index: number,
  messagesView: 'employer' | 'tasker',
): Contact {
  const latest = group.latest;
  return {
    id: group.key,
    name: group.name,
    role: groupSubtitle(group, messagesView),
    avatar: group.avatar || MY_AVATAR_FALLBACK,
    lastMessage: latest.last_message?.content || 'No messages yet',
    time: formatMessageTime(latest.last_message?.created_at || latest.last_message_at),
    unread: group.totalUnread,
    badgeColor: BADGE_COLORS[index % BADGE_COLORS.length],
    online: false,
  };
}

function DashboardMessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, initialize } = useAuthStore();
  const sidebarRole = useDashboardSidebarRole();
  const dashboardRole = sidebarRole === 'customer' ? 'customer' : 'tasker';
  const messagesView = chatInboxViewParam(dashboardRole);
  const emptyInboxMessage = emptyMessagesMessage(messagesView);

  const [searchQuery, setSearchQuery] = useState('');
  const [mobilePane, setMobilePane] = useState<'list' | 'thread'>('list');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deletedHistoryBackup, setDeletedHistoryBackup] = useState<UiMessage[] | null>(null);
  const [archivedConversationIds, setArchivedConversationIds] = useState<string[]>([]);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activePersonKey, setActivePersonKey] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyConversationId, setReplyConversationId] = useState<string | null>(null);
  const [apiMessages, setApiMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [resolvingDeepLink, setResolvingDeepLink] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const resolvedDeepLinkRef = useRef<string | null>(null);
  const loadedMessagesForRef = useRef<string | null>(null);
  const shouldScrollToBottomRef = useRef(false);

  const myAvatar = user?.profile_image || MY_AVATAR_FALLBACK;

  const dedupedConversations = useMemo(
    () => dedupeConversations(conversations),
    [conversations],
  );

  const conversationGroups = useMemo(
    () => groupConversationsByPerson(dedupedConversations, user?.id),
    [dedupedConversations, user?.id],
  );

  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversationGroups;
    return conversationGroups.filter((group) => {
      if (group.name.toLowerCase().includes(q)) return true;
      return group.conversations.some((conv) =>
        (conv.task_title || '').toLowerCase().includes(q),
      );
    });
  }, [conversationGroups, searchQuery]);

  const contacts = useMemo(
    () => filteredGroups.map((group, index) => groupToContact(group, index, messagesView)),
    [filteredGroups, messagesView],
  );

  const selectedGroup = useMemo(
    () =>
      conversationGroups.find((group) => group.key === activePersonKey) ??
      conversationGroups.find((group) =>
        group.conversations.some((c) => conversationKey(c) === selectedId),
      ) ??
      null,
    [conversationGroups, activePersonKey, selectedId],
  );

  const activeContact = useMemo(() => {
    if (!selectedGroup) {
      return (
        contacts[0] ?? {
          id: '',
          name: 'Messages',
          role: '',
          avatar: MY_AVATAR_FALLBACK,
          lastMessage: '',
          time: '',
          unread: 0,
          online: false,
        }
      );
    }
    const index = conversationGroups.findIndex((g) => g.key === selectedGroup.key);
    return groupToContact(selectedGroup, index >= 0 ? index : 0, messagesView);
  }, [selectedGroup, contacts, conversationGroups, messagesView]);

  const replyConversation = useMemo(() => {
    const id = replyConversationId ?? selectedId;
    if (!id) return null;
    return dedupedConversations.find((c) => String(c.id) === String(id)) ?? null;
  }, [replyConversationId, selectedId, dedupedConversations]);

  const canSendMessages = isMessagingEnabledForConversation(replyConversation);
  const messagingDisabledText = messagingDisabledReason(
    getTaskStatusFromConversation(replyConversation),
  );

  const activeMessages: UiMessage[] = useMemo(() => {
    let source = apiMessages;
    if (selectedGroup && selectedGroup.conversations.length > 1) {
      const threadId = replyConversationId ?? selectedId;
      if (threadId) {
        source = apiMessages.filter((m) => String(m.conversation) === String(threadId));
      }
    }
    return sortMessages(source).map((msg) => {
        const isMe = String(msg.sender?.id) === String(user?.id);
        const senderName = isMe
          ? 'You'
          : msg.sender?.full_name ||
            `${msg.sender?.first_name || ''} ${msg.sender?.last_name || ''}`.trim() ||
            'User';
        return {
          id: String(msg.id),
          sender: isMe ? 'me' : 'them',
          senderName,
          senderAvatar: msg.sender?.profile_image || (isMe ? myAvatar : activeContact.avatar),
          text: msg.content || '',
          time: formatMessageTime(msg.created_at) || 'Just now',
        };
      });
  }, [apiMessages, user?.id, myAvatar, activeContact.avatar, selectedGroup, replyConversationId, selectedId]);

  const loadConversations = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setLoadingConversations(true);
    try {
      const response = await chatService.getConversations({
        view: messagesView,
        page_size: 100,
      });
      if (response.success && response.data) {
        setConversations(dedupeConversations(extractList(response.data)));
      }
    } catch {
      if (!options?.silent) toast.error('Failed to load conversations');
    } finally {
      if (!options?.silent) setLoadingConversations(false);
    }
  }, [messagesView]);

  const patchConversationPreview = useCallback(
    (conversationId: string, content: string, createdAt: string) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                last_message_at: createdAt,
                unread_count: 0,
                last_message: {
                  id: conv.last_message?.id ?? '',
                  sender: user?.full_name || 'You',
                  content,
                  created_at: createdAt,
                  is_read: true,
                },
              }
            : conv,
        ),
      );
    },
    [user?.full_name],
  );

  const loadGroupMessages = useCallback(
    async (convs: Conversation[], options?: { silent?: boolean }) => {
      if (!options?.silent) setLoadingMessages(true);
      try {
        const batches = await Promise.all(
          convs.map(async (conv) => {
            const id = conversationKey(conv);
            if (!id) return [] as Message[];
            const response = await chatService.getMessages(id);
            return response.success && response.data ? extractList(response.data) : [];
          }),
        );
        const merged = sortMessages(batches.flat());
        if (options?.silent) {
          setApiMessages((prev) => {
            const byId = new Map<string, Message>();
            for (const msg of prev) byId.set(String(msg.id), msg);
            for (const msg of merged) byId.set(String(msg.id), msg);
            const next = sortMessages([...byId.values()]);
            if (next.length === prev.length && next.every((m, i) => String(m.id) === String(prev[i]?.id))) {
              return prev;
            }
            return next;
          });
        } else {
          shouldScrollToBottomRef.current = true;
          setApiMessages(merged);
        }
      } catch {
        if (!options?.silent) toast.error('Failed to load messages');
        setApiMessages([]);
      } finally {
        if (!options?.silent) setLoadingMessages(false);
      }
    },
    [],
  );

  const wsConversationIds = useMemo(() => {
    if (selectedGroup) {
      return selectedGroup.conversations
        .map((c) => conversationKey(c))
        .filter((id): id is string => Boolean(id));
    }
    return selectedId ? [selectedId] : [];
  }, [selectedGroup, selectedId]);

  const activeConversationId = replyConversationId ?? selectedId;

  const sendWsMessageRef = useRef<(conversationId: string, message: WebSocketMessage) => void>(
    () => undefined,
  );

  const { otherUserTyping, notifyTyping, stopTyping, clearOtherUserTyping, handleRealtimeEvent } = useChatTyping({
    activeConversationId,
    currentUserId: user?.id,
    canSend: canSendMessages,
    sendWsMessage: (conversationId, message) => sendWsMessageRef.current(conversationId, message),
  });

  const handleRealtimeMessage = useCallback(
    (payload: WebSocketMessage & { type: string; message?: Message }) => {
      handleRealtimeEvent(payload);

      if (payload.type === 'error') {
        toast.error(
          typeof payload.message === 'string'
            ? payload.message
            : 'Could not deliver message in real time.',
        );
        return;
      }
      if (payload.type !== 'chat_message' || !payload.message) return;

      const incoming = payload.message;
      const conversationId = String(incoming.conversation ?? '');
      if (!conversationId) return;

      const inGroup = selectedGroup?.conversations.some(
        (c) => conversationKey(c) === conversationId,
      );
      if (!inGroup) {
        void loadConversations({ silent: true });
        return;
      }

      setApiMessages((prev) => {
        if (prev.some((m) => String(m.id) === String(incoming.id))) return prev;
        shouldScrollToBottomRef.current = true;
        return sortMessages([...prev, incoming]);
      });

      patchConversationPreview(
        conversationId,
        incoming.content || '',
        incoming.created_at || new Date().toISOString(),
      );

      if (String(incoming.sender?.id) !== String(user?.id)) {
        clearOtherUserTyping(String(incoming.sender?.id));
        void chatService.markAllAsRead(conversationId).catch(() => undefined);
      }
    },
    [selectedGroup, user?.id, patchConversationPreview, loadConversations, handleRealtimeEvent, clearOtherUserTyping],
  );

  const { isConnected: wsConnected, sendMessage: sendWsMessage } = useMultiConversationWebSocket(
    wsConversationIds,
    {
      enabled: Boolean(isAuthenticated && isWebSocketsEnabled() && wsConversationIds.length > 0),
      onMessage: (msg) => handleRealtimeMessage(msg as { type: string; message?: Message }),
    },
  );

  sendWsMessageRef.current = sendWsMessage;

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated && !user) {
      router.replace(`/signin?next=${encodeURIComponent(DASHBOARD_MESSAGES_PATH)}`);
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated || user) void loadConversations();
  }, [isAuthenticated, user, loadConversations]);

  useEffect(() => {
    setConversations([]);
    setSelectedId(null);
    setActivePersonKey(null);
    setReplyConversationId(null);
    loadedMessagesForRef.current = null;
    resolvedDeepLinkRef.current = null;
    setMobilePane('list');
  }, [messagesView]);

  useEffect(() => {
    if (!selectedId) return;
    const stillVisible = conversationGroups.some((group) =>
      group.conversations.some((conv) => conversationKey(conv) === selectedId),
    );
    if (!stillVisible) {
      setSelectedId(null);
      setActivePersonKey(null);
      setReplyConversationId(null);
      setMobilePane('list');
    }
  }, [conversationGroups, selectedId]);

  useEffect(() => {
    const conversationParam = searchParams.get('conversation');
    const bidParam = searchParams.get('bid');
    const taskerParam = searchParams.get('tasker');
    const taskParam = searchParams.get('task');

    const deepKey =
      conversationParam ||
      (bidParam && taskerParam ? `bid:${bidParam}:${taskerParam}` : '') ||
      (taskParam && taskerParam ? `task:${taskParam}:${taskerParam}` : '');

    if (!deepKey) return;

    if (conversationParam) {
      if (resolvedDeepLinkRef.current === deepKey) return;

      setSelectedId(conversationParam);
      const group = conversationGroups.find((g) =>
        g.conversations.some((c) => conversationKey(c) === conversationParam),
      );
      if (group) {
        resolvedDeepLinkRef.current = deepKey;
        setActivePersonKey(group.key);
        setMobilePane('thread');
        return;
      }

      if (loadingConversations || resolvingDeepLink) return;

      setResolvingDeepLink(true);
      void chatService
        .getConversation(conversationParam)
        .then((response) => {
          if (!response.success || !response.data) {
            toast.error('Could not open this conversation.');
            return;
          }
          const conv = response.data;
          const id = String(conv.id);
          resolvedDeepLinkRef.current = deepKey;
          setSelectedId(id);
          setConversations((prev) => dedupeConversations([conv, ...prev]));
          const personKey = otherParticipantKey(conv, user?.id);
          if (personKey) {
            setActivePersonKey(personKey);
            setMobilePane('thread');
          }
        })
        .catch(() => {
          toast.error('Could not open this conversation.');
        })
        .finally(() => {
          setResolvingDeepLink(false);
        });
      return;
    }

    if (resolvedDeepLinkRef.current === deepKey) return;

    const openConversation = async (
      finder: () => ReturnType<typeof chatService.findOrCreateConversationForBid>,
    ) => {
      setResolvingDeepLink(true);
      try {
        const response = await finder();
        if (response.success && response.data) {
          const conv = response.data;
          const id = String(conv.id);
          resolvedDeepLinkRef.current = deepKey;
          setSelectedId(id);
          setConversations((prev) => dedupeConversations([conv, ...prev]));
          const personKey = otherParticipantKey(conv, user?.id);
          if (personKey) {
            setActivePersonKey(personKey);
            setMobilePane('thread');
          }
          if (!isMessagingEnabledForConversation(conv)) {
            toast.info(messagingDisabledReason(getTaskStatusFromConversation(conv)));
          }
        } else {
          toast.error(
            formatChatApiError(
              { message: response.message || '' },
              'Could not open conversation. Accept the offer first to start messaging.',
            ),
          );
        }
      } catch (err) {
        toast.error(
          formatChatApiError(
            err,
            'Could not open conversation. Accept the offer first to start messaging.',
          ),
        );
      } finally {
        setResolvingDeepLink(false);
      }
    };

    if (bidParam && taskerParam) {
      resolvedDeepLinkRef.current = deepKey;
      void openConversation(() =>
        chatService.findOrCreateConversationForBid(bidParam, taskerParam),
      );
      return;
    }

    if (taskParam && taskerParam) {
      resolvedDeepLinkRef.current = deepKey;
      void openConversation(() =>
        chatService.findOrCreateConversationForTask(taskParam, taskerParam),
      );
    }
  }, [searchParams, conversationGroups, user?.id, loadingConversations, resolvingDeepLink]);

  useEffect(() => {
    if (!selectedGroup) {
      setApiMessages([]);
      loadedMessagesForRef.current = null;
      return;
    }

    const signature = `${selectedGroup.key}|${selectedGroup.conversations
      .map((c) => conversationKey(c))
      .filter(Boolean)
      .sort()
      .join(',')}`;

    const defaultReplyId = conversationKey(selectedGroup.latest);
    setReplyConversationId((prev) => {
      if (prev && selectedGroup.conversations.some((c) => conversationKey(c) === prev)) {
        return prev;
      }
      return defaultReplyId;
    });

    if (loadedMessagesForRef.current !== signature) {
      loadedMessagesForRef.current = signature;
      void loadGroupMessages(selectedGroup.conversations);

      for (const conv of selectedGroup.conversations) {
        const id = conversationKey(conv);
        if (id) void chatService.markAllAsRead(id).catch(() => undefined);
      }
      void loadConversations({ silent: true });
    }
  }, [selectedGroup, loadGroupMessages, loadConversations]);

  useEffect(() => {
    if (!selectedId) {
      if (searchParams.get('conversation')) {
        router.replace(messagesHref(DASHBOARD_MESSAGES_PATH), { scroll: false });
      }
      return;
    }
    const current = searchParams.get('conversation');
    if (current === selectedId) return;
    router.replace(messagesHref(DASHBOARD_MESSAGES_PATH, { conversation: selectedId }), {
      scroll: false,
    });
  }, [selectedId, searchParams, router]);

  useEffect(() => {
    if (loadingConversations || resolvingDeepLink || selectedId) return;
    if (
      searchParams.get('conversation') ||
      searchParams.get('bid') ||
      searchParams.get('task')
    ) {
      return;
    }
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return;
    const first = filteredGroups[0]?.latest;
    if (first?.id) {
      const id = String(first.id);
      setSelectedId(id);
      setActivePersonKey(filteredGroups[0].key);
    }
  }, [loadingConversations, resolvingDeepLink, selectedId, filteredGroups, searchParams]);

  useEffect(() => {
    if (!selectedGroup) return;
    const pollMs = wsConnected ? 45000 : 4000;
    const poll = () => {
      if (document.visibilityState === 'hidden') return;
      void loadGroupMessages(selectedGroup.conversations, { silent: true });
    };
    const interval = setInterval(poll, pollMs);
    const onVisible = () => {
      if (document.visibilityState === 'visible') poll();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', poll);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', poll);
    };
  }, [selectedGroup, loadGroupMessages, wsConnected]);

  useEffect(() => {
    if (otherUserTyping) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [otherUserTyping]);

  useEffect(() => {
    if (shouldScrollToBottomRef.current) {
      shouldScrollToBottomRef.current = false;
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeMessages, sending]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length]);

  const handleSelectContact = (personKey: string) => {
    const group = conversationGroups.find((g) => g.key === personKey);
    if (!group) return;
    const latestId = conversationKey(group.latest);
    loadedMessagesForRef.current = null;
    setActivePersonKey(personKey);
    if (latestId) setSelectedId(latestId);
    setDeletedHistoryBackup(null);
    setToastMessage(null);
    setMobilePane('thread');
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const textContent = inputText.trim();
    const sendConversationId = replyConversationId ?? selectedId;
    if (!textContent || !sendConversationId || !user) return;

    if (!canSendMessages) {
      toast.error(messagingDisabledText);
      return;
    }

    const optimisticId = `temp-${Date.now()}`;
    const optimisticCreatedAt = new Date().toISOString();
    const optimisticMessage: Message = {
      id: optimisticId,
      conversation: sendConversationId,
      sender: user,
      content: textContent,
      message_type: 'text',
      is_read: false,
      created_at: optimisticCreatedAt,
    };

    setInputText('');
    stopTyping();
    shouldScrollToBottomRef.current = true;
    setApiMessages((prev) => sortMessages([...prev, optimisticMessage]));
    patchConversationPreview(sendConversationId, textContent, optimisticCreatedAt);
    setSending(true);

    try {
      const response = await chatService.sendMessage(sendConversationId, {
        content: textContent,
      });
      if (response.success && response.data) {
        setApiMessages((prev) =>
          sortMessages(prev.map((m) => (m.id === optimisticId ? response.data! : m))),
        );
        patchConversationPreview(
          sendConversationId,
          response.data.content || textContent,
          response.data.created_at || optimisticCreatedAt,
        );
      } else {
        setApiMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        toast.error(formatChatApiError(response, 'Failed to send message'));
      }
    } catch (err) {
      setApiMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      toast.error(formatChatApiError(err, 'Failed to send message'));
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!selectedGroup || activeMessages.length === 0) return;

    setDeletedHistoryBackup(activeMessages);
    setArchivedConversationIds(
      selectedGroup.conversations
        .map((c) => conversationKey(c))
        .filter((id): id is string => Boolean(id)),
    );
    setApiMessages([]);

    await Promise.all(
      selectedGroup.conversations.map(async (conv) => {
        const id = conversationKey(conv);
        if (id) await chatService.archiveConversation(id).catch(() => undefined);
      }),
    );

    setToastMessage(`Conversation with ${activeContact.name} was deleted.`);
    void loadConversations({ silent: true });
    setTimeout(() => setToastMessage(null), 6000);
  };

  const handleUndoDelete = async () => {
    if (!deletedHistoryBackup || !selectedGroup) return;

    await Promise.all(
      archivedConversationIds.map((id) =>
        chatService.unarchiveConversation(id).catch(() => undefined),
      ),
    );

    setDeletedHistoryBackup(null);
    setArchivedConversationIds([]);
    setToastMessage('Conversation history restored successfully!');
    void loadConversations();
    loadedMessagesForRef.current = null;
    void loadGroupMessages(selectedGroup.conversations);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleInputChange = (value: string) => {
    setInputText(value);
    if (value.trim()) notifyTyping();
    else stopTyping();
  };

  const typingDisplayName = otherUserTyping?.userName || activeContact.name;

  return (
    <div className={DASHBOARD_PAGE_ROOT}>
      <div className="mx-auto grid min-w-0 max-w-7xl grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
        <div
          className={`${mobilePane === 'thread' ? 'hidden lg:flex' : 'flex'} ${DASHBOARD_MESSAGES_HEIGHT} min-w-0 flex-col rounded-2xl border border-neutral-100 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.01)] sm:p-5 lg:col-span-4`}
        >
          <div className="relative mb-5 flex items-center rounded-xl border border-neutral-100 bg-[#F9F9FB] px-4 py-1">
            <Search className="mr-2.5 h-[18px] w-[18px] shrink-0 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations"
              className="w-full border-0 bg-transparent py-3 text-sm font-normal text-neutral-800 outline-none placeholder:text-neutral-400 focus:outline-none focus:ring-0"
            />
          </div>

          <div className="scrollbar-thin scrollbar-thumb-neutral-200 flex-1 space-y-2 overflow-y-auto pr-1">
            {loadingConversations || resolvingDeepLink ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#52C47F]" />
              </div>
            ) : contacts.length === 0 ? (
              <div className="py-12 text-center font-sans text-xs text-neutral-400">
                {emptyInboxMessage}
              </div>
            ) : (
              contacts.map((contact) => {
                const isSelected = activePersonKey === contact.id;
                return (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => handleSelectContact(contact.id)}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-xl p-3.5 text-left transition-all ${
                      isSelected
                        ? 'border border-neutral-100/50 bg-[#F9F9FB]'
                        : 'border border-transparent hover:bg-neutral-50/70'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3.5">
                      <div className="relative h-11 w-11 shrink-0">
                        <img
                          src={contact.avatar}
                          alt={contact.name}
                          className="h-11 w-11 rounded-full border border-neutral-100 object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {contact.online ? (
                          <span className="absolute bottom-0 right-0 h-[11px] w-[11px] rounded-full bg-[#27AE60] ring-2 ring-white" />
                        ) : null}
                      </div>

                      <div className="min-w-0">
                        <h4 className="mb-1 truncate text-sm font-medium leading-tight tracking-tight text-black">
                          {contact.name}
                        </h4>
                        <p className="truncate text-xs font-normal text-neutral-400">
                          {contact.role}
                        </p>
                      </div>
                    </div>

                    <div className="flex h-9 shrink-0 flex-col items-end justify-between text-right">
                      <span className="text-[11px] font-normal tracking-tight text-neutral-400">
                        {contact.time}
                      </span>

                      {contact.unread > 0 ? (
                        <span
                          style={{ backgroundColor: contact.badgeColor || '#52C47F' }}
                          className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-center text-[10px] font-medium leading-none text-white"
                        >
                          {contact.unread > 99 ? '99+' : contact.unread}
                        </span>
                      ) : (
                        <div className="h-4" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div
          className={`${mobilePane === 'list' ? 'hidden lg:flex' : 'flex'} relative ${DASHBOARD_MESSAGES_HEIGHT} min-w-0 flex-col rounded-2xl border border-neutral-100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.01)] lg:col-span-8`}
        >
          <div className="flex items-center justify-between gap-3 rounded-t-2xl border-b border-neutral-100 bg-white px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3.5">
              <button
                type="button"
                onClick={() => setMobilePane('list')}
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 lg:hidden"
                aria-label="Back to conversations"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
              </button>
              <div className="relative h-11 w-11 shrink-0">
                <img
                  src={activeContact.avatar}
                  alt={activeContact.name}
                  className="h-11 w-11 rounded-full border border-neutral-100 object-cover"
                  referrerPolicy="no-referrer"
                />
                {activeContact.online ? (
                  <span className="absolute bottom-0 right-0 h-[11px] w-[11px] rounded-full bg-[#27AE60] ring-2 ring-white" />
                ) : null}
              </div>

              <div className="leading-tight">
                <h3 className="text-[15px] font-medium tracking-tight text-black">
                  {activeContact.name}
                </h3>
                <span className="mt-0.5 block text-[11px] font-normal tracking-tight text-neutral-400">
                  {selectedGroup ? activeContact.role : 'Select a conversation'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleDeleteConversation()}
              disabled={!selectedGroup || activeMessages.length === 0}
              className="shrink-0 cursor-pointer text-xs font-normal text-red-500 underline decoration-red-100 transition-all hover:text-red-700 hover:decoration-red-400 disabled:cursor-not-allowed disabled:opacity-40 sm:text-[13px]"
            >
              Delete Conversation
            </button>
          </div>

          {toastMessage ? (
            <div className="animate-in fade-in absolute left-1/2 top-20 z-50 flex -translate-x-1/2 items-center gap-4 rounded-xl border border-neutral-200 bg-[#F9F9FB] px-4 py-2.5 text-xs text-neutral-800 shadow-lg duration-300">
              <span>{toastMessage}</span>
              {deletedHistoryBackup ? (
                <button
                  type="button"
                  onClick={() => void handleUndoDelete()}
                  className="cursor-pointer text-xs font-semibold text-[#27AE60] hover:underline"
                >
                  Undo
                </button>
              ) : null}
            </div>
          ) : null}

          {selectedGroup && selectedGroup.conversations.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto border-b border-neutral-100 bg-white px-4 py-2 sm:px-6">
              {selectedGroup.conversations.map((conv) => {
                const id = conversationKey(conv);
                if (!id) return null;
                const isActive = (replyConversationId ?? selectedId) === id;
                const label = conv.task_title?.trim() || 'Listing thread';
                const canSend = isMessagingEnabledForConversation(conv);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setReplyConversationId(id);
                      setSelectedId(id);
                      loadedMessagesForRef.current = null;
                      void loadGroupMessages([conv]);
                      void chatService.markAllAsRead(id).catch(() => undefined);
                    }}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#52C47F] text-white'
                        : canSend
                          ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                          : 'bg-neutral-50 text-neutral-400'
                    }`}
                    title={canSend ? label : messagingDisabledReason(getTaskStatusFromConversation(conv))}
                  >
                    {label}
                    {(conv.unread_count ?? 0) > 0 ? (
                      <span className="ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white/90 px-1 text-[10px] font-semibold text-[#52C47F]">
                        {conv.unread_count}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="scrollbar-thin scrollbar-thumb-neutral-200 flex-1 space-y-6 overflow-y-auto bg-[#FAF9F7]/10 p-6">
            {loadingMessages ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#52C47F]" />
              </div>
            ) : !selectedGroup ? (
              <div className="flex h-full flex-col items-center justify-center space-y-2 p-8 text-center">
                <p className="text-sm font-medium text-neutral-900">Select a conversation</p>
                <p className="text-xs text-neutral-400">
                  Choose someone from the list to view messages.
                </p>
              </div>
            ) : activeMessages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center space-y-2 p-8 text-center">
                <p className="text-sm font-medium text-neutral-900">
                  This conversation has been cleared
                </p>
                <p className="text-xs text-neutral-400">
                  Send an introductory message to start talking again.
                </p>
                {deletedHistoryBackup ? (
                  <button
                    type="button"
                    onClick={() => void handleUndoDelete()}
                    className="mt-2 cursor-pointer text-xs font-semibold text-[#52C47F] hover:underline"
                  >
                    Restore conversation
                  </button>
                ) : null}
              </div>
            ) : (
              activeMessages.map((msg) => {
                const isMe = msg.sender === 'me';

                if (isMe) {
                  return (
                    <div
                      key={msg.id}
                      className="animate-in fade-in flex flex-col items-end space-y-2 duration-300"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[11.5px] font-normal text-neutral-400">
                          {msg.time}
                        </span>
                        <span className="text-[13px] font-medium text-neutral-700">
                          {msg.senderName}
                        </span>
                        <img
                          src={msg.senderAvatar}
                          alt="Your avatar profile portrait"
                          className="h-[28px] w-[28px] rounded-full border border-neutral-100 object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="max-w-[70%] rounded-2xl rounded-tr-none border border-[#e5f4ec]/80 bg-[#f0faf4] px-5 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                        <p className="font-sans text-[13.5px] font-normal leading-relaxed text-[#2e6b4e]">
                          {msg.text}
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className="animate-in fade-in flex flex-col items-start space-y-2 duration-300"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={msg.senderAvatar}
                        alt={msg.senderName}
                        className="h-[28px] w-[28px] rounded-full border border-neutral-100 object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[13px] font-medium text-neutral-700">
                        {msg.senderName}
                      </span>
                      <span className="text-[11.5px] font-normal text-neutral-400">
                        {msg.time}
                      </span>
                    </div>

                    <div className="max-w-[70%] rounded-2xl rounded-tl-none border border-neutral-100/50 bg-[#F9F9FB] px-5 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                      <p className="font-sans text-[13.5px] font-normal leading-relaxed text-neutral-800">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                );
              })
            )}

            {otherUserTyping ? (
              <div className="flex animate-pulse flex-col items-start space-y-2">
                <div className="flex items-center gap-2">
                  <img
                    src={activeContact.avatar}
                    alt={typingDisplayName}
                    className="h-[28px] w-[28px] rounded-full border border-neutral-100 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-[13px] font-medium text-neutral-700">
                    {typingDisplayName}
                  </span>
                  <span className="text-[11px] text-neutral-400">is typing...</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-none border border-neutral-100/40 bg-[#F9F9FB] px-5 py-3">
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#52C47F]"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#52C47F]"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#52C47F]"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>

          {!canSendMessages && selectedGroup && replyConversation ? (
            <p className="border-t border-neutral-100 bg-white px-6 py-2 text-xs text-neutral-500">
              {messagingDisabledText}
            </p>
          ) : null}

          <form
            onSubmit={(e) => void handleSendMessage(e)}
            className="flex items-center justify-between gap-4 rounded-b-2xl border-t border-neutral-100 bg-white p-4"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => handleInputChange(e.target.value)}
              disabled={sending || !selectedGroup || !canSendMessages}
              placeholder="Type a Message"
              className="flex-1 border-0 bg-transparent px-1.5 py-3 text-sm font-normal text-neutral-800 outline-none placeholder:text-neutral-400 focus:outline-none focus:ring-0 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || sending || !selectedGroup || !canSendMessages}
              className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-5 py-3 text-xs font-medium tracking-tight text-white transition-all ${
                inputText.trim() && !sending && selectedGroup && canSendMessages
                  ? 'bg-[#52C47F] shadow-md hover:scale-[1.02] hover:bg-[#43B26F] active:scale-[0.98]'
                  : 'cursor-not-allowed border border-neutral-100 bg-neutral-100 text-neutral-400'
              }`}
            >
              <span>Send Message</span>
              <ArrowUpRight className="ml-0.5 h-4 w-4 shrink-0" strokeWidth={2.4} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function DashboardMessages() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[640px] items-center justify-center bg-[#f0efec] text-sm text-neutral-500">
          Loading messages…
        </div>
      }
    >
      <DashboardMessagesContent />
    </Suspense>
  );
}
