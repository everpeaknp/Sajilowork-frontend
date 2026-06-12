'use client';

import { notFound, useParams } from 'next/navigation';
import DashboardCreateRoute from '../../../DashboardCreateRoute';
import { isDashboardCreateRoute } from '../../../dashboardTabs';

export default function DashboardEditSlugPage() {
  const params = useParams();
  const tab = typeof params.tab === 'string' ? params.tab : '';
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const itemSlug = typeof params.itemSlug === 'string' ? decodeURIComponent(params.itemSlug) : '';

  if (!isDashboardCreateRoute(tab, slug) || !itemSlug) {
    notFound();
  }

  return <DashboardCreateRoute tab={tab} editSlug={itemSlug} />;
}
