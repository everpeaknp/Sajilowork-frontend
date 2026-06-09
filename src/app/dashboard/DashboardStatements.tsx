'use client';

import { useState, type FormEvent } from 'react';
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  TrendingUp,
  Wallet,
  Clock,
  CircleDollarSign,
  Download,
  Filter,
} from 'lucide-react';

interface Statement {
  id: string;
  date: string;
  type: string;
  detail: string;
  price: string;
  priceVal: number;
  amount: string;
}

function buildStatements(): Statement[] {
  const list: Statement[] = [
    {
      id: 'stmt-p1-1',
      date: 'April 15, 2023',
      type: 'Service Purchased',
      detail: 'API Redesign and GraphQL Setup for Client Workspace',
      price: '$1.400',
      priceVal: 1400,
      amount: '$1.400',
    },
    {
      id: 'stmt-p1-2',
      date: 'April 12, 2023',
      type: 'Service Purchased',
      detail: 'NextJS static build adjustments & LCP speed tweaks',
      price: '$600',
      priceVal: 600,
      amount: '$600',
    },
    {
      id: 'stmt-p1-3',
      date: 'April 10, 2023',
      type: 'Hourly Contract',
      detail: 'React dynamic maps and visual filters consulting hours',
      price: '$450',
      priceVal: 450,
      amount: '$450',
    },
    {
      id: 'stmt-p2-1',
      date: 'April 9, 2023',
      type: 'Service Purchased',
      detail: 'I will design website UI UX in adobe xd or figma',
      price: '$829',
      priceVal: 829,
      amount: '$829',
    },
    {
      id: 'stmt-p2-2',
      date: 'April 9, 2023',
      type: 'Service Purchased',
      detail: 'I will design website UI UX in adobe xd or figma',
      price: '$829',
      priceVal: 829,
      amount: '$829',
    },
    {
      id: 'stmt-p2-3',
      date: 'April 9, 2023',
      type: 'Service Purchased',
      detail: 'Tailwind CSS responsive code overhaul and theme support',
      price: '$829',
      priceVal: 829,
      amount: '$829',
    },
  ];

  const extraDetails = [
    'Custom authentication & security headers configuration',
    'Tailwind layout cleanups and dark mode template adjustments',
    'Marketing landing page illustrations template matching',
    'Stripe payment integration with multi-currency dynamic calculations',
    'Relational PostgreSQL schema setup and Drizzle migration script',
    'React query caching and pagination improvements',
    'Figma asset bundle sync instructions and vector assets',
  ];
  const types = ['Service Purchased', 'Hourly Contract', 'Milestone Released'];

  for (let i = 6; i < 60; i++) {
    const priceVal = 200 + ((i * 85) % 1500);
    const priceStr = `$${priceVal}`;

    list.push({
      id: `stmt-gen-${i}`,
      date: 'April 9, 2023',
      type: types[i % types.length],
      detail: extraDetails[i % extraDetails.length],
      price: priceStr,
      priceVal,
      amount: priceStr,
    });
  }

  return list;
}

