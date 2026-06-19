import dynamic from 'next/dynamic';

const DashboardTabContent = dynamic(() => import('./DashboardTabContent'), {
  loading: () => (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-sm text-neutral-500">Loading…</p>
    </div>
  ),
});

export default function DashboardPage() {
  return <DashboardTabContent />;
}
