import type { Metadata } from 'next';

import { NOINDEX_METADATA } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Verify email',
  ...NOINDEX_METADATA,
};

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
