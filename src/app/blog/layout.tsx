import type { Metadata } from 'next';

import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: 'Jobs in Nepal',
    description:
      'Browse open jobs and freelance opportunities across Nepal. Find remote, contract, and full-time roles on Sajilowork.',
    path: '/jobs',
  });
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
