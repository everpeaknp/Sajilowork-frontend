import { getApiBaseUrl } from './constants';

type FetchOptions = {
  revalidate?: number;
};

function resolvePaginatedNextUrl(next: string | null | undefined, apiBase: string): string | null {
  if (!next) return null;
  if (next.startsWith('http://') || next.startsWith('https://')) {
    try {
      const parsed = new URL(next);
      const api = new URL(apiBase);
      if (parsed.origin !== api.origin) {
        return `${apiBase}${parsed.pathname}${parsed.search}`;
      }
    } catch {
      return null;
    }
  }
  if (next.startsWith('/')) {
    return `${apiBase}${next}`;
  }
  return `${apiBase}/${next}`;
}

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
  const apiBase = getApiBaseUrl();
  const items: T[] = [];
  let nextUrl: string | null = `${apiBase}${path}`;
  let guard = 0;

  while (nextUrl && guard < 50) {
    guard += 1;
    try {
      const response = await fetch(nextUrl, { next: { revalidate: options.revalidate ?? 3600 } });
      if (!response.ok) break;
      const data = (await response.json()) as Paginated<T>;
      if (Array.isArray(data.results)) items.push(...data.results);
      nextUrl = resolvePaginatedNextUrl(data.next, apiBase);
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

export type ProfileSeoRecord = {
  slug?: string;
  username?: string;
  full_name?: string;
  name?: string;
  bio?: string;
  tagline?: string;
  description?: string;
  profile_image?: string | null;
  logo_url?: string | null;
  specialization?: string | null;
  industry?: string | null;
  location?: string | null;
  updated_at?: string | null;
  date_joined?: string | null;
  member_since?: string | null;
};

export async function fetchFreelancerSeo(slug: string): Promise<ProfileSeoRecord | null> {
  return fetchPublicJson<ProfileSeoRecord>(`/freelancers/${encodeURIComponent(slug)}/`, {
    revalidate: 300,
  });
}

export async function fetchEmployerSeo(slug: string): Promise<ProfileSeoRecord | null> {
  return fetchPublicJson<ProfileSeoRecord>(`/employers/${encodeURIComponent(slug)}/`, {
    revalidate: 300,
  });
}
