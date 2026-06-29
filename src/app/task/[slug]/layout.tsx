import type { Metadata } from 'next';

import JsonLd from '@/components/seo/JsonLd';
import CrawlableDetailShell from '@/components/seo/CrawlableDetailShell';
import {
  buildListingDetailSchemaGraph,
  buildDetailSerpTitle,
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
    title: task?.title ? buildDetailSerpTitle(task.title, 'Task in Nepal') : null,
    description: task?.description || task?.excerpt,
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
      {task?.title ? (
        <CrawlableDetailShell title={task.title} description={task.description || task.excerpt} />
      ) : null}
      {children}
    </>
  );
}

export const revalidate = 300;
