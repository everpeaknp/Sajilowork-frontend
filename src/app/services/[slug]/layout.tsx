import type { Metadata } from 'next';

import { buildListingMetadata, fetchListingSeo } from '@/lib/seo';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await fetchListingSeo('/services', slug);
  return buildListingMetadata({
    title: service?.title,
    description: service?.description,
    image: service?.primary_image,
    path: `/services/${slug}`,
  });
}

export default function ServiceSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
