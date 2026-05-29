import type { BlogPost } from '@/types/blog';

/** Prefer on-site article page unless an external URL is configured. */
export function getBlogPostHref(post: Pick<BlogPost, 'slug' | 'link_url'>): string {
  const external = (post.link_url || '').trim();
  if (external && /^https?:\/\//i.test(external)) {
    return external;
  }
  return `/blog/${encodeURIComponent(post.slug)}`;
}

export function isExternalBlogHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}
