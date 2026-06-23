import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import MarketingPageLayout from '@/components/marketing/MarketingPageLayout';
import { buildPageMetadata, getSeoLocationPage } from '@/lib/seo';
import { POST_TASK_PATH } from '@/lib/postTaskPath';

type Props = {
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

export default async function LocationPage({ params }: Props) {
  const { city } = await params;
  const location = getSeoLocationPage(city);
  if (!location) notFound();

  return (
    <MarketingPageLayout
      title={`Sajilowork in ${location.name}`}
      description={`Find local taskers, jobs, and services in ${location.name}.`}
      contentClassName="max-w-3xl"
    >
      <p className="mb-6 text-sm leading-relaxed text-[#6a719a] sm:text-base">{location.description}</p>
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/discover?location=${encodeURIComponent(location.name)}`}
          className="inline-flex rounded-full bg-brand-emerald px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Explore {location.name}
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
