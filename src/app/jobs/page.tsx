import type { Metadata } from 'next';

import { searchBrowseJobs } from '@/lib/listingSearchApi';
import type { Job } from '@/components/jobs/jobListData';

import JobsPageClient from './JobsPageClient';

export default async function JobsPage() {
  let initialJobs: Job[] = [];
  let initialTotal = 0;

  try {
    const result = await searchBrowseJobs({
      page: 1,
      page_size: 16,
      sort_by: 'newest',
    });
    initialJobs = result.items;
    initialTotal = result.total;
  } catch {
    // Client will retry after hydration.
  }

  return <JobsPageClient initialJobs={initialJobs} initialTotal={initialTotal} />;
}

export const revalidate = 300;
