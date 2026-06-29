import type { Metadata } from 'next';

import { buildNoIndexPageMetadata } from '@/lib/seo';

import DashboardClientShell from './DashboardClientShell';

export const metadata: Metadata = buildNoIndexPageMetadata('Dashboard');

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardClientShell>{children}</DashboardClientShell>;
}
