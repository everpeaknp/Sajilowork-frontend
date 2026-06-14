import { getAllJobsIncludingPosted } from './jobStore';
import type { Job } from './jobListData';
import type { Task } from '@/types';
import { getDashboardEditHref } from '@/app/dashboard/dashboardTabs';

/** Minimal task shape for bid/application submission from a job listing. */
export function jobToOfferTask(job: Job): Task {
  const budgetAmount =
    job.budgetMin > 0
      ? job.budgetMin
      : job.budgetMax > 0
        ? job.budgetMax
        : 0;

  return {
    id: job.id,
    title: job.title,
    slug: job.slug,
    description: job.description,
    budget_type: job.type === 'Hourly' ? 'hourly' : 'fixed',
    budget_amount: budgetAmount,
    budget_min: job.budgetMin,
    budget_max: job.budgetMax,
    location_type: job.location === 'Remote' ? 'remote' : 'in_person',
    status: 'open',
    owner: job.ownerId ? ({ id: job.ownerId } as Task['owner']) : undefined,
  } as Task;
}

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

export function getJobEditHref(job: Job): string {
  return getDashboardEditHref('jobs', getJobSlug(job));
}

export function isJobOwner(job: Job, userId?: string | number | null): boolean {
  return Boolean(userId) && Boolean(job.ownerId) && String(userId) === String(job.ownerId);
}
