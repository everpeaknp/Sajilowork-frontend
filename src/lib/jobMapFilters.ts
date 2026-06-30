import { taskBudgetAmount, haversineKm } from '@/lib/taskFilters';
import type { Task } from '@/types';

export type JobMapSalaryFilter = 'All' | '0-50k' | '50k-100k' | '100k-150k' | '150k+';
export type JobMapSort = 'best-seller' | 'budget-high' | 'newest' | 'closest';

export interface JobMapFilters {
  query?: string;
  location?: string;
  category?: string;
  salary?: JobMapSalaryFilter;
  jobType?: string;
  level?: string;
  sortBy?: JobMapSort;
  user_latitude?: number;
  user_longitude?: number;
  /** 100 = nationwide (no distance cap). */
  distance_km?: number;
}

export const DEFAULT_JOB_MAP_FILTERS: JobMapFilters = {
  category: 'All',
  salary: 'All',
  jobType: 'All',
  level: 'All',
  sortBy: 'newest',
  distance_km: 100,
};

function toCoord(raw: unknown): number {
  if (raw === null || raw === undefined || raw === '') return NaN;
  if (typeof raw === 'number') return raw;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function resolveCategoryName(task: Task): string {
  if (typeof task.category === 'string') return task.category;
  return task.category?.name || task.category_name || '';
}

function resolveJobType(task: Task): string {
  if (task.budget_type === 'hourly') return 'Hourly';
  return 'Fixed Price';
}

function resolveExperienceLevel(task: Task): string {
  const meta = task.requirements as { experienceLevel?: string } | undefined;
  if (meta?.experienceLevel) return meta.experienceLevel;
  const desc = task.description || '';
  const match = desc.match(/Experience level:\s*(.+)/i);
  return match?.[1]?.trim() || 'Intermediate';
}

function salaryRange(filter: JobMapSalaryFilter): { min?: number; max?: number } {
  switch (filter) {
    case '0-50k':
      return { max: 50000 };
    case '50k-100k':
      return { min: 50000, max: 100000 };
    case '100k-150k':
      return { min: 100001, max: 150000 };
    case '150k+':
      return { min: 150000 };
    default:
      return {};
  }
}

function matchesLocationText(task: Task, locationQuery?: string): boolean {
  if (!locationQuery?.trim()) return true;
  const q = locationQuery.trim().toLowerCase();
  const haystack = [
    task.city,
    task.state,
    task.country,
    task.address,
    task.location_type,
    task.work_type,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q) || q === 'remote' && (task.work_type === 'remote' || task.location_type === 'remote');
}

export function applyJobMapFilters(tasks: Task[], filters: JobMapFilters): Task[] {
  const f = { ...DEFAULT_JOB_MAP_FILTERS, ...filters };
  let result = [...tasks];

  const q = f.query?.trim().toLowerCase();
  if (q) {
    result = result.filter(
      (task) =>
        (task.title || '').toLowerCase().includes(q) ||
        (task.description || '').toLowerCase().includes(q) ||
        (task.owner_business_name || task.owner_name || '').toLowerCase().includes(q),
    );
  }

  if (f.category && f.category !== 'All') {
    const cat = f.category.toLowerCase();
    result = result.filter((task) => resolveCategoryName(task).toLowerCase() === cat);
  }

  if (f.jobType && f.jobType !== 'All') {
    result = result.filter((task) => resolveJobType(task) === f.jobType);
  }

  if (f.level && f.level !== 'All') {
    result = result.filter((task) => resolveExperienceLevel(task) === f.level);
  }

  const range = salaryRange(f.salary ?? 'All');
  if (range.min != null) {
    result = result.filter((task) => taskBudgetAmount(task) >= range.min!);
  }
  if (range.max != null) {
    result = result.filter((task) => taskBudgetAmount(task) <= range.max!);
  }

  result = result.filter((task) => matchesLocationText(task, f.location));

  const maxKm = f.distance_km ?? 100;
  const userLat = f.user_latitude;
  const userLng = f.user_longitude;
  if (
    userLat != null &&
    userLng != null &&
    maxKm > 0 &&
    maxKm < 100
  ) {
    result = result.filter((task) => {
      const lat = toCoord(task.latitude);
      const lng = toCoord(task.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return true;
      return haversineKm(userLat, userLng, lat, lng) <= maxKm;
    });
  }

  const sorted = [...result];
  switch (f.sortBy) {
    case 'budget-high':
      sorted.sort((a, b) => taskBudgetAmount(b) - taskBudgetAmount(a));
      break;
    case 'closest': {
      if (userLat == null || userLng == null) break;
      const dist = (task: Task) => {
        const lat = toCoord(task.latitude);
        const lng = toCoord(task.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return Infinity;
        return haversineKm(userLat, userLng, lat, lng);
      };
      sorted.sort((a, b) => dist(a) - dist(b));
      break;
    }
    case 'best-seller':
      sorted.sort((a, b) => (b.bids_count ?? 0) - (a.bids_count ?? 0));
      break;
    case 'newest':
    default:
      sorted.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
      );
  }

  return sorted;
}
