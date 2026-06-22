import type { Metadata } from 'next';

import JsonLd from '@/components/seo/JsonLd';
import { buildArticleSchema, buildListingMetadata, fetchBlogPostSeo } from '@/lib/seo';
import { fetchSiteSettings } from '@/lib/siteSettings';

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPostSeo(slug);
  return buildListingMetadata({
    title: post?.title,
    description: post?.excerpt || post?.description,
    image: post?.image || post?.image_url,
    path: `/blog/${slug}`,
    type: 'article',
  });
}

export default async function BlogPostLayout({ children, params }: Props) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([fetchBlogPostSeo(slug), fetchSiteSettings()]);

  const schema =
    post?.title &&
    buildArticleSchema({
      title: post.title,
      description: post.excerpt || post.description,
      path: `/blog/${slug}`,
      image: post.image || post.image_url,
      publishedAt: post.published_at,
      updatedAt: post.updated_at,
      settings,
    });

  return (
    <>
      {schema ? <JsonLd data={schema} /> : null}
      {children}
    </>
  );
}
