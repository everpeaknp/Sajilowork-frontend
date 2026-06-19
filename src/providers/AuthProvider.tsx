/**
 * Authentication Provider
 *
 * Initializes authentication state on app load without blocking the UI.
 */

'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return <>{children}</>;
}

export default AuthProvider;
