/**
 * useAuth Hook
 * 
 * Custom hook for accessing authentication state and actions
 */

'use client';

import { useAuthStore } from '@/store';
import { LoginCredentials, RegisterData } from '@/types';

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    hasHydrated,
    error,
    login,
    register,
    logout,
    refreshUser,
    clearError
  } = useAuthStore();

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    hasHydrated,
    error,

    // Actions
    login: async (credentials: LoginCredentials) => {
      try {
        await login(credentials);
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },

    register: async (data: RegisterData) => {
      try {
        await register(data);
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },

    logout: async () => {
      await logout();
    },

    refreshUser,
    clearError,

    // Computed
    isCustomer: user?.role === 'customer',
    isTasker: user?.role === 'tasker',
    isAdmin: user?.role === 'admin'
  };
}

export default useAuth;
