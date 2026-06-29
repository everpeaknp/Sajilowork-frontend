import { notFound } from 'next/navigation';

import {
  fetchPublicJobBySlug,
  fetchPublicJobs,
  getRelatedJobsFromList,
} from '@/lib/jobApi';

import JobSlugPageClient from './JobSlugPageClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function JobSlugPage({ params }: Props) {
  const { slug } = await params;
  if (!slug) notFound();

  const [job, allJobs] = await Promise.all([
    fetchPublicJobBySlug(slug),
    fetchPublicJobs(),
  ]);

  if (!job) notFound();

  const relatedJobs = getRelatedJobsFromList(job, allJobs, 3);

  return <JobSlugPageClient job={job} relatedJobs={relatedJobs} />;
}

export const revalidate = 300;
