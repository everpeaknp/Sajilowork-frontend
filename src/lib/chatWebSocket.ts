/**
 * Build a Django Channels chat WebSocket URL for a conversation UUID.
 * NEXT_PUBLIC_WS_URL should be the base only, e.g. ws://localhost:8000/ws
 */
export function buildChatWebSocketUrl(conversationId: string): string {
  const base = (process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws').replace(/\/$/, '');
  return `${base}/chat/${conversationId}/`;
}

export function isWebSocketsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_WEBSOCKETS !== 'false';
}
