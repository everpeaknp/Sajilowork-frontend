import { notFound } from 'next/navigation';

import { mapTaskToPublicProject } from '@/lib/projectApi';
import { fetchPublicJson } from '@/lib/seo/api';
import type { Project } from '@/components/projects/projectListData';
import type { Task } from '@/types';

import ProjectSlugPageClient from './ProjectSlugPageClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProjectSlugPage({ params }: Props) {
  const { slug } = await params;
  if (!slug) notFound();

  // Prefer native fetch for RSC — avoids axios/js-cookie edge cases on the server.
  const raw = await fetchPublicJson<Task>(`/projects/${encodeURIComponent(slug)}/`, {
    revalidate: 300,
  });
  if (!raw) notFound();

  let project: Project;
  try {
    project = mapTaskToPublicProject(raw);
  } catch (error) {
    console.error('[ProjectSlugPage] Failed to map project', slug, error);
    notFound();
  }

  return <ProjectSlugPageClient project={project} />;
}

export const revalidate = 300;
