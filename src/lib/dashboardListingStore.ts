import type { Job, Project, Service } from '@/app/dashboard/types';

const STORAGE_KEYS = {
  services: 'sajilowork-dashboard-listing-services',
  jobs: 'sajilowork-dashboard-listing-jobs',
  projects: 'sajilowork-dashboard-listing-projects',
} as const;

function readList<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, items: T[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(items));
}

function prependUnique<T extends { id: string }>(key: string, item: T) {
  const next = [item, ...readList<T>(key).filter((row) => row.id !== item.id)];
  writeList(key, next);
}

function removeById<T extends { id: string }>(key: string, id: string) {
  writeList(
    key,
    readList<T>(key).filter((row) => row.id !== id),
  );
}

export function getListingServices(): Service[] {
  return readList<Service>(STORAGE_KEYS.services);
}

export function addListingService(service: Service) {
  prependUnique(STORAGE_KEYS.services, service);
}

export function updateListingService(service: Service) {
  prependUnique(STORAGE_KEYS.services, service);
}

export function removeListingService(id: string) {
  removeById<Service>(STORAGE_KEYS.services, id);
}

export function getListingJobs(): Job[] {
  return readList<Job>(STORAGE_KEYS.jobs);
}

export function addListingJob(job: Job) {
  prependUnique(STORAGE_KEYS.jobs, job);
}

export function updateListingJob(job: Job) {
  prependUnique(STORAGE_KEYS.jobs, job);
}

export function removeListingJob(id: string) {
  removeById<Job>(STORAGE_KEYS.jobs, id);
}

export function getListingProjects(): Project[] {
  return readList<Project>(STORAGE_KEYS.projects);
}

export function addListingProject(project: Project) {
  prependUnique(STORAGE_KEYS.projects, project);
}

export function updateListingProject(project: Project) {
  prependUnique(STORAGE_KEYS.projects, project);
}

export function removeListingProject(id: string) {
  removeById<Project>(STORAGE_KEYS.projects, id);
}

export function mergeListingWithSeed<T extends { id: string }>(stored: T[], seed: T[]): T[] {
  const storedIds = new Set(stored.map((item) => item.id));
  return [...stored, ...seed.filter((item) => !storedIds.has(item.id))];
}
