/**
 * Authentication Store
 * 
 * Global state management for authentication using Zustand
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AuthTokens, LoginCredentials, RegisterData } from '@/types';
import { authService, tokenManager } from '@/services';
import { normalizeUserFromApi } from '@/lib/userProfileSync';
import { persistSessionCookies, clearSessionCookies } from '@/lib/authSession';

interface AuthState {
  // State
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /**
       * Initialize auth state from stored tokens
       */
      initialize: async () => {
        set({ isLoading: true });

        try {
          let access = tokenManager.getAccessToken();
          let refresh = tokenManager.getRefreshToken();

          if (!access) {
            const restored = await tokenManager.refreshViaBff();
            if (restored) {
              tokenManager.setTokens(restored.access, restored.refresh);
              access = restored.access;
              refresh = restored.refresh;
            }
          }

          const tokens = access && refresh ? { access, refresh } : access ? { access, refresh: '' } : null;

          if (!tokens?.access) {
            set({ isAuthenticated: false, user: null, tokens: null, error: null });
            return;
          }

          if (!refresh) {
            const restored = await tokenManager.refreshViaBff();
            if (restored) {
              tokenManager.setTokens(restored.access, restored.refresh);
            }
          }

          await persistSessionCookies(
            tokenManager.getAccessToken() || tokens.access,
            tokenManager.getRefreshToken() || tokens.refresh || '',
          );

          const currentAccess = tokenManager.getAccessToken() || tokens.access;

          if (tokenManager.isTokenExpired(currentAccess)) {
            try {
              await authService.refreshToken();
            } catch {
              tokenManager.clearTokens();
              void clearSessionCookies();
              set({ isAuthenticated: false, user: null, tokens: null, error: null });
              return;
            }
          }

          const activeAccess = tokenManager.getAccessToken();
          const activeRefresh = tokenManager.getRefreshToken();
          const activeTokens =
            activeAccess && activeRefresh
              ? { access: activeAccess, refresh: activeRefresh }
              : { access: currentAccess, refresh: tokens.refresh || activeRefresh || '' };

          try {
            const response = await authService.getCurrentUser();

            if (response.success && response.data) {
              set({
                user: normalizeUserFromApi(response.data as unknown as Record<string, unknown>),
                tokens: activeTokens,
                isAuthenticated: true,
                error: null,
              });
              return;
            }

            set({
              tokens: activeTokens,
              isAuthenticated: true,
              error: response.message || 'Failed to fetch user profile',
            });
          } catch (error: unknown) {
            const status =
              typeof error === 'object' && error !== null && 'status' in error
                ? Number((error as { status?: number }).status)
                : 0;

            if (status === 401 || status === 403) {
              try {
                await authService.refreshToken();
                const retry = await authService.getCurrentUser();
                if (retry.success && retry.data) {
                  const refreshedAccess = tokenManager.getAccessToken();
                  const refreshedRefresh = tokenManager.getRefreshToken();
                  set({
                    user: normalizeUserFromApi(retry.data as unknown as Record<string, unknown>),
                    tokens:
                      refreshedAccess && refreshedRefresh
                        ? { access: refreshedAccess, refresh: refreshedRefresh }
                        : activeTokens,
                    isAuthenticated: true,
                    error: null,
                  });
                  return;
                }
              } catch {
                // fall through to logout
              }

              tokenManager.clearTokens();
              void clearSessionCookies();
              set({
                isAuthenticated: false,
                user: null,
                tokens: null,
                error: 'Session expired',
              });
              return;
            }

            set({
              tokens: activeTokens,
              isAuthenticated: true,
              error:
                error instanceof Error ? error.message : 'Failed to fetch user profile',
            });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * Login user
       */
      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authService.login(credentials);
          
          if (response.success) {
            set({
              user: normalizeUserFromApi(response.data.user as unknown as Record<string, unknown>),
              tokens: response.data.tokens,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } else {
            throw new Error(response.message || 'Login failed');
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Login failed'
          });
          throw error;
        }
      },

      /**
       * Register new user
       */
      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authService.register(data);
          
          if (response.success) {
            const tokens = response.data?.tokens ?? null;
            set({
              user: response.data?.user
                ? normalizeUserFromApi(response.data.user as unknown as Record<string, unknown>)
                : null,
              tokens,
              isAuthenticated: Boolean(tokens?.access && tokens?.refresh),
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error(response.message || 'Registration failed');
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Registration failed'
          });
          throw error;
        }
      },

      /**
       * Logout user
       */
      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          // Logout should be best-effort (e.g. refresh already expired).
        } finally {
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            error: null
          });
        }
      },

      /**
       * Refresh current user data
       */
      refreshUser: async () => {
        try {
          const response = await authService.getCurrentUser();
          
          if (response.success && response.data) {
            set({
              user: normalizeUserFromApi(response.data as unknown as Record<string, unknown>),
            });
          }
        } catch (error: any) {
          console.error('Failed to refresh user:', error);
          // Don't logout on refresh failure, token might still be valid
        }
      },

      /**
       * Clear error message
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Set user directly (for profile updates)
       */
      setUser: (user: User) => {
        set({ user: normalizeUserFromApi(user as unknown as Record<string, unknown>) });
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist user, not tokens (tokens are in cookies)
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        if (!state || typeof window === 'undefined') return;
        const hasTokens =
          !!tokenManager.getAccessToken() && !!tokenManager.getRefreshToken();
        if (!hasTokens) {
          state.isAuthenticated = false;
          state.user = null;
        }
      },
    }
  )
);

export default useAuthStore;
