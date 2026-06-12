import type { CreateProjectFormData } from '@/app/dashboard/DashboardCreateProject';
import type { ScheduleTimeSlot } from '@/components/post-task/ScheduleFields';
import type {
  Project,
  ProjectAttachment,
  ProjectQuestionItem,
  ProjectScheduleInfo,
} from '@/components/projects/projectListData';
import { parseServiceSkills, parseTaskDashboardMeta } from '@/lib/dashboardListingApi';
import { formatNPR, formatTaskLocationShort } from '@/lib/nepalLocale';
import { getTimeSlotById } from '@/lib/timeSlot';
import { extractTaskList, formatTaskDisplayTitle } from '@/lib/taskUtils';
import { projectService } from '@/services/project.service';
import { getMediaUrl, isTaskImageAttachment } from '@/lib/utils';
import { resolveOwnerAvatarBg } from '@/lib/employerAvatarUtils';
import type { Task, TaskAttachment, TaskQuestion, User } from '@/types';

const LEVEL_TO_EXPERIENCE: Record<string, Project['experienceLevel']> = {
  Entry: 'Entry Level',
  Medium: 'Intermediate',
  Expert: 'Expert',
};

const PRICE_TO_TYPE: Record<string, Project['type']> = {
  Hourly: 'Hourly',
  'Fixed Price': 'Fixed Price',
  Contract: 'Contract',
};

function resolveOwnerId(task: Task): string | undefined {
  if (typeof task.owner === 'string') return task.owner;
  if (task.owner && typeof task.owner === 'object' && task.owner.id) {
    return String(task.owner.id);
  }
  return undefined;
}

export function mapTaskQuestionToProjectItem(
  question: TaskQuestion,
  buyerName: string,
): ProjectQuestionItem {
  return {
    id: question.id,
    askedByName: question.asked_by_name || 'Freelancer',
    askedByImage: question.asked_by_image ? getMediaUrl(question.asked_by_image) : undefined,
    question: question.question,
    answer: question.answer,
    answeredByName: question.answer?.trim() ? buyerName : undefined,
    createdAt: question.created_at || new Date().toISOString(),
    answeredAt: question.answered_at,
  };
}

