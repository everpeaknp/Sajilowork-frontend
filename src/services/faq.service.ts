import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types';

export type FaqCategory = 'general' | 'services';

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
  sort_order?: number;
};

export type FaqListResponse = {
  count: number;
  results: FaqItem[];
};

function faqApiRoot(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';
  return base.replace(/\/api\/v1\/?$/, '');
}

class FaqService {
  async listFaq(category?: FaqCategory): Promise<ApiResponse<FaqListResponse>> {
    return apiClient.get<FaqListResponse>('/faq/', {
      baseURL: faqApiRoot(),
      skipAuth: true,
      params: category ? { category } : undefined,
    });
  }

  async listServicesFaq(): Promise<ApiResponse<FaqListResponse>> {
    return this.listFaq('services');
  }

  async listGeneralFaq(): Promise<ApiResponse<FaqListResponse>> {
    return this.listFaq('general');
  }
}

export const faqService = new FaqService();
export default faqService;
