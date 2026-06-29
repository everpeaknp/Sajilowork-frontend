import type { Metadata } from 'next';

import { absoluteUrl, buildNoIndexPageMetadata, fetchFreelancerSeo } from '@/lib/seo';
import { fetchSiteSettings } from '@/lib/siteSettings';

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

/** Legacy /users/:slug URLs — noindex with canonical to /freelancers/:slug when profile exists. */
export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { slug } = await params;
  const [profile, settings] = await Promise.all([
    fetchFreelancerSeo(slug),
    fetchSiteSettings(),
  ]);

  const base = buildNoIndexPageMetadata(
    profile?.full_name || profile?.name || profile?.username || 'User Profile',
  );

  if (profile?.username || profile?.slug) {
    const canonicalSlug = (profile.username || profile.slug || slug).trim();
    return {
      ...base,
      alternates: {
        canonical: absoluteUrl(`/freelancers/${encodeURIComponent(canonicalSlug)}`, settings),
      },
    };
  }

  return base;
}

export default function UserSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
