/**
 * User Service
 * 
 * Handles all user-related API calls
 */

import { apiClient } from '@/lib/api/client';
import { tryUploadImageToCloudinary } from '@/services/cloudinary.service';
import { 
  User, 
  UserSkill,
  UserSkillInput,
  UserBadge,
  Badge,
  PortfolioItem,
  UserDocument,
  UserDocumentType,
  UserKYC,
  ProfileFormData,
  ApiResponse,
  PaginatedResponse,
  DashboardStats
} from '@/types';

export const userService = {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<User>> {
    return apiClient.get<User>('/users/me/');
  },

  /**
   * Update current user profile
   */
  async updateProfile(data: Partial<ProfileFormData>): Promise<ApiResponse<User>> {
    return apiClient.patch<User>('/users/me/', data);
  },

  /**
   * Upload profile image
   */
  async uploadProfileImage(file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<User>> {
    const formData = new FormData();

    const cloudinaryResult = await tryUploadImageToCloudinary(file, {
      folder: 'sajilowork/profile_images',
      onProgress,
    });

    if (cloudinaryResult?.url) {
      formData.append('image_url', cloudinaryResult.url);
    } else {
      formData.append('profile_image', file);
    }

    return apiClient.upload<User>('/users/me/upload-image/', formData, onProgress);
  },

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<ApiResponse<User>> {
    return apiClient.get<User>(`/users/${userId}/`);
  },

  /**
   * Get public profile (for taskers)
   */
  async getPublicProfile(userId: string): Promise<ApiResponse<User>> {
    return apiClient.get<User>(`/users/${userId}/public_profile/`);
  },

  /**
   * Public profile by username or user id (for /users/[slug])
   */
  async getPublicProfileByUsername(username: string): Promise<ApiResponse<import('@/types/publicProfile').PublicUserProfile>> {
    return apiClient.get(`/users/profile/${encodeURIComponent(username)}/`);
  },

  async getFollowStatus(userId: string): Promise<
    ApiResponse<{ is_following: boolean; followers_count: number }>
  > {
    return apiClient.get(`/users/${userId}/follow_status/`);
  },

  async followUser(
    userId: string
  ): Promise<ApiResponse<{ is_following: boolean; followers_count: number }>> {
    return apiClient.post(`/users/${userId}/follow/`);
  },

  async unfollowUser(
    userId: string
  ): Promise<ApiResponse<{ is_following: boolean; followers_count: number }>> {
    return apiClient.post(`/users/${userId}/unfollow/`);
  },

  /**
   * Public user directory (search + filters) for /users/
   */
  async getUserDirectory(params?: {
    search?: string;
    q?: string;
    role?: 'tasker' | 'customer';
    city?: string;
    min_rating?: number;
    verified_only?: boolean;
    sort_by?: 'rating' | 'tasks' | 'newest' | 'name';
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<UserDirectoryEntry>>> {
    const query: Record<string, string | number | boolean> = {};
    if (params?.search) query.search = params.search;
    if (params?.q) query.q = params.q;
    if (params?.role) query.role = params.role;
    if (params?.city) query.city = params.city;
    if (params?.min_rating != null) query.min_rating = params.min_rating;
    if (params?.verified_only) query.verified_only = 'true';
    if (params?.sort_by) query.sort_by = params.sort_by;
    if (params?.page) query.page = params.page;
    if (params?.page_size) query.page_size = params.page_size;

    return apiClient.get<PaginatedResponse<UserDirectoryEntry>>('/users/directory/', {
      params: query,
    });
  },

  /**
   * Get verified taskers
   */
  async getVerifiedTaskers(params?: {
    category?: string;
    location?: string;
    page?: number;
  }): Promise<ApiResponse<PaginatedResponse<User>>> {
    return apiClient.get<PaginatedResponse<User>>('/users/taskers/', { params });
  },

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<ApiResponse<DashboardStats>> {
    return apiClient.get<DashboardStats>('/users/stats/');
  },

  /**
   * Get user skills
   */
  async getUserSkills(userId?: string): Promise<ApiResponse<UserSkill[]>> {
    const endpoint = userId ? `/users/${userId}/skills/` : '/users/me/skills/';
    const response = await apiClient.get<UserSkill[] | PaginatedResponse<UserSkill>>(endpoint);
    const data = Array.isArray(response.data)
      ? response.data
      : Array.isArray((response.data as PaginatedResponse<UserSkill>).results)
        ? (response.data as PaginatedResponse<UserSkill>).results
        : [];

    return { ...response, data };
  },

  /**
   * Alias to get user skills for backward compatibility
   */
  async getSkills(userId?: string): Promise<ApiResponse<UserSkill[]>> {
    return this.getUserSkills(userId);
  },

  /**
   * Add user skill
   */
  async addSkill(data: UserSkillInput): Promise<ApiResponse<UserSkill>> {
    return apiClient.post<UserSkill>('/users/me/skills/', data);
  },

  /**
   * Update user skill
   */
  async updateSkill(
    skillId: string,
    data: Partial<UserSkillInput>,
  ): Promise<ApiResponse<UserSkill>> {
    return apiClient.patch<UserSkill>(`/users/me/skills/${skillId}/`, data);
  },

  /**
   * Delete user skill
   */
  async deleteSkill(skillId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/users/me/skills/${skillId}/`);
  },

  /**
   * Get user badges
   */
  async getUserBadges(userId?: string): Promise<ApiResponse<UserBadge[]>> {
    const endpoint = userId ? `/users/${userId}/badges/` : '/users/me/badges/';
    const response = await apiClient.get<UserBadge[] | PaginatedResponse<UserBadge>>(endpoint);
    const data = Array.isArray(response.data)
      ? response.data
      : Array.isArray((response.data as PaginatedResponse<UserBadge>).results)
      ? (response.data as PaginatedResponse<UserBadge>).results
      : [];

    return {
      ...response,
      data,
    };
  },

  /**
   * Get badges (new format)
   */
  async getBadges(): Promise<ApiResponse<Badge[]>> {
    const response = await apiClient.get<Badge[] | PaginatedResponse<Badge>>('/users/me/badges/');
    const data = Array.isArray(response.data)
      ? response.data
      : Array.isArray((response.data as PaginatedResponse<Badge>).results)
      ? (response.data as PaginatedResponse<Badge>).results
      : [];

    return {
      ...response,
      data,
    };
  },

  /**
   * Add badge
   */
  async addBadge(data: { badge_type: string }): Promise<ApiResponse<Badge>> {
    return apiClient.post<Badge>('/users/me/badges/', data);
  },

  /**
   * Request a badge with supporting document (police check, licences).
   */
  async addBadgeWithDocument(
    data: {
      badge_type: string;
      document_number?: string;
      name?: string;
      description?: string;
    },
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<ApiResponse<Badge>> {
    const formData = new FormData();
    formData.append('badge_type', data.badge_type);
    formData.append('verification_document', file);
    if (data.document_number?.trim()) {
      formData.append('document_number', data.document_number.trim());
    }
    if (data.name?.trim()) {
      formData.append('name', data.name.trim());
    }
    if (data.description?.trim()) {
      formData.append('description', data.description.trim());
    }
    return apiClient.upload<Badge>('/users/me/badges/', formData, onProgress);
  },

  /**
   * Get portfolio items
   */
  async getPortfolio(userId?: string): Promise<ApiResponse<PortfolioItem[]>> {
    const endpoint = userId ? `/users/${userId}/portfolio/` : '/users/me/portfolio/';
    const response = await apiClient.get<PortfolioItem[] | PaginatedResponse<PortfolioItem>>(
      endpoint,
    );
    const data = Array.isArray(response.data)
      ? response.data
      : Array.isArray((response.data as PaginatedResponse<PortfolioItem>).results)
        ? (response.data as PaginatedResponse<PortfolioItem>).results
        : [];

    return { ...response, data };
  },

  /**
   * Upload portfolio item
   */
  async uploadPortfolioItem(
    file: File, 
    data: { title: string; description?: string },
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<PortfolioItem>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', data.title);
    if (data.description) {
      formData.append('description', data.description);
    }
    
    return apiClient.upload<PortfolioItem>('/users/me/portfolio/', formData, onProgress);
  },

  /**
   * Delete portfolio item
   */
  async deletePortfolioItem(itemId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/users/me/portfolio/${itemId}/`);
  },

  /**
   * Get user documents (verification uploads)
   */
  async getDocuments(): Promise<ApiResponse<UserDocument[]>> {
    const response = await apiClient.get<UserDocument[] | PaginatedResponse<UserDocument>>(
      '/users/me/documents/',
    );
    const data = Array.isArray(response.data)
      ? response.data
      : Array.isArray((response.data as PaginatedResponse<UserDocument>).results)
        ? (response.data as PaginatedResponse<UserDocument>).results
        : [];

    return { ...response, data };
  },

  /**
   * Upload / replace a verification document
   */
  async uploadDocument(
    file: File,
    data: { document_type: UserDocumentType | string; document_number?: string },
    onProgress?: (progress: number) => void,
  ): Promise<ApiResponse<UserDocument>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', data.document_type);
    if (data.document_number) formData.append('document_number', data.document_number);

    return apiClient.upload<UserDocument>('/users/me/documents/', formData, onProgress);
  },

  /**
   * Delete a document
   */
  async deleteDocument(documentId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/users/me/documents/${documentId}/`);
  },

  /**
   * Identity Trust Program (Verify Account / KYC)
   */
  async getKyc(): Promise<ApiResponse<UserKYC>> {
    return apiClient.get<UserKYC>('/users/me/kyc/');
  },

  async updateKyc(data: { pan_number?: string }): Promise<ApiResponse<UserKYC>> {
    return apiClient.patch<UserKYC>('/users/me/kyc/', data);
  },

  /**
   * Update email
   */
  async updateEmail(email: string): Promise<ApiResponse<User>> {
    return apiClient.patch<User>('/users/me/', { email });
  },

  /**
   * Update phone number
   */
  async updatePhoneNumber(phone_number: string): Promise<ApiResponse<User>> {
    return apiClient.patch<User>('/users/me/', { phone: phone_number });
  },

  /**
   * Change password
   */
  async changePassword(data: { 
    current_password: string; 
    new_password: string 
  }): Promise<ApiResponse<void>> {
    return apiClient.post('/users/me/change-password/', data);
  },

  /**
   * Update availability status
   */
  async updateAvailability(status: 'available' | 'busy' | 'offline'): Promise<ApiResponse<User>> {
    return apiClient.patch<User>('/users/me/', { availability_status: status });
  },

  /**
   * Deactivate account
   */
  async deactivateAccount(): Promise<ApiResponse<void>> {
    return apiClient.post('/users/me/deactivate/');
  },

  /**
   * Delete account
   */
  async deleteAccount(password: string): Promise<ApiResponse<void>> {
    return apiClient.post('/users/me/delete/', { password });
  },

  /**
   * Update date of birth
   */
  async updateDateOfBirth(date_of_birth: string): Promise<ApiResponse<User>> {
    return apiClient.patch<User>('/users/me/', { date_of_birth });
  },

  /**
   * Send phone verification code
   */
  async sendPhoneVerificationCode(phone: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>('/users/me/send-verification-code/', { phone });
  },

  /**
   * Verify phone with code
   */
  async verifyPhone(phone: string, code: string): Promise<ApiResponse<User>> {
    return apiClient.post<User>('/users/me/verify-phone/', { phone, code });
  },

  /**
   * Update billing address
   */
  async updateBillingAddress(data: {
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country?: string;
  }): Promise<ApiResponse<User>> {
    return apiClient.patch<User>('/users/me/', data);
  },

  /**
   * Link bank account (placeholder - needs payment service integration)
   */
  async linkBankAccount(data: {
    account_holder_name: string;
    bsb_number: string;
    account_number: string;
  }): Promise<ApiResponse<{ message: string }>> {
    // TODO: Integrate with payment service (Stripe Connect, etc.)
    return apiClient.post<{ message: string }>('/users/me/link-bank-account/', data);
  }
};

export interface UserDirectoryEntry {
  id: string;
  username?: string;
  full_name?: string;
  profile_image?: string | null;
  role?: string;
  bio?: string;
  tagline?: string;
  city?: string;
  state?: string;
  country?: string;
  location_display?: string;
  average_rating?: number;
  total_reviews?: number;
  tasks_completed?: number;
  completion_rate?: number | string;
  hourly_rate?: number | string;
  skill_tags?: string[];
  language_tags?: string[];
  specialization?: string | null;
  profile_type?: string | null;
  date_joined?: string;
  is_verified_tasker?: boolean;
  is_online?: boolean;
}

export default userService;
