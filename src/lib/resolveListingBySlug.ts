import { jobService } from '@/services/job.service';
import { projectService } from '@/services/project.service';
import { serviceService } from '@/services/service.service';
import { taskService } from '@/services/task.service';
import type { Task } from '@/types';

export type ListingKindFilter = 'task' | 'project' | 'job' | 'service';

async function fetchListingIfAvailable(
  fetcher: () => Promise<{ success: boolean; data?: Task | null }>,
): Promise<Task | null> {
  try {
    const response = await fetcher();
    if (response.success && response.data) {
      return response.data;
    }
  } catch {
    // Wrong listing type for this slug (404) — fall through to the next kind.
  }
  return null;
}

/**
 * Resolve a marketplace listing by slug across task/project/job/service APIs.
 * Swallows 404s so mixed dashboard routes can fall through safely.
 */
export async function resolveListingBySlug(
  slug: string,
  listingKinds?: ListingKindFilter[],
): Promise<Task | null> {
  const order: ListingKindFilter[] = listingKinds ?? ['task', 'project', 'job', 'service'];

  for (const kind of order) {
    let task: Task | null = null;

    if (kind === 'project') {
      task = await fetchListingIfAvailable(() => projectService.getProjectBySlug(slug));
    } else if (kind === 'task') {
      task = await fetchListingIfAvailable(() => taskService.getTaskBySlug(slug));
    } else if (kind === 'job') {
      task = await fetchListingIfAvailable(() => jobService.getJobBySlug(slug));
    } else if (kind === 'service') {
      task = await fetchListingIfAvailable(() => serviceService.getServiceBySlug(slug));
    }

    if (task) return task;
  }

  return null;
}
