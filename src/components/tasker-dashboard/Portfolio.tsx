'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Image as ImageIcon,
  Plus,
  Upload,
  AlertCircle,
  FileText,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  X,
  Loader2,
} from 'lucide-react';
import { userService } from '@/services';
import type { PortfolioItem, PortfolioDocumentStatus } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  landingBody,
  landingBodyMuted,
  landingHeadline,
  landingHeadlineSm,
} from '@/components/LangingHome/landingTypography';

const PORTFOLIO_TYPO = `${landingBody} [&_h1]:font-formula [&_h1]:font-black [&_h1]:tracking-tight [&_h2]:font-formula [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h3]:font-formula [&_h3]:font-bold [&_h3]:tracking-tight`;

const MAX_ITEMS = 30;
const MAX_BYTES = 5 * 1024 * 1024;
const VALID_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];

function getErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (error instanceof Error && error.message.trim()) return error.message;
  const err = error as {
    message?: string;
    error?: string;
    detail?: string;
    response?: { data?: unknown };
  };
  if (typeof err.message === 'string' && err.message.trim()) return err.message;
  if (typeof err.error === 'string' && err.error.trim()) return err.error;
  if (typeof err.detail === 'string' && err.detail.trim()) return err.detail;
  if (err.response?.data && typeof err.response.data === 'object') {
    const data = err.response.data as Record<string, unknown>;
    if (typeof data.error === 'string') return data.error;
    if (typeof data.detail === 'string') return data.detail;
    if (typeof data.message === 'string') return data.message;
  }
  return fallback;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function StatusBadge({ status }: { status?: PortfolioDocumentStatus }) {
  if (status === 'approved') {
    return (
      <span
        className={cn(
          landingHeadlineSm,
          'inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs text-green-700',
        )}
      >
        <CheckCircle2 className="size-3.5 shrink-0" aria-hidden />
        Approved
      </span>
    );
  }
  if (status === 'rejected') {
    return (
      <span
        className={cn(
          landingHeadlineSm,
          'inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-700',
        )}
      >
        <XCircle className="size-3.5 shrink-0" aria-hidden />
        Rejected
      </span>
    );
  }
  return (
    <span
      className={cn(
        landingHeadlineSm,
        'inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-800',
      )}
    >
      <Clock className="size-3.5 shrink-0" aria-hidden />
      Pending review
    </span>
  );
}

