import type { Task } from '@/types';
import type { TaskData } from '@/components/post-task/TitleDateStep';
import { formatTaskLocation } from '@/lib/nepalLocale';
import { getTimeSlotById, type TaskTimeSlotId } from '@/lib/timeSlot';

const PREFILL_STORAGE_KEY = 'similar_task_prefill';

export type SimilarTaskPrefill = Partial<TaskData>;

function resolveLocationType(task: Task): 'in-person' | 'remote' {
  const raw = task.work_type || task.location_type;
  if (raw === 'remote') return 'remote';
  return 'in-person';
}

function resolveDateFields(task: Task): Pick<
  TaskData,
  'dateType' | 'specificDate' | 'beforeDate'
> {
  if (task.flexible_date) {
    return { dateType: 'flexible', specificDate: '', beforeDate: '' };
  }
  if (task.due_date) {
    const iso = String(task.due_date);
    const day = iso.length >= 10 ? iso.slice(0, 10) : '';
    if (day) {
      return { dateType: 'specific', specificDate: day, beforeDate: '' };
    }
  }
  return { dateType: 'flexible', specificDate: '', beforeDate: '' };
}

function resolveTimeFields(task: Task): Pick<TaskData, 'timeOfDayRequired' | 'timeSlot'> {
  const timeReq = Array.isArray(task.requirements)
    ? task.requirements.find((r) => r?.type === 'time_slot')
    : undefined;
  const slotId = timeReq?.value as TaskTimeSlotId | undefined;
  const slot = getTimeSlotById(slotId);
  if (slot) {
    return { timeOfDayRequired: true, timeSlot: slot.id };
  }
  return { timeOfDayRequired: false, timeSlot: null };
}

/** Build post-task form defaults from an existing task. */
export function taskToSimilarPrefill(task: Task): SimilarTaskPrefill {
  const location =
    formatTaskLocation(task, '').trim() ||
    [task.address, task.city, task.state].filter(Boolean).join(', ').trim();

  const lat = task.latitude != null ? Number(task.latitude) : undefined;
  const lng = task.longitude != null ? Number(task.longitude) : undefined;

  const categoryId =
    typeof task.category === 'object' && task.category?.id
      ? String(task.category.id)
      : '';
  const categoryName =
    typeof task.category === 'object' && task.category?.name
      ? task.category.name
      : task.category_name || '';

  return {
    title: (task.title || '').trim(),
    categoryId,
    categoryName,
    details: (task.description || '').trim(),
    location,
    locationType: resolveLocationType(task),
    latitude: Number.isFinite(lat) ? lat : undefined,
    longitude: Number.isFinite(lng) ? lng : undefined,
    budgetType: task.budget_type === 'hourly' ? 'hourly' : 'total',
    budgetAmount: Number(task.budget_amount) || 0,
    images: [],
    ...resolveDateFields(task),
    ...resolveTimeFields(task),
  };
}

export function saveSimilarTaskPrefill(task: Task): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(PREFILL_STORAGE_KEY, JSON.stringify(taskToSimilarPrefill(task)));
  } catch {
    // Ignore quota / private mode errors
  }
}

export function consumeSimilarTaskPrefill(): SimilarTaskPrefill | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(PREFILL_STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PREFILL_STORAGE_KEY);
    const parsed = JSON.parse(raw) as SimilarTaskPrefill;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    sessionStorage.removeItem(PREFILL_STORAGE_KEY);
    return null;
  }
}

/** Keyword suggestion for task alerts based on category or title. */
export function suggestTaskAlertKeyword(task: Task): string {
  const category =
    typeof task.category === 'object' && task.category?.name
      ? task.category.name
      : task.category_name;
  if (category?.trim()) {
    return category.trim().slice(0, 64);
  }

  const words = (task.title || '').trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return words.slice(0, 3).join(' ').slice(0, 64);
  }
  return (task.title || 'task').trim().slice(0, 64);
}
