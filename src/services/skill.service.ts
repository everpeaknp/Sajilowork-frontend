import { apiClient } from '@/lib/api/client';
import type { ApiResponse, MarketplaceSkill, PaginatedResponse } from '@/types';

export const skillService = {
  async getSkills(
    params?: Record<string, string | number | boolean>,
  ): Promise<ApiResponse<PaginatedResponse<MarketplaceSkill>>> {
    return apiClient.get<PaginatedResponse<MarketplaceSkill>>('/skills/', { params });
  },

  async createSkill(data: {
    name: string;
    listing_kind: 'job' | 'project' | 'service';
  }): Promise<ApiResponse<MarketplaceSkill>> {
    return apiClient.post<MarketplaceSkill>('/skills/', data);
  },
};

export default skillService;
