import { searchBrowseProjects } from '@/lib/listingSearchApi';
import type { Project } from '@/components/projects/projectListData';

import ProjectsPageClient from './ProjectsPageClient';

export default async function ProjectsPage() {
  let initialProjects: Project[] = [];
  let initialTotal = 0;

  try {
    const result = await searchBrowseProjects({ page: 1, page_size: 8, sort_by: 'newest' });
    initialProjects = result.items;
    initialTotal = result.total;
  } catch {
    // Client will retry after hydration.
  }

  return <ProjectsPageClient initialProjects={initialProjects} initialTotal={initialTotal} />;
}

export const revalidate = 300;
