"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TOP_CATEGORIES } from "../constants";
import { taskService } from "@/services/task.service";
import { buildCategoryColumns, postTaskHref, type CategoryColumn } from "@/lib/landingHome";
import { extractCategoryList } from "@/lib/taskUtils";
import { landingHeadline } from "./landingTypography";

function fallbackColumns(): CategoryColumn[] {
  return TOP_CATEGORIES.map((group) => ({
    title: group.title,
    links: group.links.map((label) => ({
      label,
      href: postTaskHref(`${group.title} — ${label}`),
    })),
  }));
}

export default function CategoryDirectory() {
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
    <section className="border-t border-gray-100 bg-white py-12 sm:py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <h2 className={`${landingHeadline} text-2xl sm:text-4xl`}>Top Categories</h2>
          <Link
            href="/discover"
            className="text-sm font-semibold text-[#1161fe] hover:underline"
          >
            Explore all services →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-10 md:grid-cols-3 lg:grid-cols-5 lg:gap-x-16 lg:gap-y-12">
          {columns.map((group) => (
            <div key={group.title} className="min-w-0">
              <h4 className={`${landingHeadline} mb-4 text-base text-gray-900 sm:mb-6 sm:text-lg`}>{group.title}</h4>
              <ul className="space-y-2.5 sm:space-y-4">
                {group.links.map((link) => (
                  <li key={`${group.title}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-[#1161fe] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
