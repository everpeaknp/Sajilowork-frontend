import { getAllJobsIncludingPosted } from './jobStore';
import type { Job } from './jobListData';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** URL slug — prefers backend task slug when available */
export function getJobSlug(job: Job): string {
  if (job.slug?.trim()) return job.slug.trim();
  const num = job.id.replace(/^job-/, '');
  return `${slugify(job.title)}-${num}`;
}

export function findJobBySlug(slug: string, jobs: Job[] = getAllJobsIncludingPosted()): Job | undefined {
  const normalized = slug.trim().toLowerCase();
  return jobs.find((job) => getJobSlug(job).toLowerCase() === normalized);
}

export function getJobDetailPath(job: Job): string {
  return `/jobs/${getJobSlug(job)}`;
}
