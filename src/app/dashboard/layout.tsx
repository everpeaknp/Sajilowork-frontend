import type { Metadata } from 'next';

import { NOINDEX_METADATA } from '@/lib/seo';

import DashboardClientShell from './DashboardClientShell';

export const metadata: Metadata = {
  title: 'Dashboard',
  ...NOINDEX_METADATA,
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardClientShell>{children}</DashboardClientShell>;
}
