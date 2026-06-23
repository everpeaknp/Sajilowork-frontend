import type { Metadata } from 'next';

import { NOINDEX_METADATA } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Task map',
  ...NOINDEX_METADATA,
};

export default function TaskmapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
