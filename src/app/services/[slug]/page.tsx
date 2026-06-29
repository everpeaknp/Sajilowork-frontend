import { notFound } from 'next/navigation';

import { fetchPublicServiceBySlug } from '@/lib/serviceApi';

import ServiceSlugPageClient from './ServiceSlugPageClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ServiceSlugPage({ params }: Props) {
  const { slug } = await params;
  if (!slug) notFound();

  const service = await fetchPublicServiceBySlug(slug);
  if (!service) notFound();

  return <ServiceSlugPageClient service={service} />;
}

export const revalidate = 300;
