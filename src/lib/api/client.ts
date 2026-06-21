import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { ApiResponse, ApiError } from '@/types';
import { isJwtNotExpired } from '@/lib/jwt';
import { persistSessionCookies, clearSessionCookies } from '@/lib/authSession';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** Do not attach JWT — required for public AllowAny endpoints when the stored token is invalid. */
    skipAuth?: boolean;
  }
}

// ============================================================================
// Custom Error Class
// ============================================================================

/**
 * Custom error class that properly extends Error and carries ApiError properties
 * This ensures errors are properly serialized through promise chains
 */
class ApiErrorClass extends Error {
  public readonly status: number;
  public readonly errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    
    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiErrorClass);
    }
  }

  /**
   * Convert to plain ApiError object
   */
  toJSON(): ApiError {
    return {
      message: this.message,
      status: this.status,
      errors: this.errors
    };
  }
}

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
const TOKEN_REFRESH_ENDPOINT = '/auth/token/refresh/';
const REQUEST_TIMEOUT = 30000; // 30 seconds

/** Endpoints where 401 means invalid credentials, not an expired access token. */
const PUBLIC_AUTH_PATHS = [
  '/auth/login/',
  '/auth/register/',
  '/auth/email/verify/',
  '/auth/email/resend/',
  '/users/register/',
  '/auth/password-reset/',
  '/users/password-reset/',
  '/users/password-reset/confirm/',
];

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// ============================================================================
// Token Management
// ============================================================================

const COOKIE_OPTIONS = {
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};

