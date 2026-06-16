'use client';

import Link from 'next/link';
import type { CheckoutKind } from '@/lib/checkout';

export type CheckoutSummaryData = {
  title: string;
  subtitle?: string;
  priceLabel?: string;
  detailHref: string;
};

type CheckoutOrderSummaryProps = {
  kind: CheckoutKind;
  summary: CheckoutSummaryData;
};

const KIND_LABEL: Record<CheckoutKind, string> = {
  task: 'Task',
  project: 'Project',
  job: 'Job',
  service: 'Service',
};

export default function CheckoutOrderSummary({ kind, summary }: CheckoutOrderSummaryProps) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50/40 p-5">
      <p className="text-sm font-medium text-neutral-900">Summary</p>

      <div className="mt-4 space-y-4">
        <div>
          <p className="text-xs text-neutral-500">{KIND_LABEL[kind]}</p>
          <p className="mt-1 text-sm leading-snug text-neutral-900">{summary.title}</p>
          {summary.subtitle ? (
            <p className="mt-0.5 text-xs text-neutral-500">{summary.subtitle}</p>
          ) : null}
        </div>

        {summary.priceLabel ? (
          <div className="flex items-baseline justify-between gap-4 border-t border-neutral-200 pt-4 text-sm">
            <span className="text-neutral-500">Amount</span>
            <span className="font-medium tabular-nums text-neutral-900">{summary.priceLabel}</span>
          </div>
        ) : null}
      </div>

      <Link
        href={summary.detailHref}
        className="mt-5 inline-block text-xs text-neutral-500 underline-offset-2 hover:text-neutral-900 hover:underline"
      >
        View listing
      </Link>
    </div>
  );
}
