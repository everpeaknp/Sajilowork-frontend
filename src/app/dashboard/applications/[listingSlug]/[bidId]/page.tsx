'use client';

import { notFound, useParams } from 'next/navigation';
import DashboardProposalDetail from '../../../DashboardProposalDetail';

export default function DashboardApplicationDetailPage() {
  const params = useParams();
  const listingSlug =
    typeof params.listingSlug === 'string' ? decodeURIComponent(params.listingSlug) : '';
  const bidId = typeof params.bidId === 'string' ? decodeURIComponent(params.bidId) : '';

  if (!listingSlug || !bidId) {
    notFound();
  }

  return (
    <DashboardProposalDetail
      projectSlug={listingSlug}
      bidId={bidId}
      detailFrom="applications"
    />
  );
}
