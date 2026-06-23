import type { Metadata } from 'next';

import { NOINDEX_METADATA } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Authentication',
  ...NOINDEX_METADATA,
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
