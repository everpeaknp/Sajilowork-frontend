'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';

const MOBILE_MQ = '(max-width: 639px)';

function subscribeMobileMq(cb: () => void) {
  const mq = window.matchMedia(MOBILE_MQ);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}

function getMobileMq() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(MOBILE_MQ).matches;
}

export function FilterPanelActions({
  onCancel,
  onApply,
}: {
  onCancel: () => void;
  onApply: () => void;
}) {
  return (
    <div className="mt-4 flex shrink-0 items-center justify-between border-t border-outline-variant/50 pt-4">
      <button
        type="button"
        onClick={onCancel}
        className="min-h-[44px] px-2 font-sans text-[16px] font-bold text-brand-emerald hover:underline"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onApply}
        className="min-h-[44px] px-2 font-sans text-[16px] font-extrabold text-brand-emerald hover:underline"
      >
        Apply
      </button>
    </div>
  );
}

export function useIsMobileFilterViewport() {
  const [mobile, setMobile] = useState(getMobileMq);

  useEffect(() => {
    setMobile(getMobileMq());
    return subscribeMobileMq(() => setMobile(getMobileMq()));
  }, []);

  return mobile;
}

type FilterDropdownPanelProps = {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  panelRef?: RefObject<HTMLDivElement | null>;
  title?: string;
  align?: 'left' | 'right';
  /** Tailwind width classes for desktop anchored panel (e.g. sm:w-[400px]) */
  desktopClassName?: string;
  children: ReactNode;
};

export default function FilterDropdownPanel({
  open,
  onClose,
  anchorRef,
  panelRef,
  title,
  align = 'left',
  desktopClassName = 'sm:w-[360px]',
  children,
}: FilterDropdownPanelProps) {
  const isMobileFromHook = useIsMobileFilterViewport();
  const [mounted, setMounted] = useState(false);
  const internalPanelRef = useRef<HTMLDivElement>(null);
  const resolvedPanelRef = panelRef ?? internalPanelRef;
  const [desktopPos, setDesktopPos] = useState({ top: 0, left: 0, right: 0 });

  useEffect(() => setMounted(true), []);

  // Read matchMedia when open so the first tap on mobile never uses desktop positioning
  // (hook state can still be false until the subscription effect runs).
  const isMobile =
    mounted && typeof window !== 'undefined'
      ? window.matchMedia(MOBILE_MQ).matches
      : isMobileFromHook;

  useLayoutEffect(() => {
    if (!open || isMobile || !anchorRef.current) return;

    const update = () => {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const padding = 12;
      const panelWidth = resolvedPanelRef.current?.offsetWidth || 320;
      const top = rect.bottom + 8;

      let left = rect.left;
      let right = window.innerWidth - rect.right;

      if (align === 'right') {
        right = Math.max(padding, right);
        const panelLeftEdge = window.innerWidth - right - panelWidth;
        if (panelLeftEdge < padding) {
          right = Math.max(padding, window.innerWidth - padding - panelWidth);
        }
      } else {
        left = Math.max(padding, left);
        if (left + panelWidth > window.innerWidth - padding) {
          left = Math.max(padding, window.innerWidth - padding - panelWidth);
        }
      }

      setDesktopPos({ top, left, right });
    };

    update();
    const raf = window.requestAnimationFrame(update);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, isMobile, anchorRef, align, resolvedPanelRef]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted || typeof document === 'undefined') return null;

  const panelInner = (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {title ? (
        <div className="mb-4 flex shrink-0 items-center justify-between border-b border-outline-variant/60 pb-3 sm:mb-0 sm:border-0 sm:pb-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
            {title}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="font-sans text-[14px] font-bold text-brand-emerald hover:underline sm:hidden"
          >
            Close
          </button>
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
    </div>
  );

  return createPortal(
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close filter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[500] bg-black/45"
            onClick={onClose}
          />

          {isMobile ? (
            <motion.div
              ref={resolvedPanelRef}
              role="dialog"
              aria-modal="true"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed inset-x-0 bottom-0 z-[510] flex max-h-[min(88dvh,100dvh-4rem)] flex-col rounded-t-3xl border border-outline-variant bg-white shadow-[0_-12px_48px_rgba(0,0,0,0.18)] pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-neutral-700 dark:bg-neutral-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex shrink-0 justify-center pt-3 pb-1" aria-hidden>
                <div className="h-1 w-10 rounded-full bg-outline-variant/80" />
              </div>
              <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-2">{panelInner}</div>
            </motion.div>
          ) : (
            <motion.div
              ref={resolvedPanelRef}
              role="dialog"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              className={`fixed z-[510] max-h-[min(80vh,calc(100vh-6rem))] w-[min(calc(100vw-1.5rem),100%)] cursor-default overflow-hidden rounded-2xl border border-outline-variant bg-white p-4 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900 sm:rounded-3xl md:p-6 ${desktopClassName}`}
              style={{
                top: desktopPos.top,
                ...(align === 'right' ? { right: desktopPos.right } : { left: desktopPos.left }),
                maxWidth: align === 'right' ? undefined : 'min(calc(100vw - 24px), 650px)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {panelInner}
            </motion.div>
          )}
        </>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
