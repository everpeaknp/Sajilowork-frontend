import type { Metadata } from 'next';

import { buildListingMetadata, fetchListingSeo } from '@/lib/seo';

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { slug } = await params;
  const task = await fetchListingSeo('/tasks', slug);
  return buildListingMetadata({
    title: task?.title,
    description: task?.description,
    image: task?.primary_image,
    path: `/task/${slug}`,
  });
}

export default function TaskSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
