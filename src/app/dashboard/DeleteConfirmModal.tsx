'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmTone?: 'danger' | 'primary' | 'brand';
}

export const CONFIRM_MODAL_ROOT_ATTR = 'data-confirm-modal-root';

export function isConfirmModalTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(`[${CONFIRM_MODAL_ROOT_ATTR}]`));
}

const CONFIRM_TONE_CLASS: Record<NonNullable<DeleteConfirmModalProps['confirmTone']>, string> = {
  danger: 'bg-[#E53935] hover:bg-[#d32f2f]',
  primary: 'bg-[#222222] hover:bg-neutral-800',
  brand: 'bg-[#52C47F] hover:bg-[#45a86d]',
};

export default function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure you want to delete?',
  description = 'Do you really want to delete this record? This process cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  confirmTone = 'danger',
}: DeleteConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

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

  if (!open || !mounted) return null;

  return createPortal(
    <div
      {...{ [CONFIRM_MODAL_ROOT_ATTR]: '' }}
      className="fixed inset-0 z-[10100] flex items-end justify-center p-4 sm:items-center sm:p-6"
    >
      <button
        type="button"
        aria-label="Close confirmation"
        onClick={onClose}
        className="absolute inset-0 bg-neutral-900/50"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="relative z-10 w-full max-w-sm rounded-2xl border border-neutral-100 bg-white px-5 py-6 text-center shadow-2xl sm:max-w-md sm:px-8 sm:py-8 dark:border-neutral-800 dark:bg-neutral-900"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-black sm:right-4 sm:top-4 dark:hover:bg-neutral-800 dark:hover:text-stone-100"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <h3
          id="confirm-modal-title"
          className="pr-8 text-lg font-semibold tracking-tight text-black sm:text-xl dark:text-stone-100"
        >
          {title}
        </h3>
        <p className="mx-auto mt-3 text-sm leading-relaxed text-neutral-500 sm:mt-4 dark:text-neutral-400">
          {description}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-stone-100 dark:hover:bg-neutral-800"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors ${CONFIRM_TONE_CLASS[confirmTone]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
