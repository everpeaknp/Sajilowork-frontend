import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import { landingHeadline } from '@/components/LangingHome/landingTypography';

type MarketingPageLayoutProps = {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
  contentClassName?: string;
};

export default function MarketingPageLayout({
  title,
  description,
  backHref = '/',
  backLabel = 'Back to home',
  children,
  contentClassName = 'max-w-3xl',
}: MarketingPageLayoutProps) {
  return (
    <div className="mobile-bottom-nav-offset flex min-h-screen flex-col overflow-x-hidden bg-white">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-to-br from-[#005fff] via-[#0047ff] to-[#03113c] text-white">
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12 md:py-14">
            {backHref ? (
              <Link
                href={backHref}
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-100 transition-colors hover:text-white"
              >
                <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
                {backLabel}
              </Link>
            ) : null}
            <h1 className={`${landingHeadline} text-3xl leading-tight text-balance sm:text-4xl md:text-5xl`}>
              {title}
            </h1>
            {description ? (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-blue-100/90 sm:text-base">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <div className={`mx-auto px-4 py-10 sm:px-6 sm:py-12 md:py-14 ${contentClassName}`}>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
