/**
 * Authentication Provider
 *
 * Restores the session on mount. Navbar uses isLoading to avoid flashing
 * Sign in / Sign up before cookies + profile are confirmed.
 * Also syncs Web Push subscription when the user is already granted permission.
 */

'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store';
import { syncWebPushSubscription } from '@/lib/webPush';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initialize = useAuthStore((state) => state.initialize);
  const setHasHydrated = useAuthStore((state) => state.setHasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        await initialize();
      } finally {
        if (!cancelled) {
          // Ensure guests/logged-in chrome never stick on the pre-hydrate skeleton.
          setHasHydrated(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialize, setHasHydrated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void syncWebPushSubscription();
  }, [isAuthenticated]);

  return <>{children}</>;
}

export default AuthProvider;
