import type { Metadata } from 'next';

import MarketingPageJsonLd from '@/components/seo/MarketingPageJsonLd';
import { buildPageMetadata, getStaticPageSerp } from '@/lib/seo';

const serp = getStaticPageSerp('trustAndSafety');

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: serp.title,
    description: serp.description,
    path: '/trust-and-safety',
  });
}

export default function TrustAndSafetyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingPageJsonLd
        title={serp.title}
        description={serp.description}
        path="/trust-and-safety"
      />
      {children}
    </>
  );
}
