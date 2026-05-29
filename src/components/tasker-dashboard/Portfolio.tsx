'use client';

import React, { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import { userService } from '@/services';
import type { PortfolioItem, PortfolioDocumentStatus } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

function StatusBadge({ status }: { status?: PortfolioDocumentStatus }) {
  if (status === 'approved') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-[10px] font-black uppercase tracking-widest">
        <CheckCircle2 className="w-3 h-3" />
        Approved
      </span>
    );
  }
  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-[10px] font-black uppercase tracking-widest">
        <XCircle className="w-3 h-3" />
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black uppercase tracking-widest">
      <Clock className="w-3 h-3" />
      Pending review
    </span>
  );
}

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    const remaining = MAX_ITEMS - portfolio.length;

    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_ITEMS} portfolio items allowed.`);
      return;
    }

    const toUpload = files.slice(0, remaining);
    if (toUpload.length < files.length) {
      toast.warning(`Only ${toUpload.length} file(s) added — portfolio limit is ${MAX_ITEMS} items.`);
    }

    const oversized = toUpload.filter((file) => file.size > MAX_BYTES);
    if (oversized.length > 0) {
      toast.error('Some files exceed the 5MB limit');
      return;
    }

    const invalidTypes = toUpload.filter((file) => !VALID_TYPES.includes(file.type));
    if (invalidTypes.length > 0) {
      toast.error('Only JPG, PNG, PDF, and TXT files are allowed');
      return;
    }

    setUploading(true);

    try {
      let uploadedCount = 0;
      for (const file of toUpload) {
        const response = await userService.uploadPortfolioItem(
          file,
          { title: file.name.replace(/\.[^.]+$/, '') || file.name },
        );

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

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

  const atLimit = portfolio.length >= MAX_ITEMS;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-12 pb-20"
    >
      <header className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-950">Portfolio</h1>
          <p className="text-gray-500 mt-1">
            Show off your best work. Uploads are reviewed by our team before they appear on your
            public profile.
          </p>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-outline-variant shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-primary rounded-2xl">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-blue-950 tracking-tight">
              Upload portfolio items
            </h3>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600 font-medium leading-relaxed">
              Showcase your talents by adding items to your portfolio. Each upload is registered
              for review in our admin system and linked to your account.
            </p>

            <div className="p-5 bg-surface-low rounded-3xl border border-primary/10 flex gap-4">
              <AlertCircle className="w-5 h-5 text-primary shrink-0" />
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                You may upload up to <span className="font-bold text-blue-950">{MAX_ITEMS}</span>{' '}
                items. Formats:{' '}
                <span className="font-bold text-blue-950">JPG, PNG, PDF, TXT</span> (max{' '}
                <span className="font-bold text-blue-950">5MB</span> each). Do not include personal
                details you do not want shared publicly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-2">
              <div className="flex-1 flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-400">
                  {uploading
                    ? 'Uploading...'
                    : portfolio.length > 0
                      ? `${portfolio.length} / ${MAX_ITEMS} item(s)`
                      : 'No file chosen'}
                </span>
              </div>

              <input
                type="file"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf,.txt,image/jpeg,image/png,application/pdf,text/plain"
                disabled={uploading || atLimit}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || atLimit}
                className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : atLimit ? 'Limit reached' : 'Select file'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-blue-950 uppercase tracking-tighter flex items-center gap-3">
            <ImageIcon className="w-6 h-6 text-primary" />
            Your items
          </h3>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
            {portfolio.length} / {MAX_ITEMS}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Loading portfolio...</p>
          </div>
        ) : portfolio.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
            <div className="p-6 bg-white rounded-full w-fit mx-auto mb-4">
              <ImageIcon className="w-12 h-12 text-gray-300" />
            </div>
            <h4 className="text-lg font-bold text-gray-400 mb-2">No portfolio items yet</h4>
            <p className="text-sm text-gray-400 mb-6">Upload your first item to showcase your work</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:opacity-90 transition-all"
            >
              Upload Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolio.map((item) => {
              const isImage = item.file_type?.startsWith('image/');
              const isPdf = item.file_type === 'application/pdf';

              return (
                <div
                  key={item.id}
                  className="group relative aspect-square rounded-[40px] overflow-hidden shadow-sm border border-outline-variant bg-surface-low flex flex-col transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="flex-1 flex items-center justify-center relative min-h-0">
                    {isImage && item.file ? (
                      <img
                        src={item.file}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-4 p-6">
                        <div className="p-6 bg-white rounded-3xl shadow-sm text-primary">
                          <FileText className="w-12 h-12" />
                        </div>
                        <span className="text-sm font-black text-blue-950 max-w-[180px] truncate uppercase tracking-tight text-center">
                          {item.title}
                        </span>
                      </div>
                    )}

                    <div className="absolute top-4 left-4">
                      <StatusBadge status={item.status} />
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-between p-6 pointer-events-none group-hover:pointer-events-auto">
                      <div className="flex justify-end gap-2">
                        {item.file ? (
                          <a
                            href={item.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-white text-primary rounded-2xl hover:scale-110 transition-all shadow-lg pointer-events-auto"
                            aria-label="Open file"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => removePortfolioItem(item.id)}
                          className="p-3 bg-red-500 text-white rounded-2xl hover:scale-110 active:scale-90 transition-all shadow-lg pointer-events-auto"
                          aria-label="Delete item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        <p className="text-white font-black text-lg truncate leading-tight">
                          {item.title}
                        </p>
                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">
                          {isPdf ? 'PDF' : item.file_type?.split('/')[1] || item.file_type}
                        </p>
                        {item.status === 'rejected' && item.rejection_reason ? (
                          <p className="text-red-200 text-xs mt-2 line-clamp-2">
                            {item.rejection_reason}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-white border-t border-outline-variant/50 sm:hidden">
                    <p className="text-xs font-bold text-blue-950 truncate">{item.title}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <StatusBadge status={item.status} />
                      <div className="flex gap-2">
                        {item.file ? (
                          <a
                            href={item.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => removePortfolioItem(item.id)}
                          className="text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
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
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className={cn(
                  'aspect-square rounded-[40px] border-4 border-dashed border-gray-200',
                  'flex flex-col items-center justify-center gap-4 text-gray-400',
                  'hover:border-primary hover:text-primary hover:bg-primary/5 transition-all group',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
              >
                <div className="p-5 rounded-full bg-gray-50 group-hover:bg-primary/10 transition-colors">
                  <Plus className="w-10 h-10" />
                </div>
                <span className="font-black uppercase tracking-widest text-sm">Add item</span>
              </button>
            ) : null}
          </div>
        )}
      </section>
    </motion.div>
  );
}
