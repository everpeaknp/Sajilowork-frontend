import type { Metadata } from 'next';

import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: 'Discover tasks, jobs, and services',
    description:
      'Explore categories, trending services, and top taskers on Sajilowork. Find work or hire help across Nepal.',
    path: '/discover',
  });
}

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return children;
}
