import type { Metadata } from 'next';

import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: 'Home and local services',
    description:
      'Book verified local services including cleaning, repairs, moving, and home maintenance across Nepal on Sajilowork.',
    path: '/services',
  });
}

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
