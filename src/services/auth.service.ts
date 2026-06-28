/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls
 */

import { apiClient, tokenManager } from '@/lib/api/client';
import { persistSessionCookies, clearSessionCookies } from '@/lib/authSession';
import { 
  User, 
  AuthTokens, 
  LoginCredentials, 
  RegisterData,
  ApiResponse 
} from '@/types';

export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<ApiResponse<{ user: User; tokens: AuthTokens | null }>> {
    const response = await apiClient.post<any>('/users/register/', data);
    const responseData = response.data ?? response;

    if (responseData?.user) {
      return {
        success: true,
        message: responseData.message || 'Registration successful. Please verify your email.',
        data: {
          user: responseData.user as User,
          tokens: null,
        },
        errors: null,
      };
    }

    return response;
  },

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    try {
      // Call backend login endpoint
      const response = await apiClient.post<any>('/auth/login/', credentials);

      // Backend returns { access, refresh, user } directly (not wrapped in data)
      const responseData = response.data || response;
      
      if (responseData.access && responseData.refresh && responseData.user) {
        const { access, refresh, user } = responseData;
        
        // Store tokens
        tokenManager.setTokens(access, refresh);
        await persistSessionCookies(access, refresh);

        // Return in expected format
        return {
          success: true,
          message: 'Login successful',
          data: {
            user: user as User,
            tokens: { access, refresh }
          },
          errors: null
        };
      }

      // If response doesn't have expected structure, return as is
      return {
        success: false,
        message: response.message || 'Login failed',
        data: response.data,
        errors: response.errors
      };
    } catch (error: any) {
      // Extract the most specific error message
      const errorMessage = 
        error?.message ||
        error?.error ||
        error?.detail ||
        (error?.errors && typeof error.errors === 'object' ? JSON.stringify(error.errors) : null) ||
        'Login failed. Please check your credentials.';
      // Re-throw with proper error structure
      throw {
        message: errorMessage,
        errors: error?.errors || null,
        status: error?.status || 500
      };
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<void>> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
    } catch {
      // Continue with local cleanup even if API call fails.
    } finally {
      tokenManager.clearTokens();
      await clearSessionCookies();
    }

    return {
      success: true,
      message: 'Logged out successfully',
      data: undefined,
      errors: null,
    };
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<ApiResponse<AuthTokens>> {
    const refreshed = await tokenManager.refreshViaBff();

    if (!refreshed) {
      throw new Error('No refresh token available');
    }

    tokenManager.setTokens(refreshed.access, refreshed.refresh);

    return {
      success: true,
      message: 'Token refreshed',
      data: { access: refreshed.access, refresh: refreshed.refresh },
      errors: null,
    };
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get<User>('/users/me/');
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    // Backend: /api/v1/users/password-reset/
    return apiClient.post('/users/password-reset/', { email });
  },

  /**
   * Reset password with token
   */
  async resetPassword(uid: string, token: string, newPassword: string): Promise<ApiResponse<void>> {
    // Backend: /api/v1/users/password-reset/confirm/
    return apiClient.post('/users/password-reset/confirm/', {
      uid,
      token,
      new_password: newPassword,
      new_password_confirm: newPassword,
    });
  },

  /**
   * Change password (authenticated user)
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.post('/auth/password-change/', {
      old_password: oldPassword,
      new_password: newPassword
    });
  },

  /**
   * Verify email with token from verification link
   */
  async verifyEmail(token: string): Promise<ApiResponse<{ message?: string }>> {
    return apiClient.post('/auth/email/verify/', { token }, { skipAuth: true });
  },

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<ApiResponse<{ message?: string }>> {
    return apiClient.post('/auth/email/resend/', { email }, { skipAuth: true });
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = tokenManager.getAccessToken();
    return !!token && !tokenManager.isTokenExpired(token);
  },

  /**
   * Get stored tokens
   */
  getTokens(): AuthTokens | null {
    const access = tokenManager.getAccessToken();
    const refresh = tokenManager.getRefreshToken();
    
    if (!access || !refresh) return null;
    
    return { access, refresh };
  }
};

export default authService;
