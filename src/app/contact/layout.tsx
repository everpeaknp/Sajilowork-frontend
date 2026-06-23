import type { Metadata } from 'next';

import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: 'Contact us',
    description: 'Get in touch with the Sajilowork team for support, partnerships, or general enquiries.',
    path: '/contact',
  });
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
