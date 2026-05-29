'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { RefreshCw, Send, Search, CheckCheck, Check, Loader2, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import UserAvatar from '@/components/common/UserAvatar';
import { chatService } from '@/services/chat.service';
import { useAuthStore } from '@/store/auth.store';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { Conversation, Message, PaginatedResponse } from '@/types';
import {
  getTaskStatusFromConversation,
  isMessagingEnabledForConversation,
  messagingDisabledReason,
} from '@/lib/chatMessaging';
import { formatChatApiError } from '@/lib/chatErrors';
import { buildChatWebSocketUrl, isWebSocketsEnabled } from '@/lib/chatWebSocket';

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

/** Drop rows without an id and collapse duplicates (e.g. bid deep-link + refresh). */
function sortMessages(msgs: Message[]): Message[] {
  return [...msgs].sort((a, b) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    return ta - tb;
  });
}

function profileImageForConversation(conv: Conversation, currentUserId?: string): string | undefined {
  if (conv.other_participant?.profile_image) {
    return conv.other_participant.profile_image;
  }
  const other = conv.participants?.find((p) => String(p.id) !== String(currentUserId));
  return other?.profile_image;
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

type PersonConversationGroup = {
  key: string;
  name: string;
  avatar?: string;
  conversations: Conversation[];
  latest: Conversation;
  totalUnread: number;
};

function otherParticipantKey(conv: Conversation, currentUserId?: string): string | null {
  const other = conv.other_participant;
  if (other?.id != null && other.id !== '') {
    return String(other.id);
  }
  const otherParticipant = conv.participants?.find(
    (p) => String(p.id) !== String(currentUserId)
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

function groupConversationsByPerson(
  list: Conversation[],
  currentUserId?: string
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
    (a, b) => conversationActivityTime(b.latest) - conversationActivityTime(a.latest)
  );
}

function groupSubtitle(group: PersonConversationGroup): string | undefined {
  const titles = group.conversations
    .map((c) => c.task_title?.trim())
    .filter((t): t is string => Boolean(t));
  const unique = [...new Set(titles)];
  if (unique.length === 0) return undefined;
  if (unique.length === 1) return unique[0];
  return `${unique.length} tasks`;
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

function formatMessageTime(iso?: string): string {
  if (!iso) return '';
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return '';
  }
}

function formatClockTime(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
}

function taskTitleForConversation(conv?: Conversation | null): string {
  return conv?.task_title?.trim() || 'Task conversation';
}

function taskPathForConversation(conv?: Conversation | null): string | undefined {
  if (!conv) return undefined;
  const slug =
    conv.task_slug ||
    (conv.task && typeof conv.task === 'object' && 'slug' in conv.task
      ? (conv.task as { slug?: string }).slug
      : undefined);
  return slug ? `/task/${slug}` : undefined;
}

type MessageWithTask = Message & {
  taskTitle: string;
  taskPath?: string;
};

type MessageFeedItem =
  | { kind: 'task_break'; conversationId: string; title: string; taskPath?: string }
  | { kind: 'message'; message: MessageWithTask; index: number };

function enrichMessage(msg: Message, conv: Conversation): MessageWithTask {
  return {
    ...msg,
    taskTitle: taskTitleForConversation(conv),
    taskPath: taskPathForConversation(conv),
  };
}

function messagesContentSignature(msgs: MessageWithTask[]): string {
  return msgs
    .map((m) => `${m.id}:${m.created_at ?? ''}:${m.is_read ? 1 : 0}:${m.content}`)
    .join('|');
}

function buildMessageFeed(messages: MessageWithTask[]): MessageFeedItem[] {
  const items: MessageFeedItem[] = [];
  let lastConvId: string | null = null;

  messages.forEach((msg, index) => {
    const convId = String(msg.conversation);
    if (convId !== lastConvId) {
      items.push({
        kind: 'task_break',
        conversationId: convId,
        title: msg.taskTitle,
        taskPath: msg.taskPath,
      });
      lastConvId = convId;
    }
    items.push({ kind: 'message', message: msg, index });
  });

  return items;
}

function TaskBreakDivider({
  title,
  taskPath,
  isActive,
  onSelect,
}: {
  title: string;
  taskPath?: string;
  isActive?: boolean;
  onSelect?: () => void;
}) {
  const content = (
    <>
      <div className="flex-1 h-px bg-outline-variant" />
      <div className="flex items-center gap-1.5 min-w-0 max-w-[min(100%,360px)]">
        <Briefcase className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden />
        <span className="text-xs font-semibold text-primary truncate">{title}</span>
      </div>
      <div className="flex-1 h-px bg-outline-variant" />
    </>
  );

  const className = `flex items-center gap-3 w-full py-2 ${
    isActive ? 'rounded-lg bg-primary/5 ring-1 ring-primary/30 px-2 -mx-2' : ''
  }`;

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={`${className} hover:bg-surface-container transition-colors`}
        role="separator"
        aria-label={`Messages for task: ${title}. Click to reply in this task.`}
        aria-pressed={isActive}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={className} role="separator" aria-label={`Messages for task: ${title}`}>
      {content}
      {taskPath && (
        <span className="sr-only">View task available</span>
      )}
    </div>
  );
}

export default function MessagesSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, initialize } = useAuthStore();

  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyConversationId, setReplyConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageWithTask[]>([]);
  const [messageText, setMessageText] = useState('');
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [resolvingBid, setResolvingBid] = useState(false);

  const isResizing = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resolvedDeepLinkRef = useRef<string | null>(null);
  const prevMessageCountRef = useRef(0);
  const shouldScrollToBottomRef = useRef(false);
  const loadedMessagesForRef = useRef<string | null>(null);

  const dedupedConversations = useMemo(
    () => dedupeConversations(conversations),
    [conversations]
  );

  const conversationGroups = useMemo(
    () => groupConversationsByPerson(dedupedConversations, user?.id),
    [dedupedConversations, user?.id]
  );

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversationGroups;
    return conversationGroups.filter((group) => {
      if (group.name.toLowerCase().includes(q)) return true;
      return group.conversations.some((conv) =>
        (conv.task_title || '').toLowerCase().includes(q)
      );
    });
  }, [conversationGroups, search]);

  const selected = dedupedConversations.find((c) => c.id === selectedId) ?? null;

  const selectedGroup = useMemo(
    () =>
      conversationGroups.find((group) =>
        group.conversations.some((c) => conversationKey(c) === selectedId)
      ) ?? null,
    [conversationGroups, selectedId]
  );

  const selectedGroupSignature = useMemo(() => {
    if (!selectedGroup) return '';
    const ids = selectedGroup.conversations
      .map((c) => conversationKey(c))
      .filter((id): id is string => Boolean(id))
      .sort()
      .join(',');
    return `${selectedGroup.key}|${ids}`;
  }, [selectedGroup]);

  const replyConversation = useMemo(() => {
    const id = replyConversationId ?? selectedId;
    if (!id) return null;
    return dedupedConversations.find((c) => c.id === id) ?? null;
  }, [replyConversationId, selectedId, dedupedConversations]);

  const canSendMessages = isMessagingEnabledForConversation(replyConversation);
  const selectedTaskStatus = getTaskStatusFromConversation(replyConversation);
  const messagingDisabledText = messagingDisabledReason(selectedTaskStatus);

  const loadConversations = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setLoadingConversations(true);
    try {
      const response = await chatService.getConversations();
      if (response.success && response.data) {
        setConversations(dedupeConversations(extractList(response.data)));
      }
    } catch {
      if (!options?.silent) toast.error('Failed to load conversations');
    } finally {
      if (!options?.silent) setLoadingConversations(false);
    }
  }, []);

  const patchConversationPreview = useCallback(
    (conversationId: string, content: string, createdAt: string) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                last_message_at: createdAt,
                last_message: {
                  id: conv.last_message?.id ?? '',
                  sender: user?.full_name || 'You',
                  content,
                  created_at: createdAt,
                  is_read: true,
                },
              }
            : conv
        )
      );
    },
    [user?.full_name]
  );

  // One stable socket per person (latest thread) — avoids reconnect errors when switching task reply.
  const wsConversationId = useMemo(() => {
    if (selectedGroup) {
      return conversationKey(selectedGroup.latest) ?? selectedId;
    }
    return selectedId;
  }, [selectedGroup, selectedId]);

  const wsUrl =
    isWebSocketsEnabled() && wsConversationId
      ? buildChatWebSocketUrl(wsConversationId)
      : null;

  const loadGroupMessages = useCallback(
    async (convs: Conversation[], options?: { silent?: boolean }) => {
      if (!options?.silent) setLoadingMessages(true);
      try {
        const batches = await Promise.all(
          convs.map(async (conv) => {
            const id = conversationKey(conv);
            if (!id) return [] as MessageWithTask[];
            const response = await chatService.getMessages(id);
            const list =
              response.success && response.data ? extractList(response.data) : [];
            return list.map((m) => enrichMessage(m, conv));
          })
        );
        const merged = sortMessages(batches.flat()) as MessageWithTask[];
        if (options?.silent) {
          setMessages((prev) => {
            if (messagesContentSignature(prev) === messagesContentSignature(merged)) {
              return prev;
            }
            return merged;
          });
        } else {
          shouldScrollToBottomRef.current = true;
          setMessages(merged);
        }
      } catch {
        if (!options?.silent) toast.error('Failed to load messages');
        setMessages([]);
      } finally {
        if (!options?.silent) setLoadingMessages(false);
      }
    },
    []
  );

  const handleRealtimeMessage = useCallback(
    (payload: { type: string; message?: Message }) => {
      if (payload.type === 'error') {
        const errText =
          typeof payload.message === 'string'
            ? payload.message
            : 'Could not deliver message in real time.';
        toast.error(errText);
        return;
      }

      if (payload.type !== 'chat_message' || !payload.message) return;

      const incoming = payload.message;
      const conversationId = String(incoming.conversation ?? '');
      if (!conversationId) return;

      const convInGroup = selectedGroup?.conversations.find(
        (c) => conversationKey(c) === conversationId
      );

      if (!convInGroup) {
        void loadConversations({ silent: true });
        return;
      }

      const enriched = enrichMessage(incoming, convInGroup) as MessageWithTask;

      setMessages((prev) => {
        if (prev.some((m) => String(m.id) === String(enriched.id))) {
          return prev;
        }
        shouldScrollToBottomRef.current = true;
        return sortMessages([...prev, enriched]) as MessageWithTask[];
      });

      const previewContent = incoming.content || '';
      const previewTime = incoming.created_at || new Date().toISOString();
      patchConversationPreview(conversationId, previewContent, previewTime);

      if (String(incoming.sender?.id) !== String(user?.id)) {
        void chatService.markAllAsRead(conversationId).catch(() => undefined);
      }
    },
    [selectedGroup, user?.id, patchConversationPreview, loadConversations]
  );

  const { isConnected: wsConnected } = useWebSocket(wsUrl, {
    enabled: Boolean(isAuthenticated && wsConversationId),
    onMessage: (msg) => handleRealtimeMessage(msg as any),
  });

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated && !user) {
      router.replace('/signin?next=/message');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated || user) {
      void loadConversations();
    }
  }, [isAuthenticated, user, loadConversations]);

  // Deep-link: ?conversation= | ?bid=&tasker= | ?task=&tasker=
  useEffect(() => {
    const conversationParam = searchParams.get('conversation');
    const bidParam = searchParams.get('bid');
    const taskerParam = searchParams.get('tasker');
    const taskParam = searchParams.get('task');

    const deepKey =
      conversationParam ||
      (bidParam && taskerParam ? `bid:${bidParam}:${taskerParam}` : '') ||
      (taskParam && taskerParam ? `task:${taskParam}:${taskerParam}` : '');

    if (!deepKey || resolvedDeepLinkRef.current === deepKey) return;

    if (conversationParam) {
      resolvedDeepLinkRef.current = deepKey;
      setSelectedId(conversationParam);
      return;
    }

    const openConversation = async (
      finder: () => ReturnType<typeof chatService.findOrCreateConversationForBid>
    ) => {
      setResolvingBid(true);
      try {
        const response = await finder();
        if (response.success && response.data) {
          const conv = response.data;
          setSelectedId(String(conv.id));
          setConversations((prev) => dedupeConversations([conv, ...prev]));
          if (!isMessagingEnabledForConversation(conv)) {
            toast.info(messagingDisabledReason(getTaskStatusFromConversation(conv)));
          }
        } else {
          toast.error(
            formatChatApiError(
              { message: response.message || '' },
              'Could not open conversation. Accept the offer first to start messaging.'
            )
          );
        }
      } catch (err) {
        toast.error(
          formatChatApiError(err, 'Could not open conversation. Accept the offer first to start messaging.')
        );
      } finally {
        setResolvingBid(false);
      }
    };

    if (bidParam && taskerParam) {
      resolvedDeepLinkRef.current = deepKey;
      void openConversation(() =>
        chatService.findOrCreateConversationForBid(bidParam, taskerParam)
      );
      return;
    }

    if (taskParam && taskerParam) {
      resolvedDeepLinkRef.current = deepKey;
      void openConversation(() =>
        chatService.findOrCreateConversationForTask(taskParam, taskerParam)
      );
    }
  }, [searchParams]);

  const findGroupBySignature = useCallback(
    (signature: string) =>
      conversationGroups.find((g) => {
        const ids = g.conversations
          .map((c) => conversationKey(c))
          .filter((id): id is string => Boolean(id))
          .sort()
          .join(',');
        return `${g.key}|${ids}` === signature;
      }) ?? null,
    [conversationGroups]
  );

  useEffect(() => {
    if (!selectedGroupSignature) {
      setMessages([]);
      loadedMessagesForRef.current = null;
      return;
    }

    const group = findGroupBySignature(selectedGroupSignature);
    if (!group) return;

    const defaultReplyId = conversationKey(group.latest);
    setReplyConversationId((prev) => {
      if (prev && group.conversations.some((c) => conversationKey(c) === prev)) {
        return prev;
      }
      return defaultReplyId;
    });

    if (loadedMessagesForRef.current !== selectedGroupSignature) {
      loadedMessagesForRef.current = selectedGroupSignature;
      void loadGroupMessages(group.conversations);

      for (const conv of group.conversations) {
        const id = conversationKey(conv);
        if (id) {
          void chatService.markAllAsRead(id).catch(() => undefined);
        }
      }
      void loadConversations({ silent: true });
    }
  }, [selectedGroupSignature, findGroupBySignature, loadGroupMessages, loadConversations]);

  useEffect(() => {
    if (!selectedId) return;
    const current = searchParams.get('conversation');
    if (current === selectedId) return;
    router.replace(`/message?conversation=${selectedId}`, { scroll: false });
  }, [selectedId, searchParams, router]);

  useEffect(() => {
    if (loadingConversations || resolvingBid || selectedId) return;
    if (
      searchParams.get('conversation') ||
      searchParams.get('bid') ||
      searchParams.get('task')
    ) {
      return;
    }
    const first = filteredGroups[0]?.latest;
    if (first?.id) setSelectedId(String(first.id));
  }, [loadingConversations, resolvingBid, selectedId, filteredGroups, searchParams]);

  useEffect(() => {
    if (!selectedGroupSignature) return;

    const pollMs = wsConnected ? 45000 : 20000;
    const interval = setInterval(() => {
      if (document.visibilityState === 'hidden') return;
      const group = findGroupBySignature(selectedGroupSignature);
      if (!group) return;
      void loadGroupMessages(group.conversations, { silent: true });
    }, pollMs);

    return () => clearInterval(interval);
  }, [selectedGroupSignature, findGroupBySignature, loadGroupMessages, wsConnected]);

  useEffect(() => {
    const count = messages.length;
    const grew = count > prevMessageCountRef.current;
    prevMessageCountRef.current = count;

    if (shouldScrollToBottomRef.current || grew) {
      shouldScrollToBottomRef.current = false;
      messagesEndRef.current?.scrollIntoView({ behavior: grew ? 'smooth' : 'auto' });
    }
  }, [messages]);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMove = (ev: MouseEvent) => {
      if (!isResizing.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = ev.clientX - rect.left;
      setSidebarWidth(Math.min(520, Math.max(200, newWidth)));
    };

    const onUp = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleSendMessage = async () => {
    const trimmed = messageText.trim();
    const sendConversationId = replyConversationId ?? selectedId;
    if (!trimmed || !sendConversationId || !user) return;

    if (!canSendMessages) {
      toast.error(messagingDisabledText);
      return;
    }

    const sendConv =
      replyConversation ??
      dedupedConversations.find((c) => c.id === sendConversationId) ??
      null;

    const optimisticId = `temp-${Date.now()}`;
    const optimisticCreatedAt = new Date().toISOString();
    const optimisticMessage: MessageWithTask = {
      id: optimisticId,
      conversation: sendConversationId,
      sender: user,
      content: trimmed,
      message_type: 'text',
      is_read: false,
      created_at: optimisticCreatedAt,
      taskTitle: taskTitleForConversation(sendConv),
      taskPath: taskPathForConversation(sendConv),
    };

    setMessageText('');
    shouldScrollToBottomRef.current = true;
    setMessages((prev) => sortMessages([...prev, optimisticMessage]) as MessageWithTask[]);
    patchConversationPreview(sendConversationId, trimmed, optimisticCreatedAt);
    setSending(true);

    try {
      const response = await chatService.sendMessage(sendConversationId, { content: trimmed });
      if (response.success && response.data) {
        const sent = enrichMessage(response.data, sendConv ?? ({} as Conversation)) as MessageWithTask;
        setMessages((prev) =>
          (sortMessages(prev.map((m) => (m.id === optimisticId ? sent : m))) as MessageWithTask[])
        );
        patchConversationPreview(
          sendConversationId,
          sent.content,
          sent.created_at || optimisticCreatedAt
        );
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        toast.error(response.message || 'Failed to send message');
      }
    } catch (err: unknown) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      toast.error(formatChatApiError(err, 'Failed to send message'));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  const totalUnread = dedupedConversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);

  const selectedName = selectedGroup
    ? selectedGroup.name
    : selected
      ? conversationDisplayName(selected, user?.id)
      : '';
  const selectedAvatar = selectedGroup
    ? selectedGroup.avatar
    : selected
      ? profileImageForConversation(selected, user?.id)
      : undefined;
  const selectedTaskPath = taskPathForConversation(replyConversation);
  const messageFeed = useMemo(() => buildMessageFeed(messages), [messages]);
  const hasMultipleTasks = (selectedGroup?.conversations.length ?? 0) > 1;

  const selectReplyConversation = useCallback((conversationId: string) => {
    setReplyConversationId(conversationId);
    setSelectedId(conversationId);
  }, []);

  const openPersonGroup = useCallback((latestId: string) => {
    loadedMessagesForRef.current = null;
    setSelectedId(latestId);
  }, []);

  return (
    <div ref={containerRef} className="flex h-full overflow-hidden">
      <aside
        style={{ width: sidebarWidth, minWidth: 200, maxWidth: 520 }}
        className="flex flex-col bg-background border-r border-outline-variant shrink-0 overflow-hidden"
      >
        <div className="p-4 border-b border-outline-variant">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">Messages</h2>
              {totalUnread > 0 && (
                <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => void loadConversations()}
              className="p-1.5 hover:bg-surface-container-low rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-on-surface-variant ${loadingConversations ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConversations || resolvingBid ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredGroups.length === 0 ? (
            <p className="p-6 text-center text-sm text-on-surface-variant">
              No conversations yet. Message a tasker from an offer on a task.
            </p>
          ) : (
            filteredGroups.map((group) => {
              const latest = group.latest;
              const latestId = conversationKey(latest);
              if (!latestId) return null;

              const isSelected = group.conversations.some(
                (c) => conversationKey(c) === selectedId
              );
              const preview = latest.last_message?.content || 'No messages yet';
              const time = formatMessageTime(
                latest.last_message?.created_at || latest.last_message_at
              );
              const taskLabel = groupSubtitle(group);

              return (
                <button
                  key={group.key}
                  type="button"
                  onClick={() => openPersonGroup(latestId)}
                  className={`w-full text-left p-4 flex gap-3 transition-colors border-l-4 ${
                    isSelected
                      ? 'bg-surface-container-low border-primary'
                      : 'hover:bg-surface-container-low border-transparent'
                  }`}
                >
                  <UserAvatar
                    src={group.avatar}
                    name={group.name}
                    size="md"
                    className="shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-sm text-foreground truncate">
                        {group.name}
                      </span>
                      {time && (
                        <span className="text-[10px] text-on-surface-variant shrink-0 ml-1">
                          {time}
                        </span>
                      )}
                    </div>
                    {taskLabel && (
                      <p className="text-[10px] text-primary truncate mb-0.5">{taskLabel}</p>
                    )}
                    <p className="text-xs text-on-surface-variant truncate mb-1">{preview}</p>
                    {group.totalUnread > 0 && (
                      <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {group.totalUnread > 99 ? '99+' : group.totalUnread}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <div
        onMouseDown={startResize}
        className="w-1 shrink-0 bg-outline-variant hover:bg-primary active:bg-primary cursor-col-resize transition-colors group relative"
        title="Drag to resize"
      />

      <main className="flex-1 flex flex-col bg-background min-w-0 overflow-hidden">
        {!selectedId ? (
          <div className="flex-1 flex items-center justify-center text-on-surface-variant text-sm">
            Select a conversation to start messaging
          </div>
        ) : (
          <>
            <header className="border-b border-outline-variant px-6 py-3 shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar src={selectedAvatar} name={selectedName} size="md" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground leading-tight truncate">
                      {selectedName}
                    </h3>
                    <p className="text-xs text-on-surface-variant truncate max-w-md">
                      {canSendMessages
                        ? wsConnected
                          ? 'Live · messaging open'
                          : 'Messaging open'
                        : selectedTaskStatus
                          ? `Messaging closed (${selectedTaskStatus.replace('_', ' ')})`
                          : messagingDisabledText}
                    </p>
                  </div>
                </div>
                {selectedTaskPath && (
                  <button
                    type="button"
                    onClick={() => router.push(selectedTaskPath)}
                    className="text-xs font-medium text-primary hover:underline shrink-0"
                  >
                    View task
                  </button>
                )}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 bg-surface-container-low space-y-4 min-h-0">
              {loadingMessages ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : messageFeed.length === 0 ? (
                <p className="text-center text-sm text-on-surface-variant py-8">
                  No messages yet. Say hello!
                </p>
              ) : (
                messageFeed.map((item) => {
                  if (item.kind === 'task_break') {
                    return (
                      <TaskBreakDivider
                        key={`break-${item.conversationId}`}
                        title={item.title}
                        taskPath={item.taskPath}
                        isActive={
                          hasMultipleTasks &&
                          (replyConversationId ?? selectedId) === item.conversationId
                        }
                        onSelect={
                          hasMultipleTasks
                            ? () => selectReplyConversation(item.conversationId)
                            : undefined
                        }
                      />
                    );
                  }

                  const msg = item.message;
                  const isMine =
                    Boolean(user?.id) &&
                    String(msg.sender?.id ?? '') === String(user!.id);
                  const senderName =
                    msg.sender?.full_name ||
                    `${msg.sender?.first_name || ''} ${msg.sender?.last_name || ''}`.trim() ||
                    'User';
                  const msgKey = msg.id ? String(msg.id) : `msg-${item.index}`;

                  return (
                    <div
                      key={msgKey}
                      className={`flex gap-3 ${isMine ? 'flex-row-reverse' : ''}`}
                    >
                      <UserAvatar
                        src={msg.sender?.profile_image}
                        name={senderName}
                        size="sm"
                        className="shrink-0"
                      />
                      <div className={`flex flex-col max-w-[70%] ${isMine ? 'items-end' : ''}`}>
                        <div
                          className={`px-4 py-2.5 rounded-2xl ${
                            isMine
                              ? 'bg-primary text-white rounded-tr-sm'
                              : 'bg-background text-foreground border border-outline-variant rounded-tl-sm'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                        </div>
                        <span className="text-[10px] text-on-surface-variant mt-1 flex items-center gap-1">
                          {formatClockTime(msg.created_at)}
                          {isMine &&
                            (msg.is_read ? (
                              <CheckCheck className="w-3.5 h-3.5 text-primary inline ml-1" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-on-surface-variant inline ml-1" />
                            ))}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <footer className="p-4 border-t border-outline-variant shrink-0">
              {hasMultipleTasks && replyConversation && (
                <p className="mb-2 text-xs text-on-surface-variant">
                  Replying in{' '}
                  <span className="font-medium text-primary">
                    {taskTitleForConversation(replyConversation)}
                  </span>
                  {' · '}
                  <span className="text-on-surface-variant">
                    tap a task line above to switch
                  </span>
                </p>
              )}
              {!canSendMessages && (
                <p className="mb-3 text-sm text-on-surface-variant bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3">
                  {messagingDisabledText}
                </p>
              )}
              <div className="flex items-end gap-3">
                <div
                  className={`flex-1 bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 transition-all ${
                    canSendMessages ? 'focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent' : 'opacity-60'
                  }`}
                >
                  <input
                    ref={inputRef}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      canSendMessages ? 'Type a message...' : 'Messaging is closed for this task'
                    }
                    disabled={sending || !canSendMessages}
                    className="w-full bg-transparent outline-none text-sm text-foreground placeholder-on-surface-variant disabled:cursor-not-allowed"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void handleSendMessage()}
                  disabled={!canSendMessages || !messageText.trim() || sending}
                  className="bg-primary hover:bg-primary/90 disabled:bg-surface-container disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors shadow-lg"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
