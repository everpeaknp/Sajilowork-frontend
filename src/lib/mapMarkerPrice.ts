import { mapTaskToPublicJob } from '@/lib/jobApi';
import { mapTaskToPublicProject } from '@/lib/projectApi';
import { formatServiceStartingPrice, mapTaskToPublicService } from '@/lib/serviceApi';
import { getListingKind } from '@/lib/dashboardListingApi';
import { taskBudgetAmount } from '@/lib/taskFilters';
import { formatNPR } from '@/lib/nepalLocale';
import type { Task } from '@/types';

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
