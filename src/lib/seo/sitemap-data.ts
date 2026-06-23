import type { MetadataRoute } from 'next';

import { fetchAllPaginated } from './api';
import { getCanonicalSiteUrl } from './constants';
import { SEO_LOCATION_PAGES } from './locations';

export const SITEMAP_IDS = [
  'static',
  'jobs',
  'tasks',
  'services',
  'projects',
  'blog',
  'freelancers',
  'employers',
  'categories',
] as const;

export type SitemapId = (typeof SITEMAP_IDS)[number];

type SlugRecord = {
  slug?: string;
  username?: string;
  updated_at?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  date_joined?: string | null;
  member_since?: string | null;
};

type StaticRoute = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
};

const STATIC_PAGES: StaticRoute[] = [
  { path: '/', priority: 1, changeFrequency: 'daily' },
  { path: '/discover', priority: 0.9, changeFrequency: 'daily' },
  { path: '/about', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/how-it-works', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/trust-and-safety', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/help', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/terms', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/cancellation-policy', priority: 0.4, changeFrequency: 'yearly' },
];

const INDEX_PAGES: StaticRoute[] = [
  { path: '/jobs', priority: 0.9, changeFrequency: 'hourly' },
  { path: '/task', priority: 0.9, changeFrequency: 'hourly' },
  { path: '/services', priority: 0.9, changeFrequency: 'hourly' },
  { path: '/projects', priority: 0.8, changeFrequency: 'hourly' },
  { path: '/freelancers', priority: 0.8, changeFrequency: 'daily' },
  { path: '/employers', priority: 0.7, changeFrequency: 'daily' },
  { path: '/blog', priority: 0.8, changeFrequency: 'daily' },
  { path: '/categories', priority: 0.7, changeFrequency: 'weekly' },
];

function lastModified(record?: SlugRecord): Date | undefined {
  const value =
    record?.updated_at ||
    record?.published_at ||
    record?.created_at ||
    record?.date_joined ||
    record?.member_since;
  return value ? new Date(value) : undefined;
}

function staticEntries(base: string, routes: StaticRoute[]): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${base}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}

function slugEntries(
  base: string,
  prefix: string,
  records: SlugRecord[],
  priority: number,
  slugKey: 'slug' | 'username' = 'slug',
): MetadataRoute.Sitemap {
  return records
    .map((record) => {
      const slug = (record[slugKey] || record.slug || record.username || '').trim();
      if (!slug) return null;
      return {
        url: `${base}${prefix}/${encodeURIComponent(slug)}`,
        lastModified: lastModified(record),
        changeFrequency: 'weekly' as const,
        priority,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
}

export async function buildSitemapForId(id: SitemapId): Promise<MetadataRoute.Sitemap> {
  const base = await getCanonicalSiteUrl();
  const revalidate = 3600;

  switch (id) {
    case 'static':
      return staticEntries(base, STATIC_PAGES);

    case 'jobs': {
      const jobs = await fetchAllPaginated<SlugRecord>('/jobs/?page_size=100', { revalidate });
      return [
        ...staticEntries(base, [{ path: '/jobs', priority: 0.9, changeFrequency: 'hourly' }]),
        ...slugEntries(base, '/jobs', jobs, 0.8),
      ];
    }

    case 'tasks': {
      const tasks = await fetchAllPaginated<SlugRecord>(
        '/tasks/?listing_kind=task&page_size=100',
        { revalidate },
      );
      return [
        ...staticEntries(base, [{ path: '/task', priority: 0.9, changeFrequency: 'hourly' }]),
        ...slugEntries(base, '/task', tasks, 0.8),
      ];
    }

    case 'services': {
      const services = await fetchAllPaginated<SlugRecord>('/services/?page_size=100', {
        revalidate,
      });
      return [
        ...staticEntries(base, [{ path: '/services', priority: 0.9, changeFrequency: 'hourly' }]),
        ...slugEntries(base, '/services', services, 0.8),
      ];
    }

    case 'projects': {
      const projects = await fetchAllPaginated<SlugRecord>('/projects/?page_size=100', {
        revalidate,
      });
      return [
        ...staticEntries(base, [{ path: '/projects', priority: 0.8, changeFrequency: 'hourly' }]),
        ...slugEntries(base, '/projects', projects, 0.7),
      ];
    }

    case 'blog': {
      const posts = await fetchAllPaginated<SlugRecord>('/blog/posts/?page_size=100', {
        revalidate,
      });
      return [
        ...staticEntries(base, [{ path: '/blog', priority: 0.8, changeFrequency: 'daily' }]),
        ...slugEntries(base, '/blog', posts, 0.7),
      ];
    }

    case 'freelancers': {
      const freelancers = await fetchAllPaginated<SlugRecord>(
        '/users/directory/?role=tasker&page_size=100',
        { revalidate },
      );
      return [
        ...staticEntries(base, [
          { path: '/freelancers', priority: 0.8, changeFrequency: 'daily' },
        ]),
        ...slugEntries(base, '/freelancers', freelancers, 0.75, 'username'),
      ];
    }

    case 'employers': {
      const employers = await fetchAllPaginated<SlugRecord>('/employers/?page_size=100', {
        revalidate,
      });
      return [
        ...staticEntries(base, [
          { path: '/employers', priority: 0.7, changeFrequency: 'daily' },
        ]),
        ...slugEntries(base, '/employers', employers, 0.7),
      ];
    }

    case 'categories': {
      const categories = await fetchAllPaginated<SlugRecord>(
        '/tasks/categories/?page_size=100',
        { revalidate },
      );
      const locationEntries: MetadataRoute.Sitemap = SEO_LOCATION_PAGES.map((location) => ({
        url: `${base}/locations/${location.slug}`,
        changeFrequency: 'weekly',
        priority: 0.65,
      }));
      return [
        ...staticEntries(base, [
          { path: '/categories', priority: 0.7, changeFrequency: 'weekly' },
        ]),
        ...slugEntries(base, '/categories', categories, 0.65),
        ...locationEntries,
      ];
    }

    default:
      return [];
  }
}

/** Legacy single-sitemap builder (static index pages only). */
export async function buildLegacySitemapIndexPages(): Promise<MetadataRoute.Sitemap> {
  const base = await getCanonicalSiteUrl();
  return staticEntries(base, INDEX_PAGES);
}
