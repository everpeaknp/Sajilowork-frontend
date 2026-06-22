import type { Metadata } from 'next';

import JsonLd from '@/components/seo/JsonLd';
import {
  buildListingDetailSchemaGraph,
  buildListingMetadata,
  fetchListingSeo,
} from '@/lib/seo';
import { fetchSiteSettings } from '@/lib/siteSettings';

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { slug } = await params;
  const service = await fetchListingSeo('/services', slug);
  return buildListingMetadata({
    title: service?.title,
    description: service?.description,
    image: service?.primary_image,
    path: `/services/${slug}`,
  });
}

export default async function ServiceSlugLayout({ children, params }: Props) {
  const { slug } = await params;
  const [service, settings] = await Promise.all([
    fetchListingSeo('/services', slug),
    fetchSiteSettings(),
  ]);

  const schema =
    service &&
    buildListingDetailSchemaGraph({
      type: 'service',
      slug,
      record: service,
      settings,
    });

  return (
    <>
      {schema ? <JsonLd data={schema} /> : null}
      {children}
    </>
  );
}
