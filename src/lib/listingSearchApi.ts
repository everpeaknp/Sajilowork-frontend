/**
 * Browse pages → GET /api/v1/search/ (search_type=tasks + listing_kind).
 */

import { mapTaskToPublicJob } from '@/lib/jobApi';
import { mapTaskToPublicProject } from '@/lib/projectApi';
import { mapTaskToPublicService } from '@/lib/serviceApi';
import { normalizeTaskForDisplay } from '@/lib/taskUtils';
import { searchService, type SearchTaskResult } from '@/services/search.service';
import type { Job } from '@/components/jobs/jobListData';
import type { Project } from '@/components/projects/projectListData';
import type { Service } from '@/components/services/serviceListData';
import type { SearchFilters, Task } from '@/types';

export type BrowseListingKind = 'task' | 'job' | 'project' | 'service';

export interface BrowseSearchParams {
  query?: string;
  location?: string;
  category?: string;
  page?: number;
  page_size?: number;
  min_budget?: number;
  max_budget?: number;
  work_type?: string;
  urgency?: string;
  sort_by?: SearchFilters['sort_by'] | 'relevance';
  user_latitude?: number;
  user_longitude?: number;
  radius?: number;
  skills?: string[];
}

export interface BrowseSearchResult<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  suggestions?: string[];
  relatedSearches?: string[];
}

function listingTag(kind: BrowseListingKind): string {
  return kind === 'task' ? 'listing:task' : `listing:${kind}`;
}

function searchResultToTask(result: SearchTaskResult, kind: BrowseListingKind): Task {
  const budget = Number(result.budget) || 0;
  return normalizeTaskForDisplay({
    id: String(result.id),
    title: result.title,
    slug: result.slug,
    description: result.description ?? '',
    status: result.status,
    budget,
    budget_amount: budget,
    budget_type: result.budget_type,
    work_type: result.work_type,
    location: result.location,
    latitude: result.latitude,
    longitude: result.longitude,
    due_date: result.due_date,
    urgency: result.urgency,
    owner: result.owner,
    owner_name: result.owner_name,
    owner_username: result.owner_username,
    owner_image: result.owner_image ?? result.owner_avatar ?? undefined,
    owner_logo_url: result.owner_logo_url ?? undefined,
    owner_logo_text: result.owner_logo_text ?? undefined,
    owner_logo_color: result.owner_logo_color ?? undefined,
    owner_business_name: result.owner_business_name ?? undefined,
    owner_is_verified: result.owner_is_verified,
    category: result.category,
    category_name: result.category_name,
    bid_count: result.bid_count,
    created_at: result.created_at,
    tags: [listingTag(kind)],
    listing_kind: kind === 'task' ? undefined : kind,
  } as Task);
}

function mapSortBy(sort?: BrowseSearchParams['sort_by']): string | undefined {
  switch (sort) {
    case 'newest':
      return 'date';
    case 'budget_high':
      return 'budget_desc';
    case 'budget_low':
      return 'budget_asc';
    case 'closest':
      return 'distance';
    default:
      return sort === 'relevance' ? 'relevance' : undefined;
  }
}

function buildSearchQuery(params: BrowseSearchParams): string | undefined {
  const parts = [params.query, params.location, params.category]
    .map((p) => p?.trim())
    .filter(Boolean);
  const combined = parts.join(' ').trim();
  return combined || undefined;
}

export async function searchBrowseListings(
  kind: BrowseListingKind,
  params: BrowseSearchParams = {},
): Promise<BrowseSearchResult<Task>> {
  const res = await searchService.search({
    query: buildSearchQuery(params),
    search_type: 'tasks',
    listing_kind: kind,
    page: params.page ?? 1,
    page_size: params.page_size ?? 200,
    min_budget: params.min_budget,
    max_budget: params.max_budget,
    work_type: params.work_type,
    urgency: params.urgency,
    sort_by: mapSortBy(params.sort_by),
    latitude: params.user_latitude,
    longitude: params.user_longitude,
    radius: params.radius,
    skills: params.skills,
  });

  if (!res.success || !res.data) {
    throw new Error(res.message || 'Search failed');
  }

  const data = res.data;
  const raw = Array.isArray(data.results) ? (data.results as SearchTaskResult[]) : [];
  const items = raw.map((row) => searchResultToTask(row, kind));

  return {
    items,
    total: data.total_results ?? items.length,
    page: data.page ?? 1,
    totalPages: data.total_pages ?? 1,
    suggestions: data.suggestions,
    relatedSearches: data.related_searches,
  };
}

export async function searchBrowseJobs(params: BrowseSearchParams = {}): Promise<BrowseSearchResult<Job>> {
  const result = await searchBrowseListings('job', params);
  return {
    ...result,
    items: result.items.map(mapTaskToPublicJob),
  };
}

export async function searchBrowseProjects(params: BrowseSearchParams = {}): Promise<BrowseSearchResult<Project>> {
  const result = await searchBrowseListings('project', params);
  return {
    ...result,
    items: result.items.map(mapTaskToPublicProject),
  };
}

export async function searchBrowseServices(params: BrowseSearchParams = {}): Promise<BrowseSearchResult<Service>> {
  const result = await searchBrowseListings('service', params);
  return {
    ...result,
    items: result.items.map(mapTaskToPublicService),
  };
}

export async function searchBrowseTasks(params: BrowseSearchParams = {}): Promise<BrowseSearchResult<Task>> {
  return searchBrowseListings('task', params);
}

/** Debounced autocomplete for hero search boxes. */
export function fetchSearchSuggestions(
  query: string,
  limit = 5,
): Promise<string[]> {
  const q = query.trim();
  if (q.length < 2) return Promise.resolve([]);
  return searchService.getAutocomplete(q, 'tasks', limit).then((data) => {
    if (!data?.suggestions?.length) return [];
    return data.suggestions
      .map((s) => (typeof s === 'string' ? s : s.query || s.text || s.label || ''))
      .filter(Boolean)
      .slice(0, limit);
  });
}
