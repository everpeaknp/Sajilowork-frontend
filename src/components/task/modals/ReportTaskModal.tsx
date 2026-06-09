"use client";

import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2 } from 'lucide-react';

interface ReportTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: string, comment: string) => void | Promise<void>;
  isSubmitting?: boolean;
}

export default function ReportTaskModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: ReportTaskModalProps) {
  const [reportCategory, setReportCategory] = useState('');
  const [reportComment, setReportComment] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = () => {
    void onSubmit(reportCategory, reportComment);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
    setReportCategory('');
    setReportComment('');
  };

  useEffect(() => {
    if (!isOpen && !isSubmitting) {
      setReportCategory('');
      setReportComment('');
    }
  }, [isOpen, isSubmitting]);

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
            >
            {/* Modal Content */}
            <div className="px-10 py-10">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-brand-dark mb-2">What would you like to report?</h2>
                <p className="text-on-surface-variant text-sm">Please give us more information regarding this report</p>
              </div>

              <div className="space-y-5">
                {/* Category Dropdown */}
                <div>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-outline-variant rounded-xl focus:outline-none focus:border-brand-emerald transition-all text-on-surface bg-white appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      paddingRight: '3rem'
                    }}
                  >
                    <option value="">Please select a category</option>
                    <option value="inappropriate">Inappropriate content</option>
                    <option value="spam">Spam or misleading</option>
                    <option value="fraud">Suspected fraud</option>
                    <option value="safety">Safety concern</option>
                    <option value="duplicate">Duplicate task</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Comment Textarea */}
                <div>
                  <textarea
                    value={reportComment}
                    onChange={(e) => setReportComment(e.target.value)}
                    placeholder="Comment (required)"
                    className="w-full min-h-[140px] px-4 py-3 border-2 border-outline-variant rounded-xl resize-none focus:outline-none focus:border-brand-emerald transition-all text-on-surface"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 mt-8">
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 py-3 border-2 border-outline-variant text-on-surface font-semibold rounded-full hover:bg-surface-dim transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!reportCategory || !reportComment.trim() || isSubmitting}
                  className="flex-1 py-3 bg-brand-emerald text-white font-semibold rounded-full hover:bg-brand-emerald/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                      Sending…
                    </>
                  ) : (
                    'Send Report'
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
