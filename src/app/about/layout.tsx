import type { Metadata } from 'next';

import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: 'About Sajilowork',
    description:
      'Learn about Sajilowork — Nepal’s marketplace to hire taskers, find freelance jobs, and book local services securely.',
    path: '/about',
  });
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
