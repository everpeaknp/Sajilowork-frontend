import Link from 'next/link';

type MarketingCtaProps = {
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export default function MarketingCta({
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: MarketingCtaProps) {
  return (
    <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <Link
        href={primaryHref}
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand-emerald px-8 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-brand-emerald/25 transition hover:bg-[#3d9665] active:scale-[0.98] sm:text-base"
      >
        {primaryLabel}
      </Link>
      {secondaryHref && secondaryLabel ? (
        <Link
          href={secondaryHref}
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-brand-emerald/30 bg-white px-8 py-3.5 text-center text-sm font-semibold text-brand-dark transition hover:bg-brand-light-bg active:scale-[0.98] sm:text-base"
        >
          {secondaryLabel}
        </Link>
      ) : null}
    </div>
  );
}
