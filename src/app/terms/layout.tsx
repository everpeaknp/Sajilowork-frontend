import type { Metadata } from 'next';

import MarketingPageJsonLd from '@/components/seo/MarketingPageJsonLd';
import { buildPageMetadata, getStaticPageSerp } from '@/lib/seo';

const serp = getStaticPageSerp('terms');

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: serp.title,
    description: serp.description,
    path: '/terms',
  });
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingPageJsonLd title={serp.title} description={serp.description} path="/terms" />
      {children}
    </>
  );
}
