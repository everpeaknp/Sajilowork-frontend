export const TASK_TIME_SLOTS = [
  { id: 'morning', label: 'Morning', sub: 'Before 10am' },
  { id: 'midday', label: 'Midday', sub: '10am - 2pm' },
  { id: 'afternoon', label: 'Afternoon', sub: '2pm - 6pm' },
  { id: 'evening', label: 'Evening', sub: 'After 6pm' },
] as const;

export type TaskTimeSlotId = (typeof TASK_TIME_SLOTS)[number]['id'];

export type TaskTimeSlotDisplay = {
  label: string;
  sub: string;
};

export function getTimeSlotById(
  id: string | null | undefined
): (typeof TASK_TIME_SLOTS)[number] | null {
  if (!id || typeof id !== 'string') return null;
  const normalized = id.toLowerCase().trim();
  return TASK_TIME_SLOTS.find((s) => s.id === normalized) ?? null;
}

export function formatTimeSlotRequirement(
  slotId: TaskTimeSlotId
): { type: 'time_slot'; value: string; label: string } {
  const slot = getTimeSlotById(slotId);
  if (!slot) {
    return { type: 'time_slot', value: slotId, label: slotId };
  }
  return {
    type: 'time_slot',
    value: slot.id,
    label: `${slot.label} · ${slot.sub}`,
  };
}

export function getTaskTimeSlotFromRequirements(
  requirements?: Array<{ type?: string; label?: string; value?: string }> | null
): TaskTimeSlotDisplay | null {
  if (!Array.isArray(requirements)) return null;
  const timeReq = requirements.find((r) => r?.type === 'time_slot');
  if (!timeReq) return null;

  const fromValue = getTimeSlotById(timeReq.value);
  if (fromValue) {
    return { label: fromValue.label, sub: fromValue.sub };
  }

  if (typeof timeReq.label === 'string' && timeReq.label.trim()) {
    const legacy = timeReq.label.replace(/^preferred time:\s*/i, '').trim();
    const fromLegacy = getTimeSlotById(legacy);
    if (fromLegacy) {
      return { label: fromLegacy.label, sub: fromLegacy.sub };
    }
    const parts = timeReq.label.split('·').map((p) => p.trim());
    if (parts.length >= 2) {
      return { label: parts[0], sub: parts.slice(1).join(' · ') };
    }
  }

  return null;
}
