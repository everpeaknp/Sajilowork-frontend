'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const profileModalFieldLabelClass =
  'mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-400';

export const profileModalInputClass =
  'w-full rounded-2xl border-2 border-gray-200 px-4 py-3 font-medium text-brand-dark focus:outline-none focus:border-[#52C47F] focus:ring-2 focus:ring-[#52C47F]/25 dark:border-neutral-700 dark:bg-neutral-900 dark:text-stone-100';

export const profileModalTextareaClass = `${profileModalInputClass} resize-none`;

type ProfileFormModalProps = {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  children: ReactNode;
};

export default function ProfileFormModal({
  open,
  title,
  description,
  onClose,
  onSubmit,
  submitLabel,
  children,
}: ProfileFormModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || typeof document === 'undefined') {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open || !mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[10050] bg-brand-dark/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 z-[10051] flex items-end justify-center p-0 sm:items-center sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-form-modal-title"
      >
        <div
          className="pointer-events-auto flex max-h-[min(92dvh,calc(100dvh-1rem))] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] border border-gray-100 bg-white shadow-2xl sm:rounded-[32px] dark:border-neutral-800 dark:bg-neutral-900"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="shrink-0 border-b border-gray-100 px-6 pb-5 pt-6 dark:border-neutral-800">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 pr-2">
                <h2
                  id="profile-form-modal-title"
                  className="text-xl font-black uppercase tracking-tight text-brand-dark dark:text-stone-100"
                >
                  {title}
                </h2>
                <p className="mt-2 text-sm font-medium text-gray-500 dark:text-neutral-400">{description}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-6 py-5">
              {children}
            </div>

            <div className="shrink-0 border-t border-gray-100 bg-white px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-2xl border-2 border-gray-200 px-6 py-4 text-sm font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-brand-emerald px-6 py-4 text-sm font-black uppercase tracking-widest text-white hover:opacity-90"
                >
                  {submitLabel}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body,
  );
}
