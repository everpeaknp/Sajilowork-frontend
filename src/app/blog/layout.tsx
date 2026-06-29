import type { Metadata } from 'next';

import ListingIndexJsonLd from '@/components/seo/ListingIndexJsonLd';
import ListingPageBreadcrumbs from '@/components/seo/ListingPageBreadcrumbs';
import { buildPageMetadata, getStaticPageSerp, LISTING_FEEDS } from '@/lib/seo';

const serp = getStaticPageSerp('blog');

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: serp.title,
    description: serp.description,
    path: '/blog',
  });
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ListingIndexJsonLd
        title={serp.title}
        description={serp.description}
        path="/blog"
        breadcrumbLabel={serp.breadcrumb}
        feed={LISTING_FEEDS.blog}
      />
      <ListingPageBreadcrumbs sectionLabel={serp.breadcrumb} sectionPath="/blog" />
      {children}
    </>
  );
}

export const revalidate = 300;
