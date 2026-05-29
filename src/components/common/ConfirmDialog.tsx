'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';

export type ConfirmDialogOptions = {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'default' | 'destructive';
};

type ConfirmDialogProps = ConfirmDialogOptions & {
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmDialog({
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [onCancel]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10050] flex items-center justify-center p-4 bg-black/50"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <p
          id="confirm-dialog-title"
          className="text-sm sm:text-base text-on-surface-variant text-center leading-relaxed"
        >
          {message}
        </p>
        <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-center">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto min-w-[7rem] px-5 py-2.5 rounded-full border border-outline-variant font-semibold text-on-surface hover:bg-surface-dim transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={
              confirmVariant === 'destructive'
                ? 'w-full sm:w-auto min-w-[7rem] px-5 py-2.5 rounded-full font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors'
                : 'w-full sm:w-auto min-w-[7rem] px-5 py-2.5 rounded-full font-semibold bg-[#000d45] text-white hover:bg-[#000d45]/90 transition-colors'
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/** Centered confirmation dialog (replaces window.confirm). */
export function confirmDialog(options: ConfirmDialogOptions): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve(false);
      return;
    }

    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);

    let settled = false;
    const finish = (value: boolean) => {
      if (settled) return;
      settled = true;
      root.unmount();
      host.remove();
      resolve(value);
    };

    root.render(
      <ConfirmDialog
        {...options}
        onConfirm={() => finish(true)}
        onCancel={() => finish(false)}
      />
    );
  });
}
