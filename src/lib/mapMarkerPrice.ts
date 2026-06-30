import { mapTaskToPublicJob } from '@/lib/jobApi';
import { mapTaskToPublicProject } from '@/lib/projectApi';
import { formatServiceStartingPrice, mapTaskToPublicService } from '@/lib/serviceApi';
import { getListingKind } from '@/lib/dashboardListingApi';
import { taskBudgetAmount } from '@/lib/taskFilters';
import { formatNPR } from '@/lib/nepalLocale';
import type { Task } from '@/types';

const MAP_MARKER_LABEL_MAX = 24;

/** Truncate long category names so map pins stay readable. */
export function formatMapMarkerCategoryLabel(category: string): string {
  const trimmed = category.trim() || 'General';
  if (trimmed.length <= MAP_MARKER_LABEL_MAX) return trimmed;
  return `${trimmed.slice(0, MAP_MARKER_LABEL_MAX - 1)}…`;
}

/** Job map pins show category instead of budget. */
export function resolveJobMapMarkerCategoryLabel(task: Task): string {
  return formatMapMarkerCategoryLabel(mapTaskToPublicJob(task).category);
}

/** Service map pins show category instead of price. */
export function resolveServiceMapMarkerCategoryLabel(task: Task): string {
  return formatMapMarkerCategoryLabel(mapTaskToPublicService(task).category);
}

/** Display label for map pin markers — matches browse cards, not raw budget_amount. */
export function resolveMapMarkerPriceLabel(task: Task): string {
  const kind = getListingKind(task);

  if (kind === 'job') {
    return mapTaskToPublicJob(task).budgetLabel;
  }

  if (kind === 'service') {
    return formatServiceStartingPrice(mapTaskToPublicService(task));
  }

  if (kind === 'project') {
    return mapTaskToPublicProject(task).budgetLabel;
  }

  const amount = taskBudgetAmount(task);
  return formatNPR(amount, { compact: true });
}
