'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, Wallet, X } from 'lucide-react';
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
  }) => void;
}

export default function ServicePurchaseModal({
  service,
  package: selectedPackage,
  onClose,
  onSuccess,
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
      onSuccess?.({
        order_task_slug: response.data.order_task_slug,
        bid_id: response.data.bid_id,
      });
      onClose();
      if (response.data.conversation_id) {
        router.push(`/dashboard/message?conversation=${encodeURIComponent(response.data.conversation_id)}`);
        return;
      }
      router.push(
        `/dashboard/proposals/${encodeURIComponent(response.data.order_task_slug)}/${encodeURIComponent(response.data.bid_id)}?from=orders`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Purchase failed';
      setError(message);
      toast.error(message);
    } finally {
      setPurchasing(false);
    }
  };

  const totalHeld = feePreview?.poster_total_held ?? holdAmount;
  const sellerReceives = feePreview?.net_amount ?? selectedPackage.price;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-purchase-title"
      >
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

        <div className="space-y-4 px-5 py-5">
          <div>
            <p className="text-sm text-neutral-500">{service.title}</p>
            <p className="mt-1 text-base font-medium text-black">{selectedPackage.name} package</p>
            <p className="mt-2 text-2xl font-medium tracking-tight text-black">
              {formatNPR(selectedPackage.price)}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-7 w-7 animate-spin text-[#52C47F]" />
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-neutral-600">Wallet available</span>
                  <span className="font-medium text-black">{formatNPR(walletAvailable)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 border-t border-neutral-200/80 pt-2">
                  <span className="text-neutral-600">Held in escrow</span>
                  <span className="font-semibold text-black">{formatNPR(totalHeld)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-xs text-neutral-500">
                  <span>Seller receives on completion</span>
                  <span>{formatNPR(sellerReceives)}</span>
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

              <label className="block text-sm text-neutral-700">
                Instructions for seller (optional)
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Share any details the seller should know before starting…"
                  className="mt-1.5 w-full resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm text-black outline-none ring-[#52C47F] focus:ring-1"
                />
              </label>

              {error ? (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              ) : null}
            </>
          )}
        </div>

        <div className="flex gap-3 border-t border-neutral-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={purchasing}
            className="flex-1 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handlePurchase()}
            disabled={loading || purchasing || !walletSufficient}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#52C47F] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#49b071] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {purchasing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Pay {formatNPR(totalHeld)}
          </button>
        </div>
      </div>
    </div>
  );
}
