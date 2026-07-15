'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Wallet,
  Clock,
  CircleDollarSign,
  Eye,
} from 'lucide-react';
import { formatNPR } from '@/lib/nepalLocale';
import { paymentService } from '@/services';
import type {
  PaymentHistoryDirection,
  PaymentHistoryItem,
} from '@/services/payment.service';
import { useDashboardSidebarRole } from './DashboardRoleSwitchContext';
import { buildReceiptId } from '@/lib/statementReceiptPdf';
import StatementReceiptModal, { type StatementReceipt } from './StatementReceiptModal';
import WalletTableToolbar from './WalletTableToolbar';
import {
  DASHBOARD_CARD,
  DASHBOARD_HEADING,
  DASHBOARD_PAGE_ROOT,
  DASHBOARD_PAGINATION_ARROW,
  DASHBOARD_PAGINATION_INNER,
  DASHBOARD_PAGINATION_OUTER,
  DASHBOARD_STAT_VALUE,
  dashboardPageButtonClass,
} from './dashboardResponsive';

type Statement = StatementReceipt;

function formatStatementDate(dateString?: string) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

type PaymentStatusKind = 'paid' | 'pending' | 'held' | 'failed' | 'other';

function paymentStatusKind(status: string): PaymentStatusKind {
  const normalized = status.toLowerCase();
  if (['released', 'succeeded', 'completed'].includes(normalized)) return 'paid';
  if (normalized === 'held') return 'held';
  if (['pending', 'processing'].includes(normalized)) return 'pending';
  if (['failed', 'cancelled', 'refunded', 'reversed'].includes(normalized)) return 'failed';
  return 'other';
}

