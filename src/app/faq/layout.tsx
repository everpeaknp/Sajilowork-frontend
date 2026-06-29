import type { Metadata } from 'next';

import JsonLd from '@/components/seo/JsonLd';
import {
  buildBreadcrumbSchema,
  buildFaqPageSchema,
  buildPageMetadata,
  buildSchemaGraph,
  buildWebPageSchema,
  fetchPublicJson,
  getStaticPageSerp,
} from '@/lib/seo';
import { fetchSiteSettings } from '@/lib/siteSettings';

const serp = getStaticPageSerp('faq');

type FaqItem = {
  question: string;
  answer: string;
};

type FaqResponse = {
  results?: FaqItem[];
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: serp.title,
    description: serp.description,
    path: '/faq',
  });
}

export default async function FaqLayout({ children }: { children: React.ReactNode }) {
  const [data, settings] = await Promise.all([
    fetchPublicJson<FaqResponse>('/faq/', { revalidate: 3600 }),
    fetchSiteSettings(),
  ]);
  const items = data?.results || [];

  const schemas = [
    buildBreadcrumbSchema(
      [
        { name: 'Home', path: '/' },
        { name: serp.breadcrumb, path: '/faq' },
      ],
      settings,
    ),
    buildWebPageSchema({
      title: serp.title,
      description: serp.description,
      path: '/faq',
      settings,
    }),
    ...(items.length
      ? [
          buildFaqPageSchema(
            items.map((item) => ({ question: item.question, answer: item.answer })),
          ),
        ]
      : []),
  ];

  return (
    <>
      <JsonLd data={buildSchemaGraph(schemas)} />
      {children}
    </>
  );
}