export const tokenManager = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return Cookies.get(ACCESS_TOKEN_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return Cookies.get(REFRESH_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens: (access: string, refresh: string): void => {
    if (typeof window === 'undefined') return;

    Cookies.set(ACCESS_TOKEN_KEY, access, {
      ...COOKIE_OPTIONS,
      expires: 1,
    });

    Cookies.set(REFRESH_TOKEN_KEY, refresh, {
      ...COOKIE_OPTIONS,
      expires: 7,
    });

    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  },

  clearTokens: (): void => {
    if (typeof window === 'undefined') return;

    Cookies.remove(ACCESS_TOKEN_KEY, { path: '/' });
    Cookies.remove(REFRESH_TOKEN_KEY, { path: '/' });
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  isTokenExpired: (token: string): boolean => {
    return !isJwtNotExpired(token);
  }
};

// ============================================================================
// API Client Instance
// ============================================================================

class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];
  
  // Request deduplication - prevent duplicate simultaneous requests
  private pendingRequests: Map<string, Promise<any>> = new Map();
  
  // Rate limiting - track request timestamps
  private requestTimestamps: Map<string, number[]> = new Map();
  private readonly RATE_LIMIT_WINDOW = 10000; // 10 seconds
  private readonly MAX_REQUESTS_PER_WINDOW = 50; // 50 requests per 10 seconds

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Check if request should be rate limited
   */
  private shouldRateLimit(url: string): boolean {
    const now = Date.now();
    const timestamps = this.requestTimestamps.get(url) || [];
    
    // Remove timestamps older than the window
    const recentTimestamps = timestamps.filter(ts => now - ts < this.RATE_LIMIT_WINDOW);
    
    // Check if we've exceeded the limit
    if (recentTimestamps.length >= this.MAX_REQUESTS_PER_WINDOW) {
      return true;
    }
    
    // Add current timestamp
    recentTimestamps.push(now);
    this.requestTimestamps.set(url, recentTimestamps);
    
    return false;
  }

  /**
   * Clean up old entries from request timestamps
   */
  private cleanupRequestTimestamps(): void {
    const now = Date.now();
    for (const [key, timestamps] of this.requestTimestamps.entries()) {
      const recentTimestamps = timestamps.filter(ts => now - ts < this.RATE_LIMIT_WINDOW * 2);
      if (recentTimestamps.length === 0) {
        this.requestTimestamps.delete(key);
      } else {
        this.requestTimestamps.set(key, recentTimestamps);
      }
    }
  }

  /**
   * Get cache key for request deduplication
   */
  private getCacheKey(method: string, url: string, data?: any): string {
    const dataKey = data ? JSON.stringify(data) : '';
    return `${method}:${url}:${dataKey}`;
  }

  /**
   * Deduplicate GET requests - return existing promise if same request is in flight
   */
  private async deduplicateRequest<T>(
    cacheKey: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    // Check if same request is already in flight
    const existingRequest = this.pendingRequests.get(cacheKey);
    if (existingRequest) {
      console.log(`🔄 Deduplicating request: ${cacheKey}`);
      return existingRequest;
    }

    // Execute request and cache the promise
    const requestPromise = requestFn()
      .finally(() => {
        // Remove from pending requests when done
        this.pendingRequests.delete(cacheKey);
      });

    this.pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - Add auth token and rate limiting
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Check rate limiting
        if (config.url && this.shouldRateLimit(config.url)) {
          console.warn(`⚠️ Rate limit: Too many requests to ${config.url}`);
          const rateLimitError = new Error('Too many requests. Please wait a moment.');
          (rateLimitError as any).status = 429;
          (rateLimitError as any).isRateLimitError = true;
          return Promise.reject(rateLimitError);
        }

        // Cleanup old entries periodically
        if (Math.random() < 0.1) { // 10% chance
          this.cleanupRequestTimestamps();
        }

        const token = tokenManager.getAccessToken();
        const skipAuth = config.skipAuth === true;

        if (token && config.headers && !skipAuth) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Let the browser set multipart boundary (default json Content-Type breaks uploads).
        if (config.data instanceof FormData && config.headers) {
          delete config.headers['Content-Type'];
        }

        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(this.ensureApiError(error));
      }
    );

    // Response interceptor - Handle token refresh and rate limits
    this.instance.interceptors.response.use(
      (response) => {
        // Django/DRF returns data directly, not wrapped in { success, data, message }
        // We'll keep the response as-is and let services handle transformation
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { 
          _retry?: boolean;
          _retryCount?: number;
        };

        // Handle 429 Too Many Requests - Retry with exponential backoff
        if (error.response?.status === 429 && (!originalRequest._retryCount || originalRequest._retryCount < 3)) {
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
          
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, originalRequest._retryCount - 1) * 1000;
          
          console.warn(`⚠️ Rate limited. Retrying in ${delay}ms (attempt ${originalRequest._retryCount}/3)`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          
          return this.instance(originalRequest);
        }

        // Handle 401 Unauthorized - Token expired (skip for login/register failures)
        const requestUrl = originalRequest.url || '';
        const isPublicAuthRequest = PUBLIC_AUTH_PATHS.some((path) => requestUrl.includes(path));

        if (error.response?.status === 401 && !originalRequest._retry && !isPublicAuthRequest) {
          if (this.isRefreshing) {
            // Queue the request while refreshing
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return this.instance(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          const refreshToken = tokenManager.getRefreshToken();

          if (!refreshToken) {
            this.handleAuthFailure();
            return Promise.reject(this.ensureApiError(error));
          }

          try {
            // Attempt to refresh token
            const response = await axios.post(
              `${API_BASE_URL}${TOKEN_REFRESH_ENDPOINT}`,
              { refresh: refreshToken }
            );

            const { access, refresh } = response.data;
            const newRefresh = typeof refresh === 'string' ? refresh : refreshToken;
            tokenManager.setTokens(access, newRefresh);
            void persistSessionCookies(access, newRefresh);

            // Retry all queued requests
            this.processQueue(null);

            // Retry original request
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access}`;
            }
            return this.instance(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError);
            this.handleAuthFailure();
            return Promise.reject(this.ensureApiError(error));
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.ensureApiError(error));
      }
    );
  }

  /**
   * Process queued requests after token refresh
   */
  private processQueue(error: any): void {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve();
      }
    });

    this.failedQueue = [];
  }

  /**
   * Handle authentication failure
   */
  private handleAuthFailure(): void {
    tokenManager.clearTokens();
    void clearSessionCookies();

    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const onAuthPage = path.startsWith('/signin') || path.startsWith('/signup');
      if (!onAuthPage) {
        const redirect = encodeURIComponent(path);
        window.location.href = `/signin?redirect=${redirect}`;
      }
    }
  }

  /**
   * Unwrap the project's custom DRF exception envelope so downstream code can
   * treat the payload as a normal DRF error dict.
   *
   * Backend `utils/exceptions.custom_exception_handler` wraps every error as:
   *   { success: false, error: { message: "...", details: <drf payload> } }
   *
   * `details` may be either a field-error dict (e.g. `{ city: ["..."] }`),
   * or `{ detail: "..." }` for permission / auth style errors.
   */
  private unwrapEnvelope(payload: any): any {
    if (
      payload &&
      typeof payload === 'object' &&
      !Array.isArray(payload) &&
      payload.success === false &&
      payload.error &&
      typeof payload.error === 'object'
    ) {
      const inner = payload.error;
      const details = inner.details;
      // If details is a field-error dict, return it directly (most useful).
      if (details && typeof details === 'object' && !Array.isArray(details)) {
        // If details only contains a top-level "detail" string, surface it
        // alongside the wrapper message so we don't lose context.
        return details;
      }
      // Otherwise return the inner object so the rest of the extractor can
      // pull message/detail out of it.
      return inner;
    }
    return payload;
  }

  /**
   * Normalize error response
   */
  private extractErrorMessage(payload: any): string | null {
    if (!payload) return null;
    if (typeof payload === 'string') return payload.trim() || null;
    if (typeof payload === 'number' || typeof payload === 'boolean') return String(payload);

    const data = this.unwrapEnvelope(payload);

    if (typeof data === 'object' && data !== null) {
      // Check for common error message fields (strings)
      if (typeof data.error === 'string' && data.error.trim().length > 0) return data.error.trim();
      if (typeof data.message === 'string' && data.message.trim().length > 0) return data.message.trim();
      if (typeof data.detail === 'string' && data.detail.trim().length > 0) return data.detail.trim();

      // Check for nested message/detail/error objects
      if (data.message && typeof data.message !== 'string') {
        const nested = this.extractErrorMessage(data.message);
        if (nested) return nested;
      }
      if (data.detail && typeof data.detail !== 'string') {
        const nested = this.extractErrorMessage(data.detail);
        if (nested) return nested;
      }
      if (data.error && typeof data.error !== 'string') {
        const nested = this.extractErrorMessage(data.error);
        if (nested) return nested;
      }

      // Check for array of errors
      if (Array.isArray(data)) {
        for (const item of data) {
          const nested = this.extractErrorMessage(item);
          if (nested) return nested;
        }
      }

      // Check for field-specific errors (Django validation errors)
      for (const key of Object.keys(data)) {
        if (
          key === 'non_field_errors' ||
          key === 'detail' ||
          key === 'error' ||
          key === 'message' ||
          key === 'success' ||
          key === 'details'
        ) {
          continue; // Already checked above (or it's an envelope marker)
        }
        const value = data[key];
        if (Array.isArray(value) && value.length > 0) {
          // Return first error message from field errors
          const firstError = this.extractErrorMessage(value[0]);
          if (firstError) return `${key.replace(/_/g, ' ')}: ${firstError}`;
        } else if (value && typeof value === 'object') {
          const nested = this.extractErrorMessage(value);
          if (nested) return `${key.replace(/_/g, ' ')}: ${nested}`;
        }
      }

      // Last resort: non_field_errors
      if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
        const first = this.extractErrorMessage(data.non_field_errors[0]);
        if (first) return first;
      }
    }

    return null;
  }

  private normalizeError(error: any): ApiError {
    console.group('🔍 Normalizing Error');
    console.log('Error object:', error);
    console.log('Error type:', typeof error);
    console.log('Error keys:', error ? Object.keys(error) : 'null');
    console.log('Error.response:', error?.response);
    console.log('Error.response.data:', error?.response?.data);
    console.log('Error.response.status:', error?.response?.status);
    console.log('Error.message:', error?.message);
    console.log('Error.status:', error?.status);
    console.log('Error.data:', error?.data);
    console.log('Error.isAxiosError:', error?.isAxiosError);

    // Axios throws "Network Error" when the server is unreachable (not running, wrong port, CORS blocked)
    if (
      (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') &&
      !error?.response
    ) {
      console.groupEnd();
      return {
        message: `Cannot reach the API at ${API_BASE_URL}. Start the Django backend with "python manage.py runserver" on port 8000.`,
        status: 0,
      };
    }
    
    // Try multiple ways to extract the response
    let responseData = null;
    let status = 0;
    
    // Method 1: Standard Axios error structure (most common)
    if (error?.response) {
      responseData = error.response.data;
      status = error.response.status;
      console.log('✅ Found response via error.response');
      console.log('Response data:', responseData);
      console.log('Response status:', status);
    }
    // Method 2: Error object itself might be the response
    else if (error?.data !== undefined || error?.status !== undefined) {
      responseData = error.data;
      status = error.status || 0;
      console.log('✅ Found response via error itself');
    }
    // Method 3: Check if error is already normalized
    else if (error?.message && typeof error.message === 'string') {
      console.log('✅ Error already has message');
      console.groupEnd();
      return {
        message: error.message,
        errors: error.errors,
        status: error.status || 0
      };
    }
    
    console.log('Final extracted data:', responseData);
    console.log('Final extracted status:', status);
    
    const hasResponseData = responseData !== null || status > 0;
    
    if (hasResponseData) {
      // Server responded with error — unwrap the project's custom DRF
      // envelope ({ success: false, error: { message, details } }) so the
      // rest of this function works against the raw DRF field-error dict.
      const rawData = responseData as any;
      const data = this.unwrapEnvelope(rawData);

      console.log('📋 Processing response data:', data);
      console.log('Data type:', typeof data);
      console.log('Data is array?', Array.isArray(data));
      console.log('Data keys:', data && typeof data === 'object' ? Object.keys(data) : 'N/A');

      // Extract error message
      const errorMessage = this.extractErrorMessage(rawData);
      console.log('📝 Extracted error message:', errorMessage);

      // Build errors object for field-specific errors.
      // We only consider keys that look like field errors (skip envelope
      // markers / generic non-field keys).
      const skipKeys = new Set([
        'success',
        'error',
        'details',
        'message',
        'detail',
        'non_field_errors',
      ]);
      let errors: Record<string, string[]> | undefined;
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        errors = {};
        for (const [key, value] of Object.entries(data)) {
          if (skipKeys.has(key)) continue;
          if (Array.isArray(value)) {
            errors[key] = value.map((v) => String(v));
          } else if (typeof value === 'string') {
            errors[key] = [value];
          } else if (value && typeof value === 'object') {
            errors[key] = [JSON.stringify(value)];
          }
        }

        console.log('📦 Built errors object:', errors);

        // If no field errors, clear the errors object
        if (Object.keys(errors).length === 0) {
          errors = undefined;
        }
      }
      
      // Provide context-specific error messages based on status code
      let finalMessage = errorMessage;
      if (!finalMessage || finalMessage.trim() === '') {
        switch (status) {
          case 400:
            finalMessage = 'Invalid request. Please check your input.';
            break;
          case 401:
            finalMessage = 'Authentication required. Please sign in.';
            break;
          case 403:
            finalMessage = 'You do not have permission to perform this action.';
            break;
          case 404:
            finalMessage = 'The requested resource was not found.';
            break;
          case 409:
            finalMessage = 'This action conflicts with existing data.';
            break;
          case 500:
            finalMessage = 'Server error. Please try again later.';
            break;
          default:
            finalMessage = status > 0 ? `Request failed with status ${status}` : 'Request failed';
        }
      }
      
      const result = {
        message: finalMessage,
        errors: errors,
        status
      };
      
      console.log('✅ Final normalized error:', result);
      console.log('Final normalized error JSON:', JSON.stringify(result, null, 2));
      console.groupEnd();
      
      return result;
    } else if (error?.request) {
      // Request made but no response
      console.log('⚠️ No response from server');
      console.groupEnd();
      return {
        message: 'No response from server. Please check your connection.',
        status: 0
      };
    } else {
      // Error in request setup
      console.log('⚠️ Error in request setup');
      console.groupEnd();
      return {
        message: error?.message || 'An unexpected error occurred',
        status: 0
      };
    }
  }

  /**
   * Ensure error is properly structured as ApiError
   */
  private ensureApiError(error: any): ApiErrorClass {
    // If already an ApiErrorClass instance
    if (error instanceof ApiErrorClass) {
      return error;
    }

    // IMPORTANT: Check Axios / response-bearing errors BEFORE the generic
    // "already valid ApiError" early-out. An AxiosError has a .message
    // (e.g. "Request failed with status code 400") but the real server
    // payload lives on .response.data — without this, DRF field errors
    // would be silently dropped and the user would only see the generic
    // axios message.
    if (error?.isAxiosError || error?.response) {
      const normalized = this.normalizeError(error);
      return new ApiErrorClass(normalized.message, normalized.status || 0, normalized.errors);
    }

    // If already a properly structured ApiError with a valid message
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.trim() !== '') {
      return new ApiErrorClass(error.message, error.status || 0, error.errors);
    }

    // If it's a string
    if (typeof error === 'string' && error.trim() !== '') {
      return new ApiErrorClass(error, 0);
    }

    // If it's an Error object
    if (error instanceof Error) {
      return new ApiErrorClass(error.message || 'An unexpected error occurred', 0);
    }

    // If error is null or undefined
    if (error === null || error === undefined) {
      return new ApiErrorClass('An unexpected error occurred', 0);
    }

    // If error is an empty object or has no useful information
    if (typeof error === 'object' && Object.keys(error).length === 0) {
      return new ApiErrorClass('An unexpected error occurred. Please try again.', 0);
    }

    // Fallback for unknown error types - try to extract any useful info
    let message = 'An unexpected error occurred';
    
    // Try to extract any message-like property
    if (error && typeof error === 'object') {
      if (error.message) message = String(error.message);
      else if (error.error) message = String(error.error);
      else if (error.detail) message = String(error.detail);
      else if (error.statusText) message = String(error.statusText);
    }
    
    return new ApiErrorClass(message, error?.status || 0, error?.errors);
  }

  /**
   * GET request with deduplication
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const cacheKey = this.getCacheKey('GET', url, config?.params);
    
    return this.deduplicateRequest(cacheKey, async () => {
      try {
        console.group('🌐 API Client GET Request');
        console.log('URL:', url);
        console.log('Config:', config);
        console.log('Base URL:', API_BASE_URL);
        console.log('Full URL:', `${API_BASE_URL}${url}`);
        console.log('Access Token:', tokenManager.getAccessToken() ? 'Present' : 'Missing');
        console.groupEnd();
        
        const response = await this.instance.get<T>(url, config);
        
        console.group('✅ API Client GET Response');
        console.log('Status:', response.status);
        console.log('Data:', response.data);
        console.groupEnd();
        
        return this.wrapResponse(response.data);
      } catch (error: any) {
        console.group('❌ API Client GET Error');
        console.log('Error caught in GET method');
        console.log('Error type:', typeof error);
        console.log('Error constructor:', error?.constructor?.name);
        console.log('Is AxiosError?', error?.isAxiosError);
        console.log('Error object:', error);
        console.log('Error message:', error?.message);
        console.log('Error response:', error?.response);
        console.log('Error response status:', error?.response?.status);
        console.log('Error response data:', error?.response?.data);
        console.log('Error request:', error?.request);
        console.log('Error config:', error?.config);
        console.groupEnd();
        
        const normalized = this.ensureApiError(error);
        
        console.group('🔄 Normalized Error (GET)');
        console.log('Normalized error:', normalized);
        console.log('Normalized error type:', typeof normalized);
        console.log('Normalized error keys:', Object.keys(normalized));
        console.log('Normalized error JSON:', JSON.stringify(normalized, null, 2));
        console.groupEnd();
        
        throw normalized;
      }
    });
  }

  /**
   * Clear cache for a specific URL pattern
   */
  private clearCacheForUrl(urlPattern: string): void {
    // Normalize the pattern - remove trailing slash for comparison
    const normalizedPattern = urlPattern.replace(/\/$/, '');
    
    const keysToDelete: string[] = [];
    for (const key of this.pendingRequests.keys()) {
      // Extract URL from cache key (format: "METHOD:URL:DATA")
      const urlPart = key.split(':')[1];
      if (urlPart) {
        const normalizedUrl = urlPart.replace(/\/$/, '');
        // Check if the URL starts with the pattern (to match both /path and /path/)
        if (normalizedUrl.startsWith(normalizedPattern) || normalizedUrl === normalizedPattern) {
          keysToDelete.push(key);
        }
      }
    }
    keysToDelete.forEach(key => this.pendingRequests.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`🗑️ Cleared ${keysToDelete.length} cached requests for pattern: ${urlPattern}`);
      console.log(`🗑️ Cleared keys:`, keysToDelete);
    }
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      console.group('🌐 API Client POST Request');
      console.log('URL:', url);
      console.log('Data:', data);
      console.log('Config:', config);
      console.log('Base URL:', API_BASE_URL);
      console.log('Full URL:', `${API_BASE_URL}${url}`);
      console.log('Access Token:', tokenManager.getAccessToken() ? 'Present' : 'Missing');
      console.groupEnd();
      
      const response = await this.instance.post<T>(url, data, config);
      
      console.group('✅ API Client POST Response');
      console.log('Status:', response.status);
      console.log('Data:', response.data);
      console.groupEnd();
      
      // Clear cache for related GET requests after successful POST
      // Clear both the exact URL and the base URL to ensure all related caches are cleared
      this.clearCacheForUrl(url);
      const baseUrl = url.split('/').slice(0, -1).join('/');
      if (baseUrl && baseUrl !== url) {
        this.clearCacheForUrl(baseUrl);
      }
      if (url.includes('/bookmarks/')) {
        this.clearCacheForUrl('/bookmarks/');
      }
      
      return this.wrapResponse(response.data);
    } catch (error: any) {
      console.group('❌ API Client POST Error');
      console.log('Error caught in POST method');
      console.log('Error type:', typeof error);
      console.log('Error constructor:', error?.constructor?.name);
      console.log('Is AxiosError?', error?.isAxiosError);
      console.log('Error object:', error);
      console.log('Error message:', error?.message);
      console.log('Error response:', error?.response);
      console.log('Error response status:', error?.response?.status);
      console.log('Error response data:', error?.response?.data);
      console.log('Error request:', error?.request);
      console.log('Error config:', error?.config);
      console.groupEnd();
      
      const normalized = this.ensureApiError(error);
      
      console.group('🔄 Normalized Error');
      console.log('Normalized error:', normalized);
      console.log('Normalized error type:', typeof normalized);
      console.log('Normalized error keys:', Object.keys(normalized));
      console.log('Normalized error JSON:', JSON.stringify(normalized, null, 2));
      console.groupEnd();
      
      throw normalized;
    }
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.put<T>(url, data, config);
    
    // Clear cache for related GET requests after successful PUT
    const baseUrl = url.split('/').slice(0, -1).join('/');
    if (baseUrl) {
      this.clearCacheForUrl(baseUrl);
    }
    
    return this.wrapResponse(response.data);
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.patch<T>(url, data, config);
    
    // Clear cache for related GET requests after successful PATCH
    const baseUrl = url.split('/').slice(0, -1).join('/');
    if (baseUrl) {
      this.clearCacheForUrl(baseUrl);
    }
    
    return this.wrapResponse(response.data);
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<T>(url, config);
    
    // Clear cache for related GET requests after successful DELETE
    this.clearCacheForUrl(url);
    const baseUrl = url.split('/').slice(0, -1).join('/');
    if (baseUrl) {
      this.clearCacheForUrl(baseUrl);
    }
    if (url.includes('/bookmarks/')) {
      this.clearCacheForUrl('/bookmarks/');
    }
    
    return this.wrapResponse(response.data);
  }

  /**
   * Wrap Django/DRF response in standard ApiResponse format
   */
  private wrapResponse<T>(data: any): ApiResponse<T> {
    // If already in ApiResponse format, return as-is
    if (data && typeof data === 'object' && 'success' in data) {
      return data as ApiResponse<T>;
    }

    // Wrap Django response
    return {
      success: true,
      message: 'Request successful',
      data: data as T,
      errors: null
    };
  }

  /**
   * Upload file with progress tracking
   */
  async upload<T = any>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    try {
      console.log('API Client: Starting upload to', url);
      console.log('API Client: FormData entries:', Array.from(formData.entries()).map(([key, value]) => ({
        key,
        value: value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value
      })));
      
      const response = await this.instance.post<T>(url, formData, {
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log('Upload progress:', progress + '%');
            onProgress(progress);
          }
        },
      });
      
      console.log('API Client: Upload successful', response.data);
      return this.wrapResponse(response.data);
    } catch (error: any) {
      console.error('API Client: Upload failed', error);
      console.error('API Client: Error response:', error?.response);
      console.error('API Client: Error response data:', error?.response?.data);
      console.error('API Client: Error status:', error?.response?.status);
      console.error('API Client: Error message:', error?.message);
      
      const normalized = this.ensureApiError(error);
      
      console.error('API Client: Normalized error:', normalized);
      throw normalized;
    }
  }

  /**
   * Get raw axios instance for custom requests
   */
  getAxiosInstance(): AxiosInstance {
    return this.instance;
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const apiClient = new ApiClient();
export default apiClient;
