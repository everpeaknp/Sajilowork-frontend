'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { WebSocketMessage } from './useWebSocket';

export interface OtherUserTyping {
  userId: string;
  userName: string;
}

interface UseChatTypingOptions {
  activeConversationId: string | null;
  currentUserId?: string | number | null;
  canSend: boolean;
  sendWsMessage: (conversationId: string, message: WebSocketMessage) => void;
}

const TYPING_STOP_MS = 2500;
const REMOTE_TYPING_HIDE_MS = 4000;

export function useChatTyping({
  activeConversationId,
  currentUserId,
  canSend,
  sendWsMessage,
}: UseChatTypingOptions) {
  const [otherUserTyping, setOtherUserTyping] = useState<OtherUserTyping | null>(null);
  const remoteHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLocalTypingRef = useRef(false);

  const clearRemoteHideTimeout = useCallback(() => {
    if (remoteHideTimeoutRef.current) {
      clearTimeout(remoteHideTimeoutRef.current);
      remoteHideTimeoutRef.current = null;
    }
  }, []);

  const handleRealtimeEvent = useCallback(
    (payload: WebSocketMessage & { _conversationId?: string }) => {
      if (payload.type !== 'typing_indicator') return;

      const conversationId = String(payload._conversationId ?? '');
      if (!conversationId || conversationId !== activeConversationId) return;

      const userId = String(payload.user_id ?? '');
      if (!userId || userId === String(currentUserId ?? '')) return;

      const userName =
        typeof payload.user_name === 'string' && payload.user_name.trim()
          ? payload.user_name.trim()
          : 'User';

      if (payload.is_typing === false) {
        setOtherUserTyping((prev) => (prev?.userId === userId ? null : prev));
        clearRemoteHideTimeout();
        return;
      }

      setOtherUserTyping({ userId, userName });
      clearRemoteHideTimeout();
      remoteHideTimeoutRef.current = setTimeout(() => {
        setOtherUserTyping((prev) => (prev?.userId === userId ? null : prev));
      }, REMOTE_TYPING_HIDE_MS);
    },
    [activeConversationId, clearRemoteHideTimeout, currentUserId],
  );

  const clearOtherUserTyping = useCallback((userId?: string) => {
    clearRemoteHideTimeout();
    setOtherUserTyping((prev) => {
      if (!prev) return null;
      if (userId && prev.userId !== String(userId)) return prev;
      return null;
    });
  }, [clearRemoteHideTimeout]);

  const stopTyping = useCallback(() => {
    if (localStopTimeoutRef.current) {
      clearTimeout(localStopTimeoutRef.current);
      localStopTimeoutRef.current = null;
    }
    if (!isLocalTypingRef.current || !activeConversationId) return;
    isLocalTypingRef.current = false;
    sendWsMessage(activeConversationId, { type: 'typing_stop' });
  }, [activeConversationId, sendWsMessage]);

  const notifyTyping = useCallback(() => {
    if (!activeConversationId || !canSend) return;

    if (!isLocalTypingRef.current) {
      isLocalTypingRef.current = true;
      sendWsMessage(activeConversationId, { type: 'typing_start' });
    }

    if (localStopTimeoutRef.current) {
      clearTimeout(localStopTimeoutRef.current);
    }
    localStopTimeoutRef.current = setTimeout(stopTyping, TYPING_STOP_MS);
  }, [activeConversationId, canSend, sendWsMessage, stopTyping]);

  useEffect(() => {
    setOtherUserTyping(null);
    clearRemoteHideTimeout();
    stopTyping();
  }, [activeConversationId, clearRemoteHideTimeout, stopTyping]);

  useEffect(
    () => () => {
      clearRemoteHideTimeout();
      if (localStopTimeoutRef.current) {
        clearTimeout(localStopTimeoutRef.current);
      }
      if (isLocalTypingRef.current && activeConversationId) {
        sendWsMessage(activeConversationId, { type: 'typing_stop' });
      }
    },
    [activeConversationId, clearRemoteHideTimeout, sendWsMessage],
  );

  return { otherUserTyping, notifyTyping, stopTyping, clearOtherUserTyping, handleRealtimeEvent };
}
