'use client';

import { usePathname } from 'next/navigation';

import ListingPageBreadcrumbs from '@/components/seo/ListingPageBreadcrumbs';
import { getStaticPageSerp, type StaticSerpPageKey } from '@/lib/seo';

/** Marketplace index routes that show Home > Section breadcrumbs below the navbar. */
const LISTING_INDEX_ROUTES: Record<string, { serpKey: StaticSerpPageKey; path: string }> = {
  '/freelancers': { serpKey: 'freelancers', path: '/freelancers' },
  '/employers': { serpKey: 'employers', path: '/employers' },
  '/categories': { serpKey: 'categories', path: '/categories' },
};

export default function RouteListingBreadcrumbs() {
  const pathname = usePathname();
  const config = LISTING_INDEX_ROUTES[pathname];
  if (!config) return null;

  const serp = getStaticPageSerp(config.serpKey);
  return (
    <ListingPageBreadcrumbs sectionLabel={serp.breadcrumb} sectionPath={config.path} />
  );
}