function paymentStatusLabel(status: string) {
  const normalized = status.toLowerCase();
  if (['released', 'succeeded', 'completed'].includes(normalized)) return 'Paid';
  if (normalized === 'held') return 'Held';
  if (normalized === 'processing') return 'Processing';
  if (normalized === 'pending') return 'Pending';
  if (normalized === 'failed') return 'Failed';
  if (normalized === 'cancelled') return 'Cancelled';
  if (normalized === 'refunded') return 'Refunded';
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function PaymentStatusBadge({ status }: { status: string }) {
  const kind = paymentStatusKind(status);
  const label = paymentStatusLabel(status);

  if (kind === 'paid') {
    return (
      <span className="inline-flex rounded-xl border border-[#EBF9F1] bg-[#EBF9F1] px-5 py-2.5 text-xs font-normal text-[#27AE60]">
        {label}
      </span>
    );
  }
  if (kind === 'held') {
    return (
      <span className="inline-flex rounded-xl border border-[#FFF6E9] bg-[#FFF6E9] px-5 py-2.5 text-xs font-normal text-[#F2994A]">
        {label}
      </span>
    );
  }
  if (kind === 'pending') {
    return (
      <span className="inline-flex rounded-xl border border-[#F3F9FE] bg-[#F3F9FE] px-5 py-2.5 text-xs font-normal text-[#2F80ED]">
        {label}
      </span>
    );
  }
  if (kind === 'failed') {
    return (
      <span className="inline-flex rounded-xl border border-red-100 bg-red-50 px-5 py-2.5 text-xs font-normal text-red-700">
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-xl bg-neutral-100 px-5 py-2.5 text-xs font-normal text-neutral-600">
      {label}
    </span>
  );
}

function groupOutgoingTransactions(transactions: PaymentHistoryItem[]) {
  const grouped = new Map<string, PaymentHistoryItem>();
  const passthrough: PaymentHistoryItem[] = [];

  for (const tx of transactions) {
    const taskId = tx.task_id ? String(tx.task_id) : null;
    if (!taskId) {
      passthrough.push(tx);
      continue;
    }

    const prev = grouped.get(taskId);
    if (!prev) {
      grouped.set(taskId, tx);
      continue;
    }

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
}

function mapPaymentToStatement(
  item: PaymentHistoryItem,
  direction: PaymentHistoryDirection
): Statement {
  const grossVal = Number(item.gross_amount ?? item.amount ?? 0);
  const feeVal = Number(item.platform_fee ?? 0);
  const amountVal =
    direction === 'earned'
      ? Number(item.net_amount ?? item.amount ?? 0)
      : Number(item.gross_amount ?? item.amount ?? 0);

  return {
    id: item.id,
    receiptId: buildReceiptId(item.id),
    date: formatStatementDate(item.created_at),
    createdAt: item.created_at,
    type: item.kind === 'wallet' && !item.task_id ? 'Wallet' : 'Task payment',
    title: item.title,
    subtitle: item.subtitle ?? '',
    detail: item.title,
    price: formatNPR(grossVal),
    priceVal: grossVal,
    amount: formatNPR(amountVal),
    amountVal,
    grossVal,
    netVal: Number(item.net_amount ?? item.amount ?? 0),
    feeVal,
    status: item.status,
    currency: item.currency || 'NPR',
    taskId: item.task_id,
    counterpartyName: item.counterparty_name,
    counterpartyEmail: item.counterparty_email,
    counterpartyLocation: item.counterparty_location,
  };
}

export default function DashboardStatements({ embedded = false }: { embedded?: boolean }) {
  const role = useDashboardSidebarRole();
  const direction: PaymentHistoryDirection = role === 'customer' ? 'outgoing' : 'earned';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedStatement, setSelectedStatement] = useState<Statement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statements, setStatements] = useState<Statement[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletStats, setWalletStats] = useState({
    available: 0,
    pending: 0,
    withdrawn: 0,
    netIncome: 0,
  });

  const loadStatements = useCallback(async () => {
    try {
      setLoading(true);
      const [historyRes, walletRes] = await Promise.all([
        paymentService.getPaymentHistory(direction),
        paymentService.getWalletBalance().catch(() => null),
      ]);

      let items: PaymentHistoryItem[] = [];
      let netIncome = 0;

      if (historyRes.success && historyRes.data) {
        items = historyRes.data.items ?? [];
        netIncome =
          direction === 'outgoing'
            ? groupOutgoingTransactions(items).reduce(
                (sum, tx) => sum + Number(tx.gross_amount ?? tx.amount ?? 0),
                0
              )
            : Number(historyRes.data.total_amount) || 0;
      }

      const displayItems =
        direction === 'outgoing' ? groupOutgoingTransactions(items) : items;

      setStatements(displayItems.map((item) => mapPaymentToStatement(item, direction)));

      const wallet = walletRes?.success ? walletRes.data : null;
      setWalletStats({
        netIncome,
        available: Number(wallet?.withdrawable_balance ?? wallet?.available_balance ?? 0),
        pending: Number(wallet?.pending_balance ?? wallet?.held_balance ?? 0),
        withdrawn: Number(wallet?.total_earned ?? 0) - Number(wallet?.available_balance ?? 0),
      });
    } catch (error) {
      console.error('Failed to load statements:', error);
      setStatements([]);
    } finally {
      setLoading(false);
    }
  }, [direction]);

  useEffect(() => {
    setCurrentPage(1);
    loadStatements();
  }, [loadStatements]);

  const totalNetIncome = walletStats.netIncome || statements.reduce((sum, st) => sum + st.amountVal, 0);

  const filteredStatements = useMemo(() => {
    return statements.filter((st) => {
      const statusText = paymentStatusLabel(st.status).toLowerCase();
      const textMatch =
        st.receiptId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        statusText.includes(searchQuery.toLowerCase()) ||
        st.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.price.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.amount.toLowerCase().includes(searchQuery.toLowerCase());

      if (filterStatus === 'All') return textMatch;
      return textMatch && paymentStatusKind(st.status) === filterStatus;
    });
  }, [statements, searchQuery, filterStatus]);

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredStatements.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);

  const indexOfLastItem = activePage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStatements = filteredStatements.slice(indexOfFirstItem, indexOfLastItem);

  const statementFilterOptions = useMemo(
    () => [
      { value: 'All', label: 'All Statuses' },
      { value: 'paid', label: 'Paid' },
      { value: 'held', label: 'Held' },
      { value: 'pending', label: 'Pending' },
      { value: 'failed', label: 'Failed' },
    ],
    [],
  );

  return (
    <div className={embedded ? 'animate-in fade-in duration-300 font-sans text-black dark:text-stone-100' : DASHBOARD_PAGE_ROOT}>
      {!embedded ? (
        <div className="mx-auto mb-6 max-w-7xl pl-1 sm:mb-8">
          <h1 className={DASHBOARD_HEADING}>Statements</h1>
          <p className="mt-2 text-[15px] font-normal tracking-tight text-neutral-500">
            {direction === 'outgoing'
              ? 'Task payments and outgoing transactions.'
              : 'Earnings and releases from completed work.'}
          </p>
        </div>
      ) : null}

      <div className="mx-auto mb-8 grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-neutral-200/50 bg-white p-6 transition-all duration-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:shadow-none">
          <div className="z-10 space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              {direction === 'outgoing' ? 'Total Outgoing' : 'Net Income'}
            </span>
            <h3 className={DASHBOARD_STAT_VALUE}>
              {formatNPR(totalNetIncome, { compact: true })}
            </h3>
            <p className="font-sans text-[12px] font-normal leading-tight text-[#52C47F]">
              {statements.length}{' '}
              <span className="text-neutral-500">
                {direction === 'outgoing' ? 'Payments' : 'Transactions'}
              </span>
            </p>
          </div>
          <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#EBF9F1] text-[#27AE60]">
            <TrendingUp className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="absolute bottom-0 right-0 h-20 w-20 translate-x-4 translate-y-4 rounded-full bg-[#27AE60]/[0.01] transition-transform duration-300 group-hover:scale-[1.3]" />
        </div>

        <div className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-neutral-200/50 bg-white p-6 transition-all duration-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:shadow-none">
          <div className="z-10 space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Withdrawn
            </span>
            <h3 className={DASHBOARD_STAT_VALUE}>
              {formatNPR(Math.max(0, walletStats.withdrawn), { compact: true })}
            </h3>
            <p className="text-[12px] font-normal leading-tight text-[#52C47F]">
              <span className="text-neutral-500">From wallet</span>
            </p>
          </div>
          <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#FCF0ED] text-[#F2994A]">
            <Wallet className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="absolute bottom-0 right-0 h-20 w-20 translate-x-4 translate-y-4 rounded-full bg-[#F2994A]/[0.01] transition-transform duration-300 group-hover:scale-[1.3]" />
        </div>

        <div className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-neutral-200/50 bg-white p-6 transition-all duration-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:shadow-none">
          <div className="z-10 space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Pending Clearance
            </span>
            <h3 className={DASHBOARD_STAT_VALUE}>
              {formatNPR(walletStats.pending, { compact: true })}
            </h3>
            <p className="text-[12px] font-normal leading-tight text-[#52C47F]">
              <span className="text-neutral-500">In escrow / pending</span>
            </p>
          </div>
          <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#F3F9FE] text-[#2F80ED]">
            <Clock className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="absolute bottom-0 right-0 h-20 w-20 translate-x-4 translate-y-4 rounded-full bg-[#2F80ED]/[0.01] transition-transform duration-300 group-hover:scale-[1.3]" />
        </div>

        <div className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-neutral-200/50 bg-white p-6 transition-all duration-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:shadow-none">
          <div className="z-10 space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Available for Withdrawal
            </span>
            <h3 className={DASHBOARD_STAT_VALUE}>
              {formatNPR(walletStats.available, { compact: true })}
            </h3>
            <p className="text-[12px] font-normal leading-tight text-[#52C47F]">
              <span className="text-neutral-500">Wallet balance</span>
            </p>
          </div>
          <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-[#193E32]">
            <CircleDollarSign className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="absolute bottom-0 right-0 h-20 w-20 translate-x-4 translate-y-4 rounded-full bg-emerald-500/[0.01] transition-transform duration-300 group-hover:scale-[1.3]" />
        </div>
      </div>

      <WalletTableToolbar
        searchQuery={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search statements"
        filterStatus={filterStatus}
        onFilterChange={(value) => {
          setFilterStatus(value);
          setCurrentPage(1);
        }}
        filterOptions={statementFilterOptions}
      />

      <div className={`${DASHBOARD_CARD} border-neutral-200/60`}>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse text-left">
            <thead>
              <tr className="border-b border-transparent text-sm font-medium text-neutral-800 dark:text-stone-100">
                <th className="w-[14%] pb-6 pt-2 font-medium">Invoice ID</th>
                <th className="w-[22%] pb-6 pt-2 font-medium">Title</th>
                <th className="w-[14%] pb-6 pt-2 font-medium">Date</th>
                <th className="w-[10%] pb-6 pt-2 font-medium">Price</th>
                <th className="w-[10%] pb-6 pt-2 font-medium">Amount</th>
                <th className="w-[16%] pb-6 pt-2 font-medium">Payment Status</th>
                <th className="w-[14%] pb-6 pt-2 pr-4 text-left font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm font-normal text-neutral-400">
                    Loading statements…
                  </td>
                </tr>
              ) : currentStatements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm font-normal text-neutral-400">
                    No matching statements found. Try a different search or payment status filter.
                  </td>
                </tr>
              ) : (
                currentStatements.map((st) => (
                  <tr key={st.id} className="transition-colors hover:bg-neutral-50/30 dark:hover:bg-neutral-800/50">
                    <td className="py-6 pr-4 align-middle text-sm font-normal text-neutral-900 dark:text-stone-100">
                      {st.receiptId}
                    </td>
                    <td className="break-words py-6 pr-4 align-middle text-sm font-medium text-neutral-900 dark:text-stone-100">
                      {st.title}
                    </td>
                    <td className="py-6 pr-4 align-middle text-sm font-normal text-neutral-500">
                      {st.date}
                    </td>
                    <td className="py-6 align-middle text-sm font-medium text-neutral-800">
                      {st.price}
                    </td>
                    <td className="py-6 align-middle text-sm font-bold text-neutral-900 dark:text-stone-100">
                      {st.amount}
                    </td>
                    <td className="py-6 align-middle">
                      <PaymentStatusBadge status={st.status} />
                    </td>
                    <td className="py-6 align-middle">
                      <button
                        type="button"
                        onClick={() => setSelectedStatement(st)}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#FCF0ED] px-5 py-2.5 text-xs font-medium text-[#222222] transition-all hover:scale-[1.02] hover:bg-[#FCE6E1] active:scale-[0.98]"
                      >
                        <Eye className="h-3.5 w-3.5" strokeWidth={1.8} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredStatements.length > 0 ? (
          <div className={DASHBOARD_PAGINATION_OUTER}>
            <div className={DASHBOARD_PAGINATION_INNER}>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={activePage === 1}
                className={DASHBOARD_PAGINATION_ARROW}
              >
                <ChevronLeft className="h-5 w-5 text-black dark:text-stone-100" strokeWidth={1.5} />
              </button>

              <div className="flex shrink-0 items-center gap-1">
                {totalPages <= 6 ? (
                  Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={dashboardPageButtonClass(activePage === page)}
                    >
                      {page}
                    </button>
                  ))
                ) : (
                  <>
                    {[1, 2, 3, 4, 5].map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={dashboardPageButtonClass(activePage === page)}
                      >
                        {page}
                      </button>
                    ))}
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center text-sm font-normal text-neutral-400 sm:h-[44px] sm:w-[44px]">
                      ...
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(totalPages)}
                      className={dashboardPageButtonClass(activePage === totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={activePage === totalPages}
                className={DASHBOARD_PAGINATION_ARROW}
              >
                <ChevronRight className="h-5 w-5 text-black dark:text-stone-100" strokeWidth={1.5} />
              </button>
            </div>

            <div className="pt-1 text-sm font-normal tracking-tight text-neutral-800">
              {indexOfFirstItem + 1} – {Math.min(indexOfLastItem, filteredStatements.length)} of{' '}
              {filteredStatements.length} statements
            </div>
          </div>
        ) : null}
      </div>

      {selectedStatement ? (
        <StatementReceiptModal
          statement={selectedStatement}
          direction={direction}
          onClose={() => setSelectedStatement(null)}
        />
      ) : null}
    </div>
  );
}
