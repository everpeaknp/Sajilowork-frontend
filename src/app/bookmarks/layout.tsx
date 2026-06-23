import type { Metadata } from 'next';

import { NOINDEX_METADATA } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Bookmarks',
  ...NOINDEX_METADATA,
};

export default function BookmarksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
