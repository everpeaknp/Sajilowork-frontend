export type SiteSettings = {
  site_name: string;
  display_name: string;
  site_domain: string;
  logo_url: string | null;
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
  const { getApiBaseUrl, isPlaceholderSiteDomain, isPlaceholderSiteName } =
    await import('@/lib/seo/constants');
  try {
    const response = await fetch(`${getApiBaseUrl()}/site/settings/`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) throw new Error('Failed to load site settings');
    const data = (await response.json()) as SiteSettings;
    return {
      ...data,
      site_name:
        data.site_name?.trim() && !isPlaceholderSiteName(data.site_name)
          ? data.site_name.trim()
          : 'Sajilowork',
      display_name:
        data.display_name?.trim() && !isPlaceholderSiteName(data.display_name)
          ? data.display_name.trim()
          : data.site_name?.trim() && !isPlaceholderSiteName(data.site_name)
            ? data.site_name.trim()
            : 'Sajilowork',
      site_domain:
        data.site_domain?.trim() && !isPlaceholderSiteDomain(data.site_domain)
          ? data.site_domain.trim()
          : '',
    };
  } catch {
    return {
      site_name: 'Sajilowork',
      display_name: 'Sajilowork',
      site_domain: '',
      logo_url: null,
      favicon_url: null,
      meta_description: null,
      og_image_url: null,
      twitter_handle: null,
      contact_email: null,
      same_as: [],
    };
  }
}
