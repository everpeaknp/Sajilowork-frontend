import type { Metadata } from 'next';

import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: 'Hire skilled taskers and get things done',
    description:
      'Post tasks, hire local taskers, find freelance jobs, and book services across Nepal. Secure payments and trusted marketplace on Sajilowork.',
    path: '/',
  });
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