function validateFiles(files: File[], currentCount: number): File[] | null {
  const remaining = MAX_ITEMS - currentCount;
  if (remaining <= 0) {
    toast.error(`Maximum ${MAX_ITEMS} portfolio items allowed.`);
    return null;
  }

  const toAdd = files.slice(0, remaining);
  if (toAdd.length < files.length) {
    toast.warning(`Only ${toAdd.length} file(s) can be added — portfolio limit is ${MAX_ITEMS} items.`);
  }

  const oversized = toAdd.filter((file) => file.size > MAX_BYTES);
  if (oversized.length > 0) {
    toast.error('Some files exceed the 5MB limit');
    return null;
  }

  const invalidTypes = toAdd.filter((file) => !VALID_TYPES.includes(file.type));
  if (invalidTypes.length > 0) {
    toast.error('Only JPG, PNG, PDF, and TXT files are allowed');
    return null;
  }

  return toAdd;
}

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewUrls = useMemo(() => {
    const map = new Map<string, string>();
    pendingFiles.forEach((file) => {
      if (file.type.startsWith('image/')) {
        map.set(file.name + file.size, URL.createObjectURL(file));
      }
    });
    return map;
  }, [pendingFiles]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const response = await userService.getPortfolio();

      if (response.success && Array.isArray(response.data)) {
        setPortfolio(response.data);
      } else {
        setPortfolio([]);
      }
    } catch (error: unknown) {
      const err = error as { status?: number };
      if (err?.status === 0) {
        console.warn('Backend unreachable, showing empty portfolio');
      } else {
        toast.error(getErrorMessage(error, 'Failed to load portfolio'));
      }
      setPortfolio([]);
    } finally {
      setLoading(false);
    }
  };

  const clearPendingFiles = useCallback(() => {
    setPendingFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    const slotCount = MAX_ITEMS - portfolio.length - pendingFiles.length;
    const validated = validateFiles(files, portfolio.length + pendingFiles.length);

    if (!validated) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const capped = validated.slice(0, Math.max(0, slotCount));
    if (capped.length < validated.length) {
      toast.warning(`Only ${capped.length} more file(s) can be added.`);
    }

    if (capped.length === 0) {
      toast.error(`Maximum ${MAX_ITEMS} portfolio items allowed.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setPendingFiles((prev) => [...prev, ...capped]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadPending = async () => {
    if (pendingFiles.length === 0) return;

    setUploading(true);

    try {
      let uploadedCount = 0;
      for (const file of pendingFiles) {
        const response = await userService.uploadPortfolioItem(file, {
          title: file.name.replace(/\.[^.]+$/, '') || file.name,
        });

        if (response.success && response.data) {
          uploadedCount += 1;
          setPortfolio((prev) => [...prev, response.data]);
        } else {
          throw new Error(response.message || `Failed to upload ${file.name}`);
        }
      }

      if (uploadedCount > 0) {
        toast.success(
          `${uploadedCount} item(s) uploaded. They will appear on your public profile after admin approval.`,
        );
      }

      clearPendingFiles();
    } catch (error: unknown) {
      console.error('Failed to upload portfolio items:', error);
      toast.error(getErrorMessage(error, 'Failed to upload files'));
      await fetchPortfolio();
    } finally {
      setUploading(false);
    }
  };

  const removePortfolioItem = async (id: string) => {
    try {
      const response = await userService.deletePortfolioItem(id);

      if (response.success) {
        setPortfolio((prev) => prev.filter((item) => item.id !== id));
        toast.success('Portfolio item deleted');
      } else {
        throw new Error(response.message || 'Failed to delete item');
      }
    } catch (error: unknown) {
      console.error('Failed to delete portfolio item:', error);
      toast.error(getErrorMessage(error, 'Failed to delete item'));
    }
  };

  const atLimit = portfolio.length + pendingFiles.length >= MAX_ITEMS;
  const openFilePicker = () => fileInputRef.current?.click();

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(PORTFOLIO_TYPO, 'max-w-5xl space-y-8 pb-20')}
    >
      <header>
        <p
          className={cn(
            landingHeadlineSm,
            'mb-2 text-[10px] uppercase tracking-[0.3em] text-brand-emerald',
          )}
        >
          Professional profile
        </p>
        <h1 className={cn(landingHeadline, 'text-2xl text-brand-dark sm:text-4xl')}>Portfolio</h1>
        <p className={cn(landingBodyMuted, 'mt-2 max-w-xl text-sm leading-relaxed')}>
          Show off your best work. Uploads are reviewed by our team before they appear on your
          public profile.
        </p>
      </header>

      <section className="rounded-[32px] border border-outline-variant bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-start gap-4">
          <div className="rounded-2xl bg-emerald-50 p-3 text-brand-emerald">
            <Upload className="size-6" />
          </div>
          <div>
            <h2 className={cn(landingHeadline, 'text-xl text-brand-dark')}>Upload portfolio items</h2>
            <p className={cn(landingBodyMuted, 'mt-1 text-sm')}>
              Select files first, then confirm upload when you are ready.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex gap-4 rounded-2xl border border-brand-emerald/10 bg-surface-low/60 p-4">
            <AlertCircle className="size-5 shrink-0 text-brand-emerald" aria-hidden />
            <p className={cn(landingBodyMuted, 'text-sm leading-relaxed')}>
              Up to <span className="font-semibold text-brand-dark">{MAX_ITEMS}</span> items.
              Formats: <span className="font-semibold text-brand-dark">JPG, PNG, PDF, TXT</span>{' '}
              (max <span className="font-semibold text-brand-dark">5MB</span> each). Avoid personal
              details you do not want shared publicly.
            </p>
          </div>

          <input
            type="file"
            multiple
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".jpg,.jpeg,.png,.pdf,.txt,image/jpeg,image/png,application/pdf,text/plain"
            disabled={uploading || atLimit}
          />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={openFilePicker}
              disabled={uploading || atLimit}
              className={cn(
                landingBody,
                'flex min-h-[52px] flex-1 cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-outline-variant bg-white px-4 transition-colors hover:border-brand-emerald/40 hover:bg-brand-emerald/5 disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              <FileText className="size-5 shrink-0 text-gray-400" aria-hidden />
              <span className={cn(landingBodyMuted, 'text-sm')}>
                {atLimit
                  ? 'Portfolio limit reached'
                  : pendingFiles.length > 0
                    ? `${pendingFiles.length} file(s) selected — add more or upload`
                    : 'Choose JPG, PNG, PDF, or TXT files'}
              </span>
            </button>

            <button
              type="button"
              onClick={openFilePicker}
              disabled={uploading || atLimit}
              className={cn(
                landingBody,
                'inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-2xl border border-outline-variant bg-white px-6 text-sm font-semibold text-brand-dark transition hover:bg-surface-low disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              Select files
            </button>
          </div>

          {pendingFiles.length > 0 ? (
            <div className="space-y-4 rounded-2xl border border-outline-variant bg-surface-low/40 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className={cn(landingHeadlineSm, 'text-sm text-brand-dark')}>
                  Ready to upload ({pendingFiles.length})
                </p>
                <button
                  type="button"
                  onClick={clearPendingFiles}
                  disabled={uploading}
                  className={cn(
                    landingBody,
                    'text-sm font-semibold text-gray-500 hover:text-red-600 disabled:opacity-50',
                  )}
                >
                  Clear all
                </button>
              </div>

              <ul className="space-y-3">
                {pendingFiles.map((file, index) => {
                  const previewKey = file.name + file.size;
                  const preview = previewUrls.get(previewKey);

                  return (
                    <li
                      key={`${file.name}-${file.size}-${index}`}
                      className="flex items-center gap-4 rounded-2xl border border-outline-variant/70 bg-white p-3"
                    >
                      <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-emerald-50 text-brand-emerald">
                        {preview ? (
                          <img
                            src={preview}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <FileText className="size-6" aria-hidden />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn(landingHeadlineSm, 'truncate text-sm text-brand-dark')}>
                          {file.name}
                        </p>
                        <p className={cn(landingBodyMuted, 'text-xs')}>
                          {formatFileSize(file.size)} · {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePendingFile(index)}
                        disabled={uploading}
                        className="rounded-xl p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="size-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-end">
                <p className={cn(landingBodyMuted, 'text-xs sm:mr-auto')}>
                  {portfolio.length + pendingFiles.length} / {MAX_ITEMS} items after upload
                </p>
                <button
                  type="button"
                  onClick={handleUploadPending}
                  disabled={uploading}
                  className={cn(
                    landingBody,
                    'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-8 text-sm font-semibold text-white shadow-lg shadow-brand-emerald/25 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50',
                  )}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <Upload className="size-4" aria-hidden />
                      Upload {pendingFiles.length} file{pendingFiles.length === 1 ? '' : 's'}
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <h2
            className={cn(
              landingHeadline,
              'flex items-center gap-3 text-xl text-brand-dark',
            )}
          >
            <ImageIcon className="size-6 text-brand-emerald" aria-hidden />
            Your items
          </h2>
          <span
            className={cn(
              landingHeadlineSm,
              'rounded-full bg-surface-low px-3 py-1 text-xs text-gray-500',
            )}
          >
            {portfolio.length} / {MAX_ITEMS}
          </span>
        </div>

        {loading ? (
          <div className="rounded-[32px] border border-outline-variant bg-white py-16 text-center shadow-sm">
            <Loader2 className="mx-auto mb-4 size-10 animate-spin text-brand-emerald" aria-hidden />
            <p className={cn(landingBodyMuted, 'text-sm')}>Loading portfolio…</p>
          </div>
        ) : portfolio.length === 0 ? (
          <div className="rounded-[32px] border-2 border-dashed border-outline-variant bg-surface-low/40 py-16 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-white shadow-sm">
              <ImageIcon className="size-8 text-gray-300" aria-hidden />
            </div>
            <h3 className={cn(landingHeadlineSm, 'text-base text-gray-500')}>
              No portfolio items yet
            </h3>
            <p className={cn(landingBodyMuted, 'mt-1 text-sm')}>
              Select files above to showcase your work
            </p>
            <button
              type="button"
              onClick={openFilePicker}
              disabled={atLimit}
              className={cn(
                landingBody,
                'mt-6 inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-brand-emerald px-8 text-sm font-semibold text-white shadow-lg shadow-brand-emerald/25 transition hover:opacity-90 disabled:opacity-50',
              )}
            >
              Select files
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {portfolio.map((item) => {
              const isImage = item.file_type?.startsWith('image/');
              const isPdf = item.file_type === 'application/pdf';

              return (
                <div
                  key={item.id}
                  className="group relative flex aspect-square flex-col overflow-hidden rounded-[28px] border border-outline-variant bg-surface-low shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative flex min-h-0 flex-1 items-center justify-center">
                    {isImage && item.file ? (
                      <img
                        src={item.file}
                        alt={item.title}
                        className="size-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-4 p-6">
                        <div className="rounded-2xl bg-white p-5 text-brand-emerald shadow-sm">
                          <FileText className="size-10" />
                        </div>
                        <span
                          className={cn(
                            landingHeadlineSm,
                            'max-w-[180px] truncate text-center text-sm text-brand-dark',
                          )}
                        >
                          {item.title}
                        </span>
                      </div>
                    )}

                    <div className="absolute left-4 top-4">
                      <StatusBadge status={item.status} />
                    </div>

                    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100">
                      <div className="flex justify-end gap-2">
                        {item.file ? (
                          <a
                            href={item.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pointer-events-auto rounded-xl bg-white p-2.5 text-brand-emerald shadow-lg transition hover:scale-105"
                            aria-label="Open file"
                          >
                            <ExternalLink className="size-5" />
                          </a>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => removePortfolioItem(item.id)}
                          className="pointer-events-auto rounded-xl bg-red-500 p-2.5 text-white shadow-lg transition hover:scale-105"
                          aria-label="Delete item"
                        >
                          <Trash2 className="size-5" />
                        </button>
                      </div>
                      <div>
                        <p className={cn(landingHeadlineSm, 'truncate text-base text-white')}>
                          {item.title}
                        </p>
                        <p className={cn(landingBody, 'mt-1 text-xs text-white/70')}>
                          {isPdf ? 'PDF' : item.file_type?.split('/')[1] || item.file_type}
                        </p>
                        {item.status === 'rejected' && item.rejection_reason ? (
                          <p className="mt-2 line-clamp-2 text-xs text-red-200">
                            {item.rejection_reason}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-outline-variant/50 bg-white px-4 py-3 sm:hidden">
                    <p className={cn(landingHeadlineSm, 'truncate text-xs text-brand-dark')}>
                      {item.title}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <StatusBadge status={item.status} />
                      <div className="flex gap-2">
                        {item.file ? (
                          <a
                            href={item.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-emerald"
                            aria-label="Open file"
                          >
                            <ExternalLink className="size-4" />
                          </a>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => removePortfolioItem(item.id)}
                          className="text-red-500"
                          aria-label="Delete item"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {!atLimit ? (
              <button
                type="button"
                onClick={openFilePicker}
                disabled={uploading}
                className={cn(
                  'flex aspect-square flex-col items-center justify-center gap-3 rounded-[28px]',
                  'border-2 border-dashed border-outline-variant text-gray-400 transition',
                  'hover:border-brand-emerald hover:bg-brand-emerald/5 hover:text-brand-emerald',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                )}
              >
                <div className="rounded-full bg-surface-low p-4 transition group-hover:bg-brand-emerald/10">
                  <Plus className="size-8" />
                </div>
                <span className={cn(landingHeadlineSm, 'text-sm')}>Add item</span>
              </button>
            ) : null}
          </div>
        )}
      </section>
    </motion.div>
  );
}
