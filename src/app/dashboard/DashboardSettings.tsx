'use client';

import { Suspense } from 'react';
import Settings from '@/components/tasker-dashboard/Settings';
import { DASHBOARD_PAGE_ROOT } from './dashboardResponsive';

function SettingsFallback() {
  return (
    <div className={DASHBOARD_PAGE_ROOT}>
      <div className="mx-auto max-w-7xl animate-pulse rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none md:p-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="mb-3 rounded-xl border border-neutral-200/90 bg-neutral-50/50 p-5 dark:border-neutral-800 dark:bg-neutral-950/50"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-48 rounded-lg bg-neutral-100 dark:bg-neutral-800" />
              <div className="h-8 w-8 rounded-lg bg-neutral-100 dark:bg-neutral-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardSettings() {
  return (
    <Suspense fallback={<SettingsFallback />}>
      <Settings appearance="dashboard" showDeactivate={false} />
    </Suspense>
  );
}
