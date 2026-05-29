import type { Category, SearchFilters } from '@/types';

/**
 * Maps UI SearchFilters to query params understood by TaskViewSet
 * (DjangoFilterBackend + SearchFilter + OrderingFilter).
 */
export function buildTaskApiParams(
  filters?: SearchFilters | null,
  categories: Category[] = []
): Record<string, string | number> {
  const f = filters ?? {};
  const params: Record<string, string | number> = {};

  if (f.query?.trim()) {
    params.search = f.query.trim();
  }

  if (f.status) {
    params.status = f.status;
  }

  if (f.work_type && f.work_type !== 'flexible') {
    params.work_type = f.work_type;
  }

  if (f.category) {
    const match = categories.find(
      (c) =>
        c.name === f.category ||
        c.slug === f.category ||
        c.id === f.category
    );
    if (match) {
      params.category = match.id;
    }
  }

  switch (f.sort_by) {
    case 'budget_high':
      params.ordering = '-budget_amount';
      break;
    case 'budget_low':
      params.ordering = 'budget_amount';
      break;
    case 'closest':
    case 'newest':
    default:
      params.ordering = '-created_at';
      break;
  }

  // Browse page sorts client-side too; fetch a larger page so ordering is meaningful.
  params.page_size = 100;

  return params;
}
