import type { Metadata } from 'next';

import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: 'Privacy policy',
    description: 'Learn how Sajilowork collects, uses, and protects your personal information.',
    path: '/privacy',
  });
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
