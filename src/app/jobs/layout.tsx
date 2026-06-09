import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jobs | tasknepal',
  description:
    'Browse job listings and find skilled professionals on TaskNepal — designers, developers, and more.',
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
