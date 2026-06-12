'use client';

import { useState, type FormEvent } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, X, CreditCard } from 'lucide-react';
import { CURRENCY_INPUT_PREFIX, formatNPR } from '@/lib/nepalLocale';

export type PayoutStatus = 'Pending Orange' | 'Pending Blue' | 'Approved' | 'Processing';

export interface Payout {
  id: string;
  amount: string;
  amountVal: number;
  date: string;
  payoutMethod: string;
  status: PayoutStatus;
}

function buildPayouts(): Payout[] {
  const list: Payout[] = [
    {
      id: 'payout-p1-1',
      amount: formatNPR(2400),
      amountVal: 2400,
      date: 'April 15, 2023',
      payoutMethod: 'Paypal',
      status: 'Approved',
    },
    {
      id: 'payout-p1-2',
      amount: formatNPR(1650),
      amountVal: 1650,
      date: 'April 11, 2023',
      payoutMethod: 'Bank Transfer',
      status: 'Pending Orange',
    },
    {
      id: 'payout-p1-3',
      amount: formatNPR(950),
      amountVal: 950,
      date: 'April 10, 2023',
      payoutMethod: 'Payoneer',
      status: 'Pending Blue',
    },
    {
      id: 'payout-p2-1',
      amount: formatNPR(1800),
      amountVal: 1800,
      date: 'April 9, 2023',
      payoutMethod: 'Paypal',
      status: 'Pending Orange',
    },
    {
      id: 'payout-p2-2',
      amount: formatNPR(1800),
      amountVal: 1800,
      date: 'April 9, 2023',
      payoutMethod: 'Payoneer',
      status: 'Pending Blue',
    },
    {
      id: 'payout-p2-3',
      amount: formatNPR(1800),
      amountVal: 1800,
      date: 'April 9, 2023',
      payoutMethod: 'Bank Transfer',
      status: 'Pending Blue',
    },
  ];

  const paymentMethods = ['Paypal', 'Payoneer', 'Bank Transfer'];

  for (let i = 6; i < 60; i++) {
    const isPendingOrange = i % 4 === 1;
    const isPendingBlue = i % 4 === 2;
    const computedStatus: PayoutStatus = isPendingOrange
      ? 'Pending Orange'
      : isPendingBlue
        ? 'Pending Blue'
        : 'Approved';

    list.push({
      id: `payout-gen-${i}`,
      amount: formatNPR(1500 + ((i * 120) % 2500)),
      amountVal: 1500 + ((i * 120) % 2500),
      date: 'April 9, 2023',
      payoutMethod: paymentMethods[i % paymentMethods.length],
      status: computedStatus,
    });
  }

  return list;
}

