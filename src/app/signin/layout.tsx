import type { Metadata } from 'next';

import { NOINDEX_METADATA } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Sign in',
  ...NOINDEX_METADATA,
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
