import type { PackagesConfig } from '@/app/dashboard/DashboardCreateService';

import type { Service, ServicePackage } from '@/components/services/serviceListData';

import {

  serviceListingFallbackImage,
  parseServiceSkills,
  parseTaskDashboardMeta,
} from '@/lib/dashboardListingApi';

import { formatTaskLocationShort } from '@/lib/nepalLocale';

import { extractTaskList, formatTaskDisplayTitle } from '@/lib/taskUtils';

import { getMediaUrl } from '@/lib/utils';

import { serviceService } from '@/services/service.service';

import type { Task, User } from '@/types';



const DESIGN_TOOLS = ['Figma', 'Sketch', 'Adobe XD', 'Illustrator', 'Photoshop'] as const;

export function resolveServiceCoverImage(task: Task): string {
  const primaryImage = getMediaUrl(task.primary_image);
  if (primaryImage) return primaryImage;

  const attachmentImage = task.attachments
    ?.map((item) => getMediaUrl(item.file_url))
    .find((url): url is string => Boolean(url));
  if (attachmentImage) return attachmentImage;

  return serviceListingFallbackImage(task);
}



function resolveOwnerName(task: Task): string {

  if (task.owner_name?.trim()) return task.owner_name.trim();

  const owner = task.owner;

  if (owner && typeof owner === 'object') {

    const user = owner as User;

    const full = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();

    if (full) return full;

    if (user.username) return user.username;

  }

  return 'Service Provider';

}

function resolveOwnerUsername(task: Task): string | undefined {
  if (task.owner_username?.trim()) {
    return task.owner_username.trim().toLowerCase();
  }
  const owner = task.owner;
  if (owner && typeof owner === 'object') {
    const username = (owner as User).username?.trim();
    if (username) return username.toLowerCase();
  }
  return undefined;
}

function resolveOwnerImage(task: Task): string {

  const fromField = getMediaUrl(task.owner_image);

  if (fromField) return fromField;

  const owner = task.owner;

  if (owner && typeof owner === 'object' && (owner as User).profile_image) {

    return getMediaUrl((owner as User).profile_image as string);

  }

  return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80';

}



function resolveCategoryName(task: Task): string {
  if (task.category_name) return task.category_name;

  if (task.category && typeof task.category === 'object' && 'name' in task.category) {
    return String((task.category as { name: string }).name);
  }

  const meta = parseTaskDashboardMeta(task);
  if (meta?.category?.trim()) return meta.category.trim();

  return 'General';
}



function mapDeliveryTime(value?: string): Service['deliveryTime'] {

  if (!value) return 'anytime';

  const lower = value.toLowerCase();

  if (lower.includes('1 day') || lower.includes('24') || lower.includes('1 hour')) return '24h';

  if (lower.includes('2 day') || lower.includes('3 day')) return '3days';

  if (lower.includes('5 day') || lower.includes('7 day')) return '7days';

  return 'anytime';

}



function mapSellerLevel(task: Task): Service['level'] {

  if (task.owner_is_verified) return 'Top Rated';

  const rating = Number(task.owner_rating) || 0;

  if (rating >= 4.8) return 'Level 2';

  if (rating >= 4.5) return 'Level 1';

  return 'New Seller';

}



function mapLocationBucket(task: Task): Service['location'] {

  if (task.location_type === 'remote' || task.work_type === 'remote') return 'Remote';

  const country = (task.country || '').trim();

  if (country === 'United Kingdom') return 'United Kingdom';

  if (country === 'Germany') return 'Germany';

  if (country === 'United States') return 'United States';

  return 'Remote';

}



function mapDesignTool(skills: string[]): Service['designTool'] {

  const match = skills.find((skill) =>

    DESIGN_TOOLS.some((tool) => tool.toLowerCase() === skill.toLowerCase()),

  );

  if (!match) return 'Figma';

  return DESIGN_TOOLS.find((tool) => tool.toLowerCase() === match.toLowerCase()) ?? 'Figma';

}



function mapSpeaks(languages: string[]): Service['speaks'] {

  const allowed: Service['speaks'][] = ['English', 'Spanish', 'French', 'German'];

  const match = languages.find((lang) =>

    allowed.some((item) => item.toLowerCase() === lang.toLowerCase()),

  );

  if (!match) return 'English';

  return allowed.find((item) => item.toLowerCase() === match.toLowerCase()) ?? 'English';

}



function rowValueForTier(rows: PackagesConfig['rows'], matcher: RegExp, tierId: string): string {

  const row = rows.find((item) => matcher.test(item.label) || matcher.test(item.id));

  if (!row) return '';

  const value = row.values[tierId];

  return value == null ? '' : String(value);

}



function parsePriceFromText(text: string): number | null {

  const digits = text.replace(/[^\d.]/g, '');

  const parsed = Number(digits);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;

}



function parseDeliveryDays(text: string, fallback: number): number {

  const match = text.match(/(\d+)/);

  if (!match) return fallback;

  const days = Number(match[1]);

  return Number.isFinite(days) && days > 0 ? days : fallback;

}



function parseIntFromText(text: string, fallback: number): number {

  const match = text.match(/(\d+)/);

  if (!match) return fallback;

  const value = Number(match[1]);

  return Number.isFinite(value) && value > 0 ? value : fallback;

}



function tierPackageId(tierId: string, index: number): ServicePackage['id'] {

  if (tierId === 'basic' || tierId === 'standard' || tierId === 'premium') {

    return tierId;

  }

  if (index === 0) return 'basic';

  if (index === 1) return 'standard';

  return 'premium';

}



