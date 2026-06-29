import type { Metadata } from 'next';

import ListingIndexJsonLd from '@/components/seo/ListingIndexJsonLd';
import ListingPageBreadcrumbs from '@/components/seo/ListingPageBreadcrumbs';
import { buildPageMetadata, getStaticPageSerp, LISTING_FEEDS } from '@/lib/seo';

const serp = getStaticPageSerp('employers');

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: serp.title,
    description: serp.description,
    path: '/employers',
  });
}

export default function EmployersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ListingIndexJsonLd
        title={serp.title}
        description={serp.description}
        path="/employers"
        breadcrumbLabel={serp.breadcrumb}
        feed={LISTING_FEEDS.employers}
      />
      <ListingPageBreadcrumbs sectionLabel={serp.breadcrumb} sectionPath="/employers" />
      {children}
    </>
  );
}

export const revalidate = 300;
