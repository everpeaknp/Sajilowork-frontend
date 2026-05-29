/**
 * Review Service
 * 
 * Handles all review-related API calls
 */

import { apiClient } from '@/lib/api/client';
import type { ApiResponse, Review } from '@/types';

export type ReviewStats = {
  total_reviews: number;
  average_rating: number | null;
  rating_distribution: Record<string, number>;
  as_tasker_reviews: number;
  as_customer_reviews: number;
  trust_score: number;
};

export type UserReviewsResponse = {
  user_id: string;
  statistics: ReviewStats;
  count: number;
  results: Review[];
};

export type TaskReviewsResponse = {
  task_id: string;
  count: number;
  results: Review[];
};

export interface CreateReviewData {
  task_id: string; // UUID
  rating: number; // 1-5
  comment?: string;
  tags?: string[];
}

class ReviewService {
  private readonly BASE_PATH = '/reviews';

  /**
   * Create a new review
   */
  async createReview(data: CreateReviewData): Promise<ApiResponse<Review>> {
    return apiClient.post(`${this.BASE_PATH}/`, data);
  }

  /**
   * Get reviews for a specific user
   */
  async getUserReviews(userId: string): Promise<ApiResponse<UserReviewsResponse>> {
    return apiClient.get(`/users/${encodeURIComponent(userId)}/reviews/`);
  }

  /**
   * Get reviews for a specific task
   */
  async getTaskReviews(taskIdOrSlug: string): Promise<ApiResponse<TaskReviewsResponse>> {
    return apiClient.get(`/tasks/${encodeURIComponent(taskIdOrSlug)}/reviews/`);
  }

  /**
   * Whether current user already reviewed a task
   */
  async getMyTaskReviewStatus(taskId: string): Promise<ApiResponse<{ task_id: string; has_reviewed: boolean; review_id: string | null }>> {
    return apiClient.get(`${this.BASE_PATH}/my_task_review_status/`, {
      params: { task_id: taskId },
    });
  }
}

export const reviewService = new ReviewService();
export default reviewService;
