'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Upload, X } from 'lucide-react';

const ACCEPT = 'image/jpeg,image/png,image/webp,application/pdf';
const MAX_BYTES = 10 * 1024 * 1024;

export type BadgeUploadPayload = {
  file: File;
  documentNumber: string;
  customName?: string;
  customDescription?: string;
};

type BadgeUploadModalProps = {
  open: boolean;
  title: string;
  variant?: 'standard' | 'custom';
  onClose: () => void;
  onSubmit: (payload: BadgeUploadPayload) => Promise<void>;
  submitting?: boolean;
  initialCustomName?: string;
  initialCustomDescription?: string;
};

export default function BadgeUploadModal({
  open,
  title,
  variant = 'standard',
  onClose,
  onSubmit,
  submitting = false,
  initialCustomName = '',
  initialCustomDescription = '',
}: BadgeUploadModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [documentNumber, setDocumentNumber] = useState('');
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const isCustom = variant === 'custom';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setDocumentNumber('');
      setCustomName('');
      setCustomDescription('');
      setError(null);
      return;
    }
    if (variant === 'custom') {
      setCustomName(initialCustomName);
      setCustomDescription(initialCustomDescription);
    }
  }, [open, variant, initialCustomName, initialCustomDescription]);

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
      if (event.key === 'Escape' && !submitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, submitting, onClose]);

  const handleFileChange = (selected: File | null) => {
    setError(null);
    if (!selected) {
      setFile(null);
      return;
    }
    if (selected.size > MAX_BYTES) {
      setError('File must be 10MB or smaller.');
      setFile(null);
      return;
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(selected.type)) {
      setError('Only JPG, PNG, WebP, or PDF files are allowed.');
      setFile(null);
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async () => {
    if (isCustom && customName.trim().length < 2) {
      setError('Enter a name for your licence or certification.');
      return;
    }
    if (!file) {
      setError('Please upload your document.');
      return;
    }
    setError(null);
    await onSubmit({
      file,
      documentNumber,
      customName: isCustom ? customName.trim() : undefined,
      customDescription: isCustom ? customDescription.trim() : undefined,
    });
  };

  const handleClose = () => {
    if (submitting) {
      return;
    }
    onClose();
  };

  if (!open || !mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[10050] bg-brand-dark/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden
      />
      <div
        className="fixed inset-0 z-[10051] flex items-end justify-center p-0 sm:items-center sm:p-6 pointer-events-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="badge-upload-title"
      >
        <div
          className="pointer-events-auto flex w-full max-w-lg max-h-[min(92dvh,calc(100dvh-1rem))] flex-col overflow-hidden rounded-t-[28px] border border-gray-100 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 sm:rounded-[32px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="shrink-0 border-b border-gray-100 px-6 pb-5 pt-6 dark:border-neutral-800">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 pr-2">
                <h2
                  id="badge-upload-title"
                  className="text-xl font-black uppercase tracking-tight text-brand-dark dark:text-stone-100"
                >
                  {title}
                </h2>
                <p className="mt-2 text-sm font-medium text-gray-500 dark:text-neutral-400">
                  {isCustom
                    ? 'Name your licence or certification, upload proof, and our team will review it before it appears on your profile.'
                    : 'Upload a clear photo or PDF of your certificate. Our team will review it before the badge goes active.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-neutral-800 dark:hover:text-stone-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-6 py-5">
            {isCustom ? (
              <>
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500">
                    Badge name (required)
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 font-medium text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald/30 dark:border-neutral-700 dark:bg-neutral-950 dark:text-stone-100"
                    placeholder="e.g. HVAC Certification, Gas Fitter Licence"
                    disabled={submitting}
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500">
                    Short description (optional)
                  </label>
                  <textarea
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 font-medium text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald/30 dark:border-neutral-700 dark:bg-neutral-950 dark:text-stone-100"
                    placeholder="What does this licence cover?"
                    disabled={submitting}
                    maxLength={500}
                  />
                </div>
              </>
            ) : null}

            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500">
                Licence / reference number (optional)
              </label>
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 font-medium text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald/30 dark:border-neutral-700 dark:bg-neutral-950 dark:text-stone-100"
                placeholder="e.g. EC-12345"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500">
                Document (required)
              </label>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={submitting}
                className="flex w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-gray-200 p-6 transition-colors hover:border-brand-emerald/40 hover:bg-emerald-50/50 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-emerald-950/20 sm:p-8"
              >
                <Upload className="h-8 w-8 text-brand-emerald" />
                <span className="break-all px-2 text-center text-sm font-bold text-brand-dark dark:text-stone-100">
                  {file ? file.name : 'Choose JPG, PNG, WebP, or PDF'}
                </span>
                <span className="text-xs font-medium text-gray-400 dark:text-neutral-500">Max 10MB</span>
              </button>
            </div>

            {error ? <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p> : null}
          </div>

          <div className="shrink-0 border-t border-gray-100 bg-white px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="flex-1 rounded-2xl border-2 border-gray-200 px-6 py-4 text-sm font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-neutral-700 dark:text-stone-200 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !file}
                className="flex-1 px-6 py-4 rounded-2xl bg-brand-emerald text-white font-black text-sm uppercase tracking-widest hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? 'Uploading…' : 'Submit for review'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
