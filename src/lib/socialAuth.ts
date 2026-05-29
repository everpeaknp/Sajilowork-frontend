/**
 * Start Google or Facebook OAuth via the Django backend (authorization code flow).
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
  'http://localhost:8000/api/v1';

export type SocialProvider = 'google' | 'facebook';

export interface SocialAuthStartOptions {
  /** Path on the frontend after login, e.g. `/discover` */
  next?: string;
  /** Only used on signup — `tasker` or `customer` */
  role?: 'customer' | 'tasker';
}

function buildStartUrl(provider: SocialProvider, options?: SocialAuthStartOptions): string {
  const params = new URLSearchParams();
  if (options?.next) {
    params.set('next', options.next);
  }
  if (options?.role) {
    params.set('role', options.role);
  }
  const qs = params.toString();
  const base = `${API_BASE}/auth/${provider}/login/`;
  return qs ? `${base}?${qs}` : base;
}

export function startGoogleAuth(options?: SocialAuthStartOptions): void {
  window.location.href = buildStartUrl('google', options);
}

export function startFacebookAuth(options?: SocialAuthStartOptions): void {
  window.location.href = buildStartUrl('facebook', options);
}

export const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth_not_configured:
    'Social login is not configured on the server. Add Google/Facebook credentials to the backend .env file.',
  oauth_start_failed: 'Could not start social login. Please try again.',
  oauth_missing_code: 'Sign-in was cancelled or interrupted.',
  oauth_invalid_state: 'Sign-in session expired. Please try again.',
  oauth_failed: 'Social sign-in failed. Please try again or use email and password.',
  account_suspended: 'Your account is temporarily suspended.',
  account_disabled: 'This account is disabled.',
  access_denied: 'You declined permission to sign in.',
};

export function oauthErrorMessage(code: string | null): string {
  if (!code) return OAUTH_ERROR_MESSAGES.oauth_failed;
  return OAUTH_ERROR_MESSAGES[code] || OAUTH_ERROR_MESSAGES.oauth_failed;
}
