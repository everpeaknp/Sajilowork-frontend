import type { SingleReview } from '@/components/employers/EmployerReviews';
import type { Employer, EmployerGalleryImage } from '@/components/employers/employerData';
import { findEmployerBySlug, isStaticDemoEmployer } from '@/components/employers/employerSlug';
import type { EmployerBusinessProfile } from '@/lib/employerBusinessProfile';
import { parseTaskDashboardMeta } from '@/lib/dashboardListingApi';
import {
  ensureNepalInAddress,
  formatNPR,
  formatTaskLocationShort,
  isRemoteTask,
  shortenCommaSeparatedLocation,
} from '@/lib/nepalLocale';
import type { ApiResponse } from '@/types';
import { getMediaUrl } from '@/lib/utils';
import { formatTaskDisplayTitle } from '@/lib/taskUtils';
import type {
  EmployerGalleryImageDto,
  EmployerProfileDto,
  EmployerPublicDto,
  EmployerReviewDto,
} from '@/services/employer.service';
import { employerService } from '@/services';
import type { Task } from '@/types';

function mapGalleryImage(item: EmployerGalleryImageDto): EmployerGalleryImage {
  return {
    id: item.id,
    url: getMediaUrl(item.url) || item.url,
    alt: item.alt_text?.trim() || 'Gallery image',
  };
}

export function mapEmployerProfileDtoToBusinessProfile(
  dto: EmployerProfileDto,
): EmployerBusinessProfile {
  return {
    userId: dto.user_id,
    slug: dto.slug,
    accountType: dto.account_type,
    companyName: dto.company_name,
    tagline: dto.tagline,
    industry: dto.industry,
    teamSize: dto.team_size,
    location: dto.location,
    description: dto.description,
    website: dto.website,
    costRange: dto.cost_range,
    logoColor: dto.logo_color,
    logoText: dto.logo_text,
    logoUrl: getMediaUrl(dto.logo_url) || dto.logo_url?.trim() || '',
    contactEmail: dto.contact_email?.trim() || '',
    contactPhone: dto.contact_phone?.trim() || '',
    galleryImages: (dto.gallery_images ?? []).map(mapGalleryImage),
    updatedAt: dto.updated_at || new Date().toISOString(),
  };
}

export function mapEmployerPublicDtoToEmployer(dto: EmployerPublicDto): Employer {
  return {
    id: dto.id,
    accountType: dto.account_type,
    name: dto.name,
    tagline: dto.tagline || 'Add a tagline on your business profile.',
    industry: dto.industry,
    rating: dto.rating ?? 0,
    reviewCount: dto.review_count ?? 0,
    location: dto.location || 'Not specified',
    costRange: dto.cost_range || '—',
    openJobs: dto.open_jobs ?? 0,
    logoColor: dto.logo_color || 'serif-m',
    logoText: dto.logo_text || 'CO',
    description: dto.description || '',
    website: dto.website || '',
    teamSize: dto.team_size || 'Not specified',
    contactEmail: dto.contact_email || undefined,
    contactPhone: dto.contact_phone || undefined,
    galleryImages:
      dto.gallery_images?.length > 0 ? dto.gallery_images.map(mapGalleryImage) : undefined,
    logoUrl: getMediaUrl(dto.logo_url) || dto.logo_url?.trim() || undefined,
    memberSince: dto.member_since,
  };
}

