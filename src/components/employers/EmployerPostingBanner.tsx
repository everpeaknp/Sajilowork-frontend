'use client';

import Link from 'next/link';
import type { EmployerPostingContext } from '@/lib/employerBusinessProfile';

type EmployerPostingBannerProps = {
  context: EmployerPostingContext;
  className?: string;
};

export default function EmployerPostingBanner({ context, className = '' }: EmployerPostingBannerProps) {
  const typeLabel = context.accountType === 'company' ? 'Company' : 'Individual';
  const profileHref = context.slug ? `/employers/${context.slug}` : '/dashboard/profile';

  return (
    <div
      className={`rounded-xl border border-[#d4eadc] bg-[#f3faf6] px-4 py-3 text-sm text-neutral-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-neutral-200 ${className}`}
    >
      <span className="font-medium text-neutral-900 dark:text-stone-100">Posting as {typeLabel}:</span>{' '}
      <span>{context.displayName}</span>
      {context.slug ? (
        <>
          {' '}
          ·{' '}
          <Link href={profileHref} className="font-medium text-[#2d8f57] hover:underline dark:text-emerald-400">
            Edit business profile
          </Link>
        </>
      ) : null}
    </div>
  );
}
