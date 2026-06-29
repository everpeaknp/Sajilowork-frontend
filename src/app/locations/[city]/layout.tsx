import type { Metadata } from 'next';

import JsonLd from '@/components/seo/JsonLd';
import {
  buildBreadcrumbSchema,
  buildLocalBusinessSchema,
  buildPageMetadata,
  buildSchemaGraph,
  buildWebPageSchema,
  getSeoLocationPage,
} from '@/lib/seo';
import { fetchSiteSettings } from '@/lib/siteSettings';

type Props = {
  children: React.ReactNode;
  params: Promise<{ city: string }>;
};

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { city } = await params;
  const location = getSeoLocationPage(city);
  if (!location) {
    return buildPageMetadata({
      title: 'Location',
      path: `/locations/${city}`,
      noindex: true,
    });
  }

  return buildPageMetadata({
    title: `Hire freelancers in ${location.name}, Nepal`,
    description: location.description,
    path: `/locations/${location.slug}`,
  });
}

export default async function LocationLayout({ children, params }: Props) {
  const { city } = await params;
  const location = getSeoLocationPage(city);
  if (!location) return children;

  const settings = await fetchSiteSettings();
  const path = `/locations/${location.slug}`;
  const title = `Sajilowork in ${location.name}`;

  const schema = buildSchemaGraph([
    buildBreadcrumbSchema(
      [
        { name: 'Home', path: '/' },
        { name: location.name, path },
      ],
      settings,
    ),
    buildWebPageSchema({
      title,
      description: location.description,
      path,
      settings,
    }),
    buildLocalBusinessSchema({
      name: title,
      description: location.description,
      path,
      city: location.name,
      settings,
    }),
  ]);

  return (
    <>
      <JsonLd data={schema} />
      {children}
    </>
  );
}
