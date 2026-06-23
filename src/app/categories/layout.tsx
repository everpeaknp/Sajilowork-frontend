import type { Metadata } from 'next';

import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: 'Browse categories',
    description:
      'Explore task, job, service, and project categories on Sajilowork to find the right work or hire help in Nepal.',
    path: '/categories',
  });
}

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
