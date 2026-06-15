import { formatDistanceToNow } from 'date-fns';
import type { TaskQuestion } from '@/types';

export type DashboardQuestionsView = 'received' | 'asked';

export interface DashboardQuestionItem extends TaskQuestion {
  task_id?: string;
  task_title?: string;
  task_slug?: string;
  task_listing_kind?: 'task' | 'service' | 'project' | 'job' | null;
  can_answer?: boolean;
}

export function dashboardQuestionsViewForRole(
  role: 'customer' | 'tasker',
): DashboardQuestionsView {
  return role === 'tasker' ? 'asked' : 'received';
}

export function listingQuestionDetailPath(
  slug: string,
  kind?: string | null,
): string {
  switch (kind) {
    case 'service':
      return `/services/${encodeURIComponent(slug)}`;
    case 'job':
      return `/jobs/${encodeURIComponent(slug)}`;
    case 'project':
      return `/projects/${encodeURIComponent(slug)}`;
    default:
      return `/task/${encodeURIComponent(slug)}`;
  }
}

export function formatQuestionTimeAgo(iso?: string | null): string {
  if (!iso) return 'Recently';
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return 'Recently';
  }
}

export function extractDashboardQuestions(
  data: unknown,
): DashboardQuestionItem[] {
  if (Array.isArray(data)) {
    return data as DashboardQuestionItem[];
  }
  if (
    data &&
    typeof data === 'object' &&
    'results' in data &&
    Array.isArray((data as { results: unknown }).results)
  ) {
    return (data as { results: DashboardQuestionItem[] }).results;
  }
  return [];
}
