/**
 * Search Service
 * 
 * Handles all search-related API calls
 */

import { apiClient } from '@/lib/api/client';
import { 
  SearchResult,
  SearchFilters,
  Task,
  User,
  Category,
  ApiResponse,
  PaginatedResponse 
} from '@/types';

export const searchService = {
  /**
   * Global search across tasks, taskers, and categories
   */
  async globalSearch(query: string, params?: {
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<SearchResult>> {
    return apiClient.get<SearchResult>('/search/', {
      params: { query, ...params },
    });
  },

  /**
   * Search tasks with filters
   */
  async searchTasks(filters: SearchFilters): Promise<ApiResponse<PaginatedResponse<Task>>> {
    return apiClient.get<PaginatedResponse<Task>>('/search/tasks/', {
      params: filters,
    });
  },

  /**
   * Search taskers
   */
  async searchTaskers(params: {
    query?: string;
    category?: string;
    location?: string;
    min_rating?: number;
    is_verified?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<User>>> {
    return apiClient.get<PaginatedResponse<User>>('/search/taskers/', {
      params,
    });
  },

  /**
   * Search categories
   */
  async searchCategories(query: string): Promise<ApiResponse<Category[]>> {
    const response = await apiClient.get<PaginatedResponse<Category>>('/search/categories/', {
      params: { query, page_size: 50 },
    });
    
    return {
      ...response,
      data: response.data?.results || [],
    };
  },

  /**
   * Get search suggestions (autocomplete)
   */
  async getSearchSuggestions(query: string, limit: number = 10): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>('/search/suggestions/', {
      params: { query, limit },
    });
  },

  /**
   * Get trending searches
   */
  async getTrendingSearches(limit: number = 10): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>('/search/trending/', {
      params: { limit },
    });
  },

  /**
   * Get recent searches for current user
   */
  async getRecentSearches(limit: number = 10): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>('/search/recent/', {
      params: { limit },
    });
  },

  /**
   * Save search query
   */
  async saveSearch(query: string): Promise<ApiResponse<void>> {
    return apiClient.post('/search/save/', { query });
  },

  /**
   * Clear recent searches
   */
  async clearRecentSearches(): Promise<ApiResponse<void>> {
    return apiClient.delete('/search/recent/');
  },

  /**
   * Advanced task search with location
   */
  async searchTasksByLocation(params: {
    latitude: number;
    longitude: number;
    radius?: number; // in kilometers
    category?: string;
    budget_min?: number;
    budget_max?: number;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<Task>>> {
    return apiClient.get<PaginatedResponse<Task>>('/search/tasks/nearby/', {
      params,
    });
  },

  /**
   * Search taskers by location
   */
  async searchTaskersByLocation(params: {
    latitude: number;
    longitude: number;
    radius?: number; // in kilometers
    category?: string;
    min_rating?: number;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<User>>> {
    return apiClient.get<PaginatedResponse<User>>('/search/taskers/nearby/', {
      params,
    });
  },
};

export default searchService;
