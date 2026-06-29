import { notFound } from 'next/navigation';

import { fetchPublicProjectBySlug } from '@/lib/projectApi';

import ProjectSlugPageClient from './ProjectSlugPageClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProjectSlugPage({ params }: Props) {
  const { slug } = await params;
  if (!slug) notFound();

  const project = await fetchPublicProjectBySlug(slug);
  if (!project) notFound();

  return <ProjectSlugPageClient project={project} />;
}

export const revalidate = 300;
