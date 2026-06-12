'use client';

import { notFound, useParams } from 'next/navigation';
import DashboardProposalsProject from '../../DashboardProposalsProject';

export default function DashboardProposalsProjectPage() {
  const params = useParams();
  const projectSlug =
    typeof params.projectSlug === 'string' ? decodeURIComponent(params.projectSlug) : '';

  if (!projectSlug) {
    notFound();
  }

  return <DashboardProposalsProject projectSlug={projectSlug} />;
}