export function StatusBadge({ status }: { status: PayoutStatus }) {
  if (status === 'Pending Orange') {
    return (
      <span className="inline-flex rounded-xl border border-[#FFF6E9] bg-[#FFF6E9] px-6 py-2.5 text-xs font-normal text-[#F2994A] transition-all">
        Pending
      </span>
    );
  }
  if (status === 'Pending Blue') {
    return (
      <span className="inline-flex rounded-xl border border-[#F3F9FE] bg-[#F3F9FE] px-6 py-2.5 text-xs font-normal text-[#2F80ED] transition-all">
        Pending
      </span>
    );
  }
  if (status === 'Approved') {
    return (
      <span className="inline-flex rounded-xl border border-[#EBF9F1] bg-[#EBF9F1] px-6 py-2.5 text-xs font-normal text-[#27AE60]">
        Approved
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-xl bg-neutral-100 px-6 py-2.5 text-xs font-normal text-neutral-600">
      Processing
    </span>
  );
}

export interface DashboardPayoutsProps {
  embedded?: boolean;
  payouts?: Payout[];
  loading?: boolean;
  onCreatePayout?: () => void;
}

export default function DashboardPayouts({
  embedded = false,
  payouts: payoutsProp,
  loading = false,
  onCreatePayout,
}: DashboardPayoutsProps = {}) {
  const [localPayouts, setLocalPayouts] = useState<Payout[]>(buildPayouts);
  const payouts = payoutsProp ?? localPayouts;
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAmount, setNewAmount] = useState('1800');
  const [newMethod, setNewMethod] = useState('Paypal');
  const [newStatus, setNewStatus] = useState<'Pending Orange' | 'Pending Blue'>('Pending Orange');
  const [successNote, setSuccessNote] = useState<string | null>(null);

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(payouts.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);

  const indexOfLastItem = activePage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayouts = payouts.slice(indexOfFirstItem, indexOfLastItem);

  const pageButtonClass = (page: number) =>
    `flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-full text-sm transition-all ${
      activePage === page
        ? 'bg-[#52C47F] font-semibold text-white shadow-sm'
        : 'bg-transparent font-normal text-black hover:text-[#52C47F]'
    }`;

  const handleCreateClick = () => {
    if (onCreatePayout) {
      onCreatePayout();
      return;
    }
    setIsModalOpen(true);
  };

  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newAmount || Number.isNaN(Number(newAmount))) return;

    const parsedVal = Number(newAmount);
    const formattedAmount = formatNPR(parsedVal);

    const freshPayout: Payout = {
      id: `payout-user-${Date.now()}`,
      amount: formattedAmount,
      amountVal: parsedVal,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      payoutMethod: newMethod,
      status: newStatus,
    };

    setLocalPayouts((prev) => [freshPayout, ...prev]);
    setIsModalOpen(false);
    setCurrentPage(1);

    setSuccessNote(`Successfully initialized pending payouts of ${formattedAmount} via ${newMethod}!`);
    setTimeout(() => setSuccessNote(null), 4500);
  };

  const outerClass = embedded
    ? 'animate-in fade-in duration-300 font-sans text-black'
    : 'animate-in fade-in -mx-4 -my-6 min-h-screen bg-[#f0efec] p-4 font-sans text-black duration-300 sm:-mx-6 sm:p-6 md:-mx-8 md:p-8';

  return (
    <div className={outerClass}>
      <div className="mx-auto mb-8 flex max-w-7xl flex-col gap-5 pl-1 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[34px] font-normal leading-none tracking-tight text-neutral-900">Payouts</h1>
          <p className="mt-2 text-[15px] font-normal tracking-tight text-neutral-500">
            {embedded ? 'View payout history and request withdrawals.' : 'Lorem ipsum dolor sit amet, consectetur.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateClick}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#222222] px-6 py-4 text-sm font-medium text-white shadow-md transition-all hover:scale-[1.01] hover:bg-neutral-800 active:scale-[0.99]"
        >
          <span>Create Payout</span>
          <ArrowUpRight className="h-4 w-4 text-white" strokeWidth={2} />
        </button>
      </div>

      {successNote ? (
        <div className="animate-in slide-in-from-bottom-2 mx-auto mb-5 flex max-w-7xl items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-sm duration-300">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span>{successNote}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessNote(null)}
            className="rounded p-1 text-emerald-600 transition-all hover:bg-emerald-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-neutral-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] md:p-8">
        {loading ? (
          <div className="py-16 text-center text-sm text-neutral-500">Loading payouts…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse text-left">
              <thead>
                <tr className="border-b border-transparent text-sm font-medium text-neutral-800">
                  <th className="w-[25%] pb-6 pl-2 pt-2 font-medium">Amount</th>
                  <th className="w-[25%] pb-6 pt-2 font-medium">Date</th>
                  <th className="w-[25%] pb-6 pt-2 font-medium">Payout Method</th>
                  <th className="w-[25%] pb-6 pt-2 text-left font-medium">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {currentPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-sm text-neutral-500">
                      No payouts yet. Create your first payout to get started.
                    </td>
                  </tr>
                ) : (
                  currentPayouts.map((pay) => (
                    <tr key={pay.id} className="transition-colors hover:bg-neutral-50/20">
                      <td className="select-all py-6 pl-2 align-middle text-[15px] font-medium text-neutral-900">
                        {pay.amount}
                      </td>
                      <td className="py-6 align-middle text-sm font-normal text-neutral-500">{pay.date}</td>
                      <td className="py-6 align-middle text-sm font-normal text-neutral-800">{pay.payoutMethod}</td>
                      <td className="py-6 align-middle">
                        <StatusBadge status={pay.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && payouts.length > 0 ? (
          <div className="mt-8 flex select-none flex-col items-center justify-center gap-4 border-t border-neutral-100 pt-10 font-sans">
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={activePage === 1}
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white text-black shadow-[0_2px_6px_rgba(0,0,0,0.01)] transition-all hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
              >
                <ChevronLeft className="h-5 w-5 text-black" strokeWidth={1.5} />
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
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white text-black shadow-[0_2px_6px_rgba(0,0,0,0.01)] transition-all hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
              >
                <ChevronRight className="h-5 w-5 text-black" strokeWidth={1.5} />
              </button>
            </div>

            <div className="pt-1 text-sm font-normal tracking-tight text-neutral-800">
              {indexOfFirstItem + 1} – {Math.min(indexOfLastItem, payouts.length)} of {payouts.length} payouts
            </div>
          </div>
        ) : null}
      </div>

      {isModalOpen && !onCreatePayout ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close payout modal"
            onClick={() => setIsModalOpen(false)}
            className="animate-in fade-in absolute inset-0 bg-neutral-900/40 backdrop-blur-sm duration-300"
          />

          <div className="animate-in slide-in-from-bottom-2 relative z-10 w-full max-w-md space-y-6 rounded-2xl border border-neutral-100 bg-white p-6 shadow-2xl duration-300 md:p-8">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3.5">
              <h3 className="flex items-center gap-2 text-lg font-bold text-neutral-900">
                <div className="rounded-lg bg-emerald-50 p-2">
                  <CreditCard className="h-5 w-5 text-[#52C47F]" />
                </div>
                <span>Initialize Payout Ledger</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                  Amount (NPR)
                </label>
                <div className="flex items-center rounded-xl border border-neutral-200 px-4">
                  <span className="font-bold text-neutral-400">{CURRENCY_INPUT_PREFIX}</span>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="e.g. 1800"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full border-0 bg-transparent py-3 pl-1.5 text-sm font-semibold text-neutral-800 outline-none focus:outline-none focus:ring-0"
                  />
                </div>
                <p className="text-[11px] text-neutral-400">
                  Value will format as {formatNPR(Number(newAmount || 0))}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                  Payout Method
                </label>
                <select
                  value={newMethod}
                  onChange={(e) => setNewMethod(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-800 outline-none focus:ring-2 focus:ring-[#52C47F]"
                >
                  <option value="Paypal">Paypal</option>
                  <option value="Payoneer">Payoneer</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                  Payment Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewStatus('Pending Orange')}
                    className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border p-3 text-center text-xs transition-all ${
                      newStatus === 'Pending Orange'
                        ? 'border-[#F2994A] bg-[#FFF6E9] font-bold text-[#F2994A]'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
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
                        : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-[#2F80ED]" />
                    <span>Blue Pill</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-neutral-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 cursor-pointer rounded-xl bg-neutral-100 py-3.5 text-center text-xs font-bold text-neutral-700 transition-all hover:bg-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 cursor-pointer rounded-xl bg-[#222222] py-3.5 text-center text-xs font-bold text-white transition-all hover:bg-black"
                >
                  Confirm Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
