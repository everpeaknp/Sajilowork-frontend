import { useEffect } from 'react';

export function useMobileFilterBodyLock(open: boolean) {
  useEffect(() => {
    if (!open || typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 639px)');
    if (!mq.matches) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);
}

/** @deprecated Panels use FilterDropdownPanel portal; kept for any legacy usage */
export const FILTER_DROPDOWN_PANEL = '';
