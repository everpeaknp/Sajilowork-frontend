import { searchBrowseTasks } from '@/lib/listingSearchApi';
import type { Task } from '@/types';

import TaskPageClient from './TaskPageClient';

export default async function TaskBrowsePage() {
  let initialTasks: Task[] = [];
  let initialTotal = 0;

  try {
    const result = await searchBrowseTasks({ page: 1, page_size: 8, sort_by: 'newest' });
    initialTasks = result.items;
    initialTotal = result.total;
  } catch {
    // Client will retry after hydration.
  }

  return <TaskPageClient initialTasks={initialTasks} initialTotal={initialTotal} />;
}

export const revalidate = 300;
