import type { Metadata } from 'next';

import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: 'Trust and safety',
    description:
      'How Sajilowork keeps employers and freelancers safe — verification, secure payments, and dispute support.',
    path: '/trust-and-safety',
  });
}

export default function TrustAndSafetyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
