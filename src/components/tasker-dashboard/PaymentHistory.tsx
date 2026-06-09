'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  Search,
  Inbox,
  ArrowUpRight,
  ArrowDownRight,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { paymentService } from '@/services';
import type { PaymentHistoryItem } from '@/services/payment.service';
import { toast } from 'sonner';
import { formatNPR } from '@/lib/nepalLocale';

type HistoryTab = 'earned' | 'outgoing';

const EARNED_STATUSES = new Set(['released', 'succeeded', 'completed']);
const OUTGOING_ACTIVE = new Set(['held', 'pending', 'processing', 'succeeded']);

function formatDate(dateString?: string) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-NP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function statusLabel(status: string) {
  return status.replace(/_/g, ' ');
}

export default function PaymentHistory() {
  const [activeTab, setActiveTab] = useState<HistoryTab>('earned');
  const [transactions, setTransactions] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [currency, setCurrency] = useState('NPR');

  const displayTransactions = useMemo(() => {
    if (activeTab !== 'outgoing') return transactions;

    // Backend includes multiple outgoing events per task (escrow hold, payment record, debit/release).
    // For UI clarity, group by task_id and show the "best" single row per task.
    const grouped = new Map<string, PaymentHistoryItem>();
    const passthrough: PaymentHistoryItem[] = [];

    for (const tx of transactions) {
      const taskId = tx.task_id ? String(tx.task_id) : null;
      if (!taskId) {
        passthrough.push(tx); // withdrawals and non-task items
        continue;
      }

      const prev = grouped.get(taskId);
      if (!prev) {
        grouped.set(taskId, tx);
        continue;
      }

      // Prefer the payment record over wallet events; otherwise keep the newest.
      const prevIsPayment = prev.kind === 'payment';
      const nextIsPayment = tx.kind === 'payment';
      if (nextIsPayment && !prevIsPayment) {
        grouped.set(taskId, tx);
        continue;
      }
      if (nextIsPayment === prevIsPayment) {
        if (new Date(tx.created_at).getTime() > new Date(prev.created_at).getTime()) {
          grouped.set(taskId, tx);
        }
      }
    }

    const merged = [...grouped.values(), ...passthrough];
    merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return merged;
  }, [activeTab, transactions]);

  const displayTotalAmount = useMemo(() => {
    // Backend total_amount for outgoing can include multiple ledger movements per task
    // (escrow hold, payment record, debit/release). For UI, sum what we actually show.
    if (activeTab !== 'outgoing') return totalAmount;
    // Outgoing should reflect what the poster paid/held (includes fees),
    // not what the tasker receives.
    return displayTransactions.reduce(
      (sum, tx) => sum + Number(tx.gross_amount ?? tx.amount ?? 0),
      0
    );
  }, [activeTab, displayTransactions, totalAmount]);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await paymentService.getPaymentHistory(activeTab);

      if (response.success && response.data) {
        setTransactions(response.data.items ?? []);
        setTotalAmount(Number(response.data.total_amount) || 0);
        setCurrency(response.data.currency || 'NPR');
      } else {
        setTransactions([]);
        setTotalAmount(0);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to load payment history';
      console.error('Failed to fetch payment history:', error);
      toast.error(message);
      setTransactions([]);
      setTotalAmount(0);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const summaryLabel = activeTab === 'earned' ? 'Total earned' : 'Total outgoing';
  const emptyTitle =
    activeTab === 'earned'
      ? "You haven't earned from any tasks yet."
      : "You haven't made any task payments yet.";
  const emptyBody =
    activeTab === 'earned'
      ? 'Complete tasks as a tasker to receive payments into your wallet.'
      : 'Post a task and pay from your wallet when you accept an offer — those payments appear here.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl space-y-8 pb-20"
    >
      <header className="space-y-6">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-brand-dark sm:text-4xl">
          Payment History
        </h1>

        <div className="no-scrollbar flex overflow-x-auto border-b border-gray-100">
          <button
            type="button"
            onClick={() => setActiveTab('earned')}
            className={cn(
              'relative shrink-0 px-4 py-3 font-black transition-all sm:px-8 sm:py-4',
              activeTab === 'earned' ? 'text-brand-emerald' : 'text-gray-400 hover:text-gray-600'
            )}
          >
            Earned
            {activeTab === 'earned' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 w-full h-1 bg-brand-emerald"
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('outgoing')}
            className={cn(
              'relative shrink-0 px-4 py-3 font-black transition-all sm:px-8 sm:py-4',
              activeTab === 'outgoing' ? 'text-brand-emerald' : 'text-gray-400 hover:text-gray-600'
            )}
          >
            Outgoing
            {activeTab === 'outgoing' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 w-full h-1 bg-brand-emerald"
              />
            )}
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white p-6 rounded-3xl border border-outline-variant shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-brand-dark">Showing</span>
          <div className="flex gap-2">
            <span className="px-4 py-2 bg-surface-low text-brand-dark rounded-xl font-bold text-sm border border-brand-emerald/10">
              {activeTab === 'earned' ? 'Task earnings' : 'Task payments'}
            </span>
          </div>
        </div>

        <div className="md:ml-auto flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {summaryLabel}
            </p>
            <p className="text-2xl font-black text-brand-dark">
              {formatNPR(displayTotalAmount, { showCode: currency !== 'NPR' })}
            </p>
          </div>
          <div className="h-10 w-px bg-gray-100 mx-2" />
          <button
            type="button"
            onClick={fetchPayments}
            className="p-3 bg-surface-low text-brand-dark rounded-xl hover:bg-white border border-transparent hover:border-outline-variant transition-all"
            title="Refresh"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            {displayTransactions.length} transactions
          </p>
          <button
            type="button"
            className="text-brand-emerald font-bold text-sm hover:underline flex items-center gap-2 opacity-50 cursor-not-allowed"
            disabled
          >
            <Calendar className="w-4 h-4" />
            Custom Range
          </button>
        </div>

        {loading ? (
          <section className="bg-white min-h-[400px] rounded-3xl border border-outline-variant shadow-sm flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-brand-emerald border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-500 font-medium">Loading transactions...</p>
            </div>
          </section>
        ) : transactions.length === 0 ? (
          <section className="bg-white min-h-[400px] rounded-3xl border border-outline-variant shadow-sm flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 bg-surface-low rounded-full flex items-center justify-center mb-6">
              <Inbox className="w-10 h-10 text-gray-300" />
            </div>
            <div className="max-w-sm space-y-4">
              <h3 className="text-xl font-bold text-brand-dark">{emptyTitle}</h3>
              <p className="text-gray-500 font-medium">{emptyBody}</p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = activeTab === 'earned' ? '/task' : '/post-task';
                  }}
                  className="bg-brand-emerald text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-brand-emerald/20 hover:scale-105 transition-all active:scale-95"
                >
                  {activeTab === 'earned' ? 'Browse tasks' : 'Post a task'}
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section className="bg-white rounded-3xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {displayTransactions.map((transaction) => {
                const isEarned = activeTab === 'earned';
                const isPositiveStatus =
                  isEarned
                    ? EARNED_STATUSES.has(transaction.status)
                    : OUTGOING_ACTIVE.has(transaction.status) ||
                      transaction.status === 'released';

                return (
                  <div
                    key={transaction.id}
                    className="p-6 hover:bg-surface-low transition-colors"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <div
                          className={cn(
                            'p-3 rounded-2xl shrink-0',
                            isEarned
                              ? 'bg-green-50 text-green-600'
                              : 'bg-orange-50 text-orange-600'
                          )}
                        >
                          {isEarned ? (
                            <ArrowUpRight className="w-6 h-6" />
                          ) : (
                            <ArrowDownRight className="w-6 h-6" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-brand-dark truncate">
                            {transaction.title}
                          </h4>
                          <p className="text-sm text-gray-500 font-medium">
                            {transaction.subtitle} · {formatDate(transaction.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-left sm:text-right">
                        <p
                          className={cn(
                            'text-xl font-black',
                            isEarned ? 'text-green-700' : 'text-brand-dark'
                          )}
                        >
                          {isEarned ? '+' : '−'}
                          {formatNPR(
                            isEarned
                              ? transaction.net_amount ?? transaction.amount
                              : transaction.gross_amount ?? transaction.amount
                          )}
                        </p>
                        {transaction.platform_fee != null &&
                          Number(transaction.platform_fee) > 0 && (
                            <p className="text-xs text-gray-500 font-medium mt-0.5">
                              {isEarned ? 'Gross' : 'Held'}{' '}
                              {formatNPR(transaction.gross_amount ?? transaction.amount)}
                              {' · Fee '}
                              {formatNPR(transaction.platform_fee)}
                            </p>
                          )}
                        <span
                          className={cn(
                            'text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-full inline-block mt-1',
                            isPositiveStatus
                              ? isEarned
                                ? 'bg-green-100 text-green-700'
                                : transaction.status === 'held'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-700'
                              : transaction.status === 'failed'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                          )}
                        >
                          {statusLabel(transaction.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <footer className="pt-10 border-t border-outline-variant">
        <div className="flex items-center gap-3 p-4 bg-surface-low text-brand-emerald rounded-2xl border border-brand-emerald/10">
          <Info className="w-5 h-5 shrink-0" />
          <p className="text-sm font-semibold">
            <span className="font-black">Earned</span> shows money you received after completing
            tasks. <span className="font-black">Outgoing</span> shows payments when you posted a task
            and paid from your wallet (including escrow holds). Wallet top-ups are on the Payments
            wallet tab.
          </p>
        </div>
      </footer>
    </motion.div>
  );
}
