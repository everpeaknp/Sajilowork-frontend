/**
 * Search Service — aligned with backend /api/v1/search/
 */

import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types';

export type SearchType = 'tasks' | 'taskers' | 'categories' | 'all';

export interface SearchTaskResult {
  id: string;
  title: string;
  slug: string;
  description?: string;
  status: string;
  budget: number;
  budget_type?: string;
  work_type?: string;
  location?: string;
  owner?: string | number;
  owner_name?: string;
  owner_username?: string;
  owner_image?: string | null;
  /** @deprecated use owner_image */
  owner_avatar?: string | null;
  owner_logo_url?: string | null;
  owner_logo_text?: string | null;
  owner_logo_color?: string | null;
  owner_business_name?: string | null;
  owner_is_verified?: boolean;
  category?: number;
  category_name?: string;
  category_slug?: string;
  latitude?: number | string;
  longitude?: number | string;
  due_date?: string;
  urgency?: string;
  bid_count?: number;
  created_at?: string;
  requirements?: Array<{ type?: string; value?: string }>;
}

export interface SearchTaskerResult {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  tagline?: string;
  bio?: string;
  location?: string;
  average_rating?: number;
  total_reviews?: number;
  is_verified_tasker?: boolean;
}

export interface SearchResponse<T = SearchTaskResult | SearchTaskerResult> {
  query: string;
  search_type: SearchType;
  total_results: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: T[] | { tasks?: SearchTaskResult[]; taskers?: SearchTaskerResult[]; categories?: unknown[] };
  suggestions?: string[];
  related_searches?: string[];
}

export interface AutocompleteResponse {
  suggestions: Array<string | { text?: string; query?: string; label?: string }>;
  popular_searches?: string[];
  categories?: unknown[];
}

export const searchService: any = {
  async search(params: {
    query?: string;
    search_type?: SearchType;
    listing_kind?: 'task' | 'job' | 'project' | 'service';
    page?: number;
    page_size?: number;
    category?: string | number;
    min_budget?: number;
    max_budget?: number;
    budget_type?: string;
    work_type?: string;
    urgency?: string;
    sort_by?: string;
    min_rating?: number;
    verified_only?: boolean;
    latitude?: number;
    longitude?: number;
    radius?: number;
    skills?: string[];
  }): Promise<ApiResponse<SearchResponse>> {
    return apiClient.get<SearchResponse>('/search/', { params });
  },

  async searchTasks(
    query: string,
    params?: Omit<Parameters<typeof searchService.search>[0], 'query' | 'search_type'>
  ): Promise<SearchResponse<SearchTaskResult> | null> {
    const res = await this.search({ query, search_type: 'tasks', ...params });
    return res.success && res.data ? (res.data as SearchResponse<SearchTaskResult>) : null;
  },

  async searchTaskers(
    query: string,
    params?: Omit<Parameters<typeof searchService.search>[0], 'query' | 'search_type'>
  ): Promise<SearchResponse<SearchTaskerResult> | null> {
    const res = await this.search({ query, search_type: 'taskers', ...params });
    return res.success && res.data ? (res.data as SearchResponse<SearchTaskerResult>) : null;
  },

  async getAutocomplete(
    query: string,
    searchType: SearchType | 'all' = 'all',
    limit = 10
  ): Promise<AutocompleteResponse | null> {
    if (query.trim().length < 2) return { suggestions: [] };
    const res = await apiClient.get<AutocompleteResponse>('/search/autocomplete/', {
      params: { query, search_type: searchType, limit },
    });
    return res.success && res.data ? res.data : null;
  },

  async getTrendingSearches(limit = 10): Promise<ApiResponse<unknown[]>> {
    return apiClient.get('/search/trending/', { params: { limit } });
  },

  async clearSearchHistory(): Promise<ApiResponse<{ message?: string; count?: number }>> {
    return apiClient.delete('/search/history/clear/');
  },
};

export default searchService;
