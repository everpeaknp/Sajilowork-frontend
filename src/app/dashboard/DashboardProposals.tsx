'use client';

import { useState, type FormEvent } from 'react';
import {
  FileText,
  Trash2,
  MapPin,
  Calendar,
  Pencil,
  ChevronLeft,
  ChevronRight,
  X,
  Briefcase,
} from 'lucide-react';

type ProposalIconType =
  | 'food'
  | 'swift'
  | 'react'
  | 'design'
  | 'node'
  | 'devops'
  | 'flutter'
  | 'nextjs'
  | 'python'
  | 'android'
  | 'vue'
  | 'rust'
  | 'shopify';

interface Proposal {
  id: number;
  title: string;
  location: string;
  date: string;
  received: string;
  costMin: string;
  costMax: string;
  rateType: string;
  avatarBg: string;
  iconType: ProposalIconType;
}

interface ProposalFormData {
  title: string;
  location: string;
  date: string;
  received: string;
  costMin: string;
  costMax: string;
  rateType: string;
}

const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: 1,
    title: 'Food Delivery Mobile App',
    location: 'London, UK',
    date: 'April 01, 2023',
    received: '1 Received',
    costMin: '100',
    costMax: '150',
    rateType: 'Hourly Rate',
    avatarBg: 'bg-[#4B43DF]',
    iconType: 'food',
  },
  {
    id: 2,
    title: 'Swift / SwiftUI Developer for B2B iOS apps',
    location: 'London, UK',
    date: 'April 01, 2023',
    received: '1 Received',
    costMin: '200',
    costMax: '250',
    rateType: 'Hourly Rate',
    avatarBg: 'bg-[#1F3E35]',
    iconType: 'swift',
  },
  {
    id: 3,
    title: 'React Native Senior Lead Engineer',
    location: 'Manchester, UK',
    date: 'April 10, 2023',
    received: '2 Received',
    costMin: '140',
    costMax: '190',
    rateType: 'Hourly Rate',
    avatarBg: 'bg-amber-600',
    iconType: 'react',
  },
  {
    id: 4,
    title: 'Creative Figma UI/UX Designer & Prototyper',
    location: 'London, UK',
    date: 'May 15, 2023',
    received: '5 Received',
    costMin: '75',
    costMax: '115',
    rateType: 'Hourly Rate',
    avatarBg: 'bg-rose-600',
    iconType: 'design',
  },
  {
    id: 5,
    title: 'Node.js API Architect with Postgres/Prisma',
    location: 'Remote',
    date: 'June 02, 2023',
    received: '3 Received',
    costMin: '110',
    costMax: '160',
    rateType: 'Hourly Rate',
    avatarBg: 'bg-teal-600',
    iconType: 'node',
  },
  {
    id: 6,
    title: 'Kubernetes DevOps Cloud Security Architect',
    location: 'Berlin, DE',
    date: 'June 05, 2023',
    received: '4 Received',
    costMin: '180',
    costMax: '240',
    rateType: 'Hourly Rate',
    avatarBg: 'bg-indigo-600',
    iconType: 'devops',
  },
  {
    id: 7,
    title: 'Flutter Cross-Platform Mobile Specialist',
    location: 'Paris, FR',
    date: 'June 08, 2023',
    received: '2 Received',
    costMin: '95',
    costMax: '130',
    rateType: 'Hourly Rate',
    avatarBg: 'bg-blue-600',
    iconType: 'flutter',
  },
  {
    id: 8,
    title: 'Next.js Full Stack Web Development Lead',
    location: 'London, UK',
    date: 'June 12, 2023',
    received: '6 Received',
    costMin: '120',
    costMax: '170',
    rateType: 'Hourly Rate',
    avatarBg: 'bg-purple-700',
    iconType: 'nextjs',
  },
  {
    id: 9,
    title: 'Python Django AI Backend Developer',
    location: 'Remote',
    date: 'June 15, 2023',
    received: '1 Received',
    costMin: '150',
    costMax: '210',
    rateType: 'Hourly Rate',
    avatarBg: 'bg-amber-700',
    iconType: 'python',
  },
  {
    id: 10,
    title: 'Android Kotlin Native Systems Engineer',
    location: 'Dublin, IE',
    date: 'June 18, 2023',
    received: '4 Received',
    costMin: '135',
    costMax: '185',
    rateType: 'Hourly Rate',
    avatarBg: 'bg-emerald-700',
    iconType: 'android',
  },
  {
    id: 11,
    title: 'Vue.js SaaS Dashboard UI/UX Designer',
    location: 'Stockholm, SE',
    date: 'June 20, 2023',
    received: '3 Received',
    costMin: '85',
    costMax: '125',
    rateType: 'Hourly Rate',
    avatarBg: 'bg-orange-600',
    iconType: 'vue',
  },
  {
    id: 12,
    title: 'Rust WebAssembly Cloud Systems Coder',
    location: 'Oslo, NO',
    date: 'June 25, 2023',
    received: '8 Received',
    costMin: '220',
    costMax: '290',
    rateType: 'Hourly Rate',
    avatarBg: 'bg-zinc-800',
    iconType: 'rust',
  },
  {
    id: 13,
    title: 'Shopify Custom Theme & Liquid Specialist',
    location: 'Toronto, CA',
    date: 'June 29, 2023',
    received: '2 Received',
    costMin: '90',
    costMax: '140',
    rateType: 'Hourly Rate',
    avatarBg: 'bg-green-600',
    iconType: 'shopify',
  },
];

