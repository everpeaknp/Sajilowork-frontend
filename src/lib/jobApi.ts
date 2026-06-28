import type { CreateJobFormData } from '@/app/dashboard/DashboardCreateJob';

import type { Job as DashboardJob } from '@/app/dashboard/types';

import type { Job } from '@/components/jobs/jobListData';

import { JOB_MIN_BUDGET_NPR, resolveJobBudgetFromForm } from '@/components/jobs/jobListData';

import { parseServiceSkills, parseTaskDashboardMeta } from '@/lib/dashboardListingApi';

import { resolveOwnerAvatarBg, resolveOwnerInitials } from '@/lib/employerAvatarUtils';

import { formatTaskLocationShort } from '@/lib/nepalLocale';

import { extractTaskList } from '@/lib/taskUtils';

import { getMediaUrl } from '@/lib/utils';

import { jobService } from '@/services/job.service';

import type { Task, User } from '@/types';



const LEVEL_TO_EXPERIENCE: Record<string, Job['experienceLevel']> = {

  Entry: 'Entry Level',

  Medium: 'Intermediate',

  Expert: 'Expert',

  Intern: 'Intern',

  'Entry Level': 'Entry Level',

  Intermediate: 'Intermediate',

};



const PRICE_TO_TYPE: Record<string, Job['type']> = {

  Hourly: 'Hourly',

  'Fixed Price': 'Fixed Price',

  Contract: 'Contract',

  'Full Time': 'Full Time',

};



const ICON_TYPES: Job['companyIconType'][] = ['wave', 'face', 'in', 'clover'];



function resolveOwnerName(task: Task): string {

  if (task.owner_business_name?.trim()) return task.owner_business_name.trim();

  if (task.owner_name) return task.owner_name;

  const owner = task.owner;

  if (owner && typeof owner === 'object') {

    const user = owner as User;

    const full = `${user.first_name || ''} ${user.last_name || ''}`.trim();

    if (full) return full;

    if (user.username) return user.username;

    if (user.email) return user.email.split('@')[0];

  }

  return 'Employer';

}



function resolveJobOwnerAvatarUrl(task: Task): string | undefined {
  const businessLogo = task.owner_logo_url ? getMediaUrl(task.owner_logo_url) : undefined;
  if (businessLogo) return businessLogo;

  const ownerImage = task.owner_image ? getMediaUrl(task.owner_image) : undefined;
  if (ownerImage) return ownerImage;

  const owner = task.owner;
  if (owner && typeof owner === 'object' && (owner as User).profile_image) {
    return getMediaUrl((owner as User).profile_image as string);
  }

  return undefined;
}

function resolveOwnerId(task: Task): string | undefined {
  if (typeof task.owner === 'string') return task.owner;
  if (task.owner && typeof task.owner === 'object' && task.owner.id) {
    return String(task.owner.id);
  }
  return undefined;
}

function resolveOwnerUsername(task: Task): string | undefined {

  if (task.owner_username?.trim()) {

    return task.owner_username.trim().toLowerCase();

  }

  const owner = task.owner;

  if (owner && typeof owner === 'object' && owner.username?.trim()) {

    return owner.username.trim().toLowerCase();

  }

  return undefined;

}



function resolveCategoryName(task: Task): string {

  if (task.category_name) return task.category_name;

  if (task.category && typeof task.category === 'object' && 'name' in task.category) {

    return String((task.category as { name: string }).name);

  }

  const meta = parseJobMeta(task);

  if (meta?.category?.trim()) return meta.category.trim();

  if (meta?.jobForm?.category?.trim()) return meta.jobForm.category.trim();

  return 'General';

}



function parseJobMeta(task: Task): {

  category?: string;

  jobForm?: Partial<CreateJobFormData>;

} | null {

  const fromField = (task as Task & { job_meta?: Record<string, unknown> }).job_meta;

  if (fromField && typeof fromField === 'object') {

    return fromField as { category?: string; jobForm?: Partial<CreateJobFormData> };

  }

  return parseTaskDashboardMeta(task) as {

    category?: string;

    jobForm?: Partial<CreateJobFormData>;

  } | null;

}



function mapJobLocation(task: Task, form?: Partial<CreateJobFormData>): Job['location'] {

  if (

    form?.location === 'Remote' ||

    task.location_type === 'remote' ||

    task.work_type === 'remote'

  ) {

    return 'Remote';

  }

  const normalized = (form?.city || task.city || task.address || '').trim().toLowerCase();

  if (normalized.includes('hybrid') || form?.location === 'Hybrid') return 'Hybrid';

  if (form?.location === 'In-office' || (task.location_type as any) === 'physical') {

    return 'In-office';

  }

  return form?.location || 'Remote';

}



