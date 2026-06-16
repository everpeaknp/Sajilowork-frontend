'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isOfferProfileGateComplete } from '@/lib/checkout';
import { useAuth } from '@/hooks/useAuth';

export function useCheckoutProfileGate() {
  const router = useRouter();
  const { user } = useAuth();
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const pendingCheckoutHrefRef = useRef<string | null>(null);

  const goToCheckout = useCallback(
    (href: string) => {
      if (!isOfferProfileGateComplete(user)) {
        pendingCheckoutHrefRef.current = href;
        setShowProfilePopup(true);
        return;
      }
      router.push(href);
    },
    [router, user],
  );

  const completeProfileGate = useCallback(() => {
    setShowProfilePopup(false);
    const href = pendingCheckoutHrefRef.current;
    pendingCheckoutHrefRef.current = null;
    if (href) {
      router.push(href);
    }
  }, [router]);

  const cancelProfileGate = useCallback(() => {
    setShowProfilePopup(false);
    pendingCheckoutHrefRef.current = null;
  }, []);

  return {
    showProfilePopup,
    goToCheckout,
    completeProfileGate,
    cancelProfileGate,
  };
}
