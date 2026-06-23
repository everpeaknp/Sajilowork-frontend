import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import MarketingPageLayout from '@/components/marketing/MarketingPageLayout';
import { buildPageMetadata, fetchCategorySeo } from '@/lib/seo';
import { POST_TASK_PATH } from '@/lib/postTaskPath';

type Props = {
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
    title: `${category.name} services and tasks in Nepal`,
    description:
      category.description ||
      `Browse ${category.name} tasks, jobs, and services on Sajilowork. Hire freelancers or find work in Nepal.`,
    path: `/categories/${slug}`,
  });
}

export default async function CategorySlugPage({ params }: Props) {
  const { slug } = await params;
  const category = await fetchCategorySeo(slug);
  if (!category?.name) notFound();

  const listingKind = category.listing_kind || 'task';
  const browseHref =
    listingKind === 'job'
      ? `/jobs?category=${encodeURIComponent(category.name)}`
      : listingKind === 'service'
        ? `/services?category=${encodeURIComponent(category.name)}`
        : `/task?category=${encodeURIComponent(category.name)}`;

  return (
    <MarketingPageLayout
      title={category.name}
      description={`Find ${category.name.toLowerCase()} work or hire help across Nepal.`}
      contentClassName="max-w-3xl"
    >
      <p className="mb-6 text-sm leading-relaxed text-[#6a719a] sm:text-base">
        {category.description ||
          `Explore ${category.name} listings on Sajilowork — Nepal’s marketplace for tasks, jobs, and local services.`}
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href={browseHref}
          className="inline-flex rounded-full bg-brand-emerald px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Browse {category.name}
        </Link>
        <Link
          href={POST_TASK_PATH}
          className="inline-flex rounded-full border border-neutral-200 px-5 py-2.5 text-sm font-semibold text-brand-dark transition hover:border-brand-emerald hover:text-brand-emerald"
        >
          Post a task
        </Link>
      </div>
    </MarketingPageLayout>
  );
}
