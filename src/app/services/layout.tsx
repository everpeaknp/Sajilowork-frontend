import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services | tasknepal',
  description:
    'Browse home services on TaskNepal — cleaning, moving, repairs, and more from verified local taskers.',
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
