'use client';

import { Suspense, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PaymentMethods from '@/components/tasker-dashboard/PaymentMethods';

type WalletSection = 'wallet' | 'recharges' | 'payouts';

const WALLET_SECTIONS = new Set<WalletSection>(['wallet', 'recharges', 'payouts']);

function parseWalletSection(value: string | null): WalletSection | undefined {
  if (!value || !WALLET_SECTIONS.has(value as WalletSection)) {
    return undefined;
  }
  return value as WalletSection;
}

function WalletFallback() {
  return (
    <div className="max-w-4xl animate-pulse space-y-6 pb-20">
      <div className="space-y-4">
        <div className="h-3 w-24 rounded bg-neutral-200" />
        <div className="h-10 w-56 rounded-lg bg-neutral-200" />
        <div className="h-4 w-72 max-w-full rounded bg-neutral-100" />
      </div>
      <div className="h-12 w-full max-w-md rounded-2xl bg-neutral-100" />
      <div className="h-64 rounded-[40px] bg-neutral-100" />
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

  return <PaymentMethods initialTab={resolvedTab} />;
}

export default function DashboardWallet(props: { initialTab?: WalletSection }) {
  return (
    <Suspense fallback={<WalletFallback />}>
      <DashboardWalletInner {...props} />
    </Suspense>
  );
}
