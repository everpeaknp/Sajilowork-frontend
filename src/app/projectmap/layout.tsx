import type { Metadata } from 'next';

import { buildNoIndexPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildNoIndexPageMetadata('Project map');

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