function parseSkills(form?: Partial<CreateJobFormData>, description?: string): string[] {

  const fromForm = parseServiceSkills(form?.skills);

  if (fromForm.length) return fromForm;

  const match = description?.match(/Skills:\s*(.+)/i);

  if (match?.[1]) {

    return match[1]

      .split(',')

      .map((skill) => skill.trim())

      .filter(Boolean);

  }

  return ['General'];

}



function resolveDescription(task: Task, form?: Partial<CreateJobFormData>): string {

  if (form?.description?.trim()) {

    const paragraphs = form.description.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

    return paragraphs[0] ?? form.description.trim();

  }

  const raw = (task.description ?? '').trim();

  if (!raw) return '';

  const parts = raw.split('\n\n');

  const content = parts.filter(

    (part) =>

      !/^(skills|key responsibilities|work experience|hours|posted):/i.test(part.trim()),

  );

  return content.join('\n\n').trim() || parts[0]?.trim() || raw;

}



const JOB_META_PARAGRAPH =
  /^(skills|key responsibilities|work experience|hours|posted):/i;

function filterJobContentParagraphs(paragraphs: string[]): string[] {
  return paragraphs.filter((part) => !JOB_META_PARAGRAPH.test(part.trim()));
}

function resolveDescriptionParagraphs(task: Task, form?: Partial<CreateJobFormData>): string[] {
  if (form?.description?.trim()) {
    return filterJobContentParagraphs(
      form.description.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
    );
  }

  const raw = (task.description ?? '').trim();
  if (!raw) return [];

  return filterJobContentParagraphs(raw.split('\n\n').map((p) => p.trim()).filter(Boolean));
}



function resolveIconType(seed: string): Job['companyIconType'] {

  let hash = 0;

  for (let i = 0; i < seed.length; i += 1) {

    hash = (hash * 31 + seed.charCodeAt(i)) | 0;

  }

  return ICON_TYPES[Math.abs(hash) % ICON_TYPES.length];

}



function formatPostedLabel(iso?: string | null, form?: Partial<CreateJobFormData>): string | undefined {

  if (form?.postedLabel?.trim()) return form.postedLabel.trim();

  if (!iso) return undefined;

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return undefined;

  const daysAgo = Math.max(

    0,

    Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)),

  );

  if (daysAgo === 0) return 'Posted today';

  return `Posted ${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`;

}



