'use client';

import { notFound, useParams } from 'next/navigation';
import DashboardTabContent from '../DashboardTabContent';
import { isDashboardTab } from '../dashboardTabs';

export default function DashboardTabPage() {
  const params = useParams();
  const tab = typeof params.tab === 'string' ? params.tab : '';

  if (!isDashboardTab(tab) || tab === 'dashboard') {
    notFound();
  }

  return <DashboardTabContent />;
}
