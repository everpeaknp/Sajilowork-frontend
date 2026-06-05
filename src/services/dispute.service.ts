/**
 * Dispute Service — /api/v1/disputes/
 */

import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types';

export type DisputeType =
  | 'quality'
  | 'incomplete'
  | 'deadline'
  | 'payment'
  | 'communication'
  | 'other';

export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'closed' | 'escalated';

export interface Dispute {
  id: string;
  task: string;
  raised_by: string;
  against: string;
  dispute_type: DisputeType;
  title: string;
  description: string;
  status: DisputeStatus;
  resolution?: string | null;
  resolution_notes?: string | null;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
}

export interface CreateDisputeData {
  task: string;
  against: string;
  dispute_type: DisputeType;
  title: string;
  description: string;
}

function normalizeList<T>(response: ApiResponse<T[] | { results: T[] }>): T[] {
  if (!response.success || !response.data) return [];
  const raw = response.data;
  return Array.isArray(raw) ? raw : raw.results ?? [];
}

class DisputeService {
  private readonly BASE = '/disputes';

  async list(): Promise<ApiResponse<Dispute[]>> {
    const res = await apiClient.get<Dispute[] | { results: Dispute[] }>(`${this.BASE}/`);
    if (res.success) {
      return { ...res, data: normalizeList(res) };
    }
    return res as ApiResponse<Dispute[]>;
  }

  async get(id: string): Promise<ApiResponse<Dispute>> {
    return apiClient.get(`${this.BASE}/${id}/`);
  }

  async create(data: CreateDisputeData): Promise<ApiResponse<Dispute>> {
    return apiClient.post(`${this.BASE}/`, data);
  }
}

export const disputeService = new DisputeService();
export default disputeService;
