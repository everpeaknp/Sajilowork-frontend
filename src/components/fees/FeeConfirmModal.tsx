'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, X } from 'lucide-react';
import { formatNPR } from '@/lib/nepalLocale';
import {
  cancellationStageLabel,
  type CancellationStage,
  type FeeListingKind,
} from '@/lib/feeUtils';
import { paymentService, type FeePreview } from '@/services/payment.service';
import { CONFIRM_MODAL_ROOT_ATTR } from '@/app/dashboard/DeleteConfirmModal';

export type FeeConfirmMode = 'accept' | 'hire' | 'cancel' | 'withdraw' | 'submit' | 'purchase';

type FeeConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  mode: FeeConfirmMode;
  amount: number;
  listingKind?: FeeListingKind;
  categoryId?: string;
  cancellationStage?: CancellationStage;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirming?: boolean;
};

type CancellationPreview = {
  cancellation_fee: number;
  stage: string;
  rule_name?: string;
};

const MODE_DEFAULTS: Record<
  FeeConfirmMode,
  { title: string; description: string; confirmLabel: string }
> = {
  accept: {
    title: 'Review fees before accepting',
    description:
      'Fees below follow your platform Fee Rules. The total will be held from your wallet in escrow until work is completed.',
    confirmLabel: 'Accept & hold funds',
  },
  hire: {
    title: 'Accept this application?',
    description:
      'Job applications do not place funds in escrow or charge platform commission at hire time. You can arrange payment separately with the candidate.',
    confirmLabel: 'Accept application',
  },
  cancel: {
    title: 'Cancellation fee',
    description:
      'Cancelling may charge a fee based on the current stage and your Fee Rules. Confirm to proceed.',
    confirmLabel: 'Cancel listing',
  },
  withdraw: {
    title: 'Withdraw proposal',
    description:
      'Withdrawing may include a fee based on Fee Rules for this stage. Confirm to withdraw your proposal.',
    confirmLabel: 'Withdraw',
  },
  submit: {
    title: 'Fees on this offer',
    description:
      'Platform commission and related fees from Fee Rules apply when the offer is accepted and paid. Review before submitting.',
    confirmLabel: 'Submit offer',
  },
  purchase: {
    title: 'Review fees before purchase',
    description:
      'Fees below follow your platform Fee Rules. Payment will be held in escrow from your wallet until completion.',
    confirmLabel: 'Confirm purchase',
  },
};

function FeeSettlementRows({ fee }: { fee: FeePreview }) {
  const commission = Number(fee.commission ?? fee.platform_fee ?? 0);
  const escrow = Number(fee.escrow ?? 0);
  const tax = Number(fee.tax ?? 0);
  const discount = Number(fee.discount ?? 0);
  const totalHeld = Number(fee.poster_total_held ?? fee.total_customer_pays ?? fee.gross_amount);
  const workerReceives = Number(fee.worker_receives ?? fee.net_amount ?? 0);

  return (
    <div className="mt-4 space-y-2 rounded-xl border border-neutral-200 bg-neutral-50/80 px-4 py-3 text-left text-sm dark:border-neutral-700 dark:bg-neutral-950/50">
      <div className="flex justify-between gap-3">
        <span className="text-neutral-500 dark:text-neutral-400">Offer amount</span>
        <span className="tabular-nums text-neutral-900 dark:text-stone-100">
          {formatNPR(fee.gross_amount)}
        </span>
      </div>
      {commission > 0 ? (
        <div className="flex justify-between gap-3">
          <span className="text-neutral-500 dark:text-neutral-400">
            Tasker commission
            {fee.tasker_commission_percent
              ? ` (${fee.tasker_commission_percent}%)`
              : ''}
          </span>
          <span className="tabular-nums text-neutral-900 dark:text-stone-100">
            {formatNPR(commission)}
          </span>
        </div>
      ) : null}
      {escrow > 0 ? (
        <div className="flex justify-between gap-3">
          <span className="text-neutral-500 dark:text-neutral-400">Service / escrow fee</span>
          <span className="tabular-nums text-neutral-900 dark:text-stone-100">
            {formatNPR(escrow)}
          </span>
        </div>
      ) : null}
      {tax > 0 ? (
        <div className="flex justify-between gap-3">
          <span className="text-neutral-500 dark:text-neutral-400">Tax</span>
          <span className="tabular-nums text-neutral-900 dark:text-stone-100">{formatNPR(tax)}</span>
        </div>
      ) : null}
      {discount > 0 ? (
        <div className="flex justify-between gap-3">
          <span className="text-neutral-500 dark:text-neutral-400">Discount</span>
          <span className="tabular-nums text-emerald-700 dark:text-emerald-400">
            −{formatNPR(discount)}
          </span>
        </div>
      ) : null}
      <div className="flex justify-between gap-3 border-t border-neutral-200 pt-2 dark:border-neutral-700">
        <span className="font-medium text-neutral-800 dark:text-stone-200">
          Customer total / hold
        </span>
        <span className="font-semibold tabular-nums text-neutral-900 dark:text-stone-100">
          {formatNPR(totalHeld)}
        </span>
      </div>
      <div className="flex justify-between gap-3">
        <span className="text-neutral-500 dark:text-neutral-400">Worker receives</span>
        <span className="tabular-nums text-emerald-700 dark:text-emerald-400">
          {formatNPR(workerReceives)}
        </span>
      </div>
    </div>
  );
}

