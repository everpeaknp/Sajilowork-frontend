import type { Metadata } from 'next';

import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: 'Help centre',
    description: 'Find answers and guidance on using Sajilowork — posting tasks, hiring, payments, and account help.',
    path: '/help',
  });
}

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
