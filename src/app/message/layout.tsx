import type { Metadata } from 'next';

import { NOINDEX_METADATA } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Messages',
  ...NOINDEX_METADATA,
};

export default function MessageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