export default function FeeConfirmModal({
  open,
  onClose,
  onConfirm,
  mode,
  amount,
  listingKind,
  categoryId,
  cancellationStage = 'BEFORE_ACCEPT',
  title,
  description,
  confirmLabel,
  cancelLabel = 'Go back',
  confirming = false,
}: FeeConfirmModalProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settlement, setSettlement] = useState<FeePreview | null>(null);
  const [cancellation, setCancellation] = useState<CancellationPreview | null>(null);

  const defaults = MODE_DEFAULTS[mode];
  const isCancellationMode = mode === 'cancel' || mode === 'withdraw';
  /** Jobs hire without escrow — do not load marketplace commission / service fees. */
  const skipSettlementPreview = mode === 'hire' || (mode === 'accept' && listingKind === 'job');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSettlement(null);
      setCancellation(null);
      setError(null);
      return;
    }

    if (skipSettlementPreview) {
      setSettlement(null);
      setCancellation(null);
      setError(null);
      setLoading(false);
      return;
    }

    if (!(amount > 0)) {
      setSettlement(null);
      setCancellation(null);
      setError(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      setSettlement(null);
      setCancellation(null);

      try {
        if (isCancellationMode) {
          const res = await paymentService.getCancellationFeePreview({
            task_amount: amount,
            stage: cancellationStage,
            listing_kind: listingKind,
            category_id: categoryId,
          });
          if (cancelled) return;
          if (!res.success || !res.data) {
            throw new Error(res.message || 'Could not load cancellation fee');
          }
          setCancellation({
            cancellation_fee: Number(res.data.cancellation_fee) || 0,
            stage: String(res.data.stage || cancellationStage),
            rule_name: res.data.rule_name,
          });
        } else {
          const res = await paymentService.getFeePreview(amount, 'wallet', {
            listing_kind: listingKind,
            category_id: categoryId,
          });
          if (cancelled) return;
          if (!res.success || !res.data) {
            throw new Error(res.message || 'Could not load fee preview');
          }
          setSettlement(res.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load fee details');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [
    open,
    amount,
    listingKind,
    categoryId,
    cancellationStage,
    isCancellationMode,
    skipSettlementPreview,
  ]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      {...{ [CONFIRM_MODAL_ROOT_ATTR]: '' }}
      className="fixed inset-0 z-[10100] flex items-end justify-center p-4 sm:items-center sm:p-6"
    >
      <button
        type="button"
        aria-label="Close fee confirmation"
        onClick={onClose}
        className="absolute inset-0 bg-neutral-900/50"
        disabled={confirming}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fee-confirm-modal-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-neutral-100 bg-white px-5 py-6 shadow-2xl sm:px-8 sm:py-8 dark:border-neutral-800 dark:bg-neutral-900"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={confirming}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-black sm:right-4 sm:top-4 dark:hover:bg-neutral-800 dark:hover:text-stone-100"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <h3
          id="fee-confirm-modal-title"
          className="pr-8 text-lg font-semibold tracking-tight text-black sm:text-xl dark:text-stone-100"
        >
          {title ?? (skipSettlementPreview ? MODE_DEFAULTS.hire.title : defaults.title)}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          {description ??
            (skipSettlementPreview ? MODE_DEFAULTS.hire.description : defaults.description)}
        </p>

        {listingKind && !skipSettlementPreview ? (
          <p className="mt-2 text-xs uppercase tracking-wide text-neutral-400">
            Listing: {listingKind}
          </p>
        ) : null}

        {skipSettlementPreview ? (
          amount > 0 ? (
            <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50/80 px-4 py-3 text-sm dark:border-neutral-700 dark:bg-neutral-950/50">
              <div className="flex justify-between gap-3">
                <span className="text-neutral-500 dark:text-neutral-400">Expected salary</span>
                <span className="font-semibold tabular-nums text-neutral-900 dark:text-stone-100">
                  {formatNPR(amount)}
                </span>
              </div>
            </div>
          ) : null
        ) : loading ? (
          <div className="mt-6 flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-[#52C47F]" />
          </div>
        ) : error ? (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : settlement ? (
          <FeeSettlementRows fee={settlement} />
        ) : cancellation ? (
          <div className="mt-4 space-y-2 rounded-xl border border-neutral-200 bg-neutral-50/80 px-4 py-3 text-left text-sm dark:border-neutral-700 dark:bg-neutral-950/50">
            <div className="flex justify-between gap-3">
              <span className="text-neutral-500 dark:text-neutral-400">Stage</span>
              <span className="text-neutral-900 dark:text-stone-100">
                {cancellationStageLabel(cancellation.stage as CancellationStage)}
              </span>
            </div>
            {cancellation.rule_name ? (
              <div className="flex justify-between gap-3">
                <span className="text-neutral-500 dark:text-neutral-400">Rule</span>
                <span className="text-right text-neutral-900 dark:text-stone-100">
                  {cancellation.rule_name}
                </span>
              </div>
            ) : null}
            <div className="flex justify-between gap-3 border-t border-neutral-200 pt-2 dark:border-neutral-700">
              <span className="font-medium text-neutral-800 dark:text-stone-200">
                {mode === 'withdraw' ? 'Withdrawal fee' : 'Cancellation fee'}
              </span>
              <span className="font-semibold tabular-nums text-neutral-900 dark:text-stone-100">
                {formatNPR(cancellation.cancellation_fee)}
              </span>
            </div>
            {cancellation.cancellation_fee <= 0 ? (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                No fee applies at this stage under current Fee Rules.
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8">
          <button
            type="button"
            onClick={onClose}
            disabled={confirming}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-stone-100 dark:hover:bg-neutral-800"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={confirming || (!skipSettlementPreview && (loading || Boolean(error)))}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#52C47F] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#45a86d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {confirmLabel ??
              (skipSettlementPreview ? MODE_DEFAULTS.hire.confirmLabel : defaults.confirmLabel)}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
