/** Public job list browse page. Job detail pages stay at `/jobs/[slug]`. */
export const JOB_BROWSE_PATH = '/jobs';

/** Job map browse page (list + map). */
export const JOB_MAP_PATH = '/jobmap';

export function jobBrowsePathWithQuery(category?: string | null): string {
  if (!category?.trim()) return JOB_BROWSE_PATH;
  return `${JOB_BROWSE_PATH}?category=${encodeURIComponent(category.trim())}`;
}

export function jobMapPathWithQuery(category?: string | null): string {
  if (!category?.trim()) return JOB_MAP_PATH;
  return `${JOB_MAP_PATH}?category=${encodeURIComponent(category.trim())}`;
}
