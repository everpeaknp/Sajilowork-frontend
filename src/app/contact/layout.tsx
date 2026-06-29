import type { Metadata } from 'next';

import MarketingPageJsonLd from '@/components/seo/MarketingPageJsonLd';
import { buildPageMetadata, getStaticPageSerp } from '@/lib/seo';

const serp = getStaticPageSerp('contact');

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: serp.title,
    description: serp.description,
    path: '/contact',
  });
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingPageJsonLd title={serp.title} description={serp.description} path="/contact" />
      {children}
    </>
  );
}
