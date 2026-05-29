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
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#1161fe] px-8 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-[#1161fe]/25 transition hover:bg-[#0052cc] active:scale-[0.98] sm:text-base"
      >
        {primaryLabel}
      </Link>
      {secondaryHref && secondaryLabel ? (
        <Link
          href={secondaryHref}
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#1161fe]/30 bg-white px-8 py-3.5 text-center text-sm font-semibold text-[#1161fe] transition hover:bg-[#eef4ff] active:scale-[0.98] sm:text-base"
        >
          {secondaryLabel}
        </Link>
      ) : null}
    </div>
  );
}
