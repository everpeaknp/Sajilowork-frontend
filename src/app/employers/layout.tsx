import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Employers',
  description:
    'Browse verified employer companies and talent partners on TaskNepal — agencies, studios, and hiring organizations.',
};

export default function EmployersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
