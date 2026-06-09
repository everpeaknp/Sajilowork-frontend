"use client";

import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2 } from 'lucide-react';

interface SetUpAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestedKeyword: string;
  onSubmit: (keyword: string) => Promise<void>;
}

export default function SetUpAlertsModal({
  isOpen,
  onClose,
  suggestedKeyword,
  onSubmit,
}: SetUpAlertsModalProps) {
  const [keyword, setKeyword] = useState(suggestedKeyword);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setKeyword(suggestedKeyword);
    }
  }, [isOpen, suggestedKeyword]);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleSubmit = async () => {
    const trimmed = keyword.trim();
    if (!trimmed || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(trimmed);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTree = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-[10050]"
            aria-hidden
          />

          <div className="fixed inset-0 z-[10051] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto w-full max-w-lg bg-white rounded-3xl shadow-2xl mx-auto max-h-[min(90vh,calc(100dvh-2rem))] overflow-y-auto"
              role="dialog"
              aria-labelledby="setup-alerts-title"
            >
              <div className="px-8 py-10 sm:px-10">
                <h2
                  id="setup-alerts-title"
                  className="text-2xl sm:text-3xl font-bold text-brand-dark mb-2"
                >
                  Set up task alerts
                </h2>
                <p className="text-on-surface-variant text-sm mb-6">
                  We&apos;ll notify you when new tasks are posted that match this keyword.
                </p>

                <label className="block text-sm font-semibold text-on-surface mb-2" htmlFor="alert-keyword">
                  Alert keyword
                </label>
                <input
                  id="alert-keyword"
                  type="text"
                  maxLength={64}
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. cleaning, moving, plumbing"
                  className="w-full px-4 py-3 border-2 border-outline-variant rounded-xl focus:outline-none focus:border-brand-emerald transition-all text-on-surface"
                />
                <p className="mt-2 text-xs text-on-surface-variant">
                  Up to 64 characters. You can manage alerts in your dashboard settings.
                </p>

                <div className="flex items-center gap-3 mt-8">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 py-3 border-2 border-outline-variant text-on-surface font-semibold rounded-full hover:bg-surface-dim transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!keyword.trim() || isSubmitting}
                    className="flex-1 py-3 bg-brand-emerald text-white font-semibold rounded-full hover:bg-brand-emerald/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                        Saving…
                      </>
                    ) : (
                      'Save alert'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  if (!isMounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(modalTree, document.body);
}
