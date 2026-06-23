import type { SiteSettings } from '@/lib/siteSettings';

export const DEFAULT_SITE_NAME = 'Sajilowork';
export const GOOGLE_SITE_VERIFICATION = 'hjH7kkL6ZxyL241q-d9X5wcu6dTCnw_vDZC5eWGEbhA';
export const DEFAULT_DESCRIPTION =
  'Hire skilled taskers and freelancers in Nepal. Post tasks, find jobs, book local services, and get work done securely on Sajilowork.';
export const DEFAULT_FAVICON = '/favicon-48x48.png';
export const DEFAULT_OG_IMAGE_PATH = '/opengraph-image';

export function resolveOgImageUrl(
  settings?: { og_image_url?: string | null; favicon_url?: string | null },
  siteOrigin?: string,
): string {
  const configured = settings?.og_image_url?.trim();
  if (configured) return configured;
  const base = siteOrigin || getAppBaseUrl();
  return `${base.replace(/\/$/, '')}${DEFAULT_OG_IMAGE_PATH}`;
}

const PRODUCTION_CANONICAL_URL = 'https://www.sajilowork.com';

const PLACEHOLDER_SITE_DOMAINS = new Set([
  'example.com',
  'www.example.com',
  'localhost',
  '127.0.0.1',
]);

const PLACEHOLDER_SITE_NAMES = new Set(['example.com', 'example', 'localhost']);

export function isPlaceholderSiteName(name?: string | null): boolean {
  if (!name?.trim()) return true;
  const normalized = name.trim().toLowerCase();
  if (PLACEHOLDER_SITE_NAMES.has(normalized)) return true;
  return normalized.startsWith('localhost');
}

export function isPlaceholderSiteDomain(domain?: string | null): boolean {
  if (!domain?.trim()) return true;
  const normalized = domain.replace(/^https?:\/\//i, '').replace(/\/$/, '').toLowerCase();
  if (PLACEHOLDER_SITE_DOMAINS.has(normalized)) return true;
  return normalized.startsWith('localhost:') || normalized.startsWith('127.0.0.1:');
}

export function getAppBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (configured) {
    const normalized = configured.replace(/\/$/, '');
    // Ignore placeholder/staging hosts in production SEO output.
    if (process.env.NODE_ENV === 'production') {
      if (isPlaceholderSiteDomain(normalized)) {
        return PRODUCTION_CANONICAL_URL;
      }
      if (/everacy\.com/i.test(normalized) && !/sajilowork\.com/i.test(normalized)) {
        return PRODUCTION_CANONICAL_URL;
      }
    }
    return normalized;
  }
  if (process.env.NODE_ENV === 'production') return PRODUCTION_CANONICAL_URL;
  return 'http://localhost:3000';
}

/** Canonical public site origin for sitemap, robots, and metadata. */
export async function getCanonicalSiteUrl(): Promise<string> {
  try {
    const { fetchSiteSettings } = await import('@/lib/siteSettings');
    const settings = await fetchSiteSettings();
    return resolveSiteOrigin(settings);
  } catch {
    return getAppBaseUrl();
  }
}

export function getApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
    'http://localhost:8000/api/v1'
  );
}

export function resolveSiteOrigin(settings?: Pick<SiteSettings, 'site_domain'>): string {
  const domain = settings?.site_domain?.trim();
  if (domain && !isPlaceholderSiteDomain(domain)) {
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
