import { formatDistanceToNow } from 'date-fns';
import type { Review, PaginatedResponse, UserSkill } from '@/types';
import type { PublicProfileReview } from '@/types/publicProfile';

export type ProfileSkillGroups = {
  skill: UserSkill[];
  transport: UserSkill[];
  language: UserSkill[];
  qualification: UserSkill[];
  experience: UserSkill[];
};

/** Split dashboard “skills” rows by category (transport/language are not task skills). */
export function groupProfileSkills(
  items: UserSkill[] | null | undefined,
): ProfileSkillGroups {
  const groups: ProfileSkillGroups = {
    skill: [],
    transport: [],
    language: [],
    qualification: [],
    experience: [],
  };

  for (const item of items ?? []) {
    const category = (item.category || 'skill').trim().toLowerCase();
    if (category in groups) {
      groups[category as keyof ProfileSkillGroups].push(item);
    } else {
      groups.skill.push(item);
    }
  }

  return groups;
}

export function extractReviewList(
  data: Review[] | PaginatedResponse<Review> | null | undefined
): PublicProfileReview[] {
  if (!data) return [];
  const list = Array.isArray(data) ? data : data.results ?? [];
  return list.map(normalizePublicReview);
}

export function normalizePublicReview(review: Review): PublicProfileReview {
  const r = review as Review & {
    overall_rating?: number;
    review_text?: string;
    reviewed_user?: Review['reviewee'];
  };
  return {
    id: String(review.id),
    task: review.task as string | undefined,
    task_title: (review as { task_title?: string }).task_title,
    rating: Number(review.rating ?? r.overall_rating ?? 5),
    comment: review.comment ?? r.review_text ?? '',
    reviewer: review.reviewer as PublicProfileReview['reviewer'],
    created_at: review.created_at,
  };
}

export function formatProfileRating(value: number | string | undefined): string {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num) || num <= 0) return '—';
  return num.toFixed(1).replace(/\.0$/, '');
}

export function formatCompletionRate(
  rate: number | string | undefined,
  tasksCompleted?: number
): string {
  const num = Number(rate ?? 0);
  if (Number.isFinite(num) && num > 0) {
    return `${Math.round(num)}%`;
  }
  if (tasksCompleted && tasksCompleted > 0) {
    return '—';
  }
  return '—';
}

export function formatReviewTimeAgo(iso?: string): string {
  if (!iso) return '';
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return '';
  }
}

export function reviewerDisplayName(
  reviewer: PublicProfileReview['reviewer']
): string {
  if (!reviewer) return 'User';
  if (reviewer.full_name) {
    const parts = reviewer.full_name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[parts.length - 1][0]}.`;
    }
    return reviewer.full_name;
  }
  const first = reviewer.first_name || '';
  const last = reviewer.last_name || '';
  if (first && last) return `${first} ${last[0]}.`;
  return first || last || 'User';
}
