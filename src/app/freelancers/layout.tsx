import type { Metadata } from 'next';

import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: 'Freelancers in Nepal',
    description:
      'Browse verified freelancers — designers, developers, writers, and specialists available for hire on Sajilowork.',
    path: '/freelancers',
  });
}

export default function FreelancersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
