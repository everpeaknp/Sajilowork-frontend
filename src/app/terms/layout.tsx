import type { Metadata } from 'next';

import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: 'Terms of service',
    description: 'Read the Sajilowork terms of service governing use of our marketplace platform in Nepal.',
    path: '/terms',
  });
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
