'use client';

import { Suspense } from 'react';
import Settings from '@/components/tasker-dashboard/Settings';

function SettingsFallback() {
  return (
    <div className="animate-in fade-in relative -mx-4 -my-6 min-h-screen bg-[#f0efec] px-4 py-4 font-sans sm:-mx-6 sm:px-6 md:-mx-8 md:px-8">
      <div className="mx-auto mb-8 max-w-7xl animate-pulse pl-1">
        <div className="h-9 w-40 rounded-lg bg-neutral-200/80" />
        <div className="mt-3 h-4 w-72 max-w-full rounded bg-neutral-200/60" />
      </div>
      <div className="mx-auto max-w-7xl animate-pulse rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] md:p-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="mb-3 rounded-xl border border-neutral-200/90 bg-neutral-50/50 p-5">
            <div className="flex items-center justify-between">
              <div className="h-10 w-48 rounded-lg bg-neutral-100" />
              <div className="h-8 w-8 rounded-lg bg-neutral-100" />
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
