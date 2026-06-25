import { ALL_PROJECTS, type Project } from './projectListData';

const STORAGE_KEY = 'sajilowork-posted-projects';

let postedProjects: Project[] = [];

function readStoredProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Project[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredProjects(projects: Project[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function hydratePostedProjects() {
  postedProjects = readStoredProjects();
}

export function getPostedProjects(): Project[] {
  if (postedProjects.length === 0) {
    postedProjects = readStoredProjects();
  }
  return postedProjects;
}

export function getAllProjectsIncludingPosted(): Project[] {
  const posted = getPostedProjects();
  const postedIds = new Set(posted.map((project) => project.id));
  const seeded = ALL_PROJECTS.filter((project) => !postedIds.has(project.id));
  return [...posted, ...seeded];
}

export function addPostedProject(project: Project) {
  postedProjects = [project, ...getPostedProjects().filter((item) => item.id !== project.id)];
  writeStoredProjects(postedProjects);
}
