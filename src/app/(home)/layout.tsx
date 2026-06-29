import type { Metadata } from 'next';

import HomePageJsonLd from '@/components/seo/HomePageJsonLd';
import { buildPageMetadata, getStaticPageSerp } from '@/lib/seo';

const serp = getStaticPageSerp('home');

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: serp.title,
    description: serp.description,
    path: '/',
  });
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HomePageJsonLd />
      {children}
    </>
  );
}

export const revalidate = 300;
