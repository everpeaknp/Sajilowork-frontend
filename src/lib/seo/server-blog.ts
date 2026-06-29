import type { BlogPost, BlogPostDetail } from '@/types/blog';

import { fetchPublicJson, type Paginated } from './api';

export async function fetchServerBlogPosts(pageSize = 50): Promise<BlogPost[]> {
  const data = await fetchPublicJson<Paginated<BlogPost>>(
    `/blog/posts/?page_size=${pageSize}`,
    { revalidate: 300 },
  );
  return data?.results ?? [];
}

export async function fetchServerBlogPost(slug: string): Promise<BlogPostDetail | null> {
  const normalized = slug.trim();
  if (!normalized) return null;
  return fetchPublicJson<BlogPostDetail>(
    `/blog/posts/${encodeURIComponent(normalized)}/`,
    { revalidate: 300 },
  );
}
