import { apiClient } from '@/lib/api/client';
import type { ApiResponse, PaginatedResponse } from '@/types';
import type { BlogPost, BlogPostDetail } from '@/types/blog';

export const blogService = {
  /** Landing page featured articles */
  async getFeaturedPosts(limit = 3): Promise<ApiResponse<BlogPost[]>> {
    return apiClient.get<BlogPost[]>('/blog/posts/featured/', {
      params: { limit },
    });
  },

  async listPosts(params?: {
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<BlogPost>>> {
    return apiClient.get<PaginatedResponse<BlogPost>>('/blog/posts/', { params });
  },

  async getPostBySlug(slug: string): Promise<ApiResponse<BlogPostDetail>> {
    return apiClient.get<BlogPostDetail>(`/blog/posts/${encodeURIComponent(slug)}/`);
  },
};

export default blogService;
