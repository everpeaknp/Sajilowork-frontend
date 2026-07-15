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
  const job = await fetchListingSeo('/jobs', slug);
  return buildListingMetadata({
    title: job?.title ? buildDetailSerpTitle(job.title, 'Job in Nepal') : null,
    description: job?.description || job?.excerpt,
    image: job?.primary_image,
    path: `/jobs/${slug}`,
  });
}

export default async function JobSlugLayout({ children, params }: Props) {
  const { slug } = await params;

  let schema: ReturnType<typeof buildListingDetailSchemaGraph> = null;
  let jobTitle: string | undefined;
  let jobDescription: string | undefined;

  try {
    const [job, settings] = await Promise.all([
      fetchListingSeo('/jobs', slug),
      fetchSiteSettings(),
    ]);
    jobTitle = job?.title;
    jobDescription = job?.description || job?.excerpt;
    schema =
      job &&
      buildListingDetailSchemaGraph({
        type: 'job',
        slug,
        record: job,
        settings,
      });
  } catch (error) {
    console.error('[JobSlugLayout] SEO enrichment failed', slug, error);
  }

  return (
    <>
      {schema ? <JsonLd data={schema} /> : null}
      {jobTitle ? (
        <CrawlableDetailShell title={jobTitle} description={jobDescription} />
      ) : null}
      {children}
    </>
  );
}

export const revalidate = 300;
