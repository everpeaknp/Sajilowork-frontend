'use client';

import dynamic from 'next/dynamic';
import DashboardLoadingFallback from './DashboardLoadingFallback';

const DashboardShell = dynamic(() => import('./DashboardShell'), {
  loading: () => <DashboardLoadingFallback />,
});

export default function DashboardClientShell({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
