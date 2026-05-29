// API configuration and client
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Simple fetch wrapper
export const apiClient = {
  fetch: async (url: string, options?: RequestInit) => {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    return fetch(fullUrl, options);
  }
};
