/**
 * Marketplace services API (/api/v1/services/)
 */

import { apiClient } from '@/lib/api/client';
import type { ApiResponse, PaginatedResponse, Task, TaskFormData } from '@/types';

export const serviceService = {
  async getServices(
    params?: Record<string, string | number>,
  ): Promise<ApiResponse<PaginatedResponse<Task>>> {
    return apiClient.get<PaginatedResponse<Task>>('/services/', { params });
  },

  async getMyServices(
    params?: Record<string, string | number>,
  ): Promise<ApiResponse<PaginatedResponse<Task>>> {
    return apiClient.get<PaginatedResponse<Task>>('/services/mine/', { params });
  },

  async getServiceBySlug(slug: string): Promise<ApiResponse<Task>> {
    return apiClient.get<Task>(`/services/${slug}/`);
  },

  async createService(data: TaskFormData | Record<string, unknown>): Promise<ApiResponse<Task>> {
    return apiClient.post<Task>('/services/', data);
  },

  async updateService(
    slug: string,
    data: Partial<TaskFormData> | Record<string, unknown>,
  ): Promise<ApiResponse<Task>> {
    return apiClient.patch<Task>(`/services/${slug}/`, data);
  },

  async deleteService(slug: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/services/${slug}/`);
  },

  async getPurchasePreview(
    slug: string,
    packageId: string,
  ): Promise<
    ApiResponse<{
      package: { id: string; name: string; price: string | number };
      amount: string | number;
      hold_amount: string | number;
      currency: string;
      wallet_available: string | number;
      wallet_sufficient: boolean;
      seller_name: string;
    }>
  > {
    return apiClient.get(`/services/${slug}/purchase-preview/`, {
      params: { package_id: packageId },
    });
  },

  async purchaseService(
    slug: string,
    data: { package_id: string; note?: string },
  ): Promise<
    ApiResponse<{
      order_task_id: string;
      order_task_slug: string;
      bid_id: string;
      payment_id: string | null;
      conversation_id: string | null;
      hold_amount: string;
      parent_service_slug: string;
      message: string;
    }>
  > {
    return apiClient.post(`/services/${slug}/purchase/`, data);
  },
};

export default serviceService;
