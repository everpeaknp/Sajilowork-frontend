'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { tokenManager } from '@/lib/api/client';
import { buildChatWebSocketUrl } from '@/lib/chatWebSocket';
import type { WebSocketMessage } from './useWebSocket';

const NO_RECONNECT_CODES = new Set([4001, 4003, 1000, 1001]);

interface UseMultiConversationWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  enabled?: boolean;
}

/**
 * Subscribe to real-time chat events for one or more conversation rooms.
 */
export function useMultiConversationWebSocket(
  conversationIds: string[],
  options: UseMultiConversationWebSocketOptions = {},
) {
  const {
    onMessage,
    reconnectInterval = 3000,
    maxReconnectAttempts = 12,
    enabled = true,
  } = options;

  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const socketsRef = useRef<Map<string, WebSocket>>(new Map());
  const reconnectAttemptsRef = useRef<Map<string, number>>(new Map());
  const reconnectTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const intentionalCloseRef = useRef<Set<string>>(new Set());

  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const updateConnectedState = useCallback(() => {
    const sockets = socketsRef.current;
    const anyOpen = [...sockets.values()].some((ws) => ws.readyState === WebSocket.OPEN);
    setIsConnected(anyOpen);
  }, []);

  const disconnectOne = useCallback(
    (conversationId: string) => {
      intentionalCloseRef.current.add(conversationId);

      const timeout = reconnectTimeoutsRef.current.get(conversationId);
      if (timeout) {
        clearTimeout(timeout);
        reconnectTimeoutsRef.current.delete(conversationId);
      }

      const ws = socketsRef.current.get(conversationId);
      if (ws) {
        ws.onerror = null;
        ws.onclose = null;
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close(1000, 'Client disconnect');
        }
        socketsRef.current.delete(conversationId);
      }

      reconnectAttemptsRef.current.delete(conversationId);
      updateConnectedState();
    },
    [updateConnectedState],
  );

  const connectOne = useCallback(
    (conversationId: string) => {
      const token = tokenManager.getAccessToken();
      if (!token) return;

      const existing = socketsRef.current.get(conversationId);
      if (existing?.readyState === WebSocket.OPEN || existing?.readyState === WebSocket.CONNECTING) {
        return;
      }

      try {
        const baseUrl = buildChatWebSocketUrl(conversationId);
        const wsUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`;
        intentionalCloseRef.current.delete(conversationId);

        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          reconnectAttemptsRef.current.set(conversationId, 0);
          updateConnectedState();
        };

        ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            onMessageRef.current?.({ ...message, _conversationId: conversationId });
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        ws.onerror = () => {
          if (!intentionalCloseRef.current.has(conversationId)) {
            updateConnectedState();
          }
        };

        ws.onclose = (event) => {
          socketsRef.current.delete(conversationId);
          updateConnectedState();

          const wasIntentional = intentionalCloseRef.current.has(conversationId);
          intentionalCloseRef.current.delete(conversationId);

          if (wasIntentional || NO_RECONNECT_CODES.has(event.code)) {
            return;
          }

          const attempts = reconnectAttemptsRef.current.get(conversationId) ?? 0;
          if (attempts >= maxReconnectAttempts) {
            return;
          }

          reconnectAttemptsRef.current.set(conversationId, attempts + 1);
          const timeout = setTimeout(() => {
            reconnectTimeoutsRef.current.delete(conversationId);
            connectOne(conversationId);
          }, reconnectInterval);
          reconnectTimeoutsRef.current.set(conversationId, timeout);
        };

        socketsRef.current.set(conversationId, ws);
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
      }
    },
    [maxReconnectAttempts, reconnectInterval, updateConnectedState],
  );

  const sendMessage = useCallback((conversationId: string, message: WebSocketMessage) => {
    const ws = socketsRef.current.get(conversationId);
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }, []);

  const normalizedIds = useMemoStableIds(conversationIds);

  useEffect(() => {
    if (!enabled || !isAuthenticated || normalizedIds.length === 0) {
      for (const id of [...socketsRef.current.keys()]) {
        disconnectOne(id);
      }
      setIsConnected(false);
      return;
    }

    for (const id of normalizedIds) {
      connectOne(id);
    }

    for (const id of [...socketsRef.current.keys()]) {
      if (!normalizedIds.includes(id)) {
        disconnectOne(id);
      }
    }

    return () => {
      for (const id of [...socketsRef.current.keys()]) {
        disconnectOne(id);
      }
    };
  }, [connectOne, disconnectOne, enabled, isAuthenticated, normalizedIds]);

  return { isConnected, sendMessage };
}

function useMemoStableIds(conversationIds: string[]): string[] {
  const key = conversationIds.filter(Boolean).map(String).sort().join('|');
  const ref = useRef({ key, ids: [] as string[] });
  if (ref.current.key !== key) {
    ref.current = { key, ids: conversationIds.filter(Boolean).map(String) };
  }
  return ref.current.ids;
}
