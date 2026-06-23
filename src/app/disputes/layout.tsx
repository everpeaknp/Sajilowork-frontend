import type { Metadata } from 'next';

import { NOINDEX_METADATA } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Disputes',
  ...NOINDEX_METADATA,
};

export default function DisputesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
