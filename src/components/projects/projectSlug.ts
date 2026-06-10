import { ALL_PROJECTS, type Project } from './projectListData';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** URL slug from project title + id, e.g. `food-delivery-mobile-app-1` */
export function getProjectSlug(project: Project): string {
  const num = project.id.replace(/^job-/, '');
  return `${slugify(project.title)}-${num}`;
}

export function findProjectBySlug(
  slug: string,
  projects: Project[] = ALL_PROJECTS,
): Project | undefined {
  const normalized = slug.trim().toLowerCase();
  return projects.find((project) => getProjectSlug(project).toLowerCase() === normalized);
}

export function getProjectDetailPath(project: Project): string {
  return `/projects/${getProjectSlug(project)}`;
}
