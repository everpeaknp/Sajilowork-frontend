import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Browse project listings and find skilled professionals on TaskNepal — designers, developers, and more.',
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
