import type { Freelancer } from '@/components/freelancers/freelancerData';
import { mapDirectoryEntryToFreelancer } from '@/lib/freelancerProfileFromApi';
import { isDirectoryEntryProfileConfigured } from '@/lib/freelancerProfileReadiness';
import type { UserDirectoryEntry } from '@/services/user.service';

import { fetchAllPaginated } from './api';

export async function fetchServerFreelancers(limit = 24): Promise<Freelancer[]> {
  const entries = await fetchAllPaginated<UserDirectoryEntry>(
    '/users/directory/?role=tasker&page_size=100',
    { revalidate: 300 },
  );

  return entries
    .filter((entry) => entry?.id && isDirectoryEntryProfileConfigured(entry))
    .slice(0, limit)
    .map(mapDirectoryEntryToFreelancer);
}