function packagesFromConfig(config: PackagesConfig, basePrice: number): ServicePackage[] {

  return config.tiers.map((tier, index) => {

    const fallbackPrice =

      index === 0 ? basePrice : index === 1 ? Math.round(basePrice * 1.6) : Math.round(basePrice * 2.4);

    const totalText = rowValueForTier(config.rows, /total/i, tier.id);

    const price = parsePriceFromText(totalText) ?? fallbackPrice;



    const revisionsText = rowValueForTier(config.rows, /revision/i, tier.id);

    const pagesText = rowValueForTier(config.rows, /pages/i, tier.id);

    const deliveryText = rowValueForTier(config.rows, /delivery/i, tier.id);



    const sourceFileRow = config.rows.find((row) => /source file/i.test(row.label));

    const sourceFile =

      sourceFileRow?.type === 'checkbox' ? Boolean(sourceFileRow.values[tier.id]) : true;



    const checkboxFeatures = config.rows

      .filter((row) => row.type === 'checkbox' && row.values[tier.id])

      .map((row) => row.label);



    const textFeatures = config.rows

      .filter((row) => row.type === 'text' && !/total/i.test(row.label))

      .map((row) => {

        const value = row.values[tier.id];

        if (value == null || value === '') return null;

        return `${row.label}: ${value}`;

      })

      .filter((item): item is string => Boolean(item));



    const features = [...checkboxFeatures, ...textFeatures];



    return {

      id: tierPackageId(tier.id, index),

      name: tier.name,

      price,

      title: tier.name,

      description: tier.description,

      deliveryDays: parseDeliveryDays(deliveryText, 2 + index),

      revisions: parseIntFromText(revisionsText, 1 + index * 2),

      pageCount: parseIntFromText(pagesText, 2 + index * 2),

      sourceFile,

      features: features.length ? features : ['Source file'],

    };

  });

}



function isDescriptionMetaLine(line: string): boolean {
  return /^(skills|languages|response time|delivery time):/i.test(line.trim());
}

/** Full "Services Detail" text for the public About section. */
function resolveServiceDetail(task: Task, meta: ReturnType<typeof parseTaskDashboardMeta>): string {
  if (meta?.serviceDetail?.trim()) return meta.serviceDetail.trim();

  const raw = (task.description ?? '').trim();
  if (!raw) return '';

  const parts = raw.split('\n\n');
  const content = parts.filter((part) => !isDescriptionMetaLine(part)).join('\n\n').trim();
  return content || parts[0]?.trim() || raw;
}



export function mapTaskToPublicService(task: Task): Service {

  const meta = parseTaskDashboardMeta(task);

  const skills = parseServiceSkills(meta?.skills);

  const languages = parseServiceSkills(meta?.languages ?? meta?.language ?? meta?.englishLevel);

  const basePrice = Number(task.budget_amount) || 0;

  const images =
    task.attachments
      ?.map((item) => getMediaUrl(item.file_url))
      .filter((url): url is string => Boolean(url)) ?? [];

  const image = resolveServiceCoverImage(task);

  const packagesConfig = meta?.packages;

  const apiPackages =

    packagesConfig?.tiers?.length && packagesConfig?.rows?.length

      ? packagesFromConfig(packagesConfig, basePrice)

      : undefined;



  const isRemote = task.location_type === 'remote' || task.work_type === 'remote';

  const locationLabel = isRemote

    ? 'Remote'

    : formatTaskLocationShort(task, task.address || task.city || 'Nepal');



  return {

    id: task.id,

    slug: task.slug,

    isBookmarked: Boolean(task.is_bookmarked),

    category: resolveCategoryName(task),

    title: formatTaskDisplayTitle(task.title || ''),

    rating: Number(task.owner_rating) || 0,

    reviews: task.bids_count ?? 0,

    views: task.views_count ?? 0,

    image,

    images: images.length ? images : [image],

    author: {

      name: resolveOwnerName(task),

      avatar: resolveOwnerImage(task),

      online: true,

      username: resolveOwnerUsername(task),

      role: resolveCategoryName(task),

      hourlyRate: Math.max(500, Math.round(basePrice / 8)),

      jobSuccess: task.owner_is_verified ? 98 : 92,

    },

    startingPrice: basePrice,

    deliveryTime: mapDeliveryTime(meta?.deliveryTime),

    deliveryTimeLabel: meta?.deliveryTime?.trim() || undefined,

    budget: basePrice,

    designTool: mapDesignTool(skills),

    location: mapLocationBucket(task),

    locationLabel,

    speaks: mapSpeaks(languages),

    languages,

    responseTime: meta?.responseTime?.trim() || undefined,

    level: mapSellerLevel(task),

    description: resolveServiceDetail(task, meta),

    aboutIntro: resolveServiceDetail(task, meta),

    skills: skills.length ? skills : undefined,

    apiPackages,

  };

}



export async function fetchPublicServices(

  params?: Record<string, string | number>,

): Promise<Service[]> {

  const response = await serviceService.getServices(params);

  if (!response.success || !response.data) {

    throw new Error(response.message || 'Failed to load services');

  }

  return extractTaskList(response.data).map(mapTaskToPublicService);

}



export async function fetchPublicServiceBySlug(slug: string): Promise<Service | null> {

  const response = await serviceService.getServiceBySlug(slug);

  if (!response.success || !response.data) {

    return null;

  }

  return mapTaskToPublicService(response.data);

}


