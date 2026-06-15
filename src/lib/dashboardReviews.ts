import { formatReviewTimeAgo, reviewerDisplayName } from '@/lib/publicProfile';
import { employerService } from '@/services/employer.service';
import { freelancerService } from '@/services/freelancer.service';
import { reviewService } from '@/services/review.service';
import type { Review } from '@/types';

export type ReviewsSubTab = 'services' | 'project' | 'jobs' | 'profile';

export type DashboardSidebarRole = 'customer' | 'tasker';

export interface DashboardReviewItem {
  id: string;
  tab: ReviewsSubTab;
  taskTitle?: string;
  authorName: string;
  authorInitials: string;
  authorAvatar?: string;
  authorVerified?: boolean;
  avatarBg: string;
  rating: number;
  timeAgo: string;
  content: string;
  response?: string;
  canRespond: boolean;
}

export const REVIEWS_TABS_BY_ROLE: Record<DashboardSidebarRole, ReviewsSubTab[]> = {
  tasker: ['profile'],
  customer: ['profile'],
};

export const REVIEWS_TAB_LABELS: Record<ReviewsSubTab, string> = {
  services: 'Services',
  project: 'Project',
  jobs: 'Jobs',
  profile: 'Profile',
};

const AVATAR_BACKGROUNDS = [
  'bg-[#183B32]',
  'bg-[#4B43DF]',
  'bg-[#F2994A]',
  'bg-[#2D9CDB]',
  'bg-[#9B51E0]',
  'bg-[#EB5757]',
  'bg-[#27AE60]',
];

function hashKey(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function avatarBgForId(id: string): string {
  return AVATAR_BACKGROUNDS[hashKey(id) % AVATAR_BACKGROUNDS.length];
}

function initialsFromReviewer(reviewer: Review['reviewer']): string {
  const first = reviewer?.first_name?.trim();
  const last = reviewer?.last_name?.trim();
  if (first && last) {
    return `${first[0]}.${last[0]}`.toUpperCase();
  }
  const full = reviewer?.full_name?.trim() || first || last || '';
  const parts = full.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}.${parts[parts.length - 1][0]}`.toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return 'U';
}

export function reviewTabForListingKind(listingKind?: string | null): ReviewsSubTab {
  if (listingKind === 'service') return 'services';
  if (listingKind === 'project') return 'project';
  if (listingKind === 'job') return 'jobs';
  return 'profile';
}

/** @deprecated Use reviewTabForListingKind */
export function reviewTabForBudget(budgetType?: string | null): ReviewsSubTab {
  if (budgetType === 'hourly') return 'services';
  if (budgetType === 'fixed') return 'project';
  return 'jobs';
}

export function defaultReviewsTabForRole(role: DashboardSidebarRole): ReviewsSubTab {
  return REVIEWS_TABS_BY_ROLE[role][0];
}

export function isReviewsTabAllowedForRole(tab: ReviewsSubTab, role: DashboardSidebarRole): boolean {
  return REVIEWS_TABS_BY_ROLE[role].includes(tab);
}

export function mapReviewToDashboardItem(review: Review): DashboardReviewItem {
  const authorName = reviewerDisplayName(review.reviewer);
  const relative = formatReviewTimeAgo(review.created_at);
  const timeAgo = relative
    ? `Published ${relative.replace(/^about\s+/i, '')}`
    : 'Published recently';
  const listingKind = review.task_listing_kind ?? null;

  return {
    id: String(review.id),
    tab: reviewTabForListingKind(listingKind),
    taskTitle: review.task_title,
    authorName,
    authorInitials: initialsFromReviewer(review.reviewer),
    authorAvatar: review.reviewer?.profile_image || undefined,
    authorVerified: Boolean(review.reviewer?.is_verified_tasker),
    avatarBg: avatarBgForId(String(review.id)),
    rating: Number(review.rating) || 0,
    timeAgo,
    content: (review.comment || '').trim() || 'No written feedback.',
    response: review.response_text?.trim() || undefined,
    canRespond: !review.response_text?.trim(),
  };
}

export function mapReviewsToDashboardItems(reviews: Review[]): DashboardReviewItem[] {
  return reviews.map(mapReviewToDashboardItem);
}

export function filterReviewsByTab(
  items: DashboardReviewItem[],
  tab: ReviewsSubTab,
): DashboardReviewItem[] {
  if (tab === 'profile') {
    return items;
  }
  return items.filter((item) => item.tab === tab);
}

/**
 * Same reviews as the public /freelancers/{slug} or /employers/{slug} profile pages.
 */
export async function fetchPublicProfileReviews(
  role: DashboardSidebarRole,
  slug: string,
): Promise<Review[]> {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) {
    return [];
  }

  if (role === 'tasker') {
    const response = await freelancerService.getFreelancerReviews(normalizedSlug);
    if (!response.success || !response.data?.results) {
      return [];
    }
    return response.data.results as Review[];
  }

  const response = await employerService.getEmployerReviews(normalizedSlug);
  if (!response.success || !response.data?.results) {
    return [];
  }
  return response.data.results as Review[];
}

export async function fetchDashboardReviews(
  role: DashboardSidebarRole,
  slug?: string | null,
): Promise<Review[]> {
  if (slug?.trim()) {
    return fetchPublicProfileReviews(role, slug);
  }

  const response = await reviewService.getReceivedReviews();
  if (!response.success || !Array.isArray(response.data)) {
    return [];
  }
  return response.data;
}

export function emptyReviewsMessage(tab: ReviewsSubTab, role: DashboardSidebarRole): string {
  if (tab === 'profile') {
    return role === 'tasker'
      ? 'No reviews on your public freelancer profile yet.'
      : 'No reviews on your public employer profile yet.';
  }
  if (tab === 'services') {
    return 'No service reviews yet. Completed service work with public feedback appears here.';
  }
  if (tab === 'project') {
    return 'No project reviews yet. Completed projects with public feedback appear here.';
  }
  return 'No job reviews yet. Completed jobs with public feedback appear here.';
}
