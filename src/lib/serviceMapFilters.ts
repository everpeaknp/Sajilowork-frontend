import { mapTaskToPublicService } from '@/lib/serviceApi';
import { taskBudgetAmount, haversineKm } from '@/lib/taskFilters';
import type { Task } from '@/types';

export type ServiceMapBudgetFilter = 'All' | 'under-5k' | '5k-15k' | '15k-30k' | '30k+';
export type ServiceMapSort =
  | 'newest'
  | 'best-seller'
  | 'price-asc'
  | 'price-desc'
  | 'reviews'
  | 'closest';

export interface ServiceMapFilters {
  query?: string;
  location?: string;
  category?: string;
  budget?: ServiceMapBudgetFilter;
  deliveryTime?: string;
  level?: string;
  sortBy?: ServiceMapSort;
  user_latitude?: number;
  user_longitude?: number;
  distance_km?: number;
}

export const DEFAULT_SERVICE_MAP_FILTERS: ServiceMapFilters = {
  category: 'All',
  budget: 'All',
  deliveryTime: 'All',
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

function budgetRange(filter: ServiceMapBudgetFilter): { min?: number; max?: number } {
  switch (filter) {
    case 'under-5k':
      return { max: 5000 };
    case '5k-15k':
      return { min: 5000, max: 15000 };
    case '15k-30k':
      return { min: 15000, max: 30000 };
    case '30k+':
      return { min: 30000 };
    default:
      return {};
  }
}

function matchesLocationText(task: Task, locationQuery?: string): boolean {
  if (!locationQuery?.trim()) return true;
  const q = locationQuery.trim().toLowerCase();
  const service = mapTaskToPublicService(task);
  const haystack = [
    task.city,
    task.state,
    task.country,
    task.address,
    service.locationLabel,
    service.location,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

export function applyServiceMapFilters(tasks: Task[], filters: ServiceMapFilters): Task[] {
  const f = { ...DEFAULT_SERVICE_MAP_FILTERS, ...filters };
  let result = [...tasks];

  const q = f.query?.trim().toLowerCase();
  if (q) {
    result = result.filter((task) => {
      const service = mapTaskToPublicService(task);
      return (
        (task.title || '').toLowerCase().includes(q) ||
        (task.description || '').toLowerCase().includes(q) ||
        service.author.name.toLowerCase().includes(q) ||
        (service.skills ?? []).some((skill) => skill.toLowerCase().includes(q))
      );
    });
  }

  if (f.category && f.category !== 'All') {
    const cat = f.category.toLowerCase();
    result = result.filter((task) => mapTaskToPublicService(task).category.toLowerCase() === cat);
  }

  if (f.deliveryTime && f.deliveryTime !== 'All') {
    result = result.filter((task) => mapTaskToPublicService(task).deliveryTime === f.deliveryTime);
  }

  if (f.level && f.level !== 'All') {
    result = result.filter((task) => mapTaskToPublicService(task).level === f.level);
  }

  const range = budgetRange(f.budget ?? 'All');
  if (range.min != null) {
    result = result.filter((task) => mapTaskToPublicService(task).startingPrice >= range.min!);
  }
  if (range.max != null) {
    result = result.filter((task) => mapTaskToPublicService(task).startingPrice <= range.max!);
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
    case 'price-asc':
      sorted.sort(
        (a, b) => mapTaskToPublicService(a).startingPrice - mapTaskToPublicService(b).startingPrice,
      );
      break;
    case 'price-desc':
      sorted.sort(
        (a, b) => mapTaskToPublicService(b).startingPrice - mapTaskToPublicService(a).startingPrice,
      );
      break;
    case 'reviews':
      sorted.sort((a, b) => mapTaskToPublicService(b).reviews - mapTaskToPublicService(a).reviews);
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
      sorted.sort((a, b) => {
        const sa = mapTaskToPublicService(a);
        const sb = mapTaskToPublicService(b);
        return sb.reviews * sb.rating - sa.reviews * sa.rating;
      });
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
