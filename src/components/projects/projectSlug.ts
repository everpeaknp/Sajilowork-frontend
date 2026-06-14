import { ALL_PROJECTS, type Project } from './projectListData';
import type { Task } from '@/types';

/** Minimal task shape for bid/proposal submission from a project listing. */
export function projectToOfferTask(project: Project): Task {
  const budgetAmount =
    project.budgetMin > 0
      ? project.budgetMin
      : project.budgetMax > 0
        ? project.budgetMax
        : 0;

  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    description: project.description,
    budget_type: project.type === 'Hourly' ? 'hourly' : 'fixed',
    budget_amount: budgetAmount,
    budget_min: project.budgetMin,
    budget_max: project.budgetMax,
    location_type: project.location === 'Remote' ? 'remote' : 'in_person',
    status: (project.status ?? 'open') as Task['status'],
    owner: project.ownerId ? ({ id: project.ownerId } as Task['owner']) : undefined,
  } as Task;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** URL slug — API tasks use backend slug; legacy mock cards use title-id pattern. */
export function getProjectSlug(project: Project): string {
  if (project.slug?.trim()) return project.slug.trim();
  const num = project.id.replace(/^job-|^proj-/, '');
  return `${slugify(project.title)}-${num}`;
}

export function findProjectBySlug(slug: string, projects: Project[] = ALL_PROJECTS): Project | undefined {
  const normalized = slug.trim().toLowerCase();
  const byBackendSlug = projects.find(
    (project) => project.slug?.trim().toLowerCase() === normalized,
  );
  if (byBackendSlug) return byBackendSlug;
  return projects.find((project) => getProjectSlug(project).toLowerCase() === normalized);
}

export function getProjectDetailPath(project: Project): string {
  return `/projects/${getProjectSlug(project)}`;
}
