/**
 * Marketplace projects API (/api/v1/projects/)
 */

import { apiClient } from '@/lib/api/client';
import type { ApiResponse, PaginatedResponse, Task, TaskFormData, TaskQuestion } from '@/types';

export const projectService = {
  async getProjects(
    params?: Record<string, string | number>,
  ): Promise<ApiResponse<PaginatedResponse<Task>>> {
    return apiClient.get<PaginatedResponse<Task>>('/projects/', { params });
  },

  async getMyProjects(
    params?: Record<string, string | number>,
  ): Promise<ApiResponse<PaginatedResponse<Task>>> {
    return apiClient.get<PaginatedResponse<Task>>('/projects/mine/', { params });
  },

  async getProjectBySlug(slug: string): Promise<ApiResponse<Task>> {
    return apiClient.get<Task>(`/projects/${slug}/`);
  },

  async createProject(data: TaskFormData | Record<string, unknown>): Promise<ApiResponse<Task>> {
    return apiClient.post<Task>('/projects/', data);
  },

  async updateProject(
    slug: string,
    data: Partial<TaskFormData> | Record<string, unknown>,
  ): Promise<ApiResponse<Task>> {
    return apiClient.patch<Task>(`/projects/${slug}/`, data);
  },

  async deleteProject(slug: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/projects/${slug}/`);
  },

  async getProjectQuestions(slug: string): Promise<ApiResponse<TaskQuestion[]>> {
    const detail = await this.getProjectBySlug(slug);
    if (!detail.success || !detail.data) {
      return {
        success: false,
        message: detail.message ?? 'Failed to load questions',
        data: [],
      };
    }
    const questions = detail.data.questions ?? [];
    return { success: true, data: questions, message: 'OK' };
  },

  async askQuestion(slug: string, question: string): Promise<ApiResponse<TaskQuestion>> {
    return apiClient.post<TaskQuestion>(`/projects/${slug}/ask_question/`, { question });
  },

  async answerQuestion(
    slug: string,
    questionId: string,
    answer: string,
  ): Promise<ApiResponse<TaskQuestion>> {
    return apiClient.patch<TaskQuestion>(`/projects/${slug}/questions/${questionId}/`, {
      answer,
    });
  },
};

export default projectService;
