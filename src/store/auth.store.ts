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
        const access = tokenManager.getAccessToken();
        const refresh = tokenManager.getRefreshToken();
        const tokens = (access && refresh) ? { access, refresh } : null;
        
        if (!tokens) {
          set({ isAuthenticated: false, user: null, tokens: null });
          return;
        }

        // Check if token is expired
        if (tokenManager.isTokenExpired(tokens.access)) {
          try {
            await authService.refreshToken();
            const refreshedAccess = tokenManager.getAccessToken();
            const refreshedRefresh = tokenManager.getRefreshToken();
            const refreshedTokens = (refreshedAccess && refreshedRefresh) 
              ? { access: refreshedAccess, refresh: refreshedRefresh } 
              : null;
            set({ tokens: refreshedTokens });
          } catch (error) {
            // Token refresh failed, clear auth state
            tokenManager.clearTokens();
            set({ isAuthenticated: false, user: null, tokens: null });
            return;
          }
        }

        const activeAccess = tokenManager.getAccessToken();
        const activeRefresh = tokenManager.getRefreshToken();
        const activeTokens =
          activeAccess && activeRefresh
            ? { access: activeAccess, refresh: activeRefresh }
            : tokens;

        // Fetch current user
        try {
          set({ isLoading: true });
          const response = await authService.getCurrentUser();

          if (response.success && response.data) {
            set({
              user: normalizeUserFromApi(response.data as unknown as Record<string, unknown>),
              tokens: activeTokens,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return;
          }

          // Profile fetch failed but tokens may still be valid — keep session.
          set({
            tokens: activeTokens,
            isAuthenticated: true,
            isLoading: false,
            error: response.message || 'Failed to fetch user profile',
          });
        } catch (error: any) {
          const status = typeof error?.status === 'number' ? error.status : 0;
          const shouldClearSession = status === 401 || status === 403;

          if (shouldClearSession) {
            tokenManager.clearTokens();
            set({
              isAuthenticated: false,
              user: null,
              tokens: null,
              isLoading: false,
              error: error.message || 'Session expired',
            });
            return;
          }

          // Server/network errors: keep tokens so a refresh does not feel like logout.
          set({
            tokens: activeTokens,
            isAuthenticated: true,
            isLoading: false,
            error: error.message || 'Failed to fetch user profile',
          });
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
            set({
              user: normalizeUserFromApi(response.data.user as unknown as Record<string, unknown>),
              tokens: response.data.tokens,
              isAuthenticated: true,
              isLoading: false,
              error: null
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
