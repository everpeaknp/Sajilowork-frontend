import { apiClient } from '@/lib/api/client';
import type { ApiResponse, PortfolioItem, User } from '@/types';
import type { PublicUserProfile } from '@/types/publicProfile';
import type { UserReviewsResponse } from '@/services/review.service';

export interface FreelancerPortfolioResponse {
  count: number;
  results: PortfolioItem[];
}

export type FreelancerMyProfileDto = User & {
  slug: string;
  profile: PublicUserProfile;
};

export type FreelancerPublicDto = PublicUserProfile & {
  slug?: string;
};

export type FreelancerProfileUpdatePayload = Partial<{
  first_name: string;
  last_name: string;
  username: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  bio: string;
  tagline: string;
  role: 'customer' | 'tasker';
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  hourly_rate: number;
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

/** Public freelancer reads — no JWT so stale browser tokens cannot 401 the page. */
const PUBLIC_FREELANCER_GET = { skipAuth: true } as const;

async function getOptional<T>(url: string): Promise<ApiResponse<T>> {
  try {
    return await apiClient.get<T>(url, PUBLIC_FREELANCER_GET);
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

function freelancerSlugPath(slug: string): string {
  const normalized = slug.trim().toLowerCase();
  return `/freelancers/${encodeURIComponent(normalized)}/`;
}

export const freelancerService = {
  async getMyFreelancerProfile(): Promise<ApiResponse<FreelancerMyProfileDto>> {
    return apiClient.get<FreelancerMyProfileDto>('/users/me/freelancer-profile/');
  },

  async updateMyFreelancerProfile(
    data: FreelancerProfileUpdatePayload,
  ): Promise<ApiResponse<FreelancerMyProfileDto>> {
    return apiClient.patch<FreelancerMyProfileDto>('/users/me/freelancer-profile/', data);
  },

  async getFreelancerBySlug(slug: string): Promise<ApiResponse<FreelancerPublicDto>> {
    return getOptional<FreelancerPublicDto>(freelancerSlugPath(slug));
  },

  async getFreelancerReviews(slug: string): Promise<ApiResponse<UserReviewsResponse>> {
    return getOptional<UserReviewsResponse>(`${freelancerSlugPath(slug)}reviews/`);
  },

  async getFreelancerPortfolio(slug: string): Promise<ApiResponse<FreelancerPortfolioResponse>> {
    return getOptional<FreelancerPortfolioResponse>(`${freelancerSlugPath(slug)}portfolio/`);
  },
};
