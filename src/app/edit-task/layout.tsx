import type { Metadata } from 'next';

import { NOINDEX_METADATA } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Edit task',
  ...NOINDEX_METADATA,
};

export default function EditTaskLayout({ children }: { children: React.ReactNode }) {
  return children;
}
