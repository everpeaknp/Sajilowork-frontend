'use client';

import { useEffect } from 'react';
import { notFound, useParams, useRouter, useSearchParams } from 'next/navigation';
import DashboardProposalDetail from '../../../DashboardProposalDetail';
import { getDashboardApplicationDetailHref } from '../../../dashboardTabs';

export default function DashboardProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectSlug =
    typeof params.projectSlug === 'string' ? decodeURIComponent(params.projectSlug) : '';
  const bidId = typeof params.bidId === 'string' ? decodeURIComponent(params.bidId) : '';

  // Legacy application links used /proposals/...?from=applications — send them to the dedicated URL.
  useEffect(() => {
    if (!projectSlug || !bidId) return;
    if (searchParams.get('from') !== 'applications') return;
    router.replace(getDashboardApplicationDetailHref(projectSlug, bidId));
  }, [bidId, projectSlug, router, searchParams]);

  if (!projectSlug || !bidId) {
    notFound();
  }

  if (searchParams.get('from') === 'applications') {
    return null;
  }

  return <DashboardProposalDetail projectSlug={projectSlug} bidId={bidId} />;
}
