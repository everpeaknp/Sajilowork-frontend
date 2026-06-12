'use client';

import { notFound, useParams } from 'next/navigation';
import DashboardProjectDetail from '../../DashboardProjectDetail';

export default function DashboardProjectDetailPage() {
  const params = useParams();
  const projectSlug =
    typeof params.projectSlug === 'string' ? decodeURIComponent(params.projectSlug) : '';

  if (!projectSlug) {
    notFound();
  }

  return <DashboardProjectDetail projectSlug={projectSlug} />;
}
