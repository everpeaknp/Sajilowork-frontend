'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { tokenManager } from '@/lib/api/client';
import { authService } from '@/services/auth.service';
import { clearSessionCookies, persistSessionCookies } from '@/lib/authSession';
import {
  clearOAuthPendingSession,
  readOAuthPendingSession,
  resolveOAuthRedirectPath,
  stashOAuthPendingSession,
  stripOAuthTokensFromUrl,
} from '@/lib/oauthCallback';
import { useAuthStore } from '@/store';
import { normalizeUserFromApi } from '@/lib/userProfileSync';
import { oauthErrorMessage } from '@/lib/socialAuth';

function authErrorStatus(error: unknown): number {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    return Number((error as { status?: number }).status) || 0;
  }
  return 0;
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Completing sign-in…');

  useEffect(() => {
    const error = searchParams.get('error');

    if (error) {
      clearOAuthPendingSession();
      const msg = oauthErrorMessage(error);
      setMessage(msg);
      toast.error(msg);
      router.replace(`/signin?error=${encodeURIComponent(error)}`);
      return;
    }

    let access = searchParams.get('access');
    let refresh = searchParams.get('refresh');
    let nextPath = searchParams.get('next');

    if (access && refresh) {
      stashOAuthPendingSession({ access, refresh, next: nextPath });
      stripOAuthTokensFromUrl();
    } else {
      const pending = readOAuthPendingSession();
      if (pending) {
        access = pending.access;
        refresh = pending.refresh;
        nextPath = pending.next ?? nextPath;
      }
    }

    const finalRedirect = resolveOAuthRedirectPath(nextPath);

    if (!access || !refresh) {
      const existingAccess = tokenManager.getAccessToken();
      if (existingAccess) {
        window.location.assign(finalRedirect);
        return;
      }

      const msg = oauthErrorMessage('oauth_failed');
      setMessage(msg);
      toast.error(msg);
      router.replace('/signin');
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        tokenManager.setTokens(access, refresh);
        await persistSessionCookies(access, refresh);

        const response = await authService.getCurrentUser();
        if (cancelled) return;

        if (response.success && response.data) {
          useAuthStore.setState({
            user: normalizeUserFromApi(
              response.data as unknown as Record<string, unknown>,
            ),
            tokens: { access, refresh },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          useAuthStore.setState({
            tokens: { access, refresh },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        }

        clearOAuthPendingSession();
        toast.success('Signed in successfully');
        window.location.assign(finalRedirect);
      } catch (error: unknown) {
        if (cancelled) return;

        const status = authErrorStatus(error);
        if (status === 401 || status === 403) {
          tokenManager.clearTokens();
          await clearSessionCookies();
          clearOAuthPendingSession();
          const msg = oauthErrorMessage('oauth_failed');
          setMessage(msg);
          toast.error(msg);
          router.replace('/signin');
          return;
        }

        // Tokens were persisted — finish login and hydrate profile on the next page.
        useAuthStore.setState({
          tokens: { access, refresh },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        clearOAuthPendingSession();
        toast.success('Signed in successfully');
        window.location.assign(finalRedirect);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center px-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-on-surface-variant">{message}</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
