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
  const project = await fetchListingSeo('/projects', slug);
  return buildListingMetadata({
    title: project?.title,
    description: project?.description,
    image: project?.primary_image,
    path: `/projects/${slug}`,
  });
}

export default async function ProjectSlugLayout({ children, params }: Props) {
  const { slug } = await params;
  const [project, settings] = await Promise.all([
    fetchListingSeo('/projects', slug),
    fetchSiteSettings(),
  ]);

  const schema =
    project &&
    buildListingDetailSchemaGraph({
      type: 'project',
      slug,
      record: project,
      settings,
    });

  return (
    <>
      {schema ? <JsonLd data={schema} /> : null}
      {children}
    </>
  );
}