export default function DashboardStatements() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [selectedStatement, setSelectedStatement] = useState<Statement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [currentPage, setCurrentPage] = useState(2);

  const [newDetail, setNewDetail] = useState('Figma Mobile Dashboard Design Prototyping');
  const [newPrice, setNewPrice] = useState('829');
  const [newType, setNewType] = useState('Service Purchased');

  const [statements, setStatements] = useState<Statement[]>(buildStatements);

  const totalNetIncome = statements.reduce((accum, st) => accum + st.priceVal, 0);

  const filteredStatements = statements.filter((st) => {
    const textMatch =
      st.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.price.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterType === 'All') return textMatch;
    return textMatch && st.type === filterType;
  });

  const itemsPerPage = 3;
  const totalPages = Math.max(1, Math.ceil(filteredStatements.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);

  const indexOfLastItem = activePage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStatements = filteredStatements.slice(indexOfFirstItem, indexOfLastItem);

  const pageButtonClass = (page: number) =>
    `flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-full text-sm font-normal transition-all ${
      activePage === page
        ? 'bg-[#52C47F] font-semibold text-white shadow-sm'
        : 'bg-transparent text-black hover:text-[#52C47F]'
    }`;

  const handleCreateStatementSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newDetail.trim() || !newPrice) return;

    const priceNum = Math.abs(parseInt(newPrice, 10)) || 829;
    const formattedPrice = `$${priceNum}`;

    const newStmt: Statement = {
      id: `stmt-user-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      type: newType,
      detail: newDetail,
      price: formattedPrice,
      priceVal: priceNum,
      amount: formattedPrice,
    };

    setStatements((prev) => [newStmt, ...prev]);
    setIsModalOpen(false);
    setCurrentPage(1);
    setSuccessMsg('Statement added successfully! Values updated.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="animate-in fade-in -mx-4 -my-6 min-h-screen select-none bg-[#f0efec] p-4 font-sans text-black duration-300 sm:-mx-6 sm:p-6 md:-mx-8 md:p-8">
      <div className="mx-auto mb-8 flex max-w-7xl flex-col gap-5 pl-1 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[34px] font-normal leading-none tracking-tight text-neutral-900">Statements</h1>
          <p className="mt-2 text-[15px] font-normal tracking-tight text-neutral-500">
            Lorem ipsum dolor sit amet, consectetur.
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-3 sm:flex-row md:w-auto">
          <div className="relative flex w-full items-center rounded-xl border border-neutral-200/80 bg-white px-3.5 shadow-sm sm:w-[260px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search Statements"
              className="w-full border-0 bg-transparent py-3 text-xs font-normal text-neutral-800 outline-none placeholder:text-neutral-400 focus:outline-none focus:ring-0"
            />
            <Search className="ml-1.5 h-4 w-4 shrink-0 text-neutral-400" strokeWidth={2} />
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#222222] px-5 py-3 text-xs font-medium text-white transition-all hover:bg-neutral-800 active:bg-black sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {successMsg ? (
        <div className="animate-in slide-in-from-bottom-2 mx-auto mb-6 flex max-w-7xl items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 shadow-sm duration-300">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span>{successMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMsg('')}
            className="rounded p-1 text-emerald-600 hover:bg-emerald-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      <div className="mx-auto mb-8 grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-neutral-200/50 bg-white p-6 transition-all duration-300 hover:shadow-sm">
          <div className="z-10 space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">Net Income</span>
            <h3 className="text-3xl font-semibold tracking-tight text-neutral-900">
              ${totalNetIncome >= 40000 ? (totalNetIncome / 1000).toFixed(3) : '1.928'}
            </h3>
            <p className="font-sans text-[12px] font-normal leading-tight text-[#52C47F]">
              $99 <span className="text-neutral-500">New Earning</span>
            </p>
          </div>
          <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#EBF9F1] text-[#27AE60]">
            <TrendingUp className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="absolute bottom-0 right-0 h-20 w-20 translate-x-4 translate-y-4 rounded-full bg-[#27AE60]/[0.01] transition-transform duration-300 group-hover:scale-[1.3]" />
        </div>

        <div className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-neutral-200/50 bg-white p-6 transition-all duration-300 hover:shadow-sm">
          <div className="z-10 space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">Withdrawn</span>
            <h3 className="text-3xl font-semibold tracking-tight text-neutral-900">$912</h3>
            <p className="text-[12px] font-normal leading-tight text-[#52C47F]">
              80+ <span className="text-neutral-500">New Completed</span>
            </p>
          </div>
          <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#FCF0ED] text-[#F2994A]">
            <Wallet className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="absolute bottom-0 right-0 h-20 w-20 translate-x-4 translate-y-4 rounded-full bg-[#F2994A]/[0.01] transition-transform duration-300 group-hover:scale-[1.3]" />
        </div>

        <div className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-neutral-200/50 bg-white p-6 transition-all duration-300 hover:shadow-sm">
          <div className="z-10 space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Pending Clearance
            </span>
            <h3 className="text-3xl font-semibold tracking-tight text-neutral-900">$820</h3>
            <p className="text-[12px] font-normal leading-tight text-[#52C47F]">
              35+ <span className="text-neutral-500">New Queue</span>
            </p>
          </div>
          <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#F3F9FE] text-[#2F80ED]">
            <Clock className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="absolute bottom-0 right-0 h-20 w-20 translate-x-4 translate-y-4 rounded-full bg-[#2F80ED]/[0.01] transition-transform duration-300 group-hover:scale-[1.3]" />
        </div>

        <div className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-neutral-200/50 bg-white p-6 transition-all duration-300 hover:shadow-sm">
          <div className="z-10 space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Available for Withdrawal
            </span>
            <h3 className="text-3xl font-semibold tracking-tight text-neutral-900">$8.000</h3>
            <p className="text-[12px] font-normal leading-tight text-[#52C47F]">
              290+ <span className="text-neutral-500">New Review</span>
            </p>
          </div>
          <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-[#193E32]">
            <CircleDollarSign className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="absolute bottom-0 right-0 h-20 w-20 translate-x-4 translate-y-4 rounded-full bg-emerald-500/[0.01] transition-transform duration-300 group-hover:scale-[1.3]" />
        </div>
      </div>

      <div className="mx-auto mb-5 flex max-w-7xl justify-end">
        <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs">
          <Filter className="h-3.5 w-3.5 text-neutral-400" />
          <span className="font-normal text-neutral-500">Type:</span>
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
            className="cursor-pointer border-none bg-transparent p-0 font-bold text-neutral-800 outline-none focus:outline-none focus:ring-0"
          >
            <option value="All">All Types</option>
            <option value="Service Purchased">Service Purchased</option>
            <option value="Hourly Contract">Hourly Contract</option>
            <option value="Milestone Released">Milestone Released</option>
          </select>
        </div>
      </div>

      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] md:p-8">
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse text-left">
            <thead>
              <tr className="border-b border-transparent text-sm font-medium text-neutral-800">
                <th className="w-[20%] pb-6 pt-2 font-medium">Date</th>
                <th className="w-[20%] pb-6 pt-2 font-medium">Type</th>
                <th className="w-[40%] pb-6 pt-2 font-medium">Detail</th>
                <th className="w-[10%] pb-6 pt-2 font-medium">Price</th>
                <th className="w-[10%] pb-6 pt-2 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {currentStatements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-sm font-normal text-neutral-400">
                    No matching statements discovered. Try another query or adjust category type.
                  </td>
                </tr>
              ) : (
                currentStatements.map((st) => (
                  <tr
                    key={st.id}
                    onClick={() => setSelectedStatement(st)}
                    className="group cursor-pointer transition-colors hover:bg-neutral-50/40"
                  >
                    <td className="py-6 pr-4 align-middle text-sm font-normal text-neutral-800">{st.date}</td>
                    <td className="py-6 pr-4 align-middle">
                      <span className="inline-flex rounded-lg bg-[#5E626A] px-4 py-2 text-xs font-semibold text-white transition-transform group-hover:scale-[1.02]">
                        {st.type}
                      </span>
                    </td>
                    <td className="break-words py-6 pr-4 align-middle text-sm font-normal leading-relaxed text-neutral-800 transition-colors hover:text-[#52C47F]">
                      {st.detail}
                    </td>
                    <td className="py-6 align-middle text-sm font-medium text-neutral-800">{st.price}</td>
                    <td className="py-6 align-middle text-sm font-bold text-neutral-900">{st.amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredStatements.length > 0 ? (
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
                {totalPages <= 6 ? (
                  Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={pageButtonClass(page)}
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
                        className={pageButtonClass(page)}
                      >
                        {page}
                      </button>
                    ))}
                    <span className="flex h-[44px] w-[44px] items-center justify-center text-sm font-normal text-neutral-400">
                      ...
                    </span>
                    <button type="button" onClick={() => setCurrentPage(20)} className={pageButtonClass(20)}>
                      20
                    </button>
                  </>
                )}
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
              1 – {totalPages === 20 ? 20 : totalPages} of 300+ property available
            </div>
          </div>
        ) : null}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close add transaction modal"
            onClick={() => setIsModalOpen(false)}
            className="animate-in fade-in absolute inset-0 bg-neutral-900/40 backdrop-blur-sm duration-300"
          />

          <div className="animate-in slide-in-from-bottom-2 relative z-10 w-full max-w-md space-y-6 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xl duration-300 md:p-8">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3.5">
              <h3 className="text-lg font-bold text-neutral-900">Register New Statement</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStatementSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                  Transaction Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#52C47F]"
                >
                  <option value="Service Purchased">Service Purchased</option>
                  <option value="Hourly Contract">Hourly Contract</option>
                  <option value="Milestone Released">Milestone Released</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                  Detailed Description
                </label>
                <textarea
                  required
                  rows={2}
                  value={newDetail}
                  onChange={(e) => setNewDetail(e.target.value)}
                  placeholder="e.g. Design website UI UX in Adobe XD or Figma"
                  className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[#52C47F]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                  Value / Pricing (USD)
                </label>
                <div className="flex items-center rounded-xl border border-neutral-200 px-4">
                  <span className="font-bold text-neutral-400">$</span>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="829"
                    className="w-full border-0 bg-transparent py-3 pl-1.5 text-sm font-semibold text-neutral-800 outline-none focus:ring-0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-neutral-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl bg-neutral-100 py-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-200"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#222222] py-3 text-xs font-semibold text-white hover:bg-black"
                >
                  Confirm Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {selectedStatement ? (
        <div className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center p-4 duration-300">
          <button
            type="button"
            aria-label="Close statement detail"
            onClick={() => setSelectedStatement(null)}
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
          />

          <div className="animate-in slide-in-from-bottom-2 relative z-10 w-full max-w-lg space-y-6 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xl duration-300 md:p-8">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#52C47F]" />
                <h3 className="text-base font-semibold text-neutral-900">Transaction Receipt Ledger</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStatement(null)}
                className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 rounded-xl border border-neutral-100 bg-[#fafafa]/50 p-6 text-xs text-neutral-700">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-black tracking-tight text-neutral-900">
                    freeio<span className="text-[#52C47F]">.</span>
                  </h4>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                    Statement Receipt
                  </p>
                </div>
                <div className="text-right">
                  <span className="block font-mono uppercase tracking-wider text-neutral-500">
                    Date Transaction
                  </span>
                  <span className="font-semibold text-neutral-900">{selectedStatement.date}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-y border-neutral-100 py-4 text-[11px]">
                <div>
                  <span className="mb-1 block font-bold uppercase tracking-wider text-neutral-400">
                    Payer Account
                  </span>
                  <span className="block text-xs font-bold text-neutral-800">Freeio Client LLC</span>
                  <span className="block text-neutral-400">Kathmandu, NP</span>
                </div>
                <div>
                  <span className="mb-1 block font-bold uppercase tracking-wider text-neutral-400">
                    Receiver Beneficiary
                  </span>
                  <span className="block text-xs font-bold text-neutral-800">Bishal Baniya</span>
                  <span className="block text-neutral-400">mr.bishal.baniya@gmail.com</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Service Purchased Narrative:
                </span>
                <div className="space-y-1 rounded-xl border border-neutral-200/50 bg-white p-4">
                  <div className="flex justify-between text-xs font-bold text-neutral-900">
                    <span>{selectedStatement.type}</span>
                    <span>{selectedStatement.price}</span>
                  </div>
                  <p className="select-all pt-1 text-[11px] font-normal leading-normal text-neutral-400">
                    {selectedStatement.detail}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-sm font-bold leading-none text-neutral-900">
                <span>Final Realized Amount:</span>
                <span className="text-base text-emerald-600">{selectedStatement.amount}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-100 py-3 text-xs font-semibold text-neutral-700 transition-all hover:bg-neutral-200 hover:text-black"
              >
                <span>Print Ledger</span>
              </button>
              <button
                type="button"
                onClick={() => alert('Statement Receipt PDF download initialized.')}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#222222] py-3 text-xs font-semibold text-white transition-all hover:bg-black"
              >
                <Download className="h-4 w-4 text-white" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
