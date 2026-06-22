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
  const task = await fetchListingSeo('/tasks', slug);
  return buildListingMetadata({
    title: task?.title,
    description: task?.description,
    image: task?.primary_image,
    path: `/task/${slug}`,
  });
}

export default async function TaskSlugLayout({ children, params }: Props) {
  const { slug } = await params;
  const [task, settings] = await Promise.all([
    fetchListingSeo('/tasks', slug),
    fetchSiteSettings(),
  ]);

  const schema =
    task &&
    buildListingDetailSchemaGraph({
      type: 'task',
      slug,
      record: task,
      settings,
    });

  return (
    <>
      {schema ? <JsonLd data={schema} /> : null}
      {children}
    </>
  );
}
