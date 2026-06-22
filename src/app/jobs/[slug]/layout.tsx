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
  const job = await fetchListingSeo('/jobs', slug);
  return buildListingMetadata({
    title: job?.title,
    description: job?.description,
    image: job?.primary_image,
    path: `/jobs/${slug}`,
  });
}

export default async function JobSlugLayout({ children, params }: Props) {
  const { slug } = await params;
  const [job, settings] = await Promise.all([
    fetchListingSeo('/jobs', slug),
    fetchSiteSettings(),
  ]);

  const schema =
    job &&
    buildListingDetailSchemaGraph({
      type: 'job',
      slug,
      record: job,
      settings,
    });

  return (
    <>
      {schema ? <JsonLd data={schema} /> : null}
      {children}
    </>
  );
}
