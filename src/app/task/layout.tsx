import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tasks',
  description:
    'Browse local tasks and find work near you on TaskNepal — cleaning, delivery, repairs, and more.',
};

export default function TaskBrowseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
