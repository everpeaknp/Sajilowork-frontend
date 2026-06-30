/** Public service list browse page. Service detail pages stay at `/services/[slug]`. */
export const SERVICE_BROWSE_PATH = '/services';

/** Service map browse page (list + map). */
export const SERVICE_MAP_PATH = '/servicemap';

export function serviceBrowsePathWithQuery(category?: string | null): string {
  if (!category?.trim()) return SERVICE_BROWSE_PATH;
  return `${SERVICE_BROWSE_PATH}?category=${encodeURIComponent(category.trim())}`;
}

export function serviceMapPathWithQuery(category?: string | null): string {
  if (!category?.trim()) return SERVICE_MAP_PATH;
  return `${SERVICE_MAP_PATH}?category=${encodeURIComponent(category.trim())}`;
}
