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
