import type { MetadataRoute } from 'next';

import { fetchAllPaginated } from '@/lib/seo/api';
import { getCanonicalSiteUrl } from '@/lib/seo/constants';

type SlugRecord = {
  slug: string;
  updated_at?: string | null;
  published_at?: string | null;
  created_at?: string | null;
};

const STATIC_ROUTES: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
  { path: '/', priority: 1, changeFrequency: 'daily' },
  { path: '/discover', priority: 0.9, changeFrequency: 'daily' },
  { path: '/jobs', priority: 0.9, changeFrequency: 'hourly' },
  { path: '/task', priority: 0.9, changeFrequency: 'hourly' },
  { path: '/services', priority: 0.9, changeFrequency: 'hourly' },
  { path: '/projects', priority: 0.8, changeFrequency: 'hourly' },
  { path: '/freelancers', priority: 0.8, changeFrequency: 'daily' },
  { path: '/employers', priority: 0.7, changeFrequency: 'daily' },
  { path: '/blog', priority: 0.8, changeFrequency: 'daily' },
  { path: '/about', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/how-it-works', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/categories', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/contact', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/trust-and-safety', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/help', priority: 0.5, changeFrequency: 'monthly' },
];

function lastModified(record?: SlugRecord): Date | undefined {
  const value = record?.updated_at || record?.published_at || record?.created_at;
  return value ? new Date(value) : undefined;
}

function listingEntries(
  base: string,
  prefix: string,
  records: SlugRecord[],
  priority: number,
): MetadataRoute.Sitemap {
  return records
    .filter((record) => record.slug)
    .map((record) => ({
      url: `${base}${prefix}/${record.slug}`,
      lastModified: lastModified(record),
      changeFrequency: 'weekly' as const,
      priority,
    }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await getCanonicalSiteUrl();

  let jobs: SlugRecord[] = [];
  let tasks: SlugRecord[] = [];
  let services: SlugRecord[] = [];
  let projects: SlugRecord[] = [];
  let blogPosts: SlugRecord[] = [];

  try {
    [jobs, tasks, services, projects, blogPosts] = await Promise.all([
      fetchAllPaginated<SlugRecord>('/jobs/?page_size=100', { revalidate: 3600 }),
      fetchAllPaginated<SlugRecord>('/tasks/?listing_kind=task&page_size=100', { revalidate: 3600 }),
      fetchAllPaginated<SlugRecord>('/services/?page_size=100', { revalidate: 3600 }),
      fetchAllPaginated<SlugRecord>('/projects/?page_size=100', { revalidate: 3600 }),
      fetchAllPaginated<SlugRecord>('/blog/posts/?page_size=100', { revalidate: 3600 }),
    ]);
  } catch {
    // Static routes are still published when listing APIs are unavailable.
  }

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${base}${route.path}`,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...listingEntries(base, '/jobs', jobs, 0.8),
    ...listingEntries(base, '/task', tasks, 0.8),
    ...listingEntries(base, '/services', services, 0.8),
    ...listingEntries(base, '/projects', projects, 0.7),
    ...listingEntries(base, '/blog', blogPosts, 0.7),
  ];
}
