import type { Metadata } from 'next';

import { NOINDEX_METADATA } from '@/lib/seo';
import DashboardLayout from '@/components/tasker-dashboard/DashboardLayout';

export const metadata: Metadata = {
  title: 'Tasker dashboard',
  ...NOINDEX_METADATA,
};

export default function TaskerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
