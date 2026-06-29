import type { Metadata } from 'next';

import { fetchSiteSettings, type SiteSettings } from '@/lib/siteSettings';

import {
  DEFAULT_DESCRIPTION,
  DEFAULT_FAVICON,
  DEFAULT_SITE_NAME,
  GOOGLE_SITE_VERIFICATION,
  NOINDEX_METADATA,
  absoluteUrl,
  isPlaceholderSiteName,
  resolveOgImageUrl,
  resolveSiteOrigin,
} from './constants';
import { optimizeSerpDescription, optimizeSerpTitle } from './serp';

export type PageSeoInput = {
  title: string;
  description?: string | null;
  path: string;
  image?: string | null;
  type?: 'website' | 'article';
  noindex?: boolean;
  settings?: SiteSettings;
};

export async function getSiteSettingsForSeo(): Promise<SiteSettings> {
  return fetchSiteSettings();
}

export function buildNoIndexPageMetadata(title: string): Metadata {
  const pageTitle = title.trim();
  return {
    title: {
      absolute: `${pageTitle} | ${DEFAULT_SITE_NAME}`,
    },
    ...NOINDEX_METADATA,
  };
}

export function buildSiteMetadata(settings: SiteSettings): Metadata {
  const siteName =
    settings.site_name?.trim() && !isPlaceholderSiteName(settings.site_name)
      ? settings.site_name.trim()
      : DEFAULT_SITE_NAME;
  const description = optimizeSerpDescription(
    settings.meta_description || DEFAULT_DESCRIPTION,
    DEFAULT_DESCRIPTION,
  );
  const favicon = settings.favicon_url || DEFAULT_FAVICON;
  const siteOrigin = resolveSiteOrigin(settings);
  const ogImage = resolveOgImageUrl(settings, siteOrigin);
  const metadataBase = new URL(siteOrigin);

  return {
    metadataBase,
    applicationName: siteName,
    category: 'business',
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
    title: {
      default: optimizeSerpTitle('Hire Taskers & Freelancers in Nepal'),
      template: `%s | ${siteName}`,
    },
    description,
    keywords: [
      'Sajilowork',
      'tasks Nepal',
      'freelancers Nepal',
      'local services Nepal',
      'hire taskers',
      'jobs Nepal',
      'marketplace Nepal',
    ],
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    alternates: {
      languages: {
        'en-NP': siteOrigin,
        en: siteOrigin,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'en_NP',
      alternateLocale: ['en_US'],
      url: metadataBase.toString(),
      siteName,
      title: optimizeSerpTitle(`${siteName} — Nepal Marketplace`),
      description,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: siteName }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: optimizeSerpTitle(`${siteName} — Nepal Marketplace`),
      description,
      images: ogImage ? [ogImage] : [],
      ...(settings.twitter_handle
        ? { site: `@${settings.twitter_handle}`, creator: `@${settings.twitter_handle}` }
        : {}),
    },
    icons: {
      icon: [
        { url: '/icon', sizes: '32x32', type: 'image/png' },
        { url: favicon, sizes: '48x48', type: 'image/png' },
      ],
      shortcut: '/icon',
      apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
    },
    verification: {
      google: GOOGLE_SITE_VERIFICATION,
    },
  };
}

export async function buildPageMetadata(input: PageSeoInput): Promise<Metadata> {
  const settings = input.settings ?? (await getSiteSettingsForSeo());
  const siteName =
    settings.site_name?.trim() && !isPlaceholderSiteName(settings.site_name)
      ? settings.site_name.trim()
      : DEFAULT_SITE_NAME;
  const title = optimizeSerpTitle(input.title.trim());
  const description = optimizeSerpDescription(
    input.description || settings.meta_description,
    settings.meta_description || DEFAULT_DESCRIPTION,
  );
  const canonical = absoluteUrl(input.path, settings);
  const siteOrigin = resolveSiteOrigin(settings);
  const image =
    input.image || resolveOgImageUrl(settings, siteOrigin);
  const type = input.type || 'website';

  return {
    title: {
      absolute: `${title} | ${siteName}`,
    },
    description,
    alternates: {
      canonical,
      languages: {
        'en-NP': canonical,
        en: canonical,
      },
    },
    robots: input.noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true },
        },
    openGraph: {
      type,
      locale: 'en_NP',
      alternateLocale: ['en_US'],
      url: canonical,
      siteName,
      title: `${title} | ${siteName}`,
      description,
      images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${siteName}`,
      description,
      images: image ? [image] : [],
      ...(settings.twitter_handle
        ? { site: `@${settings.twitter_handle}`, creator: `@${settings.twitter_handle}` }
        : {}),
    },
  };
}

export async function buildListingMetadata(
  input: Omit<PageSeoInput, 'title'> & { title?: string | null },
): Promise<Metadata> {
  if (!input.title?.trim()) {
    return buildPageMetadata({
      ...input,
      title: 'Listing',
      noindex: true,
    });
  }
  return buildPageMetadata({
    ...input,
    title: input.title.trim(),
  });
}