function resolveOwnerName(task: Task): string {
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

function resolveCategoryName(task: Task): string {
  if (task.category_name) return task.category_name;
  if (task.category && typeof task.category === 'object' && 'name' in task.category) {
    return String((task.category as { name: string }).name);
  }
  const meta = parseTaskDashboardMeta(task);
  if (meta?.category?.trim()) return meta.category.trim();
  if (meta?.projectForm?.category?.trim()) return meta.projectForm.category.trim();
  return 'General';
}

function mapProjectLocation(
  task: Task,
  form?: Partial<CreateProjectFormData>,
): Project['location'] {
  if (
    form?.locationType === 'remote' ||
    task.location_type === 'remote' ||
    task.work_type === 'remote'
  ) {
    return 'Remote';
  }
  const normalized = (form?.location || task.city || task.address || '').trim().toLowerCase();
  if (normalized.includes('hybrid')) return 'Hybrid';
  if (form?.locationType === 'in-person' || task.location_type === 'physical') {
    return 'In-office';
  }
  return 'Remote';
}

function parseSkills(form?: Partial<CreateProjectFormData>, description?: string): string[] {
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

function mapExpenseLevel(budgetMax: number): Project['expenseLevel'] {
  if (budgetMax >= 3000) return 'Expensive';
  if (budgetMax >= 1500) return 'Intermediate';
  return 'Inexpensive';
}

function formatPostedDate(iso?: string | null): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function resolveLocationLabel(
  task: Task,
  form?: Partial<CreateProjectFormData>,
): string {
  if (form?.locationType === 'remote' || task.location_type === 'remote' || task.work_type === 'remote') {
    return 'Remote';
  }
  return formatTaskLocationShort(task, 'Nepal');
}

function mapAttachmentKind(item: TaskAttachment): ProjectAttachment['kind'] {
  const fileType = (item.file_type || '').toLowerCase();
  if (isTaskImageAttachment(fileType)) return 'image';
  if (fileType === 'document') return 'document';
  if (fileType === 'video') return 'video';

  const name = (item.file_name || '').toLowerCase();
  if (/\.(jpe?g|png|gif|webp|bmp)$/.test(name)) return 'image';
  if (/\.(pdf|docx?|txt|xlsx?)$/.test(name)) return 'document';
  if (/\.(mp4|mov|webm|avi)$/.test(name)) return 'video';
  return 'other';
}

function mapAttachments(task: Task): Project['attachments'] {
  return (
    task.attachments?.map((item) => {
      const name = item.file_name?.trim() || 'Attachment';
      const extension = name.includes('.') ? name.split('.').pop()?.toUpperCase() : undefined;
      const url = getMediaUrl(item.file_url);
      return {
        name,
        fileType: extension || 'FILE',
        url: url || undefined,
        kind: mapAttachmentKind(item),
      };
    }) ?? []
  );
}

function isoToDateInput(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function resolveTimeSlot(
  task: Task,
  form?: Partial<CreateProjectFormData>,
): ScheduleTimeSlot {
  if (form?.timeSlot) return form.timeSlot;
  if (!Array.isArray(task.requirements)) return null;
  const timeReq = task.requirements.find((item) => item?.type === 'time_slot');
  if (!timeReq?.value) return null;
  return (getTimeSlotById(String(timeReq.value))?.id as ScheduleTimeSlot) ?? null;
}

function resolveProjectSchedule(
  task: Task,
  form?: Partial<CreateProjectFormData>,
): ProjectScheduleInfo | undefined {
  const timeSlot = resolveTimeSlot(task, form);
  const timeOfDayRequired = Boolean(form?.timeOfDayRequired ?? timeSlot);

  if (form) {
    const dateType = form.dateType ?? '';
    if (!dateType && !timeOfDayRequired) return undefined;

    const due = isoToDateInput(task.due_date);
    let specificDate = form.specificDate ?? '';
    let beforeDate = form.beforeDate ?? '';

    if (!specificDate && !beforeDate && due) {
      if (dateType === 'before') beforeDate = due;
      else if (dateType === 'specific' || dateType === 'both') specificDate = due;
      else specificDate = due;
    }

    return {
      dateType: dateType || (due ? 'specific' : 'flexible'),
      specificDate,
      beforeDate,
      timeOfDayRequired,
      timeSlot,
    };
  }

  const due = isoToDateInput(task.due_date);
  if (!due && !timeOfDayRequired) return undefined;

  return {
    dateType: due ? 'specific' : 'flexible',
    specificDate: due,
    beforeDate: '',
    timeOfDayRequired,
    timeSlot,
  };
}

function resolveDescription(task: Task, form?: Partial<CreateProjectFormData>): string {
  if (form?.projectDetail?.trim()) return form.projectDetail.trim();
  const raw = (task.description ?? '').trim();
  if (!raw) return '';
  const parts = raw.split('\n\n');
  const content = parts.filter(
    (part) =>
      !/^(skills|freelancer type|duration|experience level|language|languages|language levels):/i.test(
        part.trim(),
      ),
  );
  return content.join('\n\n').trim() || parts[0]?.trim() || raw;
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

export function mapTaskToPublicProject(task: Task): Project {
  const meta = parseTaskDashboardMeta(task);
  const form = meta?.projectForm;
  const costVal = Number(task.budget_amount) || 0;
  const isHourly = task.budget_type === 'hourly' || form?.priceType === 'Hourly';
  const budgetMin = costVal;
  const budgetMax = isHourly ? costVal + Math.max(50, Math.round(costVal * 0.2)) : costVal;
  const budgetLabel = isHourly
    ? `${formatNPR(budgetMin)} - ${formatNPR(budgetMax)}`
    : formatNPR(budgetMin);
  const verified = Boolean(task.owner_is_verified);
  const languages = parseServiceSkills(form?.languages ?? meta?.languages);
  const location = mapProjectLocation(task, form);
  const companyName = resolveOwnerName(task);
  const employerSlug = resolveOwnerUsername(task);
  const ownerAvatarUrl = task.owner_logo_url
    ? getMediaUrl(task.owner_logo_url)
    : undefined;
  const employerLogoText = task.owner_logo_text?.trim() || undefined;
  const avatarSeed = employerSlug || companyName;
  const questions = (task.questions ?? []).map((item) =>
    mapTaskQuestionToProjectItem(item, companyName),
  );

  return {
    id: task.id,
    slug: task.slug,
    ownerId: resolveOwnerId(task),
    employerSlug,
    title: formatTaskDisplayTitle(task.title || ''),
    category: resolveCategoryName(task),
    companyName,
    ownerAvatarUrl,
    employerLogoText,
    companyLogoBg: resolveOwnerAvatarBg(avatarSeed),
    companyIconType: 'face',
    verified,
    location,
    duration: form?.projectDuration || '1-5 Days',
    type: PRICE_TO_TYPE[form?.priceType || ''] ?? (isHourly ? 'Hourly' : 'Fixed Price'),
    experienceLevel: LEVEL_TO_EXPERIENCE[form?.level || ''] ?? 'Intermediate',
    budgetMin,
    budgetMax,
    budgetLabel,
    expenseLevel: mapExpenseLevel(budgetMax),
    skills: parseSkills(form, task.description),
    description: resolveDescription(task, form),
    languages,
    freelancerType: form?.freelancerType?.trim() || undefined,
    locationLabel: resolveLocationLabel(task, form),
    postedDate: formatPostedDate(task.created_at),
    views: task.views_count ?? 0,
    attachments: mapAttachments(task),
    ownerRating: Number(task.owner_rating) || undefined,
    ownerReviews: task.bids_count ?? 0,
    schedule: resolveProjectSchedule(task, form),
    questions,
  };
}

export async function fetchPublicProjects(
  params?: Record<string, string | number>,
): Promise<Project[]> {
  const response = await projectService.getProjects(params);
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to load projects');
  }
  return extractTaskList(response.data).map(mapTaskToPublicProject);
}

export async function fetchPublicProjectBySlug(slug: string): Promise<Project | null> {
  const response = await projectService.getProjectBySlug(slug);
  if (!response.success || !response.data) {
    return null;
  }
  return mapTaskToPublicProject(response.data);
}
