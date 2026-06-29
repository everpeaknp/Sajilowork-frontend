import type { Freelancer } from '@/components/freelancers/freelancerData';

import { fetchServerFreelancers } from '@/lib/seo/server-freelancers';

import FreelancersPageClient from './FreelancersPageClient';

export default async function FreelancersPage() {
  let initialFreelancers: Freelancer[] = [];

  try {
    initialFreelancers = await fetchServerFreelancers(24);
  } catch {
    // Client will retry after hydration.
  }

  return <FreelancersPageClient initialFreelancers={initialFreelancers} />;
}

export const revalidate = 300;
