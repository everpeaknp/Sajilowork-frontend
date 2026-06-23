import type { Metadata } from 'next';

import { NOINDEX_METADATA } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Payment',
  ...NOINDEX_METADATA,
};

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
