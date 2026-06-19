'use client';

import dynamic from 'next/dynamic';

const DashboardShell = dynamic(() => import('./DashboardShell'), {
  loading: () => (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#f0efec]">
      <p className="text-sm text-neutral-500">Loading dashboard…</p>
    </div>
  ),
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
