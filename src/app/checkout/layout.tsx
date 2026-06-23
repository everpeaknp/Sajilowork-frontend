import type { Metadata } from 'next';

import { NOINDEX_METADATA } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Checkout',
  ...NOINDEX_METADATA,
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
