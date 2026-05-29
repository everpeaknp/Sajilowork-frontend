"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TOP_CATEGORIES } from "../constants";
import { taskService } from "@/services/task.service";
import { buildCategoryColumns, postTaskHref, type CategoryColumn } from "@/lib/landingHome";
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
        if (cancelled || !res.success || !Array.isArray(res.data) || res.data.length === 0) {
          return;
        }
        const built = buildCategoryColumns(res.data);
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
    <section className="bg-white py-24 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <h2 className={`${landingHeadline} text-3xl sm:text-4xl`}>Top Categories</h2>
          <Link
            href="/discover"
            className="text-sm font-semibold text-[#1161fe] hover:underline"
          >
            Explore all services →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 sm:gap-20">
          {columns.map((group) => (
            <div key={group.title}>
              <h4 className={`${landingHeadline} text-lg text-gray-900 mb-6`}>{group.title}</h4>
              <ul className="space-y-4">
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
