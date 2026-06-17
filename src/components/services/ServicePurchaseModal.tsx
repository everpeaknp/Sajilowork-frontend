'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ChevronDown, ChevronUp, Loader2, Wallet, X } from 'lucide-react';
import { toast } from 'sonner';
import { formatNPR } from '@/lib/nepalLocale';
import { paymentService } from '@/services';
import { serviceService } from '@/services/service.service';
import type { FeePreview } from '@/services/payment.service';
import type { Service, ServicePackage } from './serviceListData';

interface ServicePurchaseModalProps {
  service: Service;
  package: ServicePackage;
  onClose: () => void;
  onSuccess?: (result: {
    order_task_slug: string;
    bid_id: string;
    conversation_id?: string;
  }) => void;
  presentation?: 'modal' | 'page';
  /** Strip chrome when rendered inside checkout page */
  embedded?: boolean;
}

export default function ServicePurchaseModal({
  service,
  package: selectedPackage,
  onClose,
  onSuccess,
  presentation = 'modal',
  embedded = false,
}: ServicePurchaseModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feePreview, setFeePreview] = useState<FeePreview | null>(null);
  const [walletAvailable, setWalletAvailable] = useState(0);
  const [holdAmount, setHoldAmount] = useState(selectedPackage.price);
  const [walletSufficient, setWalletSufficient] = useState(false);
  const [note, setNote] = useState('');
  const [noteExpanded, setNoteExpanded] = useState(false);

  useEffect(() => {
    if (!service.slug) return;

    let cancelled = false;

    const loadPreview = async () => {
      setLoading(true);
      setError(null);
      try {
        const [previewRes, walletRes, feeRes] = await Promise.all([
          serviceService.getPurchasePreview(service.slug!, selectedPackage.id),
          paymentService.getWalletBalance(),
          paymentService.getFeePreview(selectedPackage.price, 'wallet'),
        ]);

        if (cancelled) return;

        if (previewRes.success && previewRes.data) {
          setHoldAmount(Number(previewRes.data.hold_amount) || selectedPackage.price);
          setWalletSufficient(Boolean(previewRes.data.wallet_sufficient));
          if (previewRes.data.wallet_available != null) {
            setWalletAvailable(Number(previewRes.data.wallet_available));
          }
        }

        if (walletRes.success && walletRes.data) {
          setWalletAvailable(walletRes.data.available_balance ?? 0);
          const hold =
            previewRes.success && previewRes.data
              ? Number(previewRes.data.hold_amount) || selectedPackage.price
              : selectedPackage.price;
          setWalletSufficient((walletRes.data.available_balance ?? 0) >= hold);
        }

        if (feeRes.success && feeRes.data) {
          setFeePreview(feeRes.data);
          setHoldAmount(feeRes.data.poster_total_held ?? selectedPackage.price);
        }
      } catch {
        if (!cancelled) {
          setError('Could not load purchase details. Please try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadPreview();

    return () => {
      cancelled = true;
    };
  }, [selectedPackage.id, selectedPackage.price, service.slug]);

  const handlePurchase = async () => {
    if (!service.slug) return;

    if (!walletSufficient) {
      setError('Insufficient wallet balance. Add funds before purchasing.');
      return;
    }

    setPurchasing(true);
    setError(null);

    try {
      const response = await serviceService.purchaseService(service.slug, {
        package_id: selectedPackage.id,
        note: note.trim() || undefined,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Purchase failed');
      }

      toast.success('Service purchased. Payment is held in escrow until completion.');
      const result = {
        order_task_slug: response.data.order_task_slug,
        bid_id: response.data.bid_id,
        conversation_id: response.data.conversation_id ?? undefined,
      };
      onSuccess?.(result);
      if (!onSuccess) {
        router.push(
          result.conversation_id
            ? `/dashboard/message?conversation=${encodeURIComponent(result.conversation_id)}`
            : `/dashboard/proposals/${encodeURIComponent(result.order_task_slug)}/${encodeURIComponent(result.bid_id)}?from=orders`,
        );
      }
      if (presentation === 'modal') {
        onClose();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Purchase failed';
      setError(message);
      toast.error(message);
    } finally {
      setPurchasing(false);
    }
  };

  const totalHeld = feePreview?.poster_total_held ?? holdAmount;

  const panel = (
    <div
      className={
        embedded
          ? 'w-full'
          : presentation === 'page'
            ? 'w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm'
            : 'w-full max-w-md rounded-2xl bg-white shadow-xl'
      }
      role={presentation === 'modal' ? 'dialog' : undefined}
      aria-modal={presentation === 'modal' ? true : undefined}
      aria-labelledby="service-purchase-title"
    >
        {!embedded ? (
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
            <h2 id="service-purchase-title" className="text-lg font-medium text-black">
              Confirm purchase
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : null}

        <div className={`space-y-4 ${embedded ? 'px-0 py-0' : 'px-5 py-5'}`}>
          {!embedded ? (
            <div>
              <p className="text-sm text-neutral-500">{service.title}</p>
              <p className="mt-1 text-base font-medium text-black">{selectedPackage.name} package</p>
              <p className="mt-2 text-2xl font-medium tracking-tight text-black">
                {formatNPR(selectedPackage.price)}
              </p>
            </div>
          ) : null}

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-7 w-7 animate-spin text-[#52C47F]" />
            </div>
          ) : (
            <>
              {!embedded ? (
                <>
                  <div className="space-y-2 border-t border-neutral-200 pt-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-neutral-500">Wallet</span>
                      <span className="text-neutral-900">{formatNPR(walletAvailable)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-neutral-500">Escrow hold</span>
                      <span className="font-medium text-neutral-900">{formatNPR(totalHeld)}</span>
                    </div>
                  </div>

                  {!walletSufficient ? (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <div>
                        <p className="font-medium">Insufficient wallet balance</p>
                        <p className="mt-1 text-amber-800/90">
                          Load at least {formatNPR(totalHeld)} into your wallet before purchasing.
                        </p>
                        <Link
                          href="/dashboard/wallet?section=recharges"
                          className="mt-2 inline-flex items-center gap-1 font-medium text-amber-900 underline"
                          onClick={onClose}
                        >
                          <Wallet className="h-4 w-4" />
                          Add funds to wallet
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs leading-relaxed text-neutral-500">
                      Payment will be held in escrow from your wallet and released to the seller when
                      the service is completed.
                    </p>
                  )}
                </>
              ) : null}

              <div className="block">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-neutral-700">
                    Instructions for seller (optional)
                  </span>
                  <button
                    type="button"
                    onClick={() => setNoteExpanded((expanded) => !expanded)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-900"
                    aria-expanded={noteExpanded}
                  >
                    {noteExpanded ? (
                      <>
                        Collapse
                        <ChevronUp className="h-3.5 w-3.5" />
                      </>
                    ) : (
                      <>
                        Expand
                        <ChevronDown className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={noteExpanded ? 10 : embedded ? 6 : 4}
                  placeholder="Share any details the seller should know before starting…"
                  className={`mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm leading-relaxed text-black outline-none transition-[min-height] ring-[#52C47F] focus:ring-1 ${
                    noteExpanded ? 'min-h-[240px] resize-y' : embedded ? 'min-h-[140px] resize-none' : 'min-h-[100px] resize-none'
                  }`}
                />
              </div>

              {error ? (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              ) : null}
            </>
          )}
        </div>

        <div
          className={`flex gap-3 border-t border-neutral-100 ${embedded ? 'px-0 py-5' : 'px-5 py-4'}`}
        >
          {!embedded ? (
            <button
              type="button"
              onClick={onClose}
              disabled={purchasing}
              className="flex-1 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50"
            >
              Cancel
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void handlePurchase()}
            disabled={loading || purchasing || !walletSufficient}
            className={`flex items-center justify-center gap-2 rounded-xl bg-[#52C47F] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#49b071] disabled:cursor-not-allowed disabled:opacity-50 ${
              embedded ? 'w-full' : 'flex-1'
            }`}
          >
            {purchasing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Pay {formatNPR(totalHeld)}
          </button>
        </div>
        {embedded ? (
          <p className="px-0 pb-5 text-xs leading-relaxed text-neutral-500 sm:px-0">
            <span className="font-semibold">Terms &amp; conditions. </span>
            By submitting this offer, I agree to complete the task if accepted and to the platform&apos;s{' '}
            <a href="/terms" className="font-semibold text-brand-emerald hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="font-semibold text-brand-emerald hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        ) : null}
      </div>
  );

  if (presentation === 'page') {
    return panel;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      {panel}
    </div>
  );
}
