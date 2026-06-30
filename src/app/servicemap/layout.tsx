import type { Metadata } from 'next';

import { buildNoIndexPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildNoIndexPageMetadata('Service map');

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
