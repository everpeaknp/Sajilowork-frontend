import { getApiBaseUrl } from './constants';

type FetchOptions = {
  revalidate?: number;
};

export async function fetchPublicJson<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T | null> {
  const revalidate = options.revalidate ?? 300;
  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      next: { revalidate },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export type Paginated<T> = {
  results?: T[];
  next?: string | null;
  count?: number;
};

export async function fetchAllPaginated<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T[]> {
  const items: T[] = [];
  let nextUrl: string | null = `${getApiBaseUrl()}${path}`;
  let guard = 0;

  while (nextUrl && guard < 50) {
    guard += 1;
    try {
      const response = await fetch(nextUrl, { next: { revalidate: options.revalidate ?? 3600 } });
      if (!response.ok) break;
      const data = (await response.json()) as Paginated<T>;
      if (Array.isArray(data.results)) items.push(...data.results);
      nextUrl = data.next || null;
    } catch {
      break;
    }
  }

  return items;
}

export type ListingSeoRecord = {
  title?: string;
  slug?: string;
  description?: string;
  excerpt?: string;
  primary_image?: string | null;
  image?: string | null;
  image_url?: string | null;
  updated_at?: string | null;
  published_at?: string | null;
  created_at?: string | null;
};

export async function fetchListingSeo(
  endpoint: string,
  slug: string,
): Promise<ListingSeoRecord | null> {
  return fetchPublicJson<ListingSeoRecord>(
    `${endpoint}/${encodeURIComponent(slug)}/`,
    { revalidate: 300 },
  );
}

export async function fetchBlogPostSeo(slug: string): Promise<ListingSeoRecord | null> {
  return fetchPublicJson<ListingSeoRecord>(
    `/blog/posts/${encodeURIComponent(slug)}/`,
    { revalidate: 300 },
  );
}
