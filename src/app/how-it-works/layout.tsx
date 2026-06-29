import type { Metadata } from 'next';

import MarketingPageJsonLd from '@/components/seo/MarketingPageJsonLd';
import { buildPageMetadata, getStaticPageSerp } from '@/lib/seo';

const serp = getStaticPageSerp('howItWorks');

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: serp.title,
    description: serp.description,
    path: '/how-it-works',
  });
}

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingPageJsonLd
        title={serp.title}
        description={serp.description}
        path="/how-it-works"
      />
      {children}
    </>
  );
}
