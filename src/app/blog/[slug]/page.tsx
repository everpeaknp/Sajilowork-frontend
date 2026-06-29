import { notFound } from 'next/navigation';

import { fetchServerBlogPost } from '@/lib/seo/server-blog';

import BlogPostClient from '../BlogPostClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  if (!slug) notFound();

  const post = await fetchServerBlogPost(slug);
  if (!post) notFound();

  return <BlogPostClient post={post} />;
}

export const revalidate = 300;
