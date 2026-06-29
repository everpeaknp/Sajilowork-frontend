import type { Metadata } from 'next';

import JsonLd from '@/components/seo/JsonLd';
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  buildDetailSerpTitle,
  buildPageMetadata,
  buildSchemaGraph,
  buildWebPageSchema,
  fetchCategorySeo,
} from '@/lib/seo';
import { fetchSiteSettings } from '@/lib/siteSettings';

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { slug } = await params;
  const category = await fetchCategorySeo(slug);
  if (!category?.name) {
    return buildPageMetadata({
      title: 'Category',
      path: `/categories/${slug}`,
      noindex: true,
    });
  }

  return buildPageMetadata({
    title: buildDetailSerpTitle(category.name, 'Services in Nepal'),
    description:
      category.description ||
      `Browse ${category.name} tasks, jobs, and services on Sajilowork. Hire freelancers or find work in Nepal.`,
    path: `/categories/${slug}`,
  });
}

export default async function CategorySlugLayout({ children, params }: Props) {
  const { slug } = await params;
  const [category, settings] = await Promise.all([
    fetchCategorySeo(slug),
    fetchSiteSettings(),
  ]);

  if (!category?.name) {
    return children;
  }

  const path = `/categories/${slug}`;
  const title = `${category.name} services and tasks in Nepal`;
  const description =
    category.description ||
    `Browse ${category.name} tasks, jobs, and services on Sajilowork.`;

  const schema = buildSchemaGraph([
    buildBreadcrumbSchema(
      [
        { name: 'Home', path: '/' },
        { name: 'Categories', path: '/categories' },
        { name: category.name, path },
      ],
      settings,
    ),
    buildWebPageSchema({ title, description, path, settings }),
    buildCollectionPageSchema({ name: category.name, description, path, settings }),
  ]);

  return (
    <>
      <JsonLd data={schema} />
      {children}
    </>
  );
}
