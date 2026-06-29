import type { SiteSettings } from '@/lib/siteSettings';

import { absoluteUrl, getAppBaseUrl, isPlaceholderSiteName, resolveSiteOrigin } from './constants';

function resolveSiteName(settings?: SiteSettings): string {
  const name = settings?.site_name?.trim();
  if (name && !isPlaceholderSiteName(name)) return name;
  return 'Sajilowork';
}

export function withAggregateRating<T extends Record<string, unknown>>(
  schema: T,
  rating?: number | null,
  reviewCount?: number | null,
): T {
  const value = typeof rating === 'number' ? rating : null;
  const count = typeof reviewCount === 'number' ? reviewCount : null;
  if (!value || !count || count < 1) return schema;
  return {
    ...schema,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: Number(value.toFixed(1)),
      reviewCount: count,
      bestRating: 5,
      worstRating: 1,
    },
  };
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
    logo: settings.favicon_url || absoluteUrl('/icon', settings),
    ...(settings.contact_email ? { email: settings.contact_email } : {}),
    sameAs: settings.same_as?.length ? settings.same_as : [],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'NP',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Nepal',
    },
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
    inLanguage: 'en-NP',
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/discover?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildCollectionPageSchema(input: {
  name: string;
  description?: string;
  path: string;
  settings?: SiteSettings;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path, input.settings),
    isPartOf: {
      '@type': 'WebSite',
      name: resolveSiteName(input.settings),
      url: resolveSiteOrigin(input.settings),
    },
    inLanguage: 'en-NP',
  };
}

export function buildItemListSchema(input: {
  name: string;
  path: string;
  items: Array<{ name: string; path: string }>;
  settings?: SiteSettings;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: input.name,
    url: absoluteUrl(input.path, input.settings),
    numberOfItems: input.items.length,
    itemListElement: input.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path, input.settings),
    })),
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
    inLanguage: 'en-NP',
    publisher: {
      '@type': 'Organization',
      name: publisherName,
      logo: {
        '@type': 'ImageObject',
        url: input.settings?.favicon_url || absoluteUrl('/icon', input.settings),
      },
    },
  };
}

export function buildBlogPostingSchema(input: {
  title: string;
  description?: string;
  path: string;
  image?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  settings?: SiteSettings;
}) {
  const publisherName = resolveSiteName(input.settings);
  const url = absoluteUrl(input.path, input.settings);
  const origin = resolveSiteOrigin(input.settings);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    description: input.description,
    image: input.image ? [input.image] : undefined,
    datePublished: input.publishedAt || undefined,
    dateModified: input.updatedAt || input.publishedAt || undefined,
    url,
    inLanguage: 'en-NP',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    author: {
      '@type': 'Organization',
      name: publisherName,
      url: origin,
    },
    publisher: {
      '@type': 'Organization',
      name: publisherName,
      logo: {
        '@type': 'ImageObject',
        url: input.settings?.favicon_url || absoluteUrl('/icon', input.settings),
      },
    },
  };
}

export function buildLocalBusinessSchema(input: {
  name: string;
  description: string;
  path: string;
  city: string;
  settings?: SiteSettings;
}) {
  const siteName = resolveSiteName(input.settings);
  const origin = resolveSiteOrigin(input.settings);

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `${siteName} — ${input.city}`,
    description: input.description,
    url: absoluteUrl(input.path, input.settings),
    address: {
      '@type': 'PostalAddress',
      addressLocality: input.city,
      addressCountry: 'NP',
    },
    areaServed: {
      '@type': 'City',
      name: input.city,
    },
    parentOrganization: {
      '@type': 'Organization',
      name: siteName,
      url: origin,
    },
  };
}

export function buildJobPostingSchema(input: {
  title: string;
  description: string;
  path: string;
  datePosted?: string | null;
  employerName?: string | null;
  employerLogo?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  employmentType?: string | null;
  settings?: SiteSettings;
}) {
  const employerName =
    input.employerName?.trim() || resolveSiteName(input.settings);
  const locality = [input.city, input.state].filter(Boolean).join(', ');

  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: input.title,
    description: input.description,
    datePosted: input.datePosted || undefined,
    employmentType: input.employmentType || undefined,
    hiringOrganization: {
      '@type': 'Organization',
      name: employerName,
      ...(input.employerLogo ? { logo: input.employerLogo } : {}),
      ...(!input.employerName?.trim() ? { sameAs: getAppBaseUrl() } : {}),
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        ...(locality ? { addressLocality: locality } : {}),
        addressCountry: input.country || 'NP',
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
  serviceType?: string;
  settings?: SiteSettings;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.title,
    description: input.description,
    ...(input.serviceType ? { serviceType: input.serviceType } : {}),
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

export function buildSoftwareApplicationSchema(settings: SiteSettings) {
  const siteName = resolveSiteName(settings);
  const url = resolveSiteOrigin(settings);

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteName,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url,
    inLanguage: 'en-NP',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'NPR',
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url,
    },
  };
}
