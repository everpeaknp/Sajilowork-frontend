'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { X, Download, Printer, Copy, Check, Receipt } from 'lucide-react';
import { formatNPR } from '@/lib/nepalLocale';
import { RECEIPT_DOCUMENT_STYLES } from '@/lib/receiptDocumentStyles';
import {
  buildReceiptId,
  buildShortReferenceId,
  downloadStatementReceiptPdf,
  printStatementReceipt,
  type StatementReceiptData,
} from '@/lib/statementReceiptPdf';
import { toast } from 'sonner';
import type { PaymentHistoryDirection } from '@/services/payment.service';
import { useAuthStore } from '@/store/auth.store';

import {
  resolveBillingParties,
  type BillingParty,
} from '@/lib/receiptBillingParties';

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
  billedFrom?: BillingParty;
  billedTo?: BillingParty;
  counterpartyName?: string;
  counterpartyEmail?: string;
  counterpartyLocation?: string;
}

export interface ReceiptLabelOverrides {
  documentTitle?: string;
  documentSubtitle?: string;
  descriptionHeading?: string;
  totalLabel?: string;
  feeLabel?: string;
  directionLabel?: string;
}

interface StatementReceiptModalProps {
  statement: StatementReceipt;
  direction: PaymentHistoryDirection;
  onClose: () => void;
  labels?: ReceiptLabelOverrides;
}

