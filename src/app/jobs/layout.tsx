import type { Metadata } from 'next';

import ListingIndexJsonLd from '@/components/seo/ListingIndexJsonLd';
import ListingPageBreadcrumbs from '@/components/seo/ListingPageBreadcrumbs';
import { buildPageMetadata, getStaticPageSerp, LISTING_FEEDS } from '@/lib/seo';

const serp = getStaticPageSerp('jobs');

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: serp.title,
    description: serp.description,
    path: '/jobs',
  });
}

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ListingIndexJsonLd
        title={serp.title}
        description={serp.description}
        path="/jobs"
        breadcrumbLabel={serp.breadcrumb}
        feed={LISTING_FEEDS.jobs}
      />
      <ListingPageBreadcrumbs sectionLabel={serp.breadcrumb} sectionPath="/jobs" />
      {children}
    </>
  );
}

export const revalidate = 300;
