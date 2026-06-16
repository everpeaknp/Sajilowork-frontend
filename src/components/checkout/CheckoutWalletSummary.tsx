'use client';

import Link from 'next/link';
import { AlertCircle, Loader2, Wallet } from 'lucide-react';
import { formatNPR } from '@/lib/nepalLocale';
import type { CheckoutKind } from '@/lib/checkout';

export type CheckoutWalletPreview = {
  walletAvailable: number;
  totalHeld: number;
  walletSufficient: boolean;
  loading: boolean;
};

const COPY: Record<Extract<CheckoutKind, 'service' | 'job'>, { heldLabel: string; insufficientLead: string }> = {
  service: {
    heldLabel: 'Escrow hold',
    insufficientLead: 'before purchasing',
  },
  job: {
    heldLabel: 'Required balance',
    insufficientLead: 'before applying',
  },
};

type CheckoutWalletSummaryProps = CheckoutWalletPreview & {
  kind: CheckoutKind;
};

function AddFundsLink({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/dashboard/wallet?section=recharges"
      className={`inline-flex items-center gap-1.5 text-sm font-medium text-[#52C47F] underline-offset-2 hover:text-[#49b071] hover:underline ${className}`}
    >
      <Wallet className="h-4 w-4" />
      Add funds to wallet
    </Link>
  );
}

export default function CheckoutWalletSummary({
  kind,
  walletAvailable,
  totalHeld,
  walletSufficient,
  loading,
}: CheckoutWalletSummaryProps) {
  const balanceOnly = kind === 'task' || kind === 'project';

  if (loading) {
    return (
      <div className="mt-4 flex justify-center rounded-lg border border-neutral-200 bg-neutral-50/40 p-5">
        <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50/40 p-5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-neutral-500">
          {balanceOnly ? 'Available balance' : 'Wallet'}
        </span>
        <span className="font-medium tabular-nums text-neutral-900">{formatNPR(walletAvailable)}</span>
      </div>

      {balanceOnly ? (
        <div className="mt-4 border-t border-neutral-200 pt-4">
          <AddFundsLink />
        </div>
      ) : !walletSufficient ? (
        <div className="mt-4 border-t border-neutral-200 pt-4">
          <div className="flex items-start gap-2 text-sm text-amber-900">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Insufficient wallet balance</p>
              <p className="mt-1 text-amber-800/90">
                Load at least {formatNPR(totalHeld)} into your wallet{' '}
                {COPY[kind as 'service' | 'job'].insufficientLead}.
              </p>
              <AddFundsLink className="mt-3 text-amber-900 hover:text-amber-950" />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-neutral-200 pt-3 text-sm">
            <span className="text-neutral-500">{COPY[kind as 'service' | 'job'].heldLabel}</span>
            <span className="font-medium tabular-nums text-neutral-900">{formatNPR(totalHeld)}</span>
          </div>
          <div className="mt-4 border-t border-neutral-200 pt-4">
            <AddFundsLink />
          </div>
        </>
      )}
    </div>
  );
}
