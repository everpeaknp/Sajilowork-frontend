import type { Metadata } from 'next';

import { NOINDEX_METADATA } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Post a task',
  ...NOINDEX_METADATA,
};

export default function PostTaskLayout({ children }: { children: React.ReactNode }) {
  return children;
}
