const OAUTH_PENDING_KEY = 'oauth_callback_pending';

export type OAuthPendingSession = {
  access: string;
  refresh: string;
  next?: string | null;
};

export function stashOAuthPendingSession(session: OAuthPendingSession): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(OAUTH_PENDING_KEY, JSON.stringify(session));
}

export function readOAuthPendingSession(): OAuthPendingSession | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(OAUTH_PENDING_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as OAuthPendingSession;
    if (parsed?.access && parsed?.refresh) return parsed;
  } catch {
    // ignore malformed payload
  }
  return null;
}

export function clearOAuthPendingSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(OAUTH_PENDING_KEY);
}

export function stripOAuthTokensFromUrl(): void {
  if (typeof window === 'undefined') return;
  const cleanUrl = new URL(window.location.href);
  cleanUrl.searchParams.delete('access');
  cleanUrl.searchParams.delete('refresh');
  const remaining = cleanUrl.searchParams.toString();
  window.history.replaceState(
    {},
    '',
    remaining ? `${cleanUrl.pathname}?${remaining}` : cleanUrl.pathname,
  );
}

export function resolveOAuthRedirectPath(next: string | null | undefined): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/discover';
}
