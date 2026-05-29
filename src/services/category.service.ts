/**
 * Category Service
 * 
 * Handles all category-related API calls
 */

import { apiClient } from '@/lib/api/client';
import { 
  Category,
  ApiResponse,
  PaginatedResponse 
} from '@/types';

export const categoryService = {
  /**
   * Get all categories
   */
  async getCategories(params?: {
    parent?: string;
    is_active?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<Category>>> {
    return apiClient.get<PaginatedResponse<Category>>('/categories/', { params });
  },

  /**
   * Get category by ID
   */
  async getCategory(categoryId: string): Promise<ApiResponse<Category>> {
    return apiClient.get<Category>(`/categories/${categoryId}/`);
  },

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string): Promise<ApiResponse<Category>> {
    return apiClient.get<Category>(`/categories/slug/${slug}/`);
  },

  /**
   * Get top-level categories (no parent)
   */
  async getTopCategories(): Promise<ApiResponse<Category[]>> {
    const response = await apiClient.get<PaginatedResponse<Category>>('/categories/', {
      params: { parent: 'null', is_active: true, page_size: 100 },
    });
    
    return {
      ...response,
      data: response.data?.results || [],
    };
  },

  /**
   * Get subcategories of a category
   */
  async getSubcategories(parentId: string): Promise<ApiResponse<Category[]>> {
    const response = await apiClient.get<PaginatedResponse<Category>>('/categories/', {
      params: { parent: parentId, is_active: true, page_size: 100 },
    });
    
    return {
      ...response,
      data: response.data?.results || [],
    };
  },

  /**
   * Search categories
   */
  async searchCategories(query: string): Promise<ApiResponse<Category[]>> {
    const response = await apiClient.get<PaginatedResponse<Category>>('/categories/search/', {
      params: { query, page_size: 50 },
    });
    
    return {
      ...response,
      data: response.data?.results || [],
    };
  },

  /**
   * Get popular categories (most tasks)
   */
  async getPopularCategories(limit: number = 10): Promise<ApiResponse<Category[]>> {
    const response = await apiClient.get<PaginatedResponse<Category>>('/categories/popular/', {
      params: { limit },
    });
    
    return {
      ...response,
      data: response.data?.results || [],
    };
  },

  /**
   * Get category tree (hierarchical structure)
   */
  async getCategoryTree(): Promise<ApiResponse<Category[]>> {
    return apiClient.get<Category[]>('/categories/tree/');
  },
};

export default categoryService;
