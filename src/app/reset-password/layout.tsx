import type { Metadata } from 'next';

import { NOINDEX_METADATA } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Reset password',
  ...NOINDEX_METADATA,
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
