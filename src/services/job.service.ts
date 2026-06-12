/**

 * Marketplace jobs API (/api/v1/jobs/)

 */



import { apiClient } from '@/lib/api/client';

import type { ApiResponse, PaginatedResponse, Task, TaskFormData, TaskQuestion } from '@/types';



export const jobService = {

  async getJobs(

    params?: Record<string, string | number>,

  ): Promise<ApiResponse<PaginatedResponse<Task>>> {

    return apiClient.get<PaginatedResponse<Task>>('/jobs/', { params });

  },



  async getMyJobs(

    params?: Record<string, string | number>,

  ): Promise<ApiResponse<PaginatedResponse<Task>>> {

    return apiClient.get<PaginatedResponse<Task>>('/jobs/mine/', { params });

  },



  async getJobBySlug(slug: string): Promise<ApiResponse<Task>> {

    return apiClient.get<Task>(`/jobs/${slug}/`);

  },



  async createJob(data: TaskFormData | Record<string, unknown>): Promise<ApiResponse<Task>> {

    return apiClient.post<Task>('/jobs/', data);

  },



  async updateJob(

    slug: string,

    data: Partial<TaskFormData> | Record<string, unknown>,

  ): Promise<ApiResponse<Task>> {

    return apiClient.patch<Task>(`/jobs/${slug}/`, data);

  },



  async deleteJob(slug: string): Promise<ApiResponse<void>> {

    return apiClient.delete(`/jobs/${slug}/`);

  },



  async askQuestion(slug: string, question: string): Promise<ApiResponse<TaskQuestion>> {

    return apiClient.post<TaskQuestion>(`/jobs/${slug}/ask_question/`, { question });

  },



  async answerQuestion(

    slug: string,

    questionId: string,

    answer: string,

  ): Promise<ApiResponse<TaskQuestion>> {

    return apiClient.patch<TaskQuestion>(`/jobs/${slug}/questions/${questionId}/`, {

      answer,

    });

  },

};



export default jobService;

