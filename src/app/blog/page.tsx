import { fetchServerBlogPosts } from '@/lib/seo/server-blog';
import type { BlogPost } from '@/types/blog';

import BlogIndexClient from './BlogIndexClient';

export default async function BlogIndexPage() {
  let posts: BlogPost[] = [];

  try {
    posts = await fetchServerBlogPosts(50);
  } catch {
    // Empty state shown in client shell.
  }

  return <BlogIndexClient posts={posts} />;
}

export const revalidate = 300;
