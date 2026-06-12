import { ALL_PROJECTS, type Project } from './projectListData';

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
