import type { Metadata } from 'next';

import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: 'Blog & Tips',
    description:
      'Read guides, tips, and marketplace insights for hiring freelancers and growing your business in Nepal on Sajilowork.',
    path: '/blog',
  });
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
