import { getAllJobsIncludingPosted } from '@/components/jobs/jobStore';
import { getJobSlug } from '@/components/jobs/jobSlug';
import type { Job } from '@/components/jobs/jobListData';
import { getAllProjectsIncludingPosted } from '@/components/projects/projectStore';
import { getProjectSlug } from '@/components/projects/projectSlug';
import type { Project } from '@/components/projects/projectListData';
import { ALL_SERVICES, type Service } from '@/components/services/serviceListData';
import { getServiceSlug } from '@/components/services/serviceSlug';
import { formatTaskDisplayTitle } from '@/lib/taskUtils';
import { taskBudgetAmount } from '@/lib/taskFilters';
import { getMediaUrl } from '@/lib/utils';
import type { Task } from '@/types';

export type SavedSubTab = 'services' | 'project' | 'jobs' | 'task';
export type SavedItemKind = 'task' | 'job' | 'project' | 'service';

export interface DashboardSavedItem {
  id: string;
  slug: string;
  kind: SavedItemKind;
  category: string;
  title: string;
  rating: number;
  reviewsCount: number;
  image: string;
  authorName: string;
  authorAvatar: string;
  price: number;
  budgetType: 'fixed' | 'hourly';
}

const CARD_IMAGES = [
  'https://images.unsplash.com/photo-1541462608141-ad4979e458c9?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80',
];

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80';

function cardImageForKey(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return CARD_IMAGES[hash % CARD_IMAGES.length];
}

function categoryLabel(task: Task): string {
  if (typeof task.category === 'object' && task.category?.name) {
    return task.category.name;
  }
  return task.category_name || 'General';
}

function ownerName(task: Task): string {
  const nested =
    (task.poster && typeof task.poster === 'object' ? task.poster : null) ||
    (task.owner && typeof task.owner === 'object' ? task.owner : null);

  if (nested) {
    const full =
      `${nested.first_name || ''} ${nested.last_name || ''}`.trim() ||
      nested.full_name ||
      nested.username ||
      '';
    if (full) return full;
  }

  return (task.owner_name || 'Task poster').trim();
}

export function resolveOwnerAvatarFromTask(task: Task): string {
  const nested =
    (task.poster && typeof task.poster === 'object' ? task.poster : null) ||
    (task.owner && typeof task.owner === 'object' ? task.owner : null);
  const fromNested = nested ? getMediaUrl(nested.profile_image) : '';
  const fromFlat = getMediaUrl(task.owner_image);
  const fromLogo = getMediaUrl(task.owner_logo_url);
  return fromLogo || fromNested || fromFlat || DEFAULT_AVATAR;
}

export function savedListingImage(task: Task): string {
  const primary = getMediaUrl((task as Task & { primary_image?: string }).primary_image);
  if (primary) return primary;

  const attachment = task.attachments
    ?.map((item) => getMediaUrl(item.file_url))
    .find((url): url is string => Boolean(url));
  if (attachment) return attachment;

  return cardImageForKey(String(task.id || task.slug || '0'));
}

export function mapTaskToDashboardSavedItem(task: Task): DashboardSavedItem {
  const budgetType = task.budget_type === 'hourly' ? 'hourly' : 'fixed';
  const rating = Number(task.owner_rating ?? 0);
  const reviewsCount = task.bids_count ?? task.bid_count ?? 0;

  return {
    id: String(task.id),
    slug: task.slug || String(task.id),
    kind: 'task',
    category: categoryLabel(task),
    title: formatTaskDisplayTitle(task.title || 'Untitled task'),
    rating: Number.isFinite(rating) && rating > 0 ? rating : 0,
    reviewsCount: Number.isFinite(reviewsCount) ? reviewsCount : 0,
    image:
      getMediaUrl((task as Task & { primary_image?: string }).primary_image) ||
      cardImageForKey(String(task.id || task.slug || '0')),
    authorName: ownerName(task),
    authorAvatar: resolveOwnerAvatarFromTask(task),
    price: taskBudgetAmount(task),
    budgetType,
  };
}

