import type { SiteSettings } from '@/lib/siteSettings';

export const DEFAULT_SITE_NAME = 'Sajilowork';
export const GOOGLE_SITE_VERIFICATION = 'hjH7kkL6ZxyL241q-d9X5wcu6dTCnw_vDZC5eWGEbhA';
export const DEFAULT_DESCRIPTION =
  'Hire skilled taskers and freelancers in Nepal. Post tasks, find jobs, book local services, and get work done securely on Sajilowork.';
export const DEFAULT_FAVICON = '/favicon-48x48.png';

export function getAppBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const productionCanonical = 'https://www.sajilowork.com';

  if (configured) {
    const normalized = configured.replace(/\/$/, '');
    // Ignore staging/preview host in production SEO output.
    if (
      process.env.NODE_ENV === 'production' &&
      /everacy\.com/i.test(normalized) &&
      !/sajilowork\.com/i.test(normalized)
    ) {
      return productionCanonical;
    }
    return normalized;
  }
  if (process.env.NODE_ENV === 'production') return productionCanonical;
  return 'http://localhost:3000';
}

/** Canonical public site origin for sitemap, robots, and metadata. */
export async function getCanonicalSiteUrl(): Promise<string> {
  try {
    const { fetchSiteSettings } = await import('@/lib/siteSettings');
    const settings = await fetchSiteSettings();
    if (settings.site_domain?.trim()) {
      return resolveSiteOrigin(settings);
    }
  } catch {
    // Fall back to env-based URL.
  }
  return getAppBaseUrl();
}

export function getApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
    'http://localhost:8000/api/v1'
  );
}

export function resolveSiteOrigin(settings?: Pick<SiteSettings, 'site_domain'>): string {
  const domain = settings?.site_domain?.trim();
  if (domain) {
    const normalized = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `https://${normalized}`;
  }
  return getAppBaseUrl();
}

export function absoluteUrl(path: string, settings?: Pick<SiteSettings, 'site_domain'>): string {
  const base = resolveSiteOrigin(settings);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export function truncateDescription(
  text: string | null | undefined,
  maxLength = 160,
): string {
  const value = (text || '').replace(/\s+/g, ' ').trim();
  if (!value) return DEFAULT_DESCRIPTION;
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trim()}…`;
}

export const NOINDEX_METADATA = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
} as const;
