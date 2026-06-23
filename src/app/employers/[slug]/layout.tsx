import type { Metadata } from 'next';

import JsonLd from '@/components/seo/JsonLd';
import {
  buildBreadcrumbSchema,
  buildEmployerOrganizationSchema,
  buildListingMetadata,
  buildSchemaGraph,
  buildWebPageSchema,
  fetchEmployerSeo,
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
  const profile = await fetchEmployerSeo(slug);
  if (!profile) {
    return buildListingMetadata({
      title: null,
      path: `/employers/${slug}`,
      noindex: true,
    });
  }

  const name = profile.name || profile.slug || slug;
  return buildListingMetadata({
    title: `${name} — Employer on Sajilowork`,
    description: profile.description || profile.tagline,
    image: profile.logo_url,
    path: `/employers/${slug}`,
  });
}

export default async function EmployerSlugLayout({ children, params }: Props) {
  const { slug } = await params;
  const [profile, settings] = await Promise.all([
    fetchEmployerSeo(slug),
    fetchSiteSettings(),
  ]);

  if (!profile) {
    return children;
  }

  const name = profile.name || profile.slug || slug;
  const path = `/employers/${slug}`;
  const description = truncateDescription(profile.description || profile.tagline);

  const schema = buildSchemaGraph([
    buildBreadcrumbSchema(
      [
        { name: 'Home', path: '/' },
        { name: 'Employers', path: '/employers' },
        { name, path },
      ],
      settings,
    ),
    buildWebPageSchema({ title: name, description, path, settings }),
    withAggregateRating(
      buildEmployerOrganizationSchema({
        name,
        description,
        path,
        image: profile.logo_url,
        settings,
      }),
      profile.rating ?? profile.average_rating,
      profile.review_count ?? profile.total_reviews,
    ),
  ]);

  return (
    <>
      <JsonLd data={schema} />
      {children}
    </>
  );
}