function formatExpiredDate(iso?: string | null): string {

  if (!iso) return 'Expires in 30 days';

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return 'Expires in 30 days';

  return `Expires ${date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;

}



export function mapTaskToPublicJob(task: Task): Job {

  const meta = parseJobMeta(task);

  const form = meta?.jobForm;

  const storedAmount = Number(task.budget_amount) || 0;

  const budget = form?.budgetPricing
    ? resolveJobBudgetFromForm(form)
    : storedAmount > JOB_MIN_BUDGET_NPR
      ? resolveJobBudgetFromForm({
          budgetPricing: 'range',
          budgetMin: form?.budgetMin ?? storedAmount,
          budgetMax: form?.budgetMax ?? storedAmount,
          budgetFixed: form?.budgetFixed,
        })
      : resolveJobBudgetFromForm({ budgetPricing: 'negotiable' });

  const budgetMin = budget.min;

  const budgetMax = budget.max;

  const companyName =
    task.owner_business_name?.trim() ||
    form?.companyName?.trim() ||
    resolveOwnerName(task);

  const employerSlug = resolveOwnerUsername(task);

  const avatarSeed = employerSlug || companyName;

  const verified = Boolean(task.owner_is_verified ?? form?.verified);

  const ownerAvatarUrl = resolveJobOwnerAvatarUrl(task);

  const employerLogoText = task.owner_logo_text?.trim() || undefined;



  return {

    id: task.id,

    slug: task.slug,

    isBookmarked: Boolean(task.is_bookmarked),

    ownerId: resolveOwnerId(task),

    title: task.title || '',

    category: resolveCategoryName(task),

    companyName,

    employerSlug,

    companyLogoBg: form?.companyLogoBg || resolveOwnerAvatarBg(avatarSeed),

    companyIconType: form?.companyIconType || resolveIconType(avatarSeed),

    ownerAvatarUrl,

    employerLogoText,

    verified,

    location: mapJobLocation(task, form),

    duration: form?.duration || '1-5 Days',

    type: PRICE_TO_TYPE[form?.type || ''] ?? (task.budget_type === 'hourly' ? 'Hourly' : 'Fixed Price'),

    experienceLevel:

      LEVEL_TO_EXPERIENCE[form?.experienceLevel || ''] ?? 'Intermediate',

    budgetMin,

    budgetMax,

    budgetLabel: budget.label,

    description: resolveDescription(task, form),

    skills: parseSkills(form, task.description),

    softSkills: parseServiceSkills(form?.softSkills),

    city: form?.city?.trim() || (task.city?.trim() ? task.city.trim() : undefined),

    hoursLabel: form?.hoursLabel?.trim() || undefined,

    postedLabel: formatPostedLabel(task.created_at, form),

    descriptionParagraphs: resolveDescriptionParagraphs(task, form),

    keyResponsibilities: form?.keyResponsibilities?.map((item) => item.trim()).filter(Boolean),

    workExperience: form?.workExperience?.map((item) => item.trim()).filter(Boolean),

  };

}



export function mapTaskToDashboardJob(task: Task): DashboardJob {

  const meta = parseJobMeta(task);

  const form = meta?.jobForm;

  const company =
    task.owner_business_name?.trim() ||
    form?.companyName?.trim() ||
    resolveOwnerName(task);

  const bids = task.bids_count ?? 0;

  const status = mapTaskStatusToDashboardJob(task);



  return {

    id: task.id,

    taskSlug: task.slug,

    title: task.title || '',

    company,

    logoColor: form?.companyLogoBg || resolveOwnerAvatarBg(company),

    logoInitial: (task.owner_logo_text?.trim() || resolveOwnerInitials(company)).toLowerCase(),

    logoUrl: resolveJobOwnerAvatarUrl(task),

    applications: bids > 0 ? `${bids} New` : '0 New',

    createdDate: task.created_at

      ? new Date(task.created_at).toLocaleDateString('en-US', {

          year: 'numeric',

          month: 'long',

          day: 'numeric',

        })

      : 'Recently',

    expiredDate: formatExpiredDate(task.due_date),

    status,

  };

}



export function mapTaskStatusToDashboardJob(task: Task): DashboardJob['status'] {
  if (task.due_date) {
    const due = new Date(task.due_date);
    if (!Number.isNaN(due.getTime()) && due.getTime() < Date.now() && task.status === 'open') {
      return 'Expired';
    }
  }

  switch (task.status) {
    case 'open':
      // List endpoints may omit is_public; open published jobs should show Active.
      if ((task as any).is_public === false) return 'Pending';
      return 'Active';
    case 'draft':
      return 'Draft';
    case 'cancelled':
    case 'completed':
      return 'Closed';
    default:
      return 'Pending';
  }
}



export function dashboardJobStatusToTaskFields(

  status: DashboardJob['status'] | '',

): { status: string; is_public: boolean } {

  switch (status) {

    case 'Active':

      return { status: 'open', is_public: true };

    case 'Pending':

      return { status: 'draft', is_public: false };

    case 'Draft':

      return { status: 'draft', is_public: false };

    case 'Closed':

      return { status: 'cancelled', is_public: false };

    case 'Expired':

      return { status: 'cancelled', is_public: false };

    default:

      return { status: 'open', is_public: true };

  }

}



export async function fetchPublicJobs(

  params?: Record<string, string | number>,

): Promise<Job[]> {

  const response = await jobService.getJobs(params);

  if (!response.success || !response.data) {

    throw new Error(response.message || 'Failed to load jobs');

  }

  return extractTaskList(response.data).map(mapTaskToPublicJob);

}



export async function fetchPublicJobBySlug(slug: string): Promise<Job | null> {

  const response = await jobService.getJobBySlug(slug);

  if (!response.success || !response.data) {

    return null;

  }

  return mapTaskToPublicJob(response.data);

}



export function getRelatedJobsFromList(job: Job, allJobs: Job[], limit = 3): Job[] {

  const others = allJobs.filter((item) => item.id !== job.id);

  const byCategory = others.filter((item) => item.category === job.category);

  const pool = byCategory.length >= limit ? byCategory : others;

  return pool.slice(0, limit);

}



export function getJobsLiveSubtitle(count: number): string {

  const addedToday = Math.max(1, (count * 17) % 400 + 200);

  return `${count.toLocaleString()} jobs live – ${addedToday} added today`;

}



export function resolveJobCityLabel(job: Job): string {

  if (job.city) return job.city;

  if (job.location === 'Remote') return 'Remote';

  return formatTaskLocationShort(

    { city: job.city, location_type: (job.location as any) === 'Remote' ? 'remote' : ('physical' as any) } as Task,

    'Nepal',

  );

}

