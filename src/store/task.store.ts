/**
 * Task Store
 * 
 * Global state management for tasks using Zustand
 */

import { create } from 'zustand';
import { Task, Category, SearchFilters, PaginatedResponse } from '@/types';
import { taskService } from '@/services';
import { buildTaskApiParams } from '@/lib/taskApiParams';
import {
  extractCategoryList,
  getFallbackCategories,
  normalizeTaskForDisplay,
} from '@/lib/taskUtils';
import { devLog, devWarn, devError } from '@/lib/devLog';

interface TaskState {
  // State
  tasks: Task[];
  currentTask: Task | null;
  categories: Category[];
  categoriesLoaded: boolean;
  filters: SearchFilters;
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
  };
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTasks: () => Promise<void>;
  fetchMyTasks: (status?: string) => Promise<void>;
  fetchTaskById: (taskId: string) => Promise<void>;
  createTask: (data: any) => Promise<Task>;
  updateTask: (taskId: string, data: any) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  setFilters: (filters: SearchFilters) => void;
  clearFilters: () => void;
  clearError: () => void;
  clearCurrentTask: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  // Initial state
  tasks: [],
  currentTask: null,
  categories: [],
  categoriesLoaded: false,
  filters: {},
  pagination: {
    count: 0,
    next: null,
    previous: null
  },
  isLoading: false,
  error: null,

  /**
   * Fetch tasks with filters
   */
  fetchTasks: async () => {
    try {
      set({ isLoading: true, error: null });

      const uiFilters = get().filters ?? {};
      const params = buildTaskApiParams(uiFilters, get().categories);
      const response = await taskService.getTasks(params);

      if (response.success) {
        const data = response.data as PaginatedResponse<Task>;
        set({
          tasks: (data.results ?? []).map(normalizeTaskForDisplay),
          pagination: {
            count: data.count,
            next: data.next,
            previous: data.previous,
          },
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: response.message || 'Failed to fetch tasks',
        });
      }
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number };
      const isRateLimited = err.status === 429;

      if (!isRateLimited) {
        devWarn('Failed to fetch tasks:', err.message ?? error);
      }

      set({
        isLoading: false,
        error:
          err.message ||
          (isRateLimited
            ? 'Too many requests. Please wait a moment.'
            : 'Failed to fetch tasks'),
      });
    }
  },

  /**
   * Fetch current user's posted tasks
   */
  fetchMyTasks: async (status?: string) => {
    try {
      devLog('🔍 Task Store: Fetching my tasks with status:', status);
      set({ isLoading: true, error: null });
      
      const response = await taskService.getMyTasks(status);
      devLog('📦 Task Store: My Tasks API Response:', response);
      devLog('📦 Raw response.data type:', typeof response.data);
      devLog('📦 Raw response.data:', JSON.stringify(response.data, null, 2));
      
      if (response.success) {
        const data = response.data as PaginatedResponse<Task>;
        devLog('✅ Task Store: My tasks received:', {
          count: data.count,
          resultsLength: data.results?.length,
          results: data.results
        });
        
        // DEBUG: Log first task in detail to see what fields are present
        if (data.results && data.results.length > 0) {
          const firstTask = data.results[0];
          devLog('🔍 FIRST TASK DETAILED DEBUG:', {
            id: firstTask.id,
            slug: firstTask.slug,
            title: firstTask.title,
            allKeys: Object.keys(firstTask),
            fullTask: firstTask
          });
        }
        
        set({
          tasks: (data.results || []).map(normalizeTaskForDisplay),
          pagination: {
            count: data.count || 0,
            next: data.next || null,
            previous: data.previous || null
          },
          isLoading: false
        });
      } else {
        devWarn('⚠️ Task Store: Response not successful:', response);
        set({
          tasks: [],
          isLoading: false,
          error: response.message || 'Failed to fetch your tasks'
        });
      }
    } catch (error: any) {
      devError('❌ Task Store: Error fetching my tasks:', error);
      devError('Error type:', typeof error);
      devError('Error constructor:', error?.constructor?.name);
      devError('Error keys:', Object.keys(error || {}));
      devError('Error message:', error?.message);
      devError('Error status:', error?.status);
      devError('Error stringified:', JSON.stringify(error, null, 2));
      
      // Handle empty error object
      if (!error || (typeof error === 'object' && Object.keys(error).length === 0)) {
        devError('⚠️ Empty error object received - likely authentication issue');
        set({
          tasks: [],
          isLoading: false,
          error: 'Authentication required. Please sign in to view your tasks.'
        });
        return;
      }
      
      const errorMessage = 
        error?.message || 
        error?.error || 
        error?.detail ||
        (typeof error === 'string' ? error : null) ||
        'Failed to fetch your tasks. Please try again.';
      
      set({
        tasks: [],
        isLoading: false,
        error: errorMessage
      });
    }
  },

  /**
   * Fetch single task by ID
   */
  fetchTaskById: async (taskId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await taskService.getTaskById(taskId);
      
      if (response.success && response.data) {
        set({
          currentTask: normalizeTaskForDisplay(response.data),
          isLoading: false
        });
      }
    } catch (error: any) {
      devError('❌ Task Store: Error fetching task by ID:', error);
      
      const errorMessage = 
        error?.message || 
        error?.error || 
        error?.detail ||
        (typeof error === 'string' ? error : null) ||
        'Failed to fetch task';
      
      set({
        isLoading: false,
        error: errorMessage
      });
    }
  },

  /**
   * Create new task
   */
  createTask: async (data: any) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await taskService.createTask(data);
      
      if (response.success) {
        set({ isLoading: false });
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to create task');
    } catch (error: any) {
      devError('❌ Task Store: Error creating task:', error);
      
      const errorMessage = 
        error?.message || 
        error?.error || 
        error?.detail ||
        (typeof error === 'string' ? error : null) ||
        'Failed to create task';
      
      set({
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  },

  /**
   * Update task
   */
  updateTask: async (taskId: string, data: any) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await taskService.updateTask(taskId, data);
      
      if (response.success) {
        // Update in list if exists
        const updated = normalizeTaskForDisplay(response.data);
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? updated : task
          ),
          currentTask: state.currentTask?.id === taskId ? updated : state.currentTask,
          isLoading: false
        }));
      }
    } catch (error: any) {
      devError('❌ Task Store: Error updating task:', error);
      
      const errorMessage = 
        error?.message || 
        error?.error || 
        error?.detail ||
        (typeof error === 'string' ? error : null) ||
        'Failed to update task';
      
      set({
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  },

  /**
   * Delete task
   */
  deleteTask: async (taskId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await taskService.deleteTask(taskId);
      
      // Remove from list
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== taskId),
        currentTask: state.currentTask?.id === taskId ? null : state.currentTask,
        isLoading: false
      }));
    } catch (error: any) {
      devError('❌ Task Store: Error deleting task:', error);
      
      const errorMessage = 
        error?.message || 
        error?.error || 
        error?.detail ||
        (typeof error === 'string' ? error : null) ||
        'Failed to delete task';
      
      set({
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  },

  /**
   * Fetch categories
   */
  fetchCategories: async () => {
    try {
      const response = await taskService.getCategories();
      let categories = response.success
        ? extractCategoryList(response.data)
        : [];

      if (categories.length === 0) {
        categories = getFallbackCategories();
      }

      set({ categories, categoriesLoaded: true });
    } catch (error: unknown) {
      devError('Failed to fetch categories:', error);
      set({ categories: getFallbackCategories(), categoriesLoaded: true });
    }
  },

  /**
   * Set filters
   */
  setFilters: (filters: SearchFilters) => {
    set({ filters: filters ?? {} });
  },

  /**
   * Clear filters
   */
  clearFilters: () => {
    set({ filters: {} });
  },

  /**
   * Clear error
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Clear current task
   */
  clearCurrentTask: () => {
    set({ currentTask: null });
  }
}));

export default useTaskStore;
