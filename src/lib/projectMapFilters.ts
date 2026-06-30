import { mapTaskToPublicProject } from '@/lib/projectApi';
import { taskBudgetAmount, haversineKm } from '@/lib/taskFilters';
import type { Task } from '@/types';

export type ProjectMapBudgetFilter = 'All' | '0-1500' | '1500-2500' | '2500-4000' | '4000+';
export type ProjectMapSort = 'best-seller' | 'budget-high' | 'newest' | 'closest' | 'duration-low';

export interface ProjectMapFilters {
  query?: string;
  location?: string;
  locationType?: string;
  category?: string;
  budget?: ProjectMapBudgetFilter;
  projectType?: string;
  level?: string;
  sortBy?: ProjectMapSort;
  user_latitude?: number;
  user_longitude?: number;
  distance_km?: number;
}

export const DEFAULT_PROJECT_MAP_FILTERS: ProjectMapFilters = {
  category: 'All',
  budget: 'All',
  projectType: 'All',
  level: 'All',
  locationType: 'All',
  sortBy: 'newest',
  distance_km: 100,
};

function toCoord(raw: unknown): number {
  if (raw === null || raw === undefined || raw === '') return NaN;
  if (typeof raw === 'number') return raw;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function budgetRange(filter: ProjectMapBudgetFilter): { min?: number; max?: number } {
  switch (filter) {
    case '0-1500':
      return { max: 1500 };
    case '1500-2500':
      return { min: 1500, max: 2500 };
    case '2500-4000':
      return { min: 2500, max: 4000 };
    case '4000+':
      return { min: 4000 };
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
  return haystack.includes(q);
}

export function applyProjectMapFilters(tasks: Task[], filters: ProjectMapFilters): Task[] {
  const f = { ...DEFAULT_PROJECT_MAP_FILTERS, ...filters };
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
    result = result.filter((task) => {
      const category =
        typeof task.category === 'string'
          ? task.category
          : task.category?.name || task.category_name || '';
      return category.toLowerCase() === cat;
    });
  }

  if (f.projectType && f.projectType !== 'All') {
    result = result.filter((task) => mapTaskToPublicProject(task).type === f.projectType);
  }

  if (f.level && f.level !== 'All') {
    result = result.filter((task) => mapTaskToPublicProject(task).experienceLevel === f.level);
  }

  if (f.locationType && f.locationType !== 'All') {
    result = result.filter((task) => mapTaskToPublicProject(task).location === f.locationType);
  }

  const range = budgetRange(f.budget ?? 'All');
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
  if (userLat != null && userLng != null && maxKm > 0 && maxKm < 100) {
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
    case 'duration-low':
      sorted.sort((a, b) => {
        const aDue = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        const bDue = b.due_date ? new Date(b.due_date).getTime() : Infinity;
        return aDue - bDue;
      });
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
