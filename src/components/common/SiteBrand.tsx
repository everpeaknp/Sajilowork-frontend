import Image from 'next/image';
import Link from 'next/link';

import { landingHeadline } from '@/components/LangingHome/landingTypography';
import { cn, getMediaUrl } from '@/lib/utils';

type SiteBrandProps = {
  displayName: string;
  logoUrl?: string | null;
  href?: string;
  className?: string;
  textClassName?: string;
  logoClassName?: string;
  showIconFallback?: boolean;
  /** Logo display size — header fits the navbar; footer is larger. */
  size?: 'header' | 'footer';
};

/** Logo + name layout — logo uses intrinsic width so text sits tight beside the mark. */
const LOGO_LAYOUT = {
  header: {
    image: 'h-11 w-auto sm:h-12',
    width: 120,
    height: 48,
    gap: 'gap-2 sm:gap-2.5',
    nameClass: `${landingHeadline} text-base text-brand-emerald min-[380px]:text-lg sm:text-xl`,
  },
  footer: {
    image: 'h-16 w-auto sm:h-[4.5rem]',
    width: 112,
    height: 72,
    gap: 'gap-0.5 sm:gap-1',
    nameClass: `${landingHeadline} text-xl text-brand-emerald sm:text-2xl`,
  },
} as const;

function BrandName({ name, className }: { name: string; className?: string }) {
  if (!name.trim()) return null;

  const match = name.match(/^(.+?)(work)$/i);
  if (match) {
    return (
      <span className={className}>
        {match[1]}
        <span className="text-brand-dark">{match[2]}</span>
      </span>
    );
  }
  return <span className={className}>{name}</span>;
}

export default function SiteBrand({
  displayName,
  logoUrl,
  href = '/',
  className,
  textClassName,
  logoClassName,
  showIconFallback = true,
  size = 'header',
}: SiteBrandProps) {
  const resolvedLogo = getMediaUrl(logoUrl);
  const layout = LOGO_LAYOUT[size];
  const nameClassName = cn(layout.nameClass, textClassName);

  return (
    <Link
      href={href}
      aria-label={displayName || 'Home'}
      className={cn(
        'flex min-w-0 shrink items-center focus:outline-none cursor-pointer',
        layout.gap,
        className,
      )}
    >
      {resolvedLogo ? (
        <Image
          src={resolvedLogo}
          alt=""
          aria-hidden
          width={layout.width}
          height={layout.height}
          className={cn('shrink-0 object-contain object-left', layout.image, logoClassName)}
          priority
        />
      ) : showIconFallback ? (
        <div
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-emerald/10 ring-1 ring-brand-emerald/20"
        >
          <span className="font-['Outfit'] text-xl font-extrabold tracking-tighter text-brand-emerald">
            {displayName.charAt(0).toLowerCase() || 's'}
          </span>
        </div>
      ) : null}

      <BrandName name={displayName} className={nameClassName} />
    </Link>
  );
}
