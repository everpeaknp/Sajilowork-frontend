import type { Metadata } from 'next';

import { NOINDEX_METADATA } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Forgot password',
  ...NOINDEX_METADATA,
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
