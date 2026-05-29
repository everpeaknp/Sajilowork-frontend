import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types';

export type PublicLimits = {
  task_budget: { min: number | null; max: number | null; currency: string };
  wallet_recharge: { min: number | null; max: number | null; currency: string };
  wallet_withdrawal: { min: number | null; max: number | null; currency: string };
};

export const rulesService = {
  async getPublicLimits(): Promise<ApiResponse<PublicLimits>> {
    return apiClient.get(`/rules/policies/public-limits/`);
  },
};

