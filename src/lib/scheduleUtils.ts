import type { ScheduleDateType } from '@/components/post-task/ScheduleFields';

/** Derive schedule mode from selected dates and flexible flag. */
export function deriveScheduleDateType(
  specificDate: string,
  beforeDate: string,
  isFlexible: boolean,
): ScheduleDateType {
  if (isFlexible) return 'flexible';
  const hasOn = Boolean(specificDate?.trim());
  const hasBefore = Boolean(beforeDate?.trim());
  if (hasOn && hasBefore) return 'both';
  if (hasOn) return 'specific';
  if (hasBefore) return 'before';
  return '';
}

export function hasScheduleSelection(
  dateType: ScheduleDateType,
  specificDate: string,
  beforeDate: string,
): boolean {
  return dateType === 'flexible' || Boolean(specificDate?.trim()) || Boolean(beforeDate?.trim());
}

/** Pick task due_date from schedule (deadline prefers before-date when both set). */
export function scheduleToDueDateIso(
  dateType: ScheduleDateType,
  specificDate: string,
  beforeDate: string,
): string | undefined {
  const toIso = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day).toISOString();
  };

  if (dateType === 'flexible' || !dateType) return undefined;
  if (dateType === 'both') {
    if (beforeDate) return toIso(beforeDate);
    if (specificDate) return toIso(specificDate);
    return undefined;
  }
  if (dateType === 'specific' && specificDate) return toIso(specificDate);
  if (dateType === 'before' && beforeDate) return toIso(beforeDate);
  return undefined;
}
