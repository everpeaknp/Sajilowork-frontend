import type { Metadata } from 'next';

import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: 'Employers and companies',
    description:
      'Explore employer profiles, agencies, and hiring organizations posting jobs and projects on Sajilowork.',
    path: '/employers',
  });
}

export default function EmployersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
