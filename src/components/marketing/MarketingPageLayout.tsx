import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import SerpBreadcrumbs, { type SerpBreadcrumbItem } from '@/components/seo/SerpBreadcrumbs';
import { landingHeadline } from '@/components/LangingHome/landingTypography';

type MarketingPageLayoutProps = {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  breadcrumbItems?: SerpBreadcrumbItem[];
  children: React.ReactNode;
  contentClassName?: string;
  hideHero?: boolean;
};

export default function MarketingPageLayout({
  title,
  description,
  backHref = '/',
  backLabel = 'Back to home',
  breadcrumbItems,
  children,
  contentClassName = 'max-w-3xl',
  hideHero = false,
}: MarketingPageLayoutProps) {
  return (
    <div className="mobile-bottom-nav-offset flex min-h-screen flex-col overflow-x-hidden bg-white dark:bg-neutral-950">
      <Navbar />
      <main className="flex-1">
        {hideHero && backHref ? (
          <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8">
            {breadcrumbItems?.length ? (
              <SerpBreadcrumbs items={breadcrumbItems} className="mb-4" />
            ) : null}
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-dark transition-colors hover:text-brand-emerald dark:text-stone-100 dark:hover:text-brand-emerald"
            >
              <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
              {backLabel}
            </Link>
          </div>
        ) : null}
        {!hideHero ? (
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-dark via-[#1e5c48] to-brand-emerald text-white">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-300/25 via-brand-emerald/10 to-transparent opacity-40" />
          <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12 md:py-14">
            {breadcrumbItems?.length ? (
              <SerpBreadcrumbs items={breadcrumbItems} className="mb-4 text-emerald-100/80 [&_a]:text-emerald-100 [&_a:hover]:text-white [&_span]:text-emerald-100" />
            ) : null}
            {backHref ? (
              <Link
                href={backHref}
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-100 transition-colors hover:text-white"
              >
                <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
                {backLabel}
              </Link>
            ) : null}
            <h1 className={`${landingHeadline} text-3xl leading-tight text-balance sm:text-4xl md:text-5xl`}>
              {title}
            </h1>
            {description ? (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-emerald-100/90 sm:text-base">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        ) : null}

        <div className={`mx-auto px-4 py-10 sm:px-6 sm:py-12 md:py-14 ${contentClassName}`}>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
