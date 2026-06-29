import type { Metadata } from 'next';

import ListingIndexJsonLd from '@/components/seo/ListingIndexJsonLd';
import ListingPageBreadcrumbs from '@/components/seo/ListingPageBreadcrumbs';
import { buildPageMetadata, getStaticPageSerp, LISTING_FEEDS } from '@/lib/seo';

const serp = getStaticPageSerp('projects');

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: serp.title,
    description: serp.description,
    path: '/projects',
  });
}

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ListingIndexJsonLd
        title={serp.title}
        description={serp.description}
        path="/projects"
        breadcrumbLabel={serp.breadcrumb}
        feed={LISTING_FEEDS.projects}
      />
      <ListingPageBreadcrumbs sectionLabel={serp.breadcrumb} sectionPath="/projects" />
      {children}
    </>
  );
}

export const revalidate = 300;
