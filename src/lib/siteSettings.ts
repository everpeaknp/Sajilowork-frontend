export type SiteSettings = {
  site_name: string;
  site_domain: string;
  favicon_url: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  twitter_handle: string | null;
  contact_email: string | null;
  same_as?: string[];
};

export {
  DEFAULT_SITE_NAME,
  DEFAULT_DESCRIPTION,
  DEFAULT_FAVICON,
} from '@/lib/seo/constants';

export { buildSiteMetadata } from '@/lib/seo/metadata';

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const { getApiBaseUrl } = await import('@/lib/seo/constants');
  try {
    const response = await fetch(`${getApiBaseUrl()}/site/settings/`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) throw new Error('Failed to load site settings');
    return (await response.json()) as SiteSettings;
  } catch {
    return {
      site_name: 'Sajilowork',
      site_domain: '',
      favicon_url: null,
      meta_description: null,
      og_image_url: null,
      twitter_handle: null,
      contact_email: null,
      same_as: [],
    };
  }
}
