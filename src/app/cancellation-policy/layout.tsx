import type { Metadata } from 'next';

import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: 'Cancellation policy',
    description: 'Understand Sajilowork cancellation and refund rules for tasks, services, and bookings.',
    path: '/cancellation-policy',
  });
}

export default function CancellationPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
