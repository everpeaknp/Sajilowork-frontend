import type { SiteSettings } from '@/lib/siteSettings';

import { absoluteUrl, getAppBaseUrl, isPlaceholderSiteName, resolveSiteOrigin } from './constants';

function resolveSiteName(settings?: SiteSettings): string {
  const name = settings?.site_name?.trim();
  if (name && !isPlaceholderSiteName(name)) return name;
  return 'Sajilowork';
}

export function buildSchemaGraph(schemas: Array<Record<string, unknown>>) {
  return {
    '@context': 'https://schema.org',
    '@graph': schemas.map((schema) => {
      const { '@context': _removed, ...rest } = schema;
      return rest;
    }),
  };
}

export function buildWebPageSchema(input: {
  title: string;
  description?: string;
  path: string;
  settings?: SiteSettings;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: input.title,
    description: input.description,
    url: absoluteUrl(input.path, input.settings),
    isPartOf: {
      '@type': 'WebSite',
      name: resolveSiteName(input.settings),
      url: resolveSiteOrigin(input.settings),
    },
  };
}

export function buildPersonSchema(input: {
  name: string;
  description?: string;
  path: string;
  image?: string | null;
  jobTitle?: string;
  settings?: SiteSettings;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path, input.settings),
    image: input.image || undefined,
    jobTitle: input.jobTitle || 'Freelancer',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'NP',
    },
  };
}

export function buildEmployerOrganizationSchema(input: {
  name: string;
  description?: string;
  path: string;
  image?: string | null;
  settings?: SiteSettings;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path, input.settings),
    logo: input.image || undefined,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'NP',
    },
  };
}

export function buildOrganizationSchema(settings: SiteSettings) {
  const siteName = resolveSiteName(settings);
  const url = resolveSiteOrigin(settings);
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url,
    logo: settings.favicon_url || absoluteUrl('/favicon-48x48.png', settings),
    ...(settings.contact_email ? { email: settings.contact_email } : {}),
    sameAs: [],
  };
}

export function buildWebsiteSchema(settings: SiteSettings) {
  const siteName = resolveSiteName(settings);
  const url = resolveSiteOrigin(settings);
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url,
    description: settings.meta_description || undefined,
  };
}

export function buildBreadcrumbSchema(
  items: Array<{ name: string; path: string }>,
  settings?: SiteSettings,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, settings),
    })),
  };
}

export function buildFaqPageSchema(
  items: Array<{ question: string; answer: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function buildArticleSchema(input: {
  title: string;
  description?: string;
  path: string;
  image?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  settings?: SiteSettings;
}) {
  const publisherName = resolveSiteName(input.settings);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    image: input.image ? [input.image] : undefined,
    datePublished: input.publishedAt || undefined,
    dateModified: input.updatedAt || input.publishedAt || undefined,
    mainEntityOfPage: absoluteUrl(input.path, input.settings),
    publisher: {
      '@type': 'Organization',
      name: publisherName,
      logo: {
        '@type': 'ImageObject',
        url: input.settings?.favicon_url || absoluteUrl('/favicon-48x48.png', input.settings),
      },
    },
  };
}

export function buildJobPostingSchema(input: {
  title: string;
  description: string;
  path: string;
  datePosted?: string | null;
  settings?: SiteSettings;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: input.title,
    description: input.description,
    datePosted: input.datePosted || undefined,
    hiringOrganization: {
      '@type': 'Organization',
      name: resolveSiteName(input.settings),
      sameAs: getAppBaseUrl(),
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'NP',
      },
    },
    url: absoluteUrl(input.path, input.settings),
  };
}

export function buildServiceSchema(input: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  settings?: SiteSettings;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.title,
    description: input.description,
    provider: {
      '@type': 'Organization',
      name: resolveSiteName(input.settings),
    },
    areaServed: {
      '@type': 'Country',
      name: 'Nepal',
    },
    url: absoluteUrl(input.path, input.settings),
    image: input.image || undefined,
  };
}
