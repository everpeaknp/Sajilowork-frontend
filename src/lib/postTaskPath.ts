import { getDashboardCreateHref } from '@/app/dashboard/dashboardTabs';

/** Dashboard route for creating a new marketplace task. */
export const POST_TASK_PATH = getDashboardCreateHref('task');

export function postTaskHref(options?: {
  title?: string;
  from?: 'similar';
  category?: string;
}): string {
  const params = new URLSearchParams();
  if (options?.title?.trim()) params.set('title', options.title.trim());
  if (options?.from) params.set('from', options.from);
  if (options?.category?.trim()) params.set('category', options.category.trim());
  const query = params.toString();
  return query ? `${POST_TASK_PATH}?${query}` : POST_TASK_PATH;
}

export function postTaskSignInRedirect(options?: Parameters<typeof postTaskHref>[0]): string {
  return `/signin?redirect=${encodeURIComponent(postTaskHref(options))}`;
}
