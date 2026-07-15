'use client';

import { Suspense, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PaymentMethods from '@/components/tasker-dashboard/PaymentMethods';
import { DASHBOARD_PAGE_ROOT } from './dashboardResponsive';

type WalletSection = 'wallet' | 'recharges' | 'payouts' | 'statements';

const WALLET_SECTIONS = new Set<WalletSection>(['wallet', 'recharges', 'payouts', 'statements']);

function parseWalletSection(value: string | null): WalletSection | undefined {
  if (!value || !WALLET_SECTIONS.has(value as WalletSection)) {
    return undefined;
  }
  return value as WalletSection;
}

function WalletFallback() {
  return (
    <div className="max-w-7xl mx-auto w-full animate-pulse space-y-6 pb-6">
      <div className="space-y-4">
        <div className="h-3 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-10 w-56 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-4 w-72 max-w-full rounded bg-neutral-100 dark:bg-neutral-800/60" />
      </div>
      <div className="h-12 w-full max-w-md rounded-2xl bg-neutral-100 dark:bg-neutral-800/60" />
      <div className="h-64 rounded-[40px] bg-neutral-100 dark:bg-neutral-800/60" />
    </div>
  );
}

function DashboardWalletInner({
  initialTab,
}: {
  initialTab?: WalletSection;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionFromQuery = searchParams.get('section');

  useEffect(() => {
    if (sectionFromQuery === 'methods') {
      router.replace('/dashboard/settings?tab=payment-methods');
    }
  }, [sectionFromQuery, router]);

  const sectionFromQueryParsed = parseWalletSection(sectionFromQuery);
  const resolvedTab = useMemo(
    () => initialTab ?? sectionFromQueryParsed ?? 'wallet',
    [initialTab, sectionFromQueryParsed]
  );

  if (sectionFromQuery === 'methods') {
    return null;
  }

  return (
    <div className={`${DASHBOARD_PAGE_ROOT} min-w-0`}>
      <PaymentMethods initialTab={resolvedTab} />
    </div>
  );
}

export default function DashboardWallet(props: { initialTab?: WalletSection }) {
  return (
    <Suspense fallback={<WalletFallback />}>
      <DashboardWalletInner {...props} />
    </Suspense>
  );
}