export function mapJobToDashboardSavedItem(job: Job): DashboardSavedItem {
  return {
    id: job.id,
    slug: getJobSlug(job),
    kind: 'job',
    category: job.category,
    title: job.title,
    rating: 0,
    reviewsCount: 0,
    image: cardImageForKey(job.id),
    authorName: job.companyName,
    authorAvatar: job.ownerAvatarUrl || DEFAULT_AVATAR,
    price: job.budgetMin,
    budgetType: job.type === 'Hourly' ? 'hourly' : 'fixed',
  };
}

export function mapProjectToDashboardSavedItem(project: Project): DashboardSavedItem {
  return {
    id: project.id,
    slug: getProjectSlug(project),
    kind: 'project',
    category: project.category,
    title: project.title,
    rating: 0,
    reviewsCount: 0,
    image: cardImageForKey(project.id),
    authorName: project.companyName,
    authorAvatar: project.ownerAvatarUrl || DEFAULT_AVATAR,
    price: project.budgetMin,
    budgetType: project.type === 'Hourly' ? 'hourly' : 'fixed',
  };
}

export function mapServiceToDashboardSavedItem(service: Service): DashboardSavedItem {
  return {
    id: service.id,
    slug: getServiceSlug(service),
    kind: 'service',
    category: service.category,
    title: service.title,
    rating: Number.isFinite(service.rating) ? service.rating : 0,
    reviewsCount: Number.isFinite(service.reviews) ? service.reviews : 0,
    image: service.image || cardImageForKey(service.id),
    authorName: service.author.name,
    authorAvatar: service.author.avatar || DEFAULT_AVATAR,
    price: service.startingPrice ?? service.budget,
    budgetType: 'hourly',
  };
}

function resolveSavedServices(savedServiceIds: readonly string[]): DashboardSavedItem[] {
  const byId = new Map(ALL_SERVICES.map((service) => [service.id, service]));
  return savedServiceIds
    .map((id) => byId.get(id))
    .filter((service): service is Service => Boolean(service))
    .map(mapServiceToDashboardSavedItem);
}

function resolveSavedProjects(savedProjectIds: readonly string[]): DashboardSavedItem[] {
  const byId = new Map(getAllProjectsIncludingPosted().map((project) => [project.id, project]));
  return savedProjectIds
    .map((id) => byId.get(id))
    .filter((project): project is Project => Boolean(project))
    .map(mapProjectToDashboardSavedItem);
}

function resolveSavedJobs(savedJobIds: readonly string[]): DashboardSavedItem[] {
  const byId = new Map(getAllJobsIncludingPosted().map((job) => [job.id, job]));
  return savedJobIds
    .map((id) => byId.get(id))
    .filter((job): job is Job => Boolean(job))
    .map(mapJobToDashboardSavedItem);
}

export function collectSavedItemsForTab(
  tab: SavedSubTab,
  savedServiceIds: readonly string[],
  savedProjectIds: readonly string[],
  savedJobIds: readonly string[],
  taskBookmarks: DashboardSavedItem[],
): DashboardSavedItem[] {
  if (tab === 'services') {
    return resolveSavedServices(savedServiceIds);
  }
  if (tab === 'project') {
    return resolveSavedProjects(savedProjectIds);
  }
  if (tab === 'jobs') {
    return resolveSavedJobs(savedJobIds);
  }
  return taskBookmarks;
}

export function savedItemDetailPath(item: DashboardSavedItem): string {
  switch (item.kind) {
    case 'service':
      return `/services/${encodeURIComponent(item.slug)}`;
    case 'project':
      return `/projects/${encodeURIComponent(item.slug)}`;
    case 'job':
      return `/jobs/${encodeURIComponent(item.slug)}`;
    case 'task':
    default:
      return `/task/${encodeURIComponent(item.slug)}`;
  }
}
