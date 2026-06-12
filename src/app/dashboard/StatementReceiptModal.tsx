'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { X, Download, Printer, Copy, Check, FileText } from 'lucide-react';
import { formatNPR } from '@/lib/nepalLocale';
import {
  buildReceiptId,
  downloadStatementReceiptPdf,
  printStatementReceipt,
  type StatementReceiptData,
} from '@/lib/statementReceiptPdf';
import type { PaymentHistoryDirection } from '@/services/payment.service';
import { useAuthStore } from '@/store/auth.store';

export interface StatementReceipt {
  id: string;
  receiptId: string;
  date: string;
  createdAt: string;
  type: string;
  title: string;
  subtitle: string;
  detail: string;
  price: string;
  priceVal: number;
  amount: string;
  amountVal: number;
  grossVal: number;
  netVal: number;
  feeVal: number;
  status: string;
  currency: string;
  taskId?: string | null;
}

interface StatementReceiptModalProps {
  statement: StatementReceipt;
  direction: PaymentHistoryDirection;
  onClose: () => void;
}

function statusLabel(status: string) {
  const label = status.replace(/_/g, ' ');
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function statusTone(status: string) {
  const normalized = status.toLowerCase();
  if (['released', 'succeeded', 'completed'].includes(normalized)) {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  }
  if (['held', 'pending', 'processing'].includes(normalized)) {
    return 'bg-amber-50 text-amber-700 ring-amber-200';
  }
  if (['failed', 'cancelled', 'refunded'].includes(normalized)) {
    return 'bg-red-50 text-red-700 ring-red-200';
  }
  return 'bg-neutral-100 text-neutral-700 ring-neutral-200';
}

export default function StatementReceiptModal({
  statement,
  direction,
  onClose,
}: StatementReceiptModalProps) {
  const user = useAuthStore((s) => s.user);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const receiptId = statement.receiptId || buildReceiptId(statement.id);

  const accountName = user?.full_name || [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Account holder';
  const accountEmail = user?.email || '—';
  const accountLocation = [user?.city, user?.country].filter(Boolean).join(', ') || 'Nepal';

  const receiptData: StatementReceiptData = useMemo(
    () => ({
      receiptId,
      transactionId: statement.id,
      date: statement.date,
      type: statement.type,
      title: statement.title,
      subtitle: statement.subtitle || undefined,
      detail: statement.detail,
      status: statement.status,
      direction,
      currency: statement.currency,
      grossAmount: statement.grossVal,
      platformFee: statement.feeVal,
      netAmount: statement.amountVal,
      taskId: statement.taskId,
      accountName,
      accountEmail,
      accountLocation,
    }),
    [statement, direction, receiptId, accountName, accountEmail, accountLocation]
  );

  const handleDownloadPdf = useCallback(async () => {
    try {
      setDownloading(true);
      downloadStatementReceiptPdf(receiptData);
    } finally {
      setDownloading(false);
    }
  }, [receiptData]);

  const handlePrint = useCallback(() => {
    if (!receiptRef.current) return;
    printStatementReceipt(receiptRef.current, `Receipt ${receiptId}`);
  }, [receiptId]);

  const handleCopyId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(receiptId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }, [receiptId]);

  return (
    <>
      <button
        type="button"
        aria-label="Close receipt"
        onClick={onClose}
        className="animate-in fade-in fixed inset-0 z-[10050] bg-neutral-900/50 backdrop-blur-sm duration-300"
      />

      <div className="animate-in fade-in slide-in-from-bottom-4 pointer-events-none fixed inset-0 z-[10051] flex items-end justify-center p-0 duration-300 sm:items-center sm:p-4">
      <div className="pointer-events-auto flex max-h-[min(92dvh,calc(100dvh-5rem))] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-neutral-200/80 bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-3xl">
        {/* Toolbar */}
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EBF9F1] text-[#27AE60]">
              <FileText className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900">Transaction Receipt</h3>
              <p className="text-xs text-neutral-500">Official ledger record</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Printable receipt body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div
            ref={receiptRef}
            className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
          >
            <div className="bg-gradient-to-r from-[#52C47F] to-[#3daf6c] px-6 py-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-2xl font-black tracking-tight">TaskNepal</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
                    Transaction Receipt Ledger
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold">{receiptId}</p>
                  <p className="mt-1 text-xs text-white/80">{statement.date}</p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusTone(statement.status)}`}
                >
                  {statusLabel(statement.status)}
                </span>
                <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
                  {statement.type}
                </span>
                <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
                  {direction === 'outgoing' ? 'Outgoing' : 'Earned'}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-neutral-100 bg-[#fafafa] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Account holder
                  </p>
                  <p className="mt-2 text-sm font-semibold text-neutral-900">{accountName}</p>
                  <p className="mt-1 text-xs text-neutral-500">{accountEmail}</p>
                  <p className="text-xs text-neutral-500">{accountLocation}</p>
                </div>
                <div className="rounded-xl border border-neutral-100 bg-[#fafafa] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Reference
                  </p>
                  <p className="mt-2 font-mono text-xs text-neutral-700 break-all">{statement.id}</p>
                  {statement.taskId ? (
                    <p className="mt-2 text-xs text-neutral-500">
                      Task: <span className="font-mono text-neutral-700">{statement.taskId}</span>
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="rounded-xl border border-neutral-200 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  {direction === 'outgoing' ? 'Payment for' : 'Earnings from'}
                </p>
                <p className="mt-2 text-sm font-semibold text-neutral-900">{statement.title}</p>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-4">
                <div className="flex items-center justify-between py-2 text-sm text-neutral-600">
                  <span>Gross amount</span>
                  <span className="font-medium text-neutral-900">{formatNPR(statement.grossVal)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-neutral-200/80 py-2 text-sm text-neutral-600">
                  <span>Platform fee</span>
                  <span className="font-medium text-neutral-900">
                    {statement.feeVal > 0 ? `− ${formatNPR(statement.feeVal)}` : formatNPR(0)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-neutral-300 py-3">
                  <span className="text-sm font-semibold text-neutral-900">
                    {direction === 'outgoing' ? 'Total paid' : 'Net received'}
                  </span>
                  <span className="text-lg font-bold text-[#27AE60]">{statement.amount}</span>
                </div>
              </div>

              <p className="text-[10px] leading-relaxed text-neutral-400">
                Generated by TaskNepal on {new Date().toLocaleString('en-NP')}. This receipt confirms the
                transaction listed above. Keep this document for your records.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="shrink-0 border-t border-neutral-100 bg-white px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleCopyId}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy receipt #'}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-100 px-4 py-3 text-xs font-semibold text-neutral-800 transition-colors hover:bg-neutral-200"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#222222] px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {downloading ? 'Generating…' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
