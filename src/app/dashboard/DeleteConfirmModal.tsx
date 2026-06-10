'use client';

import { ArrowUpRight, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export default function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure you want to delete?',
  description = 'Do you really want to delete this record? This process cannot be undone.',
}: DeleteConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close delete confirmation"
        onClick={onClose}
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-neutral-100 bg-white px-8 py-10 text-center shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-black"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-xl font-semibold tracking-tight text-black sm:text-2xl">{title}</h3>
        <p className="mx-auto mt-4 max-w-sm text-sm font-normal leading-relaxed text-neutral-500">
          {description}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-lg bg-[#E53935] px-6 py-3 text-sm font-normal text-white transition-colors hover:bg-[#d32f2f]"
          >
            Delete
            <ArrowUpRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-lg bg-[#222222] px-6 py-3 text-sm font-normal text-white transition-colors hover:bg-neutral-800"
          >
            Cancel
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
