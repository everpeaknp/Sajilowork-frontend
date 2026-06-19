/**
 * Task Service
 * 
 * Handles all task-related API calls
 */

import { apiClient } from '@/lib/api/client';
import { isImageFile, tryUploadImageToCloudinary } from '@/services/cloudinary.service';
import { 
  Task, 
  Category,
  TaskFormData,
  TaskAttachment,
  TaskQuestion,
  TaskStatus,
  SearchFilters,
  ApiResponse,
  PaginatedResponse
} from '@/types';

export const taskService = {
  /**
   * Get all tasks with filters
   */
  async getTasks(
    params?: Record<string, string | number>
  ): Promise<ApiResponse<PaginatedResponse<Task>>> {
    return apiClient.get<PaginatedResponse<Task>>('/tasks/', { params });
  },

  /**
   * @deprecated Use serviceService.getServices() — /api/v1/services/
   */
  async getServices(
    params?: Record<string, string | number>,
  ): Promise<ApiResponse<PaginatedResponse<Task>>> {
    const { serviceService } = await import('./service.service');
    return serviceService.getServices(params);
  },

  /**
   * Get task by ID (deprecated - use getTaskBySlug instead)
   */
  async getTaskById(taskId: string): Promise<ApiResponse<Task>> {
    return apiClient.get<Task>(`/tasks/${taskId}/`);
  },

  /**
   * Get task by slug
   */
  async getTaskBySlug(slug: string): Promise<ApiResponse<Task>> {
    return apiClient.get<Task>(`/tasks/${slug}/`);
  },

  /**
   * Create new task
   */
  async createTask(data: TaskFormData): Promise<ApiResponse<Task>> {
    return apiClient.post<Task>('/tasks/', data);
  },

  /**
   * Update task by slug (backend uses slug as lookup_field)
   */
  async updateTask(slugOrId: string, data: Partial<TaskFormData>): Promise<ApiResponse<Task>> {
    return apiClient.patch<Task>(`/tasks/${slugOrId}/`, data);
  },

  /**
   * Delete task by slug (backend uses slug as lookup_field)
   */
  async deleteTask(slugOrId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/tasks/${slugOrId}/`);
  },

  /**
   * Publish draft task
   */
  async publishTask(taskId: string): Promise<ApiResponse<Task>> {
    return apiClient.post<Task>(`/tasks/${taskId}/publish/`);
  },

  /**
   * Cancel task
   */
  async cancelTask(taskId: string, reason?: string): Promise<ApiResponse<Task>> {
    return apiClient.post<Task>(`/tasks/${taskId}/cancel/`, { reason });
  },

  /**
   * Complete task
   */
  async completeTask(taskId: string): Promise<ApiResponse<Task>> {
    return apiClient.post<Task>(`/tasks/${taskId}/complete/`);
  },

  /**
   * Update task status via TaskViewSet.update_status.
   * Backend expects slug lookup field and a JSON body: { status: 'in_progress' | 'completed' | ... }.
   */
  async updateTaskStatus(
    taskId: string,
    status: TaskStatus
  ): Promise<ApiResponse<{ message: string; task: Task }>> {
    return apiClient.patch<{ message: string; task: Task }>(
      `/tasks/${taskId}/update_status/`,
      { status }
    );
  },

  /**
   * Get public open tasks posted by a user (profile page)
   */
  async getUserPostedTasks(
    userId: string,
    params?: Record<string, string | number>
  ): Promise<ApiResponse<PaginatedResponse<Task>>> {
    return apiClient.get<PaginatedResponse<Task>>(`/users/${userId}/posted_tasks/`, {
      params,
    });
  },

  /**
   * Get user's posted tasks
   */
  async getMyTasks(
    params?: string | { status?: string; listing_kind?: string },
  ): Promise<ApiResponse<PaginatedResponse<Task>>> {
    const query = typeof params === 'string' ? { status: params } : params;
    return apiClient.get<PaginatedResponse<Task>>('/tasks/my_tasks/', {
      params: query,
    });
  },

  /**
   * Get tasks assigned to user
   */
  async getAssignedTasks(status?: string): Promise<ApiResponse<PaginatedResponse<Task>>> {
    return apiClient.get<PaginatedResponse<Task>>('/tasks/assigned_tasks/', {
      params: { status }
    });
  },

  /**
   * Get bookmarked listings (all kinds).
   */
  async getBookmarkedTasks(): Promise<ApiResponse<PaginatedResponse<Task> | Task[]>> {
    const { bookmarkService } = await import('./bookmark.service');
    return bookmarkService.getBookmarked();
  },

  /** Add bookmark (creates bookmark row). */
  async bookmarkTask(slug: string): Promise<ApiResponse<{ message?: string }>> {
    const { bookmarkService } = await import('./bookmark.service');
    return bookmarkService.bookmark(slug);
  },

  /** Remove bookmark. */
  async unbookmarkTask(slug: string): Promise<ApiResponse<{ message?: string }>> {
    const { bookmarkService } = await import('./bookmark.service');
    return bookmarkService.unbookmark(slug);
  },

  /**
   * Get all categories
   */
  async getCategories(
    params?: Record<string, string | number>,
  ): Promise<ApiResponse<Category[]>> {
    return apiClient.get<Category[]>('/tasks/categories/', { params });
  },

  /**
   * Get category by ID
   */
  async getCategoryById(categoryId: string): Promise<ApiResponse<Category>> {
    return apiClient.get<Category>(`/tasks/categories/${categoryId}/`);
  },

  /**
   * Upload task attachment
   */
  async uploadAttachment(
    taskId: string, 
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<TaskAttachment>> {
    const formData = new FormData();
    formData.append('task', taskId);

    if (isImageFile(file)) {
      const cloudinaryResult = await tryUploadImageToCloudinary(file, {
        folder: `sajilowork/task_attachments/${taskId}`,
        onProgress,
      });

      if (cloudinaryResult?.url) {
        formData.append('file_url', cloudinaryResult.url);
        formData.append('file_name', file.name);
        formData.append('file_size', String(file.size));
        return apiClient.upload<TaskAttachment>('/tasks/attachments/', formData, onProgress);
      }
    }

    formData.append('file', file);
    return apiClient.upload<TaskAttachment>('/tasks/attachments/', formData, onProgress);
  },

  /**
   * Delete task attachment
   */
  async deleteAttachment(attachmentId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/tasks/attachments/${attachmentId}/`);
  },

  /**
   * Get task questions (included on task detail; list endpoint is not exposed)
   */
  async getTaskQuestions(slugOrId: string): Promise<ApiResponse<TaskQuestion[]>> {
    const detail = await this.getTaskBySlug(slugOrId);
    if (!detail.success || !detail.data) {
      return {
        success: false,
        message: detail.message ?? 'Failed to load questions',
        data: [],
      };
    }
    const questions = (detail.data as Task & { questions?: TaskQuestion[] }).questions ?? [];
    return { success: true, data: questions, message: 'OK' };
  },

  /**
   * Ask question about task (DRF action: POST /tasks/{slug}/ask_question/)
   */
  async askQuestion(slugOrId: string, question: string): Promise<ApiResponse<TaskQuestion>> {
    return apiClient.post<TaskQuestion>(`/tasks/${slugOrId}/ask_question/`, { question });
  },

  /**
   * Answer task question (task poster only)
   */
  async answerQuestion(
    slugOrId: string,
    questionId: string,
    answer: string
  ): Promise<ApiResponse<TaskQuestion>> {
    return apiClient.patch<TaskQuestion>(
      `/tasks/${slugOrId}/questions/${questionId}/`,
      { answer }
    );
  },

  /**
   * Dashboard inbox — received (on your listings) or asked (by you).
   */
  async getDashboardQuestions(
    view: 'received' | 'asked' = 'received',
  ): Promise<ApiResponse<TaskQuestion[] | PaginatedResponse<TaskQuestion>>> {
    return apiClient.get<TaskQuestion[] | PaginatedResponse<TaskQuestion>>(
      '/tasks/dashboard_questions/',
      { params: { view } },
    );
  },

  /**
   * Report task
   */
  async reportTask(
    taskId: string,
    reason: string,
    description?: string
  ): Promise<ApiResponse<{ message?: string }>> {
    return apiClient.post(`/tasks/${taskId}/report/`, { reason, description });
  },

  /**
   * Search tasks
   */
  async searchTasks(query: string, filters?: SearchFilters): Promise<ApiResponse<PaginatedResponse<Task>>> {
    return apiClient.get<PaginatedResponse<Task>>('/tasks/', {
      params: { search: query, ...filters }
    });
  },

  /**
   * Get nearby tasks
   */
  async getNearbyTasks(
    latitude: number,
    longitude: number,
    radius?: number
  ): Promise<ApiResponse<Task[]>> {
    return apiClient.get<Task[]>('/tasks/nearby/', {
      params: { latitude, longitude, radius }
    });
  },

  /**
   * Get featured tasks
   */
  async getFeaturedTasks(): Promise<ApiResponse<Task[]>> {
    return apiClient.get<Task[]>('/tasks/featured/');
  },

  /**
   * Get urgent tasks
   */
  async getUrgentTasks(): Promise<ApiResponse<Task[]>> {
    return apiClient.get<Task[]>('/tasks/urgent/');
  }
};

export default taskService;
