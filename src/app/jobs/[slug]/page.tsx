import { notFound } from 'next/navigation';

import {
  fetchPublicJobs,
  getRelatedJobsFromList,
  mapTaskToPublicJob,
} from '@/lib/jobApi';
import { fetchPublicJson } from '@/lib/seo/api';
import type { Task } from '@/types';
import type { Job } from '@/components/jobs/jobListData';

import JobSlugPageClient from './JobSlugPageClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function JobSlugPage({ params }: Props) {
  const { slug } = await params;
  if (!slug) notFound();

  // Prefer native fetch for RSC — avoids axios/js-cookie edge cases on the server.
  const raw = await fetchPublicJson<Task>(`/jobs/${encodeURIComponent(slug)}/`, {
    revalidate: 300,
  });
  if (!raw) notFound();

  let job: Job;
  try {
    job = mapTaskToPublicJob(raw);
  } catch (error) {
    console.error('[JobSlugPage] Failed to map job', slug, error);
    notFound();
  }

  // Related jobs are optional — never fail the detail page if the list API errors.
  let relatedJobs: Job[] = [];
  try {
    const allJobs = await fetchPublicJobs({ page_size: 24 });
    relatedJobs = getRelatedJobsFromList(job, allJobs, 3);
  } catch (error) {
    console.error('[JobSlugPage] Related jobs unavailable', slug, error);
  }

  return <JobSlugPageClient job={job} relatedJobs={relatedJobs} />;
}

export const revalidate = 300;
