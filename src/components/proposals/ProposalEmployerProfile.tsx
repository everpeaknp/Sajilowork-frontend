'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import SingleEmployerPage from '@/components/employers/SingleEmployerPage';
import { getEmployerProfilePath } from '@/components/employers/employerSlug';
import { loadEmployerPageData } from '@/lib/employerApi';
import {
  getEmployerDisplayName,
  resolveEmployerSlug,
} from '@/lib/proposalDetailUtils';
import type { Bid, Task } from '@/types';

type ProposalEmployerProfileProps = {
  bid: Bid;
  task?: Task | null;
  loadingMessage?: string;
};

export default function ProposalEmployerProfile({
  bid,
  task = null,
  loadingMessage = 'Loading employer profile…',
}: ProposalEmployerProfileProps) {
  const [pageData, setPageData] = useState<Awaited<ReturnType<typeof loadEmployerPageData>>>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  const slug = useMemo(() => resolveEmployerSlug(bid, task), [bid, task]);
  const displayName = getEmployerDisplayName(bid);

  useEffect(() => {
    let cancelled = false;

    if (!slug) {
      setPageData(null);
      setLoadFailed(true);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    setLoadFailed(false);

    void loadEmployerPageData(slug)
      .then((loaded) => {
        if (cancelled) return;
        setPageData(loaded);
        setLoadFailed(!loaded);
      })
      .catch(() => {
        if (cancelled) return;
        setPageData(null);
        setLoadFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 py-16 text-center dark:border-neutral-700 dark:bg-neutral-900/50">
        <Loader2 className="h-8 w-8 animate-spin text-[#52C47F]" />
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{loadingMessage}</p>
      </div>
    );
  }

  if (!pageData || loadFailed) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-6 py-10 text-center dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-sm font-medium text-neutral-900 dark:text-stone-100">{displayName}</p>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Employer public profile is not available yet.
        </p>
      </div>
    );
  }

  const profileHref = getEmployerProfilePath(pageData.employer);

  return (
    <div className="overflow-hidden rounded-[20px] bg-white dark:bg-neutral-900">
      <div className="border-b border-neutral-100 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900 sm:px-6">
        <Link
          href={profileHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-normal text-[#45a874] transition-opacity hover:opacity-80 dark:text-emerald-400"
        >
          View public profile
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="px-4 pb-4 sm:px-6 sm:pb-6">
        <SingleEmployerPage
        employer={pageData.employer}
        projects={pageData.projects}
        jobs={pageData.jobs}
        reviews={pageData.reviews}
        embedded
        />
      </div>
    </div>
  );
}
