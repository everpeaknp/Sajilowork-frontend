import { apiClient } from '@/lib/api/client';
import type { ApiResponse, Task } from '@/types';

export type EmployerAccountType = 'individual' | 'company';

export interface EmployerGalleryImageDto {
  id: string;
  url: string;
  alt_text?: string;
  sort_order?: number;
}

export interface EmployerProfileDto {
  user_id: string;
  slug: string;
  account_type: EmployerAccountType;
  company_name: string;
  tagline: string;
  industry: string;
  team_size: string;
  location: string;
  description: string;
  website: string;
  cost_range: string;
  logo_url?: string | null;
  logo_color: string;
  logo_text: string;
  contact_email?: string;
  contact_phone?: string;
  gallery_images: EmployerGalleryImageDto[];
  rating: number;
  review_count: number;
  open_jobs: number;
  member_since?: string;
  updated_at?: string;
}

export interface EmployerPublicDto extends Omit<EmployerProfileDto, 'company_name'> {
  id: string;
  name: string;
}

export interface EmployerListingResponse<T> {
  count: number;
  results: T[];
}

export interface EmployerReviewDto {
  id: string;
  rating: number;
  comment?: string;
  created_at?: string;
  task_title?: string;
  reviewer_name?: string;
  reviewer?: { full_name?: string };
  helpful_count?: number;
  not_helpful_count?: number;
  user_vote?: 'helpful' | 'not_helpful' | null;
  is_reported?: boolean;
}

export interface EmployerReviewsResponse {
  count: number;
  results: EmployerReviewDto[];
  statistics?: { average_rating?: number; total_reviews?: number };
}

export type EmployerProfileUpdatePayload = Partial<{
  slug: string;
  account_type: EmployerAccountType;
  company_name: string;
  tagline: string;
  industry: string;
  team_size: string;
  location: string;
  description: string;
  website: string;
  cost_range: string;
  contact_email: string;
  contact_phone: string;
  logo_color: string;
  logo_text: string;
}>;

function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    Number((error as { status: number }).status) === 404
  );
}

function isUnauthorizedError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    Number((error as { status: number }).status) === 401
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = String((error as { message: string }).message).trim();
    if (message) return message;
  }
  return fallback;
}

/** Public employer reads — no JWT so stale browser tokens cannot 401 the page. */
const PUBLIC_EMPLOYER_GET = { skipAuth: true } as const;

/** GET that returns `{ success: false }` on 404 instead of throwing (expected for optional public lookups). */
async function getOptional<T>(url: string): Promise<ApiResponse<T>> {
  try {
    return await apiClient.get<T>(url, PUBLIC_EMPLOYER_GET);
  } catch (error) {
    if (isNotFoundError(error) || isUnauthorizedError(error)) {
      return {
        success: false,
        message: getErrorMessage(error, 'Not found'),
        data: null as T,
        errors: null,
      };
    }
    throw error;
  }
}

function employerSlugPath(slug: string): string {
  const normalized = slug.trim().toLowerCase();
  return `/employers/${encodeURIComponent(normalized)}/`;
}

export const employerService = {
  async getMyEmployerProfile(): Promise<ApiResponse<EmployerProfileDto>> {
    return apiClient.get<EmployerProfileDto>('/users/me/employer-profile/');
  },

  async updateMyEmployerProfile(
    data: EmployerProfileUpdatePayload,
  ): Promise<ApiResponse<EmployerProfileDto>> {
    return apiClient.patch<EmployerProfileDto>('/users/me/employer-profile/', data);
  },

  async uploadLogo(file: File): Promise<ApiResponse<EmployerProfileDto>> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload<EmployerProfileDto>('/users/me/employer-profile/logo/', formData);
  },

  async uploadGalleryImage(
    file: File,
    altText?: string,
  ): Promise<ApiResponse<EmployerGalleryImageDto>> {
    const formData = new FormData();
    formData.append('file', file);
    if (altText?.trim()) {
      formData.append('alt_text', altText.trim());
    }
    return apiClient.upload<EmployerGalleryImageDto>(
      '/users/me/employer-profile/gallery/',
      formData,
    );
  },

  async deleteGalleryImage(imageId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/users/me/employer-profile/gallery/${imageId}/`);
  },

  async getEmployers(
    params?: Record<string, string | number>,
  ): Promise<ApiResponse<EmployerListingResponse<EmployerPublicDto>>> {
    try {
      return await apiClient.get<EmployerListingResponse<EmployerPublicDto>>('/employers/', {
        ...PUBLIC_EMPLOYER_GET,
        params,
      });
    } catch (error) {
      if (isNotFoundError(error) || isUnauthorizedError(error)) {
        return {
          success: false,
          message: getErrorMessage(error, 'Not found'),
          data: null as unknown as EmployerListingResponse<EmployerPublicDto>,
          errors: null,
        };
      }
      throw error;
    }
  },

  async getEmployerBySlug(slug: string): Promise<ApiResponse<EmployerPublicDto>> {
    return getOptional<EmployerPublicDto>(employerSlugPath(slug));
  },

  async getEmployerProjects(slug: string): Promise<ApiResponse<EmployerListingResponse<Task>>> {
    return getOptional<EmployerListingResponse<Task>>(`${employerSlugPath(slug)}projects/`);
  },

  async getEmployerJobs(slug: string): Promise<ApiResponse<EmployerListingResponse<Task>>> {
    return getOptional<EmployerListingResponse<Task>>(`${employerSlugPath(slug)}jobs/`);
  },

  async getEmployerReviews(slug: string): Promise<ApiResponse<EmployerReviewsResponse>> {
    return getOptional<EmployerReviewsResponse>(`${employerSlugPath(slug)}reviews/`);
  },
};
