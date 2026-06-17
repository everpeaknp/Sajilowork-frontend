'use client';

import { useEffect, useState } from 'react';
import { paymentService } from '@/services';
import { serviceService } from '@/services/service.service';
import type { CheckoutKind } from '@/lib/checkout';
import type { CheckoutWalletPreview } from '@/components/checkout/CheckoutWalletSummary';

type UseCheckoutWalletPreviewOptions = {
  kind: CheckoutKind;
  enabled: boolean;
  holdAmount: number;
  serviceSlug?: string;
  packageId?: string;
};

export function useCheckoutWalletPreview({
  kind,
  enabled,
  holdAmount,
  serviceSlug,
  packageId,
}: UseCheckoutWalletPreviewOptions): CheckoutWalletPreview | null {
  const [preview, setPreview] = useState<CheckoutWalletPreview | null>(null);

  useEffect(() => {
    if (!enabled) {
      setPreview(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setPreview({
        walletAvailable: 0,
        totalHeld: holdAmount,
        walletSufficient: false,
        loading: true,
      });

      try {
        const walletRes = await paymentService.getWalletBalance();
        const walletAvailable = walletRes.success
          ? Number(walletRes.data?.available_balance ?? 0)
          : 0;

        if (kind === 'task' || kind === 'project') {
          if (cancelled) return;
          setPreview({
            walletAvailable,
            totalHeld: 0,
            walletSufficient: true,
            loading: false,
          });
          return;
        }

        if (kind === 'service' && serviceSlug && packageId) {
          const purchaseRes = await serviceService.getPurchasePreview(serviceSlug, packageId);
          if (cancelled) return;

          const totalHeld =
            purchaseRes.success && purchaseRes.data
              ? Number(purchaseRes.data.hold_amount) || holdAmount
              : holdAmount;
          const walletSufficient =
            purchaseRes.success && purchaseRes.data
              ? Boolean(purchaseRes.data.wallet_sufficient)
              : walletAvailable >= totalHeld;

          setPreview({
            walletAvailable:
              purchaseRes.success && purchaseRes.data?.wallet_available != null
                ? Number(purchaseRes.data.wallet_available)
                : walletAvailable,
            totalHeld,
            walletSufficient,
            loading: false,
          });
          return;
        }

        let totalHeld = holdAmount;
        if (holdAmount > 0) {
          const feeRes = await paymentService.getFeePreview(holdAmount, 'wallet');
          if (feeRes.success && feeRes.data?.poster_total_held != null) {
            totalHeld = Number(feeRes.data.poster_total_held);
          }
        }

        if (cancelled) return;

        setPreview({
          walletAvailable,
          totalHeld,
          walletSufficient: holdAmount <= 0 ? true : walletAvailable >= totalHeld,
          loading: false,
        });
      } catch {
        if (!cancelled) {
          setPreview({
            walletAvailable: 0,
            totalHeld: holdAmount,
            walletSufficient: false,
            loading: false,
          });
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [enabled, holdAmount, kind, packageId, serviceSlug]);

  return preview;
}
