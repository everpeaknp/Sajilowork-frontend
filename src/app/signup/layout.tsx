import type { Metadata } from 'next';

import { NOINDEX_METADATA } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Sign up',
  ...NOINDEX_METADATA,
};

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
