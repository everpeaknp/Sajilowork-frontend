/** Public project list browse page. Project detail pages stay at `/projects/[slug]`. */
export const PROJECT_BROWSE_PATH = '/projects';

/** Project map browse page (list + map). */
export const PROJECT_MAP_PATH = '/projectmap';

export function projectBrowsePathWithQuery(category?: string | null): string {
  if (!category?.trim()) return PROJECT_BROWSE_PATH;
  return `${PROJECT_BROWSE_PATH}?category=${encodeURIComponent(category.trim())}`;
}

export function projectMapPathWithQuery(category?: string | null): string {
  if (!category?.trim()) return PROJECT_MAP_PATH;
  return `${PROJECT_MAP_PATH}?category=${encodeURIComponent(category.trim())}`;
}
