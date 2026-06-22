import type { Metadata } from 'next';

import { NOINDEX_METADATA } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Search',
  ...NOINDEX_METADATA,
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
