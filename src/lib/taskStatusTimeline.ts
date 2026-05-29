export const TASK_STATUS_TIMELINE = [
  { id: 'open', label: 'Open' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
] as const;

export type TaskTimelineStepId = (typeof TASK_STATUS_TIMELINE)[number]['id'];

export type TaskTimelineStepState = 'complete' | 'current' | 'upcoming' | 'skipped';

const HAPPY_PATH: TaskTimelineStepId[] = [
  'open',
  'assigned',
  'in_progress',
  'completed',
];

function normalizeStatus(status: string): string {
  if (status === 'draft') return 'open';
  if (status === 'funded') return 'assigned';
  if (status === 'disputed' || status === 'pending_approval') return 'in_progress';
  return status;
}

/** Compact OPEN / ASSIGNED / COMPLETED row (matches task detail UI). */
export const SIMPLIFIED_STATUS_STEPS = [
  { id: 'open' as const, label: 'OPEN' },
  { id: 'assigned' as const, label: 'ASSIGNED' },
  { id: 'completed' as const, label: 'COMPLETED' },
  { id: 'cancelled' as const, label: 'CANCELLED' },
];

export type SimplifiedStatusStepId = (typeof SIMPLIFIED_STATUS_STEPS)[number]['id'];

function simplifiedActiveStep(rawStatus: string): SimplifiedStatusStepId {
  const status = normalizeStatus(rawStatus);
  if (status === 'cancelled') return 'cancelled';
  if (status === 'open') return 'open';
  if (status === 'completed') return 'completed';
  return 'assigned';
}

export function getSimplifiedTimelineSteps(rawStatus: string) {
  const status = normalizeStatus(rawStatus);
  if (status === 'cancelled') {
    return SIMPLIFIED_STATUS_STEPS.filter((s) => s.id !== 'completed');
  }
  return SIMPLIFIED_STATUS_STEPS.filter((s) => s.id !== 'cancelled');
}

export function getSimplifiedTimelineStepState(
  stepId: SimplifiedStatusStepId,
  rawStatus: string
): TaskTimelineStepState {
  const active = simplifiedActiveStep(rawStatus);
  if (stepId === active) return 'current';
  const order: SimplifiedStatusStepId[] =
    active === 'cancelled'
      ? ['open', 'assigned', 'cancelled']
      : ['open', 'assigned', 'completed'];
  const activeIdx = order.indexOf(active);
  const stepIdx = order.indexOf(stepId);
  if (stepIdx === -1) return 'upcoming';
  if (stepIdx < activeIdx) return 'complete';
  return 'upcoming';
}

/** Happy-path tasks omit Cancelled; cancelled tasks omit Completed. */
export function getVisibleTimelineSteps(rawStatus: string) {
  const status = normalizeStatus(rawStatus);
  if (status === 'cancelled') {
    return TASK_STATUS_TIMELINE.filter((s) => s.id !== 'completed');
  }
  return TASK_STATUS_TIMELINE.filter((s) => s.id !== 'cancelled');
}

export function getTaskTimelineStepState(
  stepId: TaskTimelineStepId,
  rawStatus: string
): TaskTimelineStepState {
  const status = normalizeStatus(rawStatus);

  if (status === 'cancelled') {
    if (stepId === 'cancelled') return 'current';
    const idx = HAPPY_PATH.indexOf('in_progress');
    const stepIdx = HAPPY_PATH.indexOf(stepId as (typeof HAPPY_PATH)[number]);
    if (stepIdx >= 0 && stepIdx <= idx) return 'complete';
    return 'skipped';
  }

  if (stepId === 'cancelled') return 'upcoming';

  const currentIdx = HAPPY_PATH.indexOf(status as (typeof HAPPY_PATH)[number]);
  const stepIdx = HAPPY_PATH.indexOf(stepId as (typeof HAPPY_PATH)[number]);

  if (currentIdx === -1 || stepIdx === -1) {
    return stepId === status ? 'current' : 'upcoming';
  }

  if (status === 'completed') {
    return stepIdx <= currentIdx ? 'complete' : 'upcoming';
  }

  if (stepIdx < currentIdx) return 'complete';
  if (stepIdx === currentIdx) return 'current';
  return 'upcoming';
}

/** 0–100: how far the progress track should fill (to the active step). */
export function getTimelineProgressPercent(
  steps: ReadonlyArray<{ id: TaskTimelineStepId }>,
  rawStatus: string
): number {
  if (steps.length <= 1) return 0;

  let lastActive = -1;
  steps.forEach((step, index) => {
    const state = getTaskTimelineStepState(step.id, rawStatus);
    if (state === 'complete' || state === 'current') {
      lastActive = index;
    }
  });

  if (lastActive <= 0) return 0;
  return (lastActive / (steps.length - 1)) * 100;
}