function ProposalAvatar({ prop }: { prop: Proposal }) {
  return (
    <div className="relative flex h-14 w-14 shrink-0 select-none items-center justify-center overflow-visible rounded-full">
      <div className="absolute right-0.5 top-0.5 z-10 h-3 w-3 rounded-full border-2 border-white bg-[#42D187]" />

      {prop.iconType === 'food' ? (
        <div className={`flex h-full w-full items-center justify-center rounded-full ${prop.avatarBg}`}>
          <svg
            viewBox="0 0 40 40"
            className="h-8 w-8 fill-none stroke-current text-white"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <circle cx="20" cy="20" r="11" strokeWidth="2.5" />
            <path d="M14 20 A6 6 0 0 0 26 20" strokeWidth="2" />
            <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="24" cy="16" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        </div>
      ) : prop.iconType === 'swift' ? (
        <div className={`flex h-full w-full items-center justify-center rounded-full ${prop.avatarBg}`}>
          <svg
            viewBox="0 0 40 40"
            className="h-8 w-8 fill-none stroke-current text-[#8afcd6]"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 15 C12 11, 28 11, 28 15 C28 20, 12 20, 12 25 L28 25 M12 25 C12 29, 28 29, 28 25" />
            <line x1="16" y1="20" x2="24" y2="20" />
          </svg>
        </div>
      ) : (
        <div className={`flex h-full w-full items-center justify-center rounded-full ${prop.avatarBg}`}>
          <Briefcase className="h-5 w-5 text-white" strokeWidth={2} />
        </div>
      )}
    </div>
  );
}

