export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function matchesSearchQuery(query: string, ...fields: Array<string | null | undefined>): boolean {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) return true;
  return fields.some((field) => (field ?? '').toLowerCase().includes(normalized));
}
