'use client';

import { notFound, useParams } from 'next/navigation';
import DashboardProposalsProject from '../../DashboardProposalsProject';
import { getDashboardHref } from '../../dashboardTabs';

export default function DashboardApplicationsListingPage() {
  const params = useParams();
  const listingSlug =
    typeof params.listingSlug === 'string' ? decodeURIComponent(params.listingSlug) : '';

  if (!listingSlug) {
    notFound();
  }

  return (
    <DashboardProposalsProject
      projectSlug={listingSlug}
      backHref={getDashboardHref('applications')}
      backLabel="Back to Applications"
      listingKinds={['job']}
      detailFrom="applications"
    />
  );
}
