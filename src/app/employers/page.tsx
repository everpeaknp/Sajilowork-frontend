import type { Employer } from '@/components/employers/employerData';

import { fetchServerEmployers } from '@/lib/seo/server-employers';

import EmployersPageClient from './EmployersPageClient';

export default async function EmployersPage() {
  let initialEmployers: Employer[] = [];

  try {
    initialEmployers = await fetchServerEmployers(200);
  } catch {
    // Client will retry after hydration.
  }

  return <EmployersPageClient initialEmployers={initialEmployers} />;
}

export const revalidate = 300;
