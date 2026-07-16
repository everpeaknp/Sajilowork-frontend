export type FeeListingKind = 'task' | 'project' | 'service' | 'job';

export type CancellationStage = 'BEFORE_ACCEPT' | 'AFTER_ACCEPT' | 'IN_PROGRESS';

export function cancellationStageFromStatus(
  status?: string | null,
): CancellationStage {
  const normalized = (status || '').toLowerCase();
  if (
    normalized === 'in_progress' ||
    normalized === 'pending_approval' ||
    normalized === 'under_review'
  ) {
    return 'IN_PROGRESS';
  }
  if (
    normalized === 'assigned' ||
    normalized === 'funded' ||
    normalized === 'accepted'
  ) {
    return 'AFTER_ACCEPT';
  }
  return 'BEFORE_ACCEPT';
}

export function cancellationStageLabel(stage: CancellationStage): string {
  switch (stage) {
    case 'IN_PROGRESS':
      return 'Work in progress';
    case 'AFTER_ACCEPT':
      return 'After offer accepted';
    default:
      return 'Before offer accepted';
  }
}

export function normalizeFeeListingKind(
  kind?: string | null,
): FeeListingKind | undefined {
  if (kind === 'task' || kind === 'project' || kind === 'service' || kind === 'job') {
    return kind;
  }
  return undefined;
}
