import type { Metadata } from 'next';

import JsonLd from '@/components/seo/JsonLd';
import CrawlableDetailShell from '@/components/seo/CrawlableDetailShell';
import {
  buildBlogPostingSchema,
  buildBreadcrumbSchema,
  buildDetailSerpTitle,
  buildListingMetadata,
  buildSchemaGraph,
  fetchBlogPostSeo,
} from '@/lib/seo';
import { fetchSiteSettings } from '@/lib/siteSettings';

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPostSeo(slug);
  return buildListingMetadata({
    title: post?.title ? buildDetailSerpTitle(post.title, 'Sajilowork Blog') : null,
    description: post?.excerpt || post?.description,
    image: post?.image || post?.image_url,
    path: `/blog/${slug}`,
    type: 'article',
  });
}

export default async function BlogPostLayout({ children, params }: Props) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([fetchBlogPostSeo(slug), fetchSiteSettings()]);

  const path = `/blog/${slug}`;
  const title = post?.title?.trim();

  const schema =
    title &&
    buildSchemaGraph([
      buildBreadcrumbSchema(
        [
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: title, path },
        ],
        settings,
      ),
      buildBlogPostingSchema({
        title,
        description: post?.excerpt || post?.description,
        path,
        image: post?.image || post?.image_url,
        publishedAt: post?.published_at,
        updatedAt: post?.updated_at,
        settings,
      }),
    ]);

  return (
    <>
      {schema ? <JsonLd data={schema} /> : null}
      {title ? (
        <CrawlableDetailShell
          title={title}
          description={post?.excerpt || post?.description}
        />
      ) : null}
      {children}
    </>
  );
}

export const revalidate = 300;
