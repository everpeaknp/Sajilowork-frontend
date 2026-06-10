import { FREELANCERS_DATA, type Freelancer } from './freelancerData';

/** Public profile slug from freelancer username, e.g. `jane-doe` */
export function getFreelancerSlug(freelancer: Freelancer): string {
  return freelancer.username;
}

export function findFreelancerBySlug(
  slug: string,
  freelancers: Freelancer[] = FREELANCERS_DATA,
): Freelancer | undefined {
  const normalized = slug.trim().toLowerCase();
  return freelancers.find((freelancer) => freelancer.username.toLowerCase() === normalized);
}

export function getFreelancerProfilePath(freelancer: Freelancer): string {
  return `/freelancers/${getFreelancerSlug(freelancer)}`;
}
