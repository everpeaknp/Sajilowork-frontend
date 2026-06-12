import type { CreateProjectFormData } from '@/app/dashboard/DashboardCreateProject';
import type { CreateJobFormData } from '@/app/dashboard/DashboardCreateJob';
import { dashboardJobStatusToTaskFields } from '@/lib/jobApi';
import type {
  CreateServiceFormData,
  PackagesConfig,
} from '@/app/dashboard/DashboardCreateService';
import type { Project, Service, UploadAttachment } from '@/app/dashboard/types';
import {
  DEFAULT_COUNTRY,
  DEFAULT_CURRENCY,
  formatDashboardTypeCost,
  formatTaskLocationShort,
} from '@/lib/nepalLocale';
import { deriveScheduleDateType, scheduleToDueDateIso } from '@/lib/scheduleUtils';
import { formatTimeSlotRequirement } from '@/lib/timeSlot';
import {
  extractCategoryList,
  extractTaskList,
  flattenCategoriesForSelect,
  formatTaskDisplayTitle,
} from '@/lib/taskUtils';
import { getMediaUrl } from '@/lib/utils';
import { projectService } from '@/services/project.service';
import { jobService } from '@/services/job.service';
import { serviceService } from '@/services/service.service';
import { taskService } from '@/services/task.service';
import type { Category, Task } from '@/types';

export type ListingKind = 'service' | 'project' | 'job';

const LISTING_TAG_PREFIX = 'listing:';

/** Inline SVG placeholder — works offline and when external CDNs are blocked. */
export const DEFAULT_SERVICE_IMAGE =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200"><rect width="320" height="200" fill="#f5f5f5"/><path d="M96 72h128v56H96z" fill="#e5e5e5" stroke="#d4d4d4"/><circle cx="128" cy="92" r="8" fill="#d4d4d4"/><path d="M96 128l32-28 24 20 16-14 56 22v14H96z" fill="#d4d4d4"/></svg>',
  );

export function parseServiceSkills(value?: string | string[]): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((skill) => skill.trim()).filter(Boolean);
  return value
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);
}

/** Coerce legacy single-string project fields into multi-select arrays. */
export function normalizeProjectFormData(
  data: Partial<CreateProjectFormData> & {
    language?: string | string[];
  } = {},
): Partial<CreateProjectFormData> {
  const specificDate = data.specificDate ?? '';
  const beforeDate = data.beforeDate ?? '';
  const dateType =
    data.dateType === 'flexible'
      ? 'flexible'
      : deriveScheduleDateType(specificDate, beforeDate, false) || data.dateType;

  return {
    ...data,
    dateType,
    languages: parseServiceSkills(data.languages ?? data.language),
    skills: parseServiceSkills(data.skills),
  };
}

type DashboardMeta = {
  form?: 'service' | 'project' | 'job';
  packages?: PackagesConfig;
  languages?: string | string[];
  /** @deprecated legacy service fields */
  language?: string;
  englishLevel?: string;
  responseTime?: string;
  deliveryTime?: string;
  skills?: string | string[];
  bullets?: string[];
  serviceDetail?: string;
  /** Selected category label when form options differ from API category names */
  category?: string;
  projectForm?: Partial<CreateProjectFormData>;
  jobForm?: Partial<CreateJobFormData>;
};

export type DashboardListingPayload = Record<string, unknown>;

function getListingKind(task: Task): ListingKind | null {
  const fromField = (task as Task & { listing_kind?: string | null }).listing_kind;
  if (fromField) return fromField as ListingKind;
  for (const tag of task.tags ?? []) {
    if (tag.startsWith(LISTING_TAG_PREFIX)) {
      return tag.slice(LISTING_TAG_PREFIX.length) as ListingKind;
    }
  }
  return null;
}

export function parseTaskDashboardMeta(task: Task): DashboardMeta | null {
  const jobMeta = (task as Task & { job_meta?: DashboardMeta }).job_meta;
  if (jobMeta && typeof jobMeta === 'object') {
    return jobMeta;
  }
  if (task.project_meta && typeof task.project_meta === 'object') {
    return task.project_meta as DashboardMeta;
  }
  if (task.service_meta && typeof task.service_meta === 'object') {
    return task.service_meta as DashboardMeta;
  }
  const entry = task.requirements?.find((item) => item?.type === 'dashboard_meta');
  if (!entry?.value) return null;
  try {
    return JSON.parse(entry.value) as DashboardMeta;
  } catch {
    return null;
  }
}

function buildDashboardMeta(meta: DashboardMeta) {
  return [{ type: 'dashboard_meta', value: JSON.stringify(meta) }];
}