export default function DashboardProposals() {
  const [proposalsList, setProposalsList] = useState<Proposal[]>(INITIAL_PROPOSALS);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const [editingProp, setEditingProp] = useState<Proposal | null>(null);
  const [formData, setFormData] = useState<ProposalFormData>({
    title: '',
    location: 'London, UK',
    date: 'April 01, 2023',
    received: '1 Received',
    costMin: '100',
    costMax: '150',
    rateType: 'Hourly Rate',
  });

  const totalPages = Math.ceil(proposalsList.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = proposalsList.slice(indexOfFirstItem, indexOfLastItem);

  const handleDeleteProposal = (id: number) => {
    const updated = proposalsList.filter((p) => p.id !== id);
    setProposalsList(updated);
    const newTotalPages = Math.ceil(updated.length / itemsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  };

  const handleEditClick = (prop: Proposal) => {
    setEditingProp(prop);
    setFormData({
      title: prop.title,
      location: prop.location,
      date: prop.date,
      received: prop.received,
      costMin: prop.costMin,
      costMax: prop.costMax,
      rateType: prop.rateType,
    });
  };

  const handleUpdateSave = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !editingProp) return;

    setProposalsList((prev) =>
      prev.map((p) =>
        p.id === editingProp.id
          ? {
              ...p,
              title: formData.title,
              location: formData.location,
              date: formData.date,
              received: formData.received,
              costMin: formData.costMin,
              costMax: formData.costMax,
              rateType: formData.rateType,
            }
          : p,
      ),
    );
    setEditingProp(null);
  };

  const pageButtonClass = (page: number) =>
    `flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-full border-0 text-sm font-normal outline-none transition-all focus-visible:ring-2 focus-visible:ring-[#52C47F]/30 ${
      currentPage === page
        ? 'bg-[#52C47F] text-white shadow-sm'
        : 'bg-transparent text-black hover:text-[#52C47F]'
    }`;

  return (
    <div className="animate-in fade-in -mx-4 -my-6 min-h-screen space-y-6 bg-[#f0efec] p-4 font-sans text-black duration-300 sm:-mx-6 sm:p-6 md:-mx-8 md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-sans text-3xl font-normal tracking-tight text-black">My Proposals</h2>
          <p className="mt-1.5 font-sans text-sm text-neutral-800">
            Lorem ipsum dolor sit amet, consectetur.
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] sm:p-8 md:p-10">
        <div className="grid grid-cols-12 gap-4 border-b border-neutral-100 pb-4 text-[13px] font-normal text-black select-none">
          <div className="col-span-12 md:col-span-7">Name</div>
          <div className="col-span-12 md:col-span-3">Cost / Delivery</div>
          <div className="col-span-12 text-right md:col-span-2">Action</div>
        </div>

        <div className="divide-y divide-neutral-100">
          {currentItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400">No proposals available.</div>
          ) : (
            currentItems.map((prop) => (
              <div key={prop.id} className="grid grid-cols-12 items-center gap-4 py-7">
                <div className="col-span-12 md:col-span-7">
                  <div className="flex items-center gap-4">
                    <ProposalAvatar prop={prop} />

                    <div className="min-w-0 flex-1 space-y-1.5 font-sans">
                      <h4 className="text-[15px] font-medium leading-snug tracking-tight text-black">
                        {prop.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-normal tracking-tight text-neutral-800">
                        <span className="flex items-center gap-1 text-neutral-800">
                          <MapPin strokeWidth={1.5} className="h-3.5 w-3.5 text-neutral-500" />
                          <span>{prop.location}</span>
                        </span>
                        <span className="font-normal text-neutral-300">|</span>
                        <span className="flex items-center gap-1 font-sans text-neutral-800">
                          <Calendar strokeWidth={1.5} className="h-3.5 w-3.5 text-neutral-500" />
                          <span>{prop.date}</span>
                        </span>
                        <span className="font-normal text-neutral-300">|</span>
                        <span className="flex items-center gap-1 text-neutral-800">
                          <FileText strokeWidth={1.5} className="h-3.5 w-3.5 text-neutral-500" />
                          <span>{prop.received}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-12 md:col-span-3">
                  <div className="flex items-center font-sans text-[15px] font-medium text-black">
                    <span>
                      ${prop.costMin} – ${prop.costMax}
                    </span>
                    <span className="ml-1.5 mt-0.5 text-xs font-normal leading-none text-neutral-500">
                      {prop.rateType}
                    </span>
                  </div>
                </div>

                <div className="col-span-12 md:col-span-2">
                  <div className="flex gap-2.5 md:justify-end">
                    <button
                      type="button"
                      onClick={() => handleEditClick(prop)}
                      className="shrink-0 cursor-pointer rounded-lg border-0 bg-[#FEF1EE] p-3 text-[#FF6B6B] outline-none transition-all hover:scale-105 hover:bg-[#FCE2DC] active:scale-95"
                      title="Edit Proposal"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProposal(prop.id)}
                      className="shrink-0 cursor-pointer rounded-lg border-0 bg-[#FEF1EE] p-3 text-[#FF6B6B] outline-none transition-all hover:scale-105 hover:bg-[#FCE2DC] active:scale-95"
                      title="Delete Proposal"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-8 flex select-none flex-col items-center justify-center gap-4 border-t border-neutral-100 pt-10 font-sans">
          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white text-black shadow-[0_2px_6px_rgba(0,0,0,0.01)] outline-none transition-all hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-[#52C47F]/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5 text-black" strokeWidth={1.5} />
            </button>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(Math.min(page, totalPages))}
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
                onClick={() => setCurrentPage(Math.min(20, totalPages))}
                className={pageButtonClass(20)}
              >
                20
              </button>
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white text-black shadow-[0_2px_6px_rgba(0,0,0,0.01)] outline-none transition-all hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-[#52C47F]/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
            >
              <ChevronRight className="h-5 w-5 text-black" strokeWidth={1.5} />
            </button>
          </div>

          <div className="pt-1 text-sm font-normal tracking-tight text-neutral-800">
            {indexOfFirstItem + 1} – {Math.min(indexOfLastItem, proposalsList.length)} of{' '}
            {proposalsList.length * 20}+ proposals available
          </div>
        </div>
      </div>

      {editingProp !== null ? (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close edit proposal"
            onClick={() => setEditingProp(null)}
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
          />

          <div className="animate-in fade-in relative z-10 w-full max-w-md space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl duration-300 md:p-8">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3.5">
              <h3 className="text-lg font-normal text-neutral-900">Edit Proposal</h3>
              <button
                type="button"
                onClick={() => setEditingProp(null)}
                className="cursor-pointer rounded p-1 text-neutral-400 hover:bg-neutral-50 hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-normal uppercase text-neutral-400">
                  Proposal Title / Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Food Delivery Mobile App"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 bg-white p-2.5 text-xs font-normal text-neutral-900 focus:outline-none focus:ring-1 focus:ring-[#193E32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-normal uppercase text-neutral-400">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. London, UK"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-200 bg-white p-2.5 text-xs font-normal text-neutral-900 focus:outline-none focus:ring-1 focus:ring-[#193E32]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-normal uppercase text-neutral-400">
                    Date Posted
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. April 01, 2023"
                    value={formData.date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-200 bg-white p-2.5 text-xs font-normal text-neutral-900 focus:outline-none focus:ring-1 focus:ring-[#193E32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-end gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-normal uppercase text-neutral-400">
                    Min ($)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.costMin}
                    onChange={(e) => setFormData((prev) => ({ ...prev, costMin: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-200 bg-white p-2.5 text-xs font-normal text-neutral-900 focus:outline-none focus:ring-1 focus:ring-[#193E32]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-normal uppercase text-neutral-400">
                    Max ($)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.costMax}
                    onChange={(e) => setFormData((prev) => ({ ...prev, costMax: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-200 bg-white p-2.5 text-xs font-normal text-neutral-900 focus:outline-none focus:ring-1 focus:ring-[#193E32]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-normal uppercase text-neutral-400">
                    Rate Type
                  </label>
                  <select
                    value={formData.rateType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, rateType: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-200 bg-white p-2.5 text-xs font-normal text-neutral-900 focus:outline-none focus:ring-1 focus:ring-[#193E32]"
                  >
                    <option value="Hourly Rate">Hourly Rate</option>
                    <option value="Fixed Price">Fixed Price</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 text-xs font-normal">
                <button
                  type="button"
                  onClick={() => setEditingProp(null)}
                  className="cursor-pointer rounded-lg bg-neutral-100 px-4 py-2 text-neutral-700 hover:bg-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer rounded-lg bg-[#193E32] px-[18px] py-2 text-white shadow-md hover:bg-[#1D4E3F]"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
