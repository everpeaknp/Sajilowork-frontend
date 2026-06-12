import { formatReviewTimeAgo, reviewerDisplayName } from '@/lib/publicProfile';
import type { Review } from '@/types';

export type ReviewsSubTab = 'services' | 'project' | 'jobs';

export interface DashboardReviewItem {
  id: string;
  tab: ReviewsSubTab;
  taskTitle?: string;
  authorName: string;
  authorInitials: string;
  avatarBg: string;
  rating: number;
  timeAgo: string;
  content: string;
  response?: string;
  canRespond: boolean;
}

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

export function reviewTabForBudget(budgetType?: string | null): ReviewsSubTab {
  if (budgetType === 'hourly') return 'services';
  if (budgetType === 'fixed') return 'project';
  return 'jobs';
}

export function mapReviewToDashboardItem(review: Review): DashboardReviewItem {
  const authorName = reviewerDisplayName(review.reviewer);
  const relative = formatReviewTimeAgo(review.created_at);
  const timeAgo = relative
    ? `Published ${relative.replace(/^about\s+/i, '')}`
    : 'Published recently';

  return {
    id: String(review.id),
    tab: reviewTabForBudget(review.task_budget_type),
    taskTitle: review.task_title,
    authorName,
    authorInitials: initialsFromReviewer(review.reviewer),
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
  if (tab === 'jobs') {
    return items;
  }
  return items.filter((item) => item.tab === tab);
}
