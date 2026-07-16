import { notFound } from 'next/navigation';

import type { Service } from '@/components/services/serviceListData';
import { getListingKind } from '@/lib/dashboardListingApi';
import { mapTaskToPublicService } from '@/lib/serviceApi';
import { fetchPublicJson } from '@/lib/seo/api';
import type { Task } from '@/types';

import ServiceSlugPageClient from './ServiceSlugPageClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ServiceSlugPage({ params }: Props) {
  const { slug } = await params;
  if (!slug) notFound();

  const raw = await fetchPublicJson<Task>(`/services/${encodeURIComponent(slug)}/`, {
    revalidate: 300,
  });
  if (!raw || getListingKind(raw) !== 'service') notFound();

  let service: Service;
  try {
    service = mapTaskToPublicService(raw);
  } catch (error) {
    console.error('[ServiceSlugPage] Failed to map service', slug, error);
    notFound();
  }

  return <ServiceSlugPageClient service={service} />;
}

export const revalidate = 300;
