import type { Metadata } from 'next';

import MarketingPageJsonLd from '@/components/seo/MarketingPageJsonLd';
import { buildPageMetadata, getStaticPageSerp } from '@/lib/seo';

const serp = getStaticPageSerp('privacy');

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: serp.title,
    description: serp.description,
    path: '/privacy',
  });
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingPageJsonLd title={serp.title} description={serp.description} path="/privacy" />
      {children}
    </>
  );
}
