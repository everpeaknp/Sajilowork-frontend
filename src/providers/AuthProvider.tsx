/**
 * Authentication Provider
 *
 * Restores the session on mount. Navbar uses isLoading to avoid flashing
 * Sign in / Sign up before cookies + profile are confirmed.
 */

'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initialize = useAuthStore((state) => state.initialize);
  const setHasHydrated = useAuthStore((state) => state.setHasHydrated);

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

  return <>{children}</>;
}

export default AuthProvider;
