'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { tokenManager } from '@/lib/api/client';
import { authService } from '@/services/auth.service';
import { persistSessionCookies } from '@/lib/authSession';
import { useAuthStore } from '@/store';
import { normalizeUserFromApi } from '@/lib/userProfileSync';
import { oauthErrorMessage } from '@/lib/socialAuth';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Completing sign-in…');

  useEffect(() => {
    const error = searchParams.get('error');
    const next = searchParams.get('next');
    const redirectTo =
      next && next.startsWith('/') && !next.startsWith('//') ? next : '/discover';

    if (error) {
      const msg = oauthErrorMessage(error);
      setMessage(msg);
      toast.error(msg);
      router.replace(`/signin?error=${encodeURIComponent(error)}`);
      return;
    }

    const access = searchParams.get('access');
    const refresh = searchParams.get('refresh');

    if (!access || !refresh) {
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
              response.data as unknown as Record<string, unknown>
            ),
            tokens: { access, refresh },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          toast.success('Signed in successfully');
          window.location.assign(redirectTo);
          return;
        }

        throw new Error('Could not load your profile');
      } catch {
        if (cancelled) return;
        tokenManager.clearTokens();
        const msg = oauthErrorMessage('oauth_failed');
        setMessage(msg);
        toast.error(msg);
        router.replace('/signin');
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
