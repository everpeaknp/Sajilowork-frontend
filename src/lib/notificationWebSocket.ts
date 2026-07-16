/**
 * Build Django Channels notification WebSocket URL.
 * NEXT_PUBLIC_WS_URL should be the base only, e.g. ws://localhost:8000/ws
 */
export function buildNotificationWebSocketUrl(): string {
  const base = (process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000/ws').replace(/\/$/, '');
  return `${base}/notifications/`;
}

export function isWebSocketsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_WEBSOCKETS !== 'false';
}
