import { DEFAULT_EMPLOYERS, type Employer } from './employerData';

/** URL slug from employer id, e.g. `emp-mailchimp-1` → `mailchimp-1` */
export function getEmployerSlug(employer: Employer): string {
  return employer.id.replace(/^emp-/, '');
}

export function findEmployerBySlug(slug: string, employers: Employer[] = DEFAULT_EMPLOYERS): Employer | undefined {
  const normalized = slug.trim().toLowerCase();
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

export function getEmployerProfilePathByCompanyName(companyName: string): string {
  const employer = findEmployerByCompanyName(companyName);
  if (employer) return getEmployerProfilePath(employer);
  return getEmployerProfilePath(DEFAULT_EMPLOYERS[0]);
}
