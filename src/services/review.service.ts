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

export type ReviewInvitation = {
  id: string;
  task: string;
  task_title?: string;
  reviewer_type?: string;
  reviewee_id?: string;
  status?: string;
  expires_at?: string;
  is_expired?: boolean;
};

export type ReviewEligibleTask = {
  task_id: string;
  task_title: string;
};

export type HelpfulVote = 'helpful' | 'not_helpful' | 'clear';

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

  /**
   * Reviews received by the authenticated user (employer or freelancer).
   */
  async getReceivedReviews(): Promise<ApiResponse<Review[]>> {
    return apiClient.get(`${this.BASE_PATH}/received/`);
  }

  /**
   * Post a public response as the reviewee.
   */
  async respondToReview(reviewId: string, responseText: string): Promise<ApiResponse<Review>> {
    return apiClient.post(`${this.BASE_PATH}/${encodeURIComponent(reviewId)}/respond/`, {
      response_text: responseText,
    });
  }

  async getPendingInvitations(): Promise<ApiResponse<ReviewInvitation[]>> {
    return apiClient.get(`${this.BASE_PATH}/pending_invitations/`);
  }

  async getEligibleReviewTasks(revieweeUserId: string): Promise<ApiResponse<ReviewEligibleTask[]>> {
    return apiClient.get(`${this.BASE_PATH}/eligible_tasks/`, {
      params: { reviewee_id: revieweeUserId },
    });
  }

  async voteHelpful(reviewId: string, vote: HelpfulVote): Promise<ApiResponse<Review>> {
    return apiClient.post(`${this.BASE_PATH}/${encodeURIComponent(reviewId)}/helpful/`, { vote });
  }

  async reportReview(
    reviewId: string,
    reason: string,
    description: string,
  ): Promise<ApiResponse<{ detail: string }>> {
    return apiClient.post(`${this.BASE_PATH}/${encodeURIComponent(reviewId)}/report/`, {
      reason,
      description,
    });
  }

  async getServiceReviews(slug: string): Promise<ApiResponse<TaskReviewsResponse>> {
    return apiClient.get(`/services/${encodeURIComponent(slug)}/reviews/`, { skipAuth: true });
  }

  async createServiceReview(
    slug: string,
    data: Pick<CreateReviewData, 'rating' | 'comment'>,
  ): Promise<ApiResponse<Review>> {
    return apiClient.post(`/services/${encodeURIComponent(slug)}/reviews/`, data);
  }
}

export const reviewService = new ReviewService();
export default reviewService;
