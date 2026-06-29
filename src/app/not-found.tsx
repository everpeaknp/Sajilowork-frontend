import type { Metadata } from 'next';

import NotFoundView from '@/app/not-found-view';
import { buildNoIndexPageMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...buildNoIndexPageMetadata('Page not found'),
  description: 'The page you requested could not be found on Sajilowork.',
};

export default function NotFound() {
  return <NotFoundView />;
}
