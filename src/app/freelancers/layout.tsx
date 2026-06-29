import type { Metadata } from 'next';

import ListingIndexJsonLd from '@/components/seo/ListingIndexJsonLd';
import ListingPageBreadcrumbs from '@/components/seo/ListingPageBreadcrumbs';
import { buildPageMetadata, getStaticPageSerp, LISTING_FEEDS } from '@/lib/seo';

const serp = getStaticPageSerp('freelancers');

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: serp.title,
    description: serp.description,
    path: '/freelancers',
  });
}

export default function FreelancersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ListingIndexJsonLd
        title={serp.title}
        description={serp.description}
        path="/freelancers"
        breadcrumbLabel={serp.breadcrumb}
        feed={LISTING_FEEDS.freelancers}
      />
      <ListingPageBreadcrumbs sectionLabel={serp.breadcrumb} sectionPath="/freelancers" />
      {children}
    </>
  );
}

export const revalidate = 300;
