import { fetchPublicJson, type Paginated } from './api';

export type ListingFeedConfig = {
  apiPath: string;
  urlPrefix: string;
  slugKey?: 'slug' | 'username';
};

export type ListingFeedItem = {
  name: string;
  path: string;
};

type FeedRecord = {
  slug?: string;
  username?: string;
  title?: string;
  name?: string;
  full_name?: string;
};

export async function fetchListingFeedItems(
  config: ListingFeedConfig,
  limit = 12,
): Promise<ListingFeedItem[]> {
  const separator = config.apiPath.includes('?') ? '&' : '?';
  const data = await fetchPublicJson<Paginated<FeedRecord>>(
    `${config.apiPath}${separator}page_size=${limit}`,
    { revalidate: 300 },
  );

  const slugKey = config.slugKey ?? 'slug';
  const items: ListingFeedItem[] = [];

  for (const record of data?.results ?? []) {
    const slug = (record[slugKey] || record.slug || record.username || '').trim();
    if (!slug) continue;
    const name =
      record.title?.trim() ||
      record.name?.trim() ||
      record.full_name?.trim() ||
      record.username?.trim() ||
      slug;
    items.push({
      name,
      path: `${config.urlPrefix}/${encodeURIComponent(slug)}`,
    });
  }

  return items;
}

export const LISTING_FEEDS = {
  jobs: { apiPath: '/jobs/', urlPrefix: '/jobs' },
  tasks: { apiPath: '/tasks/?listing_kind=task', urlPrefix: '/task' },
  services: { apiPath: '/services/', urlPrefix: '/services' },
  projects: { apiPath: '/projects/', urlPrefix: '/projects' },
  freelancers: {
    apiPath: '/users/directory/?role=tasker',
    urlPrefix: '/freelancers',
    slugKey: 'username' as const,
  },
  employers: { apiPath: '/employers/', urlPrefix: '/employers' },
  blog: { apiPath: '/blog/posts/', urlPrefix: '/blog' },
  categories: { apiPath: '/tasks/categories/', urlPrefix: '/categories' },
} satisfies Record<string, ListingFeedConfig>;
