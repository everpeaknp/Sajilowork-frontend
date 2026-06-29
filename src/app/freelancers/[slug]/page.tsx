import { notFound, redirect } from 'next/navigation';

import {
  loadFreelancerPageData,
  resolveEmployerRedirectForSlug,
} from '@/lib/freelancerApi';

import FreelancerSlugPageClient from './FreelancerSlugPageClient';

type Props = {
  params: Promise<{ slug: string }>;
};

const UUID_SLUG = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function FreelancerSlugPage({ params }: Props) {
  const { slug } = await params;
  if (!slug) notFound();

  const bundle = await loadFreelancerPageData(slug);
  if (!bundle) {
    const employerPath = await resolveEmployerRedirectForSlug(slug);
    if (employerPath) redirect(employerPath);
    notFound();
  }

  const profileUsername = bundle.freelancer.username?.trim();
  if (
    UUID_SLUG.test(slug) &&
    profileUsername &&
    profileUsername.toLowerCase() !== slug.toLowerCase()
  ) {
    redirect(`/freelancers/${encodeURIComponent(profileUsername)}`);
  }

  return <FreelancerSlugPageClient bundle={bundle} slug={slug} />;
}

export const revalidate = 300;
