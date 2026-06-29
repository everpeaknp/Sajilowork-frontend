import type { Metadata } from 'next';

import JsonLd from '@/components/seo/JsonLd';
import CrawlableDetailShell from '@/components/seo/CrawlableDetailShell';
import {
  buildBreadcrumbSchema,
  buildDetailSerpTitle,
  buildListingMetadata,
  buildPersonSchema,
  buildSchemaGraph,
  buildWebPageSchema,
  fetchFreelancerSeo,
  withAggregateRating,
} from '@/lib/seo';
import { truncateDescription } from '@/lib/seo/constants';
import { fetchSiteSettings } from '@/lib/siteSettings';

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { slug } = await params;
  const profile = await fetchFreelancerSeo(slug);
  if (!profile) {
    return buildListingMetadata({
      title: null,
      path: `/freelancers/${slug}`,
      noindex: true,
    });
  }

  const name = profile.full_name || profile.username || slug;
  return buildListingMetadata({
    title: buildDetailSerpTitle(name, 'Freelancer in Nepal'),
    description: profile.bio || profile.tagline || profile.specialization,
    image: profile.profile_image,
    path: `/freelancers/${slug}`,
  });
}

export default async function FreelancerSlugLayout({ children, params }: Props) {
  const { slug } = await params;
  const [profile, settings] = await Promise.all([
    fetchFreelancerSeo(slug),
    fetchSiteSettings(),
  ]);

  if (!profile) {
    return children;
  }

  const name = profile.full_name || profile.username || slug;
  const path = `/freelancers/${slug}`;
  const description = truncateDescription(profile.bio || profile.tagline);

  const schema = buildSchemaGraph([
    buildBreadcrumbSchema(
      [
        { name: 'Home', path: '/' },
        { name: 'Freelancers', path: '/freelancers' },
        { name, path },
      ],
      settings,
    ),
    buildWebPageSchema({ title: name, description, path, settings }),
    withAggregateRating(
      buildPersonSchema({
        name,
        description,
        path,
        image: profile.profile_image,
        jobTitle: profile.specialization || 'Freelancer',
        settings,
      }),
      profile.average_rating,
      profile.total_reviews,
    ),
  ]);

  return (
    <>
      <JsonLd data={schema} />
      <CrawlableDetailShell title={name} description={description} />
      {children}
    </>
  );
}

export const revalidate = 300;
