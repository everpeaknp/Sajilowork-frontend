import type { Metadata } from 'next';

import { buildNoIndexPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildNoIndexPageMetadata('Users');

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

