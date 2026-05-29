/**
 * Notification Service
 * 
 * Handles all notification-related API calls
 */

import { apiClient } from '@/lib/api/client';
import { ApiResponse, Notification } from '@/types';

export interface NotificationFilters {
  is_read?: boolean;
  /** Backend expects query param `type` */
  type?: string;
  from_date?: string;
  to_date?: string;
}

class NotificationService {
  private readonly BASE_PATH = '/notifications/notifications';
  private readonly PREFS_PATH = '/notifications/preferences';
  private readonly TASK_ALERT_KEYWORDS_PATH = '/notifications/task-alert-keywords';

  /**
   * Get all notifications for current user
   */
  async getNotifications(filters?: NotificationFilters): Promise<ApiResponse<Notification[]>> {
    return apiClient.get(`${this.BASE_PATH}/`, { params: filters });
  }

  /**
   * Get notification by ID
   */
  async getNotification(id: string | number): Promise<ApiResponse<Notification>> {
    return apiClient.get(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string | number): Promise<ApiResponse<Notification>> {
    return apiClient.post(`${this.BASE_PATH}/${id}/mark_read/`);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<ApiResponse<{ message: string }>> {
    // Backend expects `{ mark_all: true }` (otherwise it marks 0)
    return apiClient.post(`${this.BASE_PATH}/mark_all_read/`, { mark_all: true });
  }

  /**
   * Delete notification
   */
  async deleteNotification(id: string | number): Promise<ApiResponse<void>> {
    return apiClient.delete(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return apiClient.get(`${this.BASE_PATH}/unread_count/`);
  }

  /**
   * Get notification preferences for current user
   */
  async getPreferences(): Promise<ApiResponse<any[]>> {
    return apiClient.get(`${this.PREFS_PATH}/`);
  }

  /**
   * Reset preferences to backend defaults (creates rows if missing)
   */
  async resetPreferencesToDefaults(): Promise<ApiResponse<{ status: string }>> {
    return apiClient.post(`${this.PREFS_PATH}/reset_to_defaults/`);
  }

  /**
   * Update a single preference row
   */
  async updatePreference(
    id: string,
    patch: Partial<{
      in_app_enabled: boolean;
      email_enabled: boolean;
      push_enabled: boolean;
      sms_enabled: boolean;
      instant: boolean;
      daily_digest: boolean;
      weekly_digest: boolean;
      quiet_hours_enabled: boolean;
      quiet_hours_start: string | null;
      quiet_hours_end: string | null;
    }>
  ): Promise<ApiResponse<any>> {
    return apiClient.patch(`${this.PREFS_PATH}/${id}/`, patch);
  }

  async getTaskAlertKeywords(): Promise<ApiResponse<any[]>> {
    return apiClient.get(`${this.TASK_ALERT_KEYWORDS_PATH}/`);
  }

  async addTaskAlertKeyword(keyword: string): Promise<ApiResponse<any>> {
    return apiClient.post(`${this.TASK_ALERT_KEYWORDS_PATH}/`, { keyword });
  }

  async deleteTaskAlertKeyword(id: string): Promise<ApiResponse<any>> {
    return apiClient.delete(`${this.TASK_ALERT_KEYWORDS_PATH}/${id}/`);
  }
}

export const notificationService = new NotificationService();
export default notificationService;
