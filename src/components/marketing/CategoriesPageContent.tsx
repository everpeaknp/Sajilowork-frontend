'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TOP_CATEGORIES } from '@/components/constants';
import { taskService } from '@/services/task.service';
import { buildCategoryColumns, postTaskHref, type CategoryColumn } from '@/lib/landingHome';
import { extractCategoryList } from '@/lib/taskUtils';
import { landingHeadlineSm } from '@/components/LangingHome/landingTypography';
import MarketingCta from './MarketingCta';

function fallbackColumns(): CategoryColumn[] {
  return TOP_CATEGORIES.map((group) => ({
    title: group.title,
    links: group.links.map((label) => ({
      label,
      href: postTaskHref(`${group.title} — ${label}`),
    })),
  }));
}

export default function CategoriesPageContent() {
  const [columns, setColumns] = useState<CategoryColumn[]>(fallbackColumns());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await taskService.getCategories();
        const list = res.success ? extractCategoryList(res.data) : [];
        if (cancelled || list.length === 0) {
          return;
        }
        const built = buildCategoryColumns(list);
        if (built.length > 0) setColumns(built);
      } catch {
        /* keep fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-w-0">
      <p className="mb-8 text-sm leading-relaxed text-[#6a719a] sm:mb-10 sm:text-base">
        Browse popular services in Nepal. Select a category to post a task or{' '}
        <Link href="/discover" className="font-semibold text-brand-emerald hover:underline">
          explore all services
        </Link>
        .
      </p>

      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {columns.map((group) => (
          <div key={group.title} className="min-w-0">
            <h2 className={`${landingHeadlineSm} mb-4 text-base text-brand-dark sm:text-lg`}>
              {group.title}
            </h2>
            <ul className="space-y-2.5">
              {group.links.map((link) => (
                <li key={`${group.title}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#384179] transition-colors hover:text-brand-emerald sm:text-[15px]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <MarketingCta
        primaryHref="/post-task"
        primaryLabel="Post a task"
        secondaryHref="/task"
        secondaryLabel="Browse tasks"
      />
    </div>
  );
}
