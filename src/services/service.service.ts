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
};

export default serviceService;
