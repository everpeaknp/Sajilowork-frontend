import type { SearchFilters, Task } from '@/types';

export function normalizeSearchFilters(filters?: SearchFilters | null): SearchFilters {
  return filters ?? {};
}

function toCoord(raw: unknown): number {
  if (raw === null || raw === undefined || raw === '') return NaN;
  if (typeof raw === 'number') return raw;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function getCategoryName(task: Task): string {
  if (typeof task.category === 'object' && task.category?.name) {
    return task.category.name;
  }
  return task.category_name || (typeof task.category === 'string' ? task.category : '');
}

function getWorkType(task: Task): string | undefined {
  return task.work_type || task.location_type;
}

export function taskBudgetAmount(task: Task): number {
  const raw = task.budget_amount ?? task.budget_max ?? task.budget_min ?? 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export function taskCreatedAtMs(task: Task): number {
  const raw = task.created_at || task.published_at || task.updated_at;
  if (!raw) return 0;
  const ms = new Date(raw).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function matchesLocationText(task: Task, locationQuery?: string): boolean {
  if (!locationQuery?.trim()) return true;
  const q = locationQuery.trim().toLowerCase();
  const haystack = [task.address, task.city, task.state, task.country]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

/**
 * Client-side filters for fields the list API does not fully support
 * (budget range, suburb text, distance radius, flexible work type).
 */
export function applyClientTaskFilters(tasks: Task[], filters?: SearchFilters | null): Task[] {
  const f = normalizeSearchFilters(filters);
  let result = [...tasks];

  if (f.query?.trim()) {
    const q = f.query.trim().toLowerCase();
    result = result.filter(
      (t) =>
        (t.title || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        (t.city || '').toLowerCase().includes(q) ||
        getCategoryName(t).toLowerCase().includes(q)
    );
  }

  if (f.category) {
    const cat = f.category.toLowerCase();
    result = result.filter((t) => getCategoryName(t).toLowerCase() === cat);
  }

  if (f.work_type && f.work_type !== 'flexible') {
    result = result.filter((t) => getWorkType(t) === f.work_type);
  }

  if (f.status) {
    result = result.filter((t) => t.status === f.status);
  }

  if (f.budget_min != null && f.budget_min > 0) {
    result = result.filter((t) => taskBudgetAmount(t) >= f.budget_min!);
  }

  if (f.budget_max != null && f.budget_max < 10000) {
    result = result.filter((t) => taskBudgetAmount(t) <= f.budget_max!);
  }

  result = result.filter((t) => matchesLocationText(t, f.location));

  const userLat = f.user_latitude;
  const userLng = f.user_longitude;
  const maxKm = f.distance_km;

  if (
    userLat != null &&
    userLng != null &&
    maxKm != null &&
    maxKm > 0 &&
    maxKm < 100
  ) {
    result = result.filter((t) => {
      const lat = toCoord(t.latitude);
      const lng = toCoord(t.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
      return haversineKm(userLat, userLng, lat, lng) <= maxKm;
    });
  }

  return result;
}

export function sortTasks(tasks: Task[], filters?: SearchFilters | null): Task[] {
  const f = normalizeSearchFilters(filters);
  const sorted = [...tasks];
  const sortBy = f.sort_by || 'newest';

  switch (sortBy) {
    case 'budget_high':
      sorted.sort((a, b) => taskBudgetAmount(b) - taskBudgetAmount(a));
      break;
    case 'budget_low':
      sorted.sort((a, b) => taskBudgetAmount(a) - taskBudgetAmount(b));
      break;
    case 'closest': {
      const userLat = f.user_latitude;
      const userLng = f.user_longitude;
      if (userLat == null || userLng == null) {
        sorted.sort((a, b) => taskCreatedAtMs(b) - taskCreatedAtMs(a));
        break;
      }
      const dist = (t: Task) => {
        const lat = toCoord(t.latitude);
        const lng = toCoord(t.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return Infinity;
        return haversineKm(userLat, userLng, lat, lng);
      };
      sorted.sort((a, b) => dist(a) - dist(b));
      break;
    }
    case 'newest':
    default:
      sorted.sort((a, b) => taskCreatedAtMs(b) - taskCreatedAtMs(a));
  }

  return sorted;
}

export function filterAndSortTasks(tasks: Task[], filters?: SearchFilters | null): Task[] {
  const filtered = applyClientTaskFilters(tasks, filters);
  return sortTasks(filtered, filters);
}

export function hasActiveFilters(filters?: SearchFilters | null): boolean {
  const f = normalizeSearchFilters(filters);
  return Boolean(
    f.query?.trim() ||
      f.category ||
      (f.work_type && f.work_type !== 'flexible') ||
      f.location?.trim() ||
      (f.budget_min != null && f.budget_min > 0) ||
      (f.budget_max != null && f.budget_max < 10000) ||
      f.status ||
      (f.distance_km != null && f.distance_km < 100) ||
      (f.sort_by && f.sort_by !== 'newest')
  );
}
