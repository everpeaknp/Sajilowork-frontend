import type { Metadata } from 'next';

import { buildNoIndexPageMetadata } from '@/lib/seo';
import DashboardLayout from '@/components/tasker-dashboard/DashboardLayout';

export const metadata: Metadata = buildNoIndexPageMetadata('Tasker dashboard');

export default function TaskerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
