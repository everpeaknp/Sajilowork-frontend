/**
 * Authentication Provider
 * 
 * Initializes authentication state on app load
 * Provides auth context to the entire application
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await initialize();
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [initialize]);

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}

export default AuthProvider;
