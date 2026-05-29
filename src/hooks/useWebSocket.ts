'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { tokenManager } from '@/lib/api/client';

export interface WebSocketMessage {
  type: string;
  message?: unknown;
  data?: unknown;
  [key: string]: unknown;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  enabled?: boolean;
}

/** Close codes where reconnecting will not help */
const NO_RECONNECT_CODES = new Set([4001, 4003, 1000, 1001]);

function closeReason(code: number): string | undefined {
  switch (code) {
    case 4001:
      return 'authentication failed';
    case 4003:
      return 'conversation access denied';
    case 1006:
      return 'connection lost';
    default:
      return undefined;
  }
}

export function useWebSocket(url: string | null, options: UseWebSocketOptions = {}) {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    enabled = true,
  } = options;

  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const urlRef = useRef(url);
  const intentionalCloseRef = useRef(false);

  const onMessageRef = useRef(onMessage);
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onConnectRef.current = onConnect;
    onDisconnectRef.current = onDisconnect;
    onErrorRef.current = onError;
  }, [onMessage, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    intentionalCloseRef.current = true;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    const ws = wsRef.current;
    if (ws) {
      ws.onerror = null;
      ws.onclose = null;
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close(1000, 'Client disconnect');
      }
      wsRef.current = null;
    }

    setIsConnected(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  const connect = useCallback(() => {
    const targetUrl = urlRef.current;
    const token = tokenManager.getAccessToken();

    if (!targetUrl || !token) {
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      const wsUrl = `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`;
      intentionalCloseRef.current = false;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        reconnectAttemptsRef.current = 0;
        setIsConnected(true);
        onConnectRef.current?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          onMessageRef.current?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = () => {
        // Browsers fire a generic Event with no details before onclose — avoid noisy logs.
        if (!intentionalCloseRef.current) {
          onErrorRef.current?.(new Event('websocket-error'));
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        onDisconnectRef.current?.();

        const wasIntentional = intentionalCloseRef.current;
        intentionalCloseRef.current = false;

        if (wasIntentional) {
          return;
        }

        const reason = closeReason(event.code);
        if (reason && process.env.NODE_ENV === 'development') {
          console.warn(`WebSocket closed (${event.code}): ${reason}`);
        }

        if (NO_RECONNECT_CODES.has(event.code)) {
          return;
        }

        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [maxReconnectAttempts, reconnectInterval]);

  useEffect(() => {
    urlRef.current = url;
    reconnectAttemptsRef.current = 0;
    disconnect();

    if (!enabled || !isAuthenticated || !url) {
      return;
    }

    connect();

    return () => {
      disconnect();
    };
  }, [enabled, isAuthenticated, url, connect, disconnect]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  return {
    isConnected,
    sendMessage,
    disconnect,
    reconnect: connect,
  };
}
