import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Freelancers',
  description:
    'Browse verified freelancers on TaskNepal — designers, developers, writers, and specialists across Nepal.',
};

export default function FreelancersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
