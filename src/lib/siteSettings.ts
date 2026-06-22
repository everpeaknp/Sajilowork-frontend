import type { Metadata } from 'next';

export type SiteSettings = {
  site_name: string;
  site_domain: string;
  favicon_url: string | null;
};

const DEFAULT_SITE_NAME = 'Sajilowork';
const DEFAULT_FAVICON = '/favicon-48x48.png';

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

  try {
    const response = await fetch(`${apiBase}/site/settings/`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) {
      throw new Error('Failed to load site settings');
    }
    return (await response.json()) as SiteSettings;
  } catch {
    return {
      site_name: DEFAULT_SITE_NAME,
      site_domain: '',
      favicon_url: null,
    };
  }
}

export function buildSiteMetadata(settings: SiteSettings): Metadata {
  const siteName = settings.site_name?.trim() || DEFAULT_SITE_NAME;
  const favicon = settings.favicon_url || DEFAULT_FAVICON;

  return {
    applicationName: siteName,
    title: {
      default: `${siteName} - Get Things Done`,
      template: `%s | ${siteName}`,
    },
    description:
      'Connect with skilled taskers to get your tasks done quickly and efficiently',
    icons: {
      icon: [{ url: favicon, sizes: '48x48', type: 'image/png' }],
      shortcut: favicon,
      apple: favicon,
    },
  };
}
