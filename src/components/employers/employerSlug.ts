import { findStoredEmployerByCompanyName, findStoredEmployerBySlug } from '@/lib/employerBusinessProfile';
import { DEFAULT_EMPLOYERS, type Employer } from './employerData';

/** URL slug from employer id, e.g. `emp-mailchimp-1` → `mailchimp-1` */
export function getEmployerSlug(employer: Employer): string {
  return employer.id.replace(/^emp-/, '');
}

/** Static marketing/demo employers only — not API users or localStorage business profiles. */
export function isStaticDemoEmployer(employer: Employer): boolean {
  return employer.id.startsWith('emp-') && !employer.id.startsWith('emp-user-');
}

export function findEmployerBySlug(slug: string, employers: Employer[] = DEFAULT_EMPLOYERS): Employer | undefined {
  const normalized = slug.trim().toLowerCase();
  const stored = findStoredEmployerBySlug(normalized);
  if (stored) return stored;
  return employers.find((employer) => getEmployerSlug(employer).toLowerCase() === normalized);
}

export function getEmployerProfilePath(employer: Employer): string {
  return `/employers/${getEmployerSlug(employer)}`;
}

const COMPANY_EMPLOYER_IDS: Record<string, string> = {
  mailchimp: 'emp-mailchimp-1',
  slack: 'emp-slack',
  vercel: 'emp-google',
  figma: 'emp-notion',
  linear: 'emp-notion',
  airbnb: 'emp-airbnb',
  webflow: 'emp-shopify',
  stripe: 'emp-stripe',
};

export function findEmployerByCompanyName(
  companyName: string,
  employers: Employer[] = DEFAULT_EMPLOYERS,
): Employer | undefined {
  const normalized = companyName.trim().toLowerCase();
  const stored = findStoredEmployerByCompanyName(companyName);
  if (stored) return stored;

  const aliasId = COMPANY_EMPLOYER_IDS[normalized];
  if (aliasId) {
    const byAlias = employers.find((employer) => employer.id === aliasId);
    if (byAlias) return byAlias;
  }

  const exact = employers.find((employer) => employer.name.toLowerCase() === normalized);
  if (exact) return exact;

  const root = normalized.split(/\s+/)[0];
  return employers.find(
    (employer) =>
      employer.name.toLowerCase().startsWith(root) ||
      root.startsWith(employer.name.toLowerCase().split(/\s+/)[0]),
  );
}

export function getEmployerProfilePathByCompanyName(companyName: string): string | null {
  const employer = findEmployerByCompanyName(companyName);
  if (employer) return getEmployerProfilePath(employer);
  return null;
}

/** Prefer API owner username; optional demo lookup for mock listings only. */
export function resolveEmployerProfileHref(options: {
  employerSlug?: string | null;
  companyName?: string | null;
  /** When true, match legacy demo employers by company name (mock listings only). */
  allowDemoLookup?: boolean;
}): string | null {
  const slug = options.employerSlug?.trim().toLowerCase();
  if (slug) {
    return `/employers/${encodeURIComponent(slug)}`;
  }
  if (!options.allowDemoLookup) {
    return null;
  }
  const companyName = options.companyName?.trim();
  if (!companyName) return null;
  return getEmployerProfilePathByCompanyName(companyName);
}

/** Public employer page for the signed-in customer account (username slug). */
export function getEmployerBusinessProfileHref(
  user?: { username?: string | null } | null,
): string | null {
  const username = user?.username?.trim();
  if (!username) return null;
  return `/employers/${encodeURIComponent(username.toLowerCase())}`;
}