function statusLabel(status: string) {
  const label = status.replace(/_/g, ' ');
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function statusBadgeClass(status: string) {
  const normalized = status.toLowerCase();
  if (['released', 'succeeded', 'completed'].includes(normalized)) {
    return 'tn-receipt-badge tn-receipt-badge--success';
  }
  if (['held', 'pending', 'processing'].includes(normalized)) {
    return 'tn-receipt-badge tn-receipt-badge--pending';
  }
  if (['failed', 'cancelled', 'refunded'].includes(normalized)) {
    return 'tn-receipt-badge tn-receipt-badge--failed';
  }
  return 'tn-receipt-badge tn-receipt-badge--neutral';
}

function isPaidStatus(status: string) {
  return ['released', 'succeeded', 'completed'].includes(status.toLowerCase());
}

export default function StatementReceiptModal({
  statement,
  direction,
  onClose,
  labels,
}: StatementReceiptModalProps) {
  const user = useAuthStore((s) => s.user);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const receiptId = statement.receiptId || buildReceiptId(statement.id);
  const shortTransactionId = buildShortReferenceId(statement.id);
  const shortTaskRef = statement.taskId ? buildShortReferenceId(statement.taskId) : null;

  const accountName =
    user?.full_name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    'Account holder';
  const accountEmail = user?.email || '—';
  const accountLocation = [user?.city, user?.country].filter(Boolean).join(', ') || 'Nepal';

  const account: BillingParty = useMemo(
    () => ({
      name: accountName,
      email: accountEmail,
      location: accountLocation,
    }),
    [accountName, accountEmail, accountLocation]
  );

  const { billedFrom, billedTo } = useMemo(
    () =>
      resolveBillingParties({
        direction,
        statementType: statement.type,
        account,
        counterparty: {
          name: statement.counterpartyName,
          email: statement.counterpartyEmail,
          location: statement.counterpartyLocation,
        },
        billedFrom: statement.billedFrom,
        billedTo: statement.billedTo,
      }),
    [direction, statement, account]
  );

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
      billedFrom,
      billedTo,
      descriptionHeading: labels?.descriptionHeading,
      totalLabel: labels?.totalLabel,
      feeLabel: labels?.feeLabel,
    }),
    [statement, direction, receiptId, billedFrom, billedTo, labels]
  );

  const handleDownloadPdf = useCallback(async () => {
    try {
      setDownloading(true);
      downloadStatementReceiptPdf(receiptData);
    } catch (error) {
      console.error('Failed to generate receipt PDF:', error);
      toast.error('Could not download receipt. Please try Print instead.');
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

  const totalLabel =
    labels?.totalLabel ?? (direction === 'outgoing' ? 'Total paid' : 'Net received');
  const descriptionHeading =
    labels?.descriptionHeading ??
    (direction === 'outgoing' ? 'Payment for' : 'Earnings from');
  const feeLabel = labels?.feeLabel ?? 'Platform fee';
  const directionLabel =
    labels?.directionLabel ?? (direction === 'outgoing' ? 'Outgoing' : 'Earned');
  const documentTitle = labels?.documentTitle ?? 'Transaction Receipt';
  const documentSubtitle = labels?.documentSubtitle ?? 'Official payment record';
  const showPaidStamp = isPaidStatus(statement.status);
  const generatedAt = new Date().toLocaleString('en-NP', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <>
      <button
        type="button"
        aria-label="Close receipt"
        onClick={onClose}
        className="animate-in fade-in fixed inset-0 z-[10050] bg-neutral-900/55 backdrop-blur-sm duration-300"
      />

      <div className="animate-in fade-in slide-in-from-bottom-4 pointer-events-none fixed inset-0 z-[10051] flex items-end justify-center p-0 duration-300 sm:items-center sm:p-4">
        <div className="pointer-events-auto flex max-h-[min(92dvh,calc(100dvh-5rem))] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-neutral-200/80 bg-neutral-50 shadow-2xl sm:max-h-[92vh] sm:rounded-3xl dark:border-neutral-800 dark:bg-neutral-900">
          {/* Toolbar */}
          <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-5 py-4 sm:px-6 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-900/50">
                <Receipt className="h-5 w-5" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-stone-100">{documentTitle}</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{documentSubtitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-stone-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Printable receipt body */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            <div
              ref={receiptRef}
              className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
            >
              <style dangerouslySetInnerHTML={{ __html: RECEIPT_DOCUMENT_STYLES }} />

              <div className="tn-receipt">
                <div className="tn-receipt-accent" />
                <div className="tn-receipt-body-wrap">
                  {showPaidStamp ? <div className="tn-receipt-stamp">Paid</div> : null}

                  <div className="tn-receipt-inner">
                    <header className="tn-receipt-header">
                      <div>
                        <h1 className="tn-receipt-brand-name">SajiloWork</h1>
                        <p className="tn-receipt-brand-meta">
                          Kathmandu, Nepal
                          <br />
                          support@sajilowork.com
                        </p>
                      </div>
                      <div className="tn-receipt-meta-block">
                        <p className="tn-receipt-label">Receipt</p>
                        <p className="tn-receipt-id">{receiptId}</p>
                        <p className="tn-receipt-date">{statement.date}</p>
                      </div>
                    </header>

                    <hr className="tn-receipt-divider" />

                    <div className="tn-receipt-grid">
                      <div>
                        <p className="tn-receipt-section-title">Billed from</p>
                        <p className="tn-receipt-name">{billedFrom.name}</p>
                        <p className="tn-receipt-sub">{billedFrom.email}</p>
                        <p className="tn-receipt-sub">{billedFrom.location}</p>
                      </div>
                      <div>
                        <p className="tn-receipt-section-title">Billed to</p>
                        <p className="tn-receipt-name">{billedTo.name}</p>
                        <p className="tn-receipt-sub">{billedTo.email}</p>
                        <p className="tn-receipt-sub">{billedTo.location}</p>
                      </div>
                    </div>

                    <div className="tn-receipt-payment-details">
                      <p className="tn-receipt-section-title">Payment details</p>
                      <div className="tn-receipt-status-row">
                        <span className={statusBadgeClass(statement.status)}>
                          <span className="tn-receipt-badge-dot" aria-hidden />
                          {statusLabel(statement.status)}
                        </span>
                        <span className="tn-receipt-badge tn-receipt-badge--neutral">
                          {statement.type}
                        </span>
                        <span className="tn-receipt-badge tn-receipt-badge--neutral">
                          {directionLabel}
                        </span>
                      </div>
                      <p className="tn-receipt-sub" style={{ marginTop: 10 }}>
                        Currency: {statement.currency || 'NPR'}
                      </p>
                    </div>

                    <div className="tn-receipt-desc-box">
                      <p className="tn-receipt-section-title" style={{ marginBottom: 8 }}>
                        {descriptionHeading}
                      </p>
                      <p className="tn-receipt-desc-title">{statement.title}</p>
                      {statement.subtitle ? (
                        <p className="tn-receipt-sub">{statement.subtitle}</p>
                      ) : null}
                      {shortTaskRef ? (
                        <p className="tn-receipt-desc-ref">Task ref: {shortTaskRef}</p>
                      ) : null}
                    </div>

                    <table className="tn-receipt-table">
                      <thead>
                        <tr>
                          <th>Description</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Gross amount</td>
                          <td>{formatNPR(statement.grossVal)}</td>
                        </tr>
                        <tr>
                          <td>{feeLabel}</td>
                          <td>
                            {statement.feeVal > 0
                              ? `− ${formatNPR(statement.feeVal)}`
                              : formatNPR(0)}
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          <td className="tn-receipt-total-label">{totalLabel}</td>
                          <td className="tn-receipt-total-value">{statement.amount}</td>
                        </tr>
                      </tfoot>
                    </table>

                    <footer className="tn-receipt-footer">
                      <p className="tn-receipt-footer-id">
                        Transaction ID: <span>{shortTransactionId}</span>
                      </p>
                      <p className="tn-receipt-footer-note">
                        Thank you for using SajiloWork. This is a system-generated receipt — keep it
                        for your records. Generated on {generatedAt}. For support, email
                        support@sajilowork.com and include receipt {receiptId}.
                      </p>
                    </footer>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="shrink-0 border-t border-neutral-200 bg-white px-5 py-4 sm:px-6 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleCopyId}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? 'Copied' : 'Copy receipt #'}
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-100 px-4 py-3 text-xs font-semibold text-neutral-800 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-stone-100 dark:hover:bg-neutral-700"
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
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
