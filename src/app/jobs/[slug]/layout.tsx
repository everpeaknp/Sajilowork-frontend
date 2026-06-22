import type { Metadata } from 'next';

import { buildListingMetadata, fetchListingSeo } from '@/lib/seo';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await fetchListingSeo('/jobs', slug);
  return buildListingMetadata({
    title: job?.title,
    description: job?.description,
    image: job?.primary_image,
    path: `/jobs/${slug}`,
  });
}

export default function JobSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
