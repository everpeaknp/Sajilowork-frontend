import type { Metadata } from 'next';

import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: 'Tasks near you',
    description:
      'Browse local tasks and hire trusted taskers for cleaning, delivery, repairs, moving, and more across Nepal.',
    path: '/task',
  });
}

export default function TaskLayout({ children }: { children: React.ReactNode }) {
  return children;
}
