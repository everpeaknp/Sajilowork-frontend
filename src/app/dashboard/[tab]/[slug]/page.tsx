'use client';

import { notFound, useParams } from 'next/navigation';
import DashboardCreateRoute from '../../DashboardCreateRoute';
import { isDashboardCreateRoute } from '../../dashboardTabs';

export default function DashboardCreateSlugPage() {
  const params = useParams();
  const tab = typeof params.tab === 'string' ? params.tab : '';
  const slug = typeof params.slug === 'string' ? params.slug : '';

  if (!isDashboardCreateRoute(tab, slug)) {
    notFound();
  }

  return <DashboardCreateRoute tab={tab} />;
}
