'use client';

import { Pencil, Trash2, ClipboardList } from 'lucide-react';
import type { Job } from './types';

interface JobTableProps {
  jobs: Job[];
  activeSubTab: string;
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
  onAddClick: () => void;
}

function JobLogo({ logoInitial }: { logoInitial: string }) {
  if (logoInitial === 'mc') {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current text-emerald-400" strokeWidth={0}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
      </svg>
    );
  }
  if (logoInitial === 'in') {
    return <span className="font-sans text-lg font-bold lowercase leading-none tracking-tighter">in</span>;
  }
  if (logoInitial === 'ad') {
    return <span className="font-sans text-lg font-bold uppercase leading-none tracking-tighter">A</span>;
  }
  return (
    <span className="font-sans text-lg font-semibold uppercase leading-none tracking-normal">
      {logoInitial.slice(0, 2)}
    </span>
  );
}

function statusBadgeClass(status: Job['status']) {
  if (status === 'Active') {
    return 'bg-[#F0F8FF] text-[#0080FF] hover:bg-[#E1F0FF]';
  }
  if (status === 'Pending') {
    return 'bg-[#FFF6E9] text-[#F2994A] hover:bg-[#FFF0DB]';
  }
  if (status === 'Draft') {
    return 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200';
  }
  if (status === 'Closed') {
    return 'bg-[#EBF9F1] text-[#27AE60] hover:bg-[#E0F5EA]';
  }
  return 'bg-[#FFF5F5] text-[#EB5757] hover:bg-[#FEEAEA]';
}

export default function JobTable({ jobs, activeSubTab, onEdit, onDelete, onAddClick }: JobTableProps) {
  return (
    <div className="overflow-x-auto" id="jobs-table-wrapper">
      <table className="w-full table-auto border-collapse text-left" id="jobs-data-table">
        <thead>
          <tr className="border-b border-transparent text-[15px] font-medium text-neutral-800">
            <th className="w-[45%] pb-6 pl-2 pt-2 font-medium">Title</th>
            <th className="w-[20%] pb-6 pt-2 font-medium">Applications</th>
            <th className="w-[20%] pb-6 pt-2 font-medium">Created & Expired</th>
            <th className="w-[10%] pb-6 pt-2 font-medium">Status</th>
            <th className="w-[5%] pb-6 pt-2 text-center font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {jobs.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-20 text-center">
                <div className="flex flex-col items-center justify-center space-y-2 text-neutral-400">
                  <ClipboardList className="h-10 w-10 text-neutral-300" strokeWidth={1.5} />
                  <p className="text-sm font-normal">No job postings found under {activeSubTab} Jobs.</p>
                  <button
                    onClick={onAddClick}
                    type="button"
                    className="cursor-pointer text-xs font-semibold text-[#52C47F] hover:underline"
                  >
                    Post a new matching job campaign
                  </button>
                </div>
              </td>
            </tr>
          ) : (
            jobs.map((job) => (
              <tr
                key={job.id}
                className="transition-colors hover:bg-neutral-50/20"
                id={`job-row-${job.id}`}
              >
                <td className="select-all py-6 pl-2 align-top">
                  <div className="flex items-start gap-4">
                    <div className="relative mt-0.5 shrink-0">
                      <div
                        className={`flex h-[52px] w-[52px] items-center justify-center rounded-full ${job.logoColor} text-base font-bold text-white shadow-inner`}
                      >
                        <JobLogo logoInitial={job.logoInitial} />
                      </div>
                      <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="text-[17px] font-semibold leading-snug tracking-tight text-neutral-900">
                        {job.title}
                      </h4>
                      <div className="text-[15px] font-medium tracking-tight text-[#52C47F]">{job.company}</div>
                    </div>
                  </div>
                </td>

                <td className="py-6 align-middle text-[15px] font-medium text-neutral-800">{job.applications}</td>

                <td className="py-6 align-middle">
                  <div className="flex flex-col">
                    <span className="text-[15px] font-medium leading-relaxed text-neutral-800">
                      {job.createdDate}
                    </span>
                    <span className="text-[14px] font-normal text-neutral-400">{job.expiredDate}</span>
                  </div>
                </td>

                <td className="py-6 align-middle">
                  <span
                    className={`inline-flex cursor-pointer select-none rounded-lg px-[15px] py-[6px] text-sm font-medium transition-colors ${statusBadgeClass(job.status)}`}
                  >
                    {job.status}
                  </span>
                </td>

                <td className="py-6 pr-1 text-center align-middle">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      id={`job-edit-btn-${job.id}`}
                      onClick={() => onEdit(job)}
                      className="cursor-pointer rounded-xl border border-transparent bg-[#FFF5F4] p-[10px] text-[#F87171] transition-all hover:scale-[1.02] hover:bg-[#FEE2E2] hover:text-[#EF4444]"
                      title="Edit this job posting"
                    >
                      <Pencil className="h-[18px] w-[18px]" strokeWidth={2.2} />
                    </button>

                    <button
                      type="button"
                      id={`job-delete-btn-${job.id}`}
                      onClick={() => onDelete(job.id)}
                      className="cursor-pointer rounded-xl border border-transparent bg-[#FFF5F4] p-[10px] text-[#F87171] transition-all hover:scale-[1.02] hover:bg-[#FEE2E2] hover:text-[#EF4444]"
                      title="Delete this job campaign"
                    >
                      <Trash2 className="h-[18px] w-[18px]" strokeWidth={2.2} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
