'use client';

import { useState } from 'react';
import { Search, Eye, X, Download, Printer, ChevronLeft, ChevronRight } from 'lucide-react';

type InvoiceStatus = 'In Progress' | 'In Progress Blue' | 'Paid' | 'Pending';

interface Invoice {
  id: string;
  invoiceNum: string;
  serviceName: string;
  purchaseDate: string;
  amount: string;
  amountVal: number;
  status: InvoiceStatus;
  contractor: string;
  notes: string;
}

function buildInvoices(): Invoice[] {
  const base: Invoice[] = [
    {
      id: 'inv-p1-1',
      invoiceNum: '#102',
      serviceName: 'NextJS React Speed Optimization',
      purchaseDate: 'May 2, 2023',
      amount: '$2.100',
      amountVal: 2100,
      status: 'In Progress',
      contractor: 'Kristin Watson',
      notes:
        'Lighthouse mobile optimization to 99% score and image serving pipeline modifications.',
    },
    {
      id: 'inv-p1-2',
      invoiceNum: '#101',
      serviceName: 'Figma Prototyping Services',
      purchaseDate: 'April 18, 2023',
      amount: '$850',
      amountVal: 850,
      status: 'Paid',
      contractor: 'Ali Tufan',
      notes: 'High-fidelity interactive prototype for customer analytics board.',
    },
    {
      id: 'inv-p1-3',
      invoiceNum: '#100',
      serviceName: 'API Gateway Redesign',
      purchaseDate: 'April 12, 2023',
      amount: '$1.500',
      amountVal: 1500,
      status: 'Paid',
      contractor: 'Leslie Alexander',
      notes: 'Security patch application, auth flow setup, and rate limiter installation.',
    },
    {
      id: 'inv-p2-1',
      invoiceNum: '#99',
      serviceName: 'App Services',
      purchaseDate: 'April 9, 2023',
      amount: '$1.200',
      amountVal: 1200,
      status: 'In Progress',
      contractor: 'Albert Flores',
      notes: 'Full stack deployment updates for Apple Store submissions & responsive testing.',
    },
    {
      id: 'inv-p2-2',
      invoiceNum: '#99',
      serviceName: 'App Services',
      purchaseDate: 'April 9, 2023',
      amount: '$1.200',
      amountVal: 1200,
      status: 'In Progress Blue',
      contractor: 'Darlene Robertson',
      notes: 'Staging sandbox compiler integrations and layout verification scripts.',
    },
    {
      id: 'inv-p2-3',
      invoiceNum: '#99',
      serviceName: 'App Services',
      purchaseDate: 'April 9, 2023',
      amount: '$1.200',
      amountVal: 1200,
      status: 'In Progress Blue',
      contractor: 'Jane Cooper',
      notes: 'Figma design system syncing & asset bundle optimizations.',
    },
  ];

  const contractors = [
    'Arlene McCoy',
    'Wanda Runo',
    'Cody Fisher',
    'Devon Lane',
    'Eleanor Pena',
    'Guy Hawkins',
    'Harriet Morrison',
    'Jenny Wilson',
  ];
  const services = [
    'Database Optimization',
    'Stripe Checkout Setup',
    'Tailwind CSS Cleanup',
    'AWS S3 Media Bucket Configuration',
    'Type Safe Middleware Upgrade',
    'Intercom Live Chat Plugin',
    'Micro-animations with Framer Motion',
    'PostgreSQL schema validation',
  ];
  const statuses: InvoiceStatus[] = ['Paid', 'In Progress', 'In Progress Blue', 'Pending'];

  for (let i = 6; i < 60; i++) {
    const invNum = 99 - Math.floor(i / 3);
    const priceVal = 600 + ((i * 75) % 1800);
    const priceStr = `$${(priceVal / 1000).toFixed(3)}`;

    base.push({
      id: `inv-gen-${i}`,
      invoiceNum: `#${invNum}`,
      serviceName: services[i % services.length],
      purchaseDate: 'April 9, 2023',
      amount: priceStr,
      amountVal: priceVal,
      status: statuses[i % statuses.length],
      contractor: contractors[i % contractors.length],
      notes: `Milestone deliverables accomplished with verified design specifications for audit ID #${i}.`,
    });
  }

  return base;
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  if (status === 'In Progress') {
    return (
      <span className="inline-flex rounded-xl border border-[#FFF6E9] bg-[#FFF6E9] px-5 py-2.5 text-xs font-normal text-[#F2994A]">
        In Progress
      </span>
    );
  }
  if (status === 'In Progress Blue') {
    return (
      <span className="inline-flex rounded-xl border border-[#F3F9FE] bg-[#F3F9FE] px-5 py-2.5 text-xs font-normal text-[#2F80ED]">
        In Progress
      </span>
    );
  }
  if (status === 'Paid') {
    return (
      <span className="inline-flex rounded-xl border border-[#EBF9F1] bg-[#EBF9F1] px-5 py-2.5 text-xs font-normal text-[#27AE60]">
        Paid
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-xl bg-neutral-100 px-5 py-2.5 text-xs font-normal text-neutral-500">
      Pending
    </span>
  );
}

export default function DashboardInvoice() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [currentPage, setCurrentPage] = useState(2);
  const [invoices] = useState<Invoice[]>(buildInvoices);

  const filteredInvoices = invoices.filter((inv) => {
    const query = searchQuery.toLowerCase();
    return (
      inv.serviceName.toLowerCase().includes(query) ||
      inv.invoiceNum.toLowerCase().includes(query) ||
      inv.purchaseDate.toLowerCase().includes(query) ||
      inv.contractor.toLowerCase().includes(query) ||
      inv.amount.toLowerCase().includes(query)
    );
  });

  const itemsPerPage = 3;
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage) || 1;
  const activePage = Math.min(currentPage, totalPages);

  const indexOfLastItem = activePage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);

  const pageButtonClass = (page: number) =>
    `flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-full text-sm font-normal transition-all ${
      activePage === page
        ? 'bg-[#52C47F] font-semibold text-white shadow-sm'
        : 'bg-transparent text-black hover:text-[#52C47F]'
    }`;

  return (
    <div className="animate-in fade-in -mx-4 -my-6 min-h-screen select-none bg-[#f0efec] p-4 font-sans text-black duration-300 sm:-mx-6 sm:p-6 md:-mx-8 md:p-8">
      <div className="mx-auto mb-8 flex max-w-7xl flex-col gap-5 pl-1 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-sans text-[34px] font-normal leading-none tracking-tight text-neutral-900">
            Invoice
          </h1>
          <p className="mt-2 text-[15px] font-normal tracking-tight text-neutral-500">
            Lorem ipsum dolor sit amet, consectetur.
          </p>
        </div>

        <div className="relative flex w-full items-center rounded-xl border border-neutral-100 bg-white px-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] md:w-[320px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search Invoice"
            className="w-full border-0 bg-transparent py-3 text-sm font-normal text-neutral-800 outline-none placeholder:text-neutral-400 focus:outline-none focus:ring-0"
          />
          <Search className="ml-2 h-4 w-4 shrink-0 text-neutral-800" strokeWidth={1.8} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-neutral-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] md:p-8">
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse text-left">
            <thead>
              <tr className="border-b border-transparent text-sm font-medium text-neutral-800">
                <th className="w-[30%] pb-6 pt-2 font-medium">Invoice ID</th>
                <th className="w-[25%] pb-6 pt-2 font-medium">Purchase Date</th>
                <th className="w-[15%] pb-6 pt-2 font-medium">Amount</th>
                <th className="w-[15%] pb-6 pt-2 font-medium">Payment Status</th>
                <th className="w-[15%] pb-6 pt-2 pr-4 text-left font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {currentInvoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-sm font-normal text-neutral-400">
                    No matching invoices found. Try a different search query.
                  </td>
                </tr>
              ) : (
                currentInvoices.map((inv) => (
                  <tr key={inv.id} className="transition-colors hover:bg-neutral-50/30">
                    <td className="py-6 pr-4 align-middle">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-normal text-neutral-900">{inv.invoiceNum}</span>
                        <span className="text-sm font-medium text-neutral-900">{inv.serviceName}</span>
                      </div>
                    </td>
                    <td className="py-6 align-middle text-sm font-normal text-neutral-500">
                      {inv.purchaseDate}
                    </td>
                    <td className="py-6 align-middle text-sm font-medium text-neutral-900">{inv.amount}</td>
                    <td className="py-6 align-middle">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="py-6 align-middle">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoice(inv)}
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

        {filteredInvoices.length > 0 ? (
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
                    <span className="pointer-events-none flex h-[44px] w-[44px] select-none items-center justify-center text-sm font-normal text-neutral-400">
                      ...
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(20)}
                      className={pageButtonClass(20)}
                    >
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

      {selectedInvoice ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close invoice modal"
            onClick={() => setSelectedInvoice(null)}
            className="animate-in fade-in absolute inset-0 bg-neutral-900/40 backdrop-blur-sm duration-300"
          />

          <div className="animate-in slide-in-from-bottom-2 relative z-10 w-full max-w-lg space-y-6 rounded-2xl border border-neutral-100 bg-white p-6 shadow-2xl duration-300 md:p-8">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#52C47F]" />
                <h3 className="font-sans text-base font-medium text-neutral-900">
                  Billing Receipt Ledger {selectedInvoice.invoiceNum}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="cursor-pointer rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 rounded-2xl border border-neutral-100 bg-[#fafafa]/50 p-5 text-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xl font-bold tracking-tight text-neutral-900">
                    freeio<span className="text-[#52C47F]">.</span>
                  </h4>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                    Invoice Receipt
                  </p>
                </div>
                <div className="text-right">
                  <h5 className="font-mono font-bold text-[#222222]">{selectedInvoice.invoiceNum}</h5>
                  <span className="text-xs text-neutral-400">{selectedInvoice.purchaseDate}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-neutral-100 pt-4 text-[11px] leading-relaxed">
                <div>
                  <span className="mb-1 block font-bold text-neutral-400">PREPARED BY:</span>
                  <strong className="block text-xs text-neutral-800">{selectedInvoice.contractor}</strong>
                  <span className="block text-neutral-400">Verified Contractor</span>
                  <span className="block text-neutral-400">Europe & ME Service Group</span>
                </div>
                <div>
                  <span className="mb-1 block font-bold text-neutral-400">BILL TO CLIENT:</span>
                  <strong className="block text-xs text-neutral-800">Bishal Baniya</strong>
                  <span className="block text-neutral-400">Kathmandu, Nepal</span>
                  <span className="block text-neutral-400">mr.bishal.baniya@gmail.com</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-neutral-100 pt-4">
                <span className="block text-[10px] font-bold text-neutral-400">SERVICE DELIVERABLES:</span>
                <div className="space-y-1 rounded-xl border border-neutral-100 bg-white p-4">
                  <div className="flex justify-between text-xs font-medium text-neutral-900">
                    <span>{selectedInvoice.serviceName}</span>
                    <span>{selectedInvoice.amount}</span>
                  </div>
                  <p className="break-words pt-1 text-[11px] font-normal leading-normal text-neutral-400">
                    {selectedInvoice.notes}
                  </p>
                </div>
              </div>

              <div className="space-y-2 border-t border-neutral-100 pt-4 font-sans text-[11px] font-medium text-neutral-500">
                <div className="flex items-center justify-between">
                  <span>Deliverables Subtotal:</span>
                  <span className="font-mono text-neutral-800">{selectedInvoice.amount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Marketplace Platform VAT (Paid):</span>
                  <span className="font-mono text-neutral-800">$0.00</span>
                </div>
                <div className="flex items-center justify-between border-t border-neutral-100 pt-3 text-sm font-bold text-neutral-900">
                  <span>Grand Paid Total:</span>
                  <span className="font-mono text-base text-[#27AE60]">{selectedInvoice.amount}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-neutral-100 py-3 text-xs font-semibold text-neutral-700 transition-all hover:bg-neutral-200 hover:text-black"
              >
                <Printer className="h-4 w-4" />
                <span>Print Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => alert('Invoice PDF download initiated.')}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#52C47F] py-3 text-xs font-semibold text-white shadow-lg shadow-[#52C47F]/10 transition-all hover:bg-[#43B26F]"
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
