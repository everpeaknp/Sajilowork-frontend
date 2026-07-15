'use client';

import SerpBreadcrumbs from '@/components/seo/SerpBreadcrumbs';
import { getStaticPageSerp, type StaticSerpPageKey } from '@/lib/seo';
import { cn } from '@/lib/utils';

export type MarketplaceHeroBreadcrumbsProps = {
  serpKey: StaticSerpPageKey;
  sectionPath: string;
  variant?: 'light' | 'dark';
  className?: string;
};

const VARIANT_CLASSES: Record<NonNullable<MarketplaceHeroBreadcrumbsProps['variant']>, string> = {
  light:
    '[&_ol]:justify-end [&_a]:text-neutral-600 [&_a:hover]:text-brand-emerald [&_span]:text-neutral-800 [&_ol]:text-neutral-500 [&_svg]:text-neutral-300 dark:[&_a]:text-neutral-300 dark:[&_a:hover]:text-[#52C47F] dark:[&_span]:text-stone-100 dark:[&_ol]:text-neutral-400 dark:[&_svg]:text-neutral-600',
  dark: '[&_ol]:justify-end [&_a]:text-white/85 [&_a:hover]:text-white [&_span]:text-white [&_ol]:text-white/70 [&_svg]:text-white/45',
};

export default function MarketplaceHeroBreadcrumbs({
  serpKey,
  sectionPath,
  variant = 'light',
  className,
}: MarketplaceHeroBreadcrumbsProps) {
  const serp = getStaticPageSerp(serpKey);

  return (
    <div
      className={cn(
        'pointer-events-auto absolute right-4 top-4 z-20 sm:right-6 sm:top-5 lg:right-8 lg:top-6',
        className,
      )}
    >
      <SerpBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: serp.breadcrumb, href: sectionPath },
        ]}
        className={VARIANT_CLASSES[variant]}
      />
    </div>
  );
}
