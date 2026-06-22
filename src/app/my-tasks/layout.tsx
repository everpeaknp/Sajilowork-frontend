import type { Metadata } from 'next';

import { NOINDEX_METADATA } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'My tasks',
  ...NOINDEX_METADATA,
};

export default function MyTasksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
