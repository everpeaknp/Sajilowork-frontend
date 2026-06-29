import { notFound } from 'next/navigation';

import { loadEmployerPageData } from '@/lib/employerApi';

import EmployerSlugPageClient from './EmployerSlugPageClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EmployerSlugPage({ params }: Props) {
  const { slug } = await params;
  if (!slug) notFound();

  const data = await loadEmployerPageData(slug);
  if (!data) notFound();

  return (
    <EmployerSlugPageClient
      employer={data.employer}
      projects={data.projects}
      jobs={data.jobs}
      reviews={data.reviews}
    />
  );
}

export const revalidate = 300;
