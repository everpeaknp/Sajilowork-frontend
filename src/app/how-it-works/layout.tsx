import type { Metadata } from 'next';

import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: 'How it works',
    description:
      'See how Sajilowork works for employers and freelancers — post tasks, apply for jobs, and get paid securely in Nepal.',
    path: '/how-it-works',
  });
}

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
