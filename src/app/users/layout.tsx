import type { Metadata } from 'next';

import { NOINDEX_METADATA } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Users',
  ...NOINDEX_METADATA,
};

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
