import type { Metadata } from 'next';

import { buildListingMetadata, fetchListingSeo } from '@/lib/seo';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await fetchListingSeo('/projects', slug);
  return buildListingMetadata({
    title: project?.title,
    description: project?.description,
    image: project?.primary_image,
    path: `/projects/${slug}`,
  });
}

export default function ProjectSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