function formatReviewDate(iso?: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function resolveReviewerName(review: EmployerReviewDto): string {
  if (review.reviewer_name?.trim()) return review.reviewer_name.trim();
  const nested = review.reviewer;
  if (nested && typeof nested === 'object') {
    const full = (nested as { full_name?: string }).full_name?.trim();
    if (full) return full;
  }
  return 'Freelancer';
}

export function mapEmployerReviewDtoToSingleReview(review: EmployerReviewDto): SingleReview {
  return {
    id: review.id,
    reviewerName: resolveReviewerName(review),
    reviewerRole: 'Freelancer',
    rating: review.rating ?? 0,
    date: formatReviewDate(review.created_at),
    comment: review.comment?.trim() || '',
    likes: 0,
    dislikes: 0,
  };
}

export interface EmployerListingCard {
  id: string;
  title: string;
  company: string;
  budget: string;
  duration: string;
  level: string;
  locationType: string;
  slug?: string;
}

function formatTaskBudget(task: Task): string {
  const meta = parseTaskDashboardMeta(task);
  const form = meta?.projectForm;
  const costVal = Number(task.budget_amount) || 0;
  const isHourly = task.budget_type === 'hourly' || form?.priceType === 'Hourly';
  if (isHourly) {
    const max = costVal + Math.max(50, Math.round(costVal * 0.2));
    return `${formatNPR(costVal, { compact: true })} – ${formatNPR(max, { compact: true })} Hourly`;
  }
  return `${formatNPR(costVal, { compact: true })} Fixed Price`;
}

function resolveDuration(task: Task): string {
  const meta = parseTaskDashboardMeta(task);
  return meta?.projectForm?.projectDuration?.trim() || 'Flexible';
}

function resolveLevel(task: Task): string {
  const meta = parseTaskDashboardMeta(task);
  const level = meta?.projectForm?.level?.trim();
  if (level === 'Entry') return 'Entry Level';
  if (level === 'Medium') return 'Intermediate';
  if (level === 'Expert') return 'Expert';
  return level || 'Intermediate';
}

function resolveListingLocation(task: Task): string {
  const meta = parseTaskDashboardMeta(task);
  const form = meta?.projectForm;

  const formLocation = form?.location?.trim();
  if (formLocation && !/^remote$/i.test(formLocation)) {
    return shortenCommaSeparatedLocation(formLocation, 1);
  }

  const city = task.city?.trim();
  const address = task.address?.trim();
  const fullAddress = task.full_address?.trim();
  if (fullAddress || city || address) {
    if (fullAddress) {
      return shortenCommaSeparatedLocation(ensureNepalInAddress(fullAddress), 1);
    }
    const parts = [address, city, task.state?.trim()].filter(Boolean) as string[];
    return shortenCommaSeparatedLocation(ensureNepalInAddress(parts.join(', ')), 1);
  }

  if (form?.locationType === 'hybrid') {
    return 'Hybrid';
  }

  if (form?.locationType === 'remote' || isRemoteTask(task)) {
    return 'Remote';
  }

  return formatTaskLocationShort(task, 'Nepal');
}

export function mapTaskToEmployerListingCard(task: Task, companyName: string): EmployerListingCard {
  return {
    id: task.id,
    title: formatTaskDisplayTitle(task.title || ''),
    company: companyName,
    budget: formatTaskBudget(task),
    duration: resolveDuration(task),
    level: resolveLevel(task),
    locationType: resolveListingLocation(task),
    slug: task.slug,
  };
}

/** Minimal employer shell when the public profile endpoint is unavailable but listings exist. */
export function buildEmployerFromListingTask(task: Task, slug: string): Employer | null {
  const ownerId = typeof task.owner === 'string' ? task.owner : null;
  if (!ownerId && !task.owner_username?.trim()) {
    return null;
  }

  return {
    id: ownerId ? `emp-user-${ownerId}` : `emp-user-${slug}`,
    name: task.owner_business_name?.trim() || task.owner_name?.trim() || slug,
    tagline: 'Add a tagline on your business profile.',
    industry: 'Individual',
    rating: Number(task.owner_rating) || 0,
    reviewCount: 0,
    location: 'Not specified',
    costRange: '—',
    openJobs: 0,
    logoColor: task.owner_logo_color || 'serif-m',
    logoText: task.owner_logo_text || 'CO',
    logoUrl: getMediaUrl(task.owner_logo_url) || task.owner_logo_url?.trim() || undefined,
    description: '',
    website: '',
    teamSize: '—',
  };
}

function mapListingResponses(
  companyName: string,
  projectsResponse: Awaited<ReturnType<typeof employerService.getEmployerProjects>>,
  jobsResponse: Awaited<ReturnType<typeof employerService.getEmployerJobs>>,
  reviewsResponse: Awaited<ReturnType<typeof employerService.getEmployerReviews>>,
): {
  projects: EmployerListingCard[];
  jobs: EmployerListingCard[];
  reviews: SingleReview[];
} {
  const projects =
    projectsResponse.success && Array.isArray(projectsResponse.data?.results)
      ? projectsResponse.data.results.map((task) => mapTaskToEmployerListingCard(task, companyName))
      : [];

  const jobs =
    jobsResponse.success && Array.isArray(jobsResponse.data?.results)
      ? jobsResponse.data.results.map((task) => mapTaskToEmployerListingCard(task, companyName))
      : [];

  const reviews =
    reviewsResponse.success && Array.isArray(reviewsResponse.data?.results)
      ? reviewsResponse.data.results.map(mapEmployerReviewDtoToSingleReview)
      : [];

  return { projects, jobs, reviews };
}

function emptyListingResponse<T>(): ApiResponse<{ count: number; results: T[] }> {
  return { success: false, message: 'Unavailable', data: null as { count: number; results: T[] }, errors: null };
}

function emptyReviewsResponse(): ApiResponse<{
  count: number;
  results: EmployerReviewDto[];
}> {
  return { success: false, message: 'Unavailable', data: null as never, errors: null };
}

export async function loadEmployerPageData(slug: string): Promise<{
  employer: Employer;
  projects: EmployerListingCard[];
  jobs: EmployerListingCard[];
  reviews: SingleReview[];
  useMockListings: boolean;
} | null> {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) {
    return null;
  }

  try {
    const [profileResult, projectsResult, jobsResult, reviewsResult] = await Promise.allSettled([
      employerService.getEmployerBySlug(normalizedSlug),
      employerService.getEmployerProjects(normalizedSlug),
      employerService.getEmployerJobs(normalizedSlug),
      employerService.getEmployerReviews(normalizedSlug),
    ]);

    const profileResponse =
      profileResult.status === 'fulfilled' ? profileResult.value : emptyListingResponse<never>();
    const projectsResponse =
      projectsResult.status === 'fulfilled' ? projectsResult.value : emptyListingResponse<Task>();
    const jobsResponse =
      jobsResult.status === 'fulfilled' ? jobsResult.value : emptyListingResponse<Task>();
    const reviewsResponse =
      reviewsResult.status === 'fulfilled' ? reviewsResult.value : emptyReviewsResponse();

    let employer: Employer | undefined;

    if (profileResponse.success && profileResponse.data) {
      employer = mapEmployerPublicDtoToEmployer(profileResponse.data);
    } else {
      employer = findEmployerBySlug(normalizedSlug);
      if (!employer) {
        const firstListing =
          projectsResponse.data?.results?.[0] ?? jobsResponse.data?.results?.[0];
        if (firstListing) {
          employer = buildEmployerFromListingTask(firstListing, normalizedSlug) ?? undefined;
        }
      }
    }

    if (!employer) {
      return null;
    }

    const useMockListings = isStaticDemoEmployer(employer);
    if (useMockListings) {
      return { employer, projects: [], jobs: [], reviews: [], useMockListings: true };
    }

    const listings = mapListingResponses(
      employer.name,
      projectsResponse,
      jobsResponse,
      reviewsResponse,
    );

    return { employer, ...listings, useMockListings: false };
  } catch {
    const fallback = findEmployerBySlug(normalizedSlug);
    if (!fallback) {
      return null;
    }
    if (isStaticDemoEmployer(fallback)) {
      return { employer: fallback, projects: [], jobs: [], reviews: [], useMockListings: true };
    }
    return { employer: fallback, projects: [], jobs: [], reviews: [], useMockListings: false };
  }
}
