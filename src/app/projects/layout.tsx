import type { Metadata } from 'next';

import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: 'Projects',
    description:
      'Discover project-based work and hire specialists for design, development, and professional services in Nepal.',
    path: '/projects',
  });
}

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