export function mapTaskStatusToDashboard(
  status: string,
): Service['status'] | Project['status'] {
  switch (status) {
    case 'open':
      return 'Active';
    case 'draft':
      return 'Pending';
    case 'assigned':
    case 'funded':
    case 'in_progress':
    case 'pending_approval':
    case 'disputed':
      return 'Ongoing';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Canceled';
    default:
      return 'Pending';
  }
}

function formatPostedTime(iso?: string): string {
  if (!iso) return 'Recently';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatLocation(task: Task): string {
  return formatTaskLocationShort(task, 'Remote');
}

function resolveCategoryName(task: Task): string {
  if (task.category_name) return task.category_name;
  if (task.category && typeof task.category === 'object' && 'name' in task.category) {
    return task.category.name;
  }
  const meta = parseTaskDashboardMeta(task);
  if (meta?.category?.trim()) return meta.category.trim();
  if (meta?.projectForm?.category?.trim()) return meta.projectForm.category.trim();
  return 'General';
}

function resolveImageFromTask(task: Task): string {
  const cover =
    getMediaUrl(task.primary_image) ||
    getMediaUrl(task.attachments?.[0]?.file_url);
  return cover || DEFAULT_SERVICE_IMAGE;
}

function resolveGalleryFromTask(task: Task): string[] {
  const fromAttachments =
    task.attachments
      ?.map((item) => getMediaUrl(item.file_url))
      .filter((url): url is string => Boolean(url)) ?? [];
  if (fromAttachments.length) return fromAttachments;

  const primary = getMediaUrl(task.primary_image);
  return primary ? [primary] : [];
}

function bulletsFromTask(task: Task, meta: DashboardMeta | null): string[] {
  if (meta?.bullets?.length) return meta.bullets.slice(0, 3);
  const lines = (task.description ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.slice(0, 3);
}

export function mapTaskToService(task: Task): Service {
  const meta = parseTaskDashboardMeta(task);
  const costVal = Number(task.budget_amount) || 0;
  const budgetLabel = task.budget_type === 'hourly' ? 'Hourly' : 'Fixed';

  return {
    id: task.id,
    taskSlug: task.slug,
    title: task.title,
    bullets: bulletsFromTask(task, meta),
    category: resolveCategoryName(task),
    typeCost: formatDashboardTypeCost(budgetLabel, costVal),
    costVal,
    status: mapTaskStatusToDashboard(task.status),
    image: resolveImageFromTask(task),
    gallery: resolveGalleryFromTask(task),
  };
}

export function mapTaskToProject(task: Task): Project {
  const costVal = Number(task.budget_amount) || 0;
  const isHourly = task.budget_type === 'hourly';

  return {
    id: task.id,
    taskSlug: task.slug,
    title: formatTaskDisplayTitle(task.title || ''),
    location: formatLocation(task),
    postedTime: formatPostedTime(task.created_at),
    receivedCount: task.bids_count ?? 0,
    category: resolveCategoryName(task),
    typeCost: formatDashboardTypeCost(
      isHourly ? 'Hourly' : 'Fixed Price',
      costVal,
      isHourly ? costVal + 50 : undefined,
    ),
    costVal,
    status: mapTaskStatusToDashboard(task.status),
    attachments:
      task.attachments?.map(
        (item): UploadAttachment => ({
          name: item.file_name,
          url: item.file_url,
        }),
      ) ?? [],
  };
}

export function categoryNamesForSelect(categories: Category[]): string[] {
  return flattenCategoriesForSelect(categories).map((item) => item.name);
}

export async function resolveCategoryId(
  categoryName: string,
  categories: Category[] | null | undefined,
): Promise<string | undefined> {
  const normalized = categoryName.trim().toLowerCase();
  if (!normalized) return undefined;
  const list = Array.isArray(categories) ? categories : extractCategoryList(categories);
  const slugify = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  const match = flattenCategoriesForSelect(list).find((item) => {
    const name = item.name.toLowerCase();
    return (
      name === normalized ||
      item.id === categoryName ||
      slugify(item.name) === slugify(categoryName)
    );
  });
  return match?.id;
}

function coerceCoordinate(value: number | string | null | undefined): number | undefined {
  if (value == null || value === '') return undefined;
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return undefined;
  return Number(n.toFixed(6));
}

function mapLocationFields(
  isRemote: boolean,
  location: string,
  city?: string,
  country?: string,
  latitude?: number | string | null,
  longitude?: number | string | null,
) {
  return {
    location_type: isRemote ? 'remote' : 'physical',
    work_type: isRemote ? 'remote' : 'in_person',
    address: isRemote ? '' : location.trim(),
    city: isRemote ? '' : (city || location.trim()).slice(0, 100),
    country: isRemote ? '' : country || DEFAULT_COUNTRY,
    latitude: isRemote ? undefined : coerceCoordinate(latitude),
    longitude: isRemote ? undefined : coerceCoordinate(longitude),
  };
}

export function serviceFormToTaskPayload(
  data: CreateServiceFormData,
  categoryId?: string,
): DashboardListingPayload {
  const costVal = Number(data.price) || 1;
  const detail = data.serviceDetail.trim();

  const skills = parseServiceSkills(data.skills);
  const languages = parseServiceSkills(data.languages);
  const description = [
    detail || data.title.trim(),
    skills.length ? `Skills: ${skills.join(', ')}` : '',
    languages.length ? `Languages: ${languages.join(', ')}` : '',
    data.responseTime ? `Response time: ${data.responseTime}` : '',
    data.deliveryTime ? `Delivery time: ${data.deliveryTime}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  const isRemote = data.locationType === 'remote';
  const location = mapLocationFields(
    isRemote,
    data.location,
    undefined,
    DEFAULT_COUNTRY,
    data.latitude,
    data.longitude,
  );

  return {
    title: data.title.trim().slice(0, 255),
    description,
    category: categoryId,
    budget_type: 'fixed',
    budget_amount: costVal.toFixed(2),
    budget_currency: DEFAULT_CURRENCY,
    ...location,
    urgency: 'medium',
    is_public: true,
    allow_bids: true,
    listing_kind: 'service',
    requirements: buildDashboardMeta({
      form: 'service',
      packages: data.packages,
      languages,
      responseTime: data.responseTime,
      deliveryTime: data.deliveryTime,
      skills,
      bullets: skills,
      serviceDetail: detail,
      category: data.category.trim(),
    }),
  };
}

export function projectFormToTaskPayload(
  data: CreateProjectFormData,
  categoryId?: string,
): DashboardListingPayload {
  const costVal = Number(data.cost) || 1;
  const isHourly = data.priceType === 'Hourly';
  const skills = parseServiceSkills(data.skills);
  const languages = parseServiceSkills(data.languages);
  const description = [
    data.projectDetail.trim() || data.title.trim(),
    skills.length ? `Skills: ${skills.join(', ')}` : '',
    data.freelancerType ? `Freelancer type: ${data.freelancerType}` : '',
    data.projectDuration ? `Duration: ${data.projectDuration}` : '',
    data.level ? `Experience level: ${data.level}` : '',
    languages.length ? `Languages: ${languages.join(', ')}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  const location = mapLocationFields(
    data.locationType === 'remote',
    data.location,
    undefined,
    DEFAULT_COUNTRY,
    data.latitude,
    data.longitude,
  );

  const due_date = scheduleToDueDateIso(data.dateType, data.specificDate, data.beforeDate);

  return {
    title: data.title.trim().slice(0, 255),
    description,
    category: categoryId,
    budget_type: isHourly ? 'hourly' : 'fixed',
    budget_amount: costVal.toFixed(2),
    budget_currency: DEFAULT_CURRENCY,
    ...location,
    due_date,
    work_type: data.locationType === 'remote' ? 'remote' : 'flexible',
    urgency: 'medium',
    is_public: true,
    allow_bids: true,
    listing_kind: 'project',
    requirements: [
      ...buildDashboardMeta({
        form: 'project',
        projectForm: data,
        category: data.category.trim(),
      }),
      ...(data.timeOfDayRequired && data.timeSlot
        ? [formatTimeSlotRequirement(data.timeSlot)]
        : []),
    ],
  };
}

export function jobFormToTaskPayload(
  data: CreateJobFormData,
  categoryId?: string,
): DashboardListingPayload {
  const budgetMin = Number(data.budgetMin) || 1;
  const budgetMax = Number(data.budgetMax) || budgetMin;
  const budgetAmount = Math.max(budgetMin, budgetMax);
  const skills = parseServiceSkills(data.skills);
  const descriptionParts = [
    data.description.trim() || data.title.trim(),
    skills.length ? `Skills: ${skills.join(', ')}` : '',
    data.hoursLabel?.trim() ? `Hours: ${data.hoursLabel.trim()}` : '',
    data.postedLabel?.trim() ? `Posted: ${data.postedLabel.trim()}` : '',
  ].filter(Boolean);

  const keyResponsibilities = data.keyResponsibilities.map((item) => item.trim()).filter(Boolean);
  const workExperience = data.workExperience.map((item) => item.trim()).filter(Boolean);
  if (keyResponsibilities.length) {
    descriptionParts.push(`Key responsibilities:\n${keyResponsibilities.join('\n')}`);
  }
  if (workExperience.length) {
    descriptionParts.push(`Work experience:\n${workExperience.join('\n')}`);
  }

  const isRemote = data.location === 'Remote';
  const location = mapLocationFields(
    isRemote,
    data.city || data.location || '',
    data.city,
    DEFAULT_COUNTRY,
  );

  const { is_public } = dashboardJobStatusToTaskFields(
    data.status || 'Active',
  );

  const due = new Date();
  due.setDate(due.getDate() + 30);

  return {
    title: data.title.trim().slice(0, 255),
    description: descriptionParts.join('\n\n'),
    category: categoryId,
    budget_type: data.type === 'Hourly' ? 'hourly' : 'fixed',
    budget_amount: budgetAmount.toFixed(2),
    budget_currency: DEFAULT_CURRENCY,
    ...location,
    due_date: due.toISOString(),
    work_type: isRemote ? 'remote' : 'flexible',
    urgency: 'medium',
    is_public,
    allow_bids: true,
    listing_kind: 'job',
    requirements: buildDashboardMeta({
      form: 'job',
      jobForm: data,
      category: data.category.trim(),
    }),
  };
}

export function taskToJobFormData(task: Task): Partial<CreateJobFormData> {
  const meta = parseTaskDashboardMeta(task);
  if (meta?.jobForm) {
    return meta.jobForm;
  }

  const isRemote = task.location_type === 'remote' || task.work_type === 'remote';

  return {
    title: task.title,
    category: resolveCategoryName(task),
    companyName: task.owner_name || '',
    location: isRemote ? 'Remote' : 'In-office',
    city: task.city || '',
    budgetMin: String(Number(task.budget_amount) || ''),
    budgetMax: String(Number(task.budget_amount) || ''),
    type: task.budget_type === 'hourly' ? 'Hourly' : 'Fixed Price',
    description: task.description || '',
  };
}

export function taskToServiceFormData(task: Task): Partial<CreateServiceFormData> {
  const meta = parseTaskDashboardMeta(task);
  const isRemote = task.location_type === 'remote' || task.work_type === 'remote';

  return {
    title: task.title,
    price: String(Number(task.budget_amount) || ''),
    category: resolveCategoryName(task),
    languages: parseServiceSkills(meta?.languages ?? meta?.language ?? meta?.englishLevel),
    responseTime: meta?.responseTime ?? '',
    deliveryTime: meta?.deliveryTime ?? '',
    skills: parseServiceSkills(meta?.skills),
    locationType: isRemote ? 'remote' : 'in-person',
    location: isRemote ? 'Remote' : formatLocation(task),
    latitude: coerceCoordinate(task.latitude),
    longitude: coerceCoordinate(task.longitude),
    serviceDetail:
      meta?.serviceDetail?.trim() ||
      (task.description ?? '').split('\n\n')[0]?.trim() ||
      task.description ||
      '',
    packages: meta?.packages,
  };
}

export function taskToProjectFormData(task: Task): Partial<CreateProjectFormData> {
  const meta = parseTaskDashboardMeta(task);
  if (meta?.projectForm) {
    return normalizeProjectFormData(meta.projectForm);
  }

  const isRemote = task.location_type === 'remote' || task.work_type === 'remote';

  return {
    title: task.title,
    category: resolveCategoryName(task),
    priceType: task.budget_type === 'hourly' ? 'Hourly' : 'Fixed Price',
    cost: String(Number(task.budget_amount) || ''),
    locationType: isRemote ? 'remote' : 'in-person',
    location: isRemote ? 'Remote' : formatLocation(task),
    projectDetail: task.description,
    latitude: coerceCoordinate(task.latitude),
    longitude: coerceCoordinate(task.longitude),
  };
}

export async function fetchMyListingTasks(kind: ListingKind): Promise<Task[]> {
  const response =
    kind === 'service'
      ? await serviceService.getMyServices()
      : kind === 'project'
        ? await projectService.getMyProjects()
        : kind === 'job'
          ? await jobService.getMyJobs()
          : await taskService.getMyTasks({ listing_kind: kind });
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to load listings');
  }
  return extractTaskList(response.data);
}

/** Tasks where the current user is the assigned tasker, filtered by listing kind. */
export async function fetchAssignedListingTasks(kind: ListingKind): Promise<Task[]> {
  const response = await taskService.getAssignedTasks();
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to load assigned projects');
  }
  return extractTaskList(response.data).filter((task) => getListingKind(task) === kind);
}

export async function uploadTaskFiles(taskId: string, files: File[]) {
  if (!files.length) return;
  // Upload in selection order so the first image stays the cover photo.
  for (const file of files) {
    await taskService.uploadAttachment(taskId, file);
  }
}

export async function loadCategories(): Promise<Category[]> {
  const response = await taskService.getCategories();
  if (!response.success || !response.data) return [];
  return extractCategoryList(response.data);
}
