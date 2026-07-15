'use client';

import { useMemo, useState, type FormEvent } from 'react';
import {
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock,
  Eye,
  TrendingUp,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import { CURRENCY_INPUT_PREFIX, formatNPR } from '@/lib/nepalLocale';
import { sumWalletAmountsByStatus, type WalletTabSummary } from '@/lib/walletTabStats';
import { buildReceiptId } from '@/lib/statementReceiptPdf';
import { mapRechargeToInvoice, type WalletInvoiceView } from '@/lib/walletInvoice';
import { DashboardMetricCards } from './DashboardMetricCards';
import StatementReceiptModal from './StatementReceiptModal';
import WalletTableToolbar from './WalletTableToolbar';
import { DASHBOARD_PAGE_ROOT } from './dashboardResponsive';
import { StatusBadge, type PayoutStatus } from './DashboardPayouts';

export type RechargeStatus = PayoutStatus;

function rechargeStatusFilterKind(status: RechargeStatus): 'approved' | 'pending' | 'failed' | 'other' {
  if (status === 'Approved') return 'approved';
  if (status === 'Pending Orange' || status === 'Pending Blue' || status === 'Processing') {
    return 'pending';
  }
  if (status === 'Cancelled' || status === 'Rejected' || status === 'Failed') return 'failed';
  return 'other';
}

function matchesRechargeSearch(item: Recharge, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return (
    buildReceiptId(item.id).toLowerCase().includes(normalized) ||
    item.amount.toLowerCase().includes(normalized) ||
    item.date.toLowerCase().includes(normalized) ||
    item.rechargeMethod.toLowerCase().includes(normalized) ||
    item.status.toLowerCase().includes(normalized) ||
    (item.referenceNumber?.toLowerCase().includes(normalized) ?? false)
  );
}

export interface Recharge {
  id: string;
  amount: string;
  amountVal: number;
  grossVal?: number;
  netVal?: number;
  feeVal?: number;
  date: string;
  createdAt?: string;
  rechargeMethod: string;
  status: RechargeStatus;
  referenceNumber?: string;
}

function buildRecharges(): Recharge[] {
  const methods = ['eSewa', 'WhatsApp', 'Bank Transfer'];

  return Array.from({ length: 24 }, (_, i) => {
    const isPendingOrange = i % 4 === 1;
    const isPendingBlue = i % 4 === 2;
    const status: RechargeStatus = isPendingOrange
      ? 'Pending Orange'
      : isPendingBlue
        ? 'Pending Blue'
        : 'Approved';

    const amountVal = 500 + ((i * 175) % 4500);

    return {
      id: `recharge-mock-${i}`,
      amount: formatNPR(amountVal),
      amountVal,
      date: 'April 10, 2023',
      rechargeMethod: methods[i % methods.length],
      status,
    };
  });
}

export type { WalletTabSummary } from '@/lib/walletTabStats';

export interface DashboardRechargesProps {
  embedded?: boolean;
  recharges?: Recharge[];
  loading?: boolean;
  onCreateRecharge?: () => void;
  walletSummary?: WalletTabSummary;
}

export default function DashboardRecharges({
  embedded = false,
  recharges: rechargesProp,
  loading = false,
  onCreateRecharge,
  walletSummary,
}: DashboardRechargesProps = {}) {
  const [localRecharges, setLocalRecharges] = useState<Recharge[]>(buildRecharges);
  const recharges = rechargesProp ?? localRecharges;
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAmount, setNewAmount] = useState('500');
  const [newMethod, setNewMethod] = useState('eSewa');
  const [newStatus, setNewStatus] = useState<'Pending Orange' | 'Pending Blue'>('Pending Orange');
  const [successNote, setSuccessNote] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<WalletInvoiceView | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredRecharges = useMemo(() => {
    return recharges.filter((item) => {
      const textMatch = matchesRechargeSearch(item, searchQuery);
      if (filterStatus === 'All') return textMatch;
      return textMatch && rechargeStatusFilterKind(item.status) === filterStatus;
    });
  }, [recharges, searchQuery, filterStatus]);

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredRecharges.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);

  const indexOfLastItem = activePage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecharges = filteredRecharges.slice(indexOfFirstItem, indexOfLastItem);

  const totalApproved = useMemo(
    () => sumWalletAmountsByStatus(recharges, 'approved'),
    [recharges]
  );
  const totalPending = useMemo(
    () => sumWalletAmountsByStatus(recharges, 'pending'),
    [recharges]
  );

  const statCards = useMemo(
    () => [
      {
        label: 'Total Recharged',
        value: formatNPR(totalApproved, { compact: true }),
        hint: `${recharges.filter((item) => item.status === 'Approved').length} `,
        hintMuted: 'Approved top-ups',
        icon: TrendingUp,
        iconWrapClass: 'bg-[#EBF9F1] text-[#27AE60] dark:bg-emerald-950/40',
        iconClass: 'text-[#27AE60]',
        glowClass: 'bg-[#27AE60]/[0.01]',
      },
      {
        label: 'Pending Recharges',
        value: formatNPR(totalPending, { compact: true }),
        hint: `${recharges.filter((item) => item.status !== 'Approved').length} `,
        hintMuted: 'Awaiting confirmation',
        icon: Clock,
        iconWrapClass: 'bg-[#F3F9FE] text-[#2F80ED] dark:bg-blue-950/40',
        iconClass: 'text-[#2F80ED]',
        glowClass: 'bg-[#2F80ED]/[0.01]',
      },
      {
        label: 'Recharge History',
        value: String(recharges.length),
        hintMuted: 'Total recharge records',
        icon: Zap,
        iconWrapClass: 'bg-[#FCF0ED] text-[#F2994A] dark:bg-orange-950/40',
        iconClass: 'text-[#F2994A]',
        glowClass: 'bg-[#F2994A]/[0.01]',
      },
      {
        label: 'Recharge Balance',
        value: formatNPR(walletSummary?.rechargeBalance ?? totalApproved, { compact: true }),
        hintMuted: 'Total topped up in wallet',
        icon: CircleDollarSign,
        iconWrapClass:
          'border border-emerald-100 bg-emerald-50 text-[#193E32] dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300',
        iconClass: 'text-[#193E32] dark:text-emerald-300',
        glowClass: 'bg-emerald-500/[0.01]',
      },
    ],
    [recharges, totalApproved, totalPending, walletSummary?.rechargeBalance]
  );

  const pageButtonClass = (page: number) =>
    `flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-full text-sm transition-all ${
      activePage === page
        ? 'bg-[#52C47F] font-semibold text-white shadow-sm'
        : 'bg-transparent font-normal text-black hover:text-[#52C47F] dark:text-stone-200'
    }`;

  const handleCreateClick = () => {
    if (onCreateRecharge) {
      onCreateRecharge();
      return;
    }
    setIsModalOpen(true);
  };

  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newAmount || Number.isNaN(Number(newAmount))) return;

    const parsedVal = Number(newAmount);
    const formattedAmount = formatNPR(parsedVal);

    const freshRecharge: Recharge = {
      id: `recharge-user-${Date.now()}`,
      amount: formattedAmount,
      amountVal: parsedVal,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      rechargeMethod: newMethod,
      status: newStatus,
    };

    setLocalRecharges((prev) => [freshRecharge, ...prev]);
    setIsModalOpen(false);
    setCurrentPage(1);

    setSuccessNote(`Recharge of ${formattedAmount} via ${newMethod} recorded.`);
    setTimeout(() => setSuccessNote(null), 4500);
  };

  const outerClass = embedded
    ? 'animate-in fade-in duration-300 font-sans text-black dark:text-stone-100'
    : DASHBOARD_PAGE_ROOT;

  return (
    <div className={outerClass}>
      {!embedded ? (
        <div className="mx-auto mb-8 flex max-w-7xl flex-col gap-5 pl-1 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-[34px] font-normal leading-none tracking-tight text-neutral-900 dark:text-stone-100">Recharges</h1>
            <p className="mt-2 text-[15px] font-normal tracking-tight text-neutral-500 dark:text-neutral-400">
              Lorem ipsum dolor sit amet, consectetur.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreateClick}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-neutral-900 px-6 py-4 text-sm font-medium text-white shadow-md transition-all hover:scale-[1.01] hover:bg-neutral-800 active:scale-[0.99] dark:bg-stone-100 dark:text-neutral-900 dark:hover:bg-white"
          >
            <span>Create Recharge</span>
            <ArrowDownLeft className="h-4 w-4 text-white" strokeWidth={2} />
          </button>
        </div>
      ) : null}

      {successNote ? (
        <div className="animate-in slide-in-from-bottom-2 mx-auto mb-5 flex max-w-7xl items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-sm duration-300 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200 dark:shadow-none">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span>{successNote}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessNote(null)}
            className="rounded p-1 text-emerald-600 transition-all hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <DashboardMetricCards cards={statCards} />

      <WalletTableToolbar
        searchQuery={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search recharge"
        filterStatus={filterStatus}
        onFilterChange={(value) => {
          setFilterStatus(value);
          setCurrentPage(1);
        }}
      />

      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-neutral-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] md:p-8 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none">
        {loading ? (
          <div className="py-16 text-center text-sm text-neutral-500 dark:text-neutral-400">Loading recharges…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse text-left">
              <thead>
                <tr className="border-b border-transparent text-sm font-medium text-neutral-800 dark:text-stone-100">
                  <th className="w-[12%] pb-6 pl-2 pt-2 font-medium">Invoice ID</th>
                  <th className="w-[18%] pb-6 pt-2 font-medium">Amount</th>
                  <th className="w-[18%] pb-6 pt-2 font-medium">Date</th>
                  <th className="w-[18%] pb-6 pt-2 font-medium">Recharge Method</th>
                  <th className="w-[18%] pb-6 pt-2 text-left font-medium">Payment Status</th>
                  <th className="w-[16%] pb-6 pt-2 pr-2 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {currentRecharges.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
                      {recharges.length === 0
                        ? 'No recharges yet. Create your first recharge to get started.'
                        : 'No matching recharges found. Try a different search or payment status filter.'}
                    </td>
                  </tr>
                ) : (
                  currentRecharges.map((item) => (
                    <tr key={item.id} className="transition-colors hover:bg-neutral-50/20 dark:hover:bg-neutral-800/50">
                      <td className="py-6 pl-2 align-middle text-sm font-normal text-neutral-900 dark:text-stone-100">
                        {buildReceiptId(item.id)}
                      </td>
                      <td className="select-all py-6 align-middle text-[15px] font-medium text-neutral-900 dark:text-stone-100">
                        {item.amount}
                      </td>
                      <td className="py-6 align-middle text-sm font-normal text-neutral-500 dark:text-neutral-400">{item.date}</td>
                      <td className="py-6 align-middle text-sm font-normal text-neutral-800 dark:text-stone-200">{item.rechargeMethod}</td>
                      <td className="py-6 align-middle">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-6 pr-2 align-middle">
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(mapRechargeToInvoice(item))}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#FCF0ED] px-4 py-2.5 text-xs font-medium text-[#222222] transition-all hover:scale-[1.02] hover:bg-[#FCE6E1] active:scale-[0.98] dark:text-stone-100"
                        >
                          <Eye className="h-3.5 w-3.5" strokeWidth={1.8} />
                          <span>Invoice</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredRecharges.length > 0 ? (
          <div className="mt-8 flex select-none flex-col items-center justify-center gap-4 border-t border-neutral-100 pt-10 font-sans dark:border-neutral-800">
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={activePage === 1}
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white text-black shadow-[0_2px_6px_rgba(0,0,0,0.01)] transition-all hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-stone-100 dark:hover:bg-neutral-800 dark:disabled:hover:bg-neutral-900"
              >
                <ChevronLeft className="h-5 w-5 text-black dark:text-stone-100" strokeWidth={1.5} />
              </button>

              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].filter((page) => page <= totalPages).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={pageButtonClass(page)}
                  >
                    {page}
                  </button>
                ))}
                {totalPages > 5 ? (
                  <>
                    <span className="flex h-[44px] w-[44px] items-center justify-center text-sm font-normal text-neutral-400">
                      ...
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(totalPages)}
                      className={pageButtonClass(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={activePage === totalPages}
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white text-black shadow-[0_2px_6px_rgba(0,0,0,0.01)] transition-all hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-stone-100 dark:hover:bg-neutral-800 dark:disabled:hover:bg-neutral-900"
              >
                <ChevronRight className="h-5 w-5 text-black dark:text-stone-100" strokeWidth={1.5} />
              </button>
            </div>

            <div className="pt-1 text-sm font-normal tracking-tight text-neutral-800">
              {indexOfFirstItem + 1} – {Math.min(indexOfLastItem, filteredRecharges.length)} of{' '}
              {filteredRecharges.length} recharges
            </div>
          </div>
        ) : null}
      </div>

      {isModalOpen && !onCreateRecharge ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close recharge modal"
            onClick={() => setIsModalOpen(false)}
            className="animate-in fade-in absolute inset-0 bg-neutral-900/40 backdrop-blur-sm duration-300"
          />

          <div className="animate-in slide-in-from-bottom-2 relative z-10 w-full max-w-md space-y-6 rounded-2xl border border-neutral-100 bg-white p-6 shadow-2xl duration-300 md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3.5 dark:border-neutral-800">
              <h3 className="flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-stone-100">
                <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950/40">
                  <Wallet className="h-5 w-5 text-[#52C47F]" />
                </div>
                <span>New Recharge</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-black dark:hover:bg-neutral-800 dark:hover:text-stone-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Amount (NPR)
                </label>
                <div className="flex items-center rounded-xl border border-neutral-200 px-4 dark:border-neutral-700">
                  <span className="font-bold text-neutral-400">{CURRENCY_INPUT_PREFIX}</span>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="e.g. 500"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full border-0 bg-transparent py-3 pl-1.5 text-sm font-semibold text-neutral-800 outline-none focus:outline-none focus:ring-0 dark:text-stone-100"
                  />
                </div>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                  Value will format as {formatNPR(Number(newAmount || 0))}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Recharge Method
                </label>
                <select
                  value={newMethod}
                  onChange={(e) => setNewMethod(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-800 outline-none focus:ring-2 focus:ring-[#52C47F] dark:border-neutral-700 dark:bg-neutral-900 dark:text-stone-100"
                >
                  <option value="eSewa">eSewa</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Payment Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewStatus('Pending Orange')}
                    className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border p-3 text-center text-xs transition-all ${
                      newStatus === 'Pending Orange'
                        ? 'border-[#F2994A] bg-[#FFF6E9] font-bold text-[#F2994A]'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-stone-300 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-[#F2994A]" />
                    <span>Orange Pill</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStatus('Pending Blue')}
                    className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border p-3 text-center text-xs transition-all ${
                      newStatus === 'Pending Blue'
                        ? 'border-[#2F80ED] bg-[#F3F9FE] font-bold text-[#2F80ED]'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-stone-300 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-[#2F80ED]" />
                    <span>Blue Pill</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 cursor-pointer rounded-xl bg-neutral-100 py-3.5 text-center text-xs font-bold text-neutral-700 transition-all hover:bg-neutral-200 dark:bg-neutral-800 dark:text-stone-200 dark:hover:bg-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 cursor-pointer rounded-xl bg-neutral-900 py-3.5 text-center text-xs font-bold text-white transition-all hover:bg-neutral-800 dark:bg-stone-100 dark:text-neutral-900 dark:hover:bg-white"
                >
                  Confirm Recharge
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {selectedInvoice ? (
        <StatementReceiptModal
          statement={selectedInvoice.statement}
          direction={selectedInvoice.direction}
          labels={selectedInvoice.labels}
          onClose={() => setSelectedInvoice(null)}
        />
      ) : null}
    </div>
  );
}
