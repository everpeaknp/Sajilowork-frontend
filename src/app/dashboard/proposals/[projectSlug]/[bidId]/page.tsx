'use client';

import { notFound, useParams } from 'next/navigation';
import DashboardProposalDetail from '../../../DashboardProposalDetail';

export default function DashboardProposalDetailPage() {
  const params = useParams();
  const projectSlug =
    typeof params.projectSlug === 'string' ? decodeURIComponent(params.projectSlug) : '';
  const bidId = typeof params.bidId === 'string' ? decodeURIComponent(params.bidId) : '';

  if (!projectSlug || !bidId) {
    notFound();
  }

  return <DashboardProposalDetail projectSlug={projectSlug} bidId={bidId} />;
}
