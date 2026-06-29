import { notFound } from 'next/navigation';

import { fetchPublicJson } from '@/lib/seo/api';
import { normalizeTaskForDisplay } from '@/lib/taskUtils';
import type { Task } from '@/types';

import TaskSlugPageClient from './TaskSlugPageClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function TaskDetailPage({ params }: Props) {
  const { slug } = await params;
  if (!slug) notFound();

  const raw = await fetchPublicJson<Task>(`/tasks/${encodeURIComponent(slug)}/`, {
    revalidate: 300,
  });

  if (!raw) notFound();

  const task = normalizeTaskForDisplay(raw);

  return <TaskSlugPageClient task={task} />;
}

export const revalidate = 300;
