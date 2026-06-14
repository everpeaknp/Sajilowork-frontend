import { apiClient } from '@/lib/api/client';
import type { ApiResponse, PaginatedResponse, Task } from '@/types';

export const bookmarkService = {
  async getBookmarked(
    listingKind?: string,
  ): Promise<ApiResponse<PaginatedResponse<Task> | Task[]>> {
    return apiClient.get<PaginatedResponse<Task> | Task[]>('/bookmarks/', {
      params: listingKind ? { listing_kind: listingKind } : undefined,
    });
  },

  async bookmark(slug: string): Promise<ApiResponse<{ message?: string }>> {
    return apiClient.post<{ message?: string }>(`/bookmarks/${encodeURIComponent(slug)}/`);
  },

  async unbookmark(slug: string): Promise<ApiResponse<{ message?: string }>> {
    return apiClient.delete<{ message?: string }>(`/bookmarks/${encodeURIComponent(slug)}/`);
  },
};
