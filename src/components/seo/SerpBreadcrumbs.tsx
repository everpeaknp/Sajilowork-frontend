import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

export type SerpBreadcrumbItem = {
  label: string;
  href?: string;
};

type SerpBreadcrumbsProps = {
  items: SerpBreadcrumbItem[];
  className?: string;
};

/** Visible breadcrumb trail — pairs with BreadcrumbList JSON-LD for SERP rich results. */
export default function SerpBreadcrumbs({ items, className }: SerpBreadcrumbsProps) {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('w-full', className)}>
      <ol className="flex flex-wrap items-center gap-1 text-xs text-neutral-500 sm:text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {index > 0 ? (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-neutral-300" aria-hidden />
              ) : null}
              {isLast || !item.href ? (
                <span
                  className={cn(
                    'font-medium',
                    isLast ? 'text-neutral-800' : 'text-neutral-500',
                  )}
                  {...(isLast ? { 'aria-current': 'page' as const } : {})}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="font-medium text-neutral-600 transition-colors hover:text-brand-emerald"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
