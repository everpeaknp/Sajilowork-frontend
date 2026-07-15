'use client';

import { Pencil, Trash2, ClipboardList } from 'lucide-react';
import EmployerAvatarCircle from '@/components/employers/EmployerAvatarCircle';
import type { Job } from './types';

interface JobTableProps {
  jobs: Job[];
  activeSubTab: string;
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
  onAddClick: () => void;
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
          <tr className="border-b border-transparent text-[15px] font-medium text-neutral-800 dark:text-stone-100">
            <th className="w-[45%] pb-6 pl-2 pt-2 font-medium">Title</th>
            <th className="w-[20%] pb-6 pt-2 font-medium">Applications</th>
            <th className="w-[20%] pb-6 pt-2 font-medium">Created & Expired</th>
            <th className="w-[10%] pb-6 pt-2 font-medium">Status</th>
            <th className="w-[5%] pb-6 pt-2 text-center font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
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
                className="transition-colors hover:bg-neutral-50/20 dark:hover:bg-neutral-800/50"
                id={`job-row-${job.id}`}
              >
                <td className="select-all py-6 pl-2 align-top">
                  <div className="flex items-start gap-4">
                    <div className="relative mt-0.5 shrink-0">
                      <EmployerAvatarCircle
                        name={job.company}
                        avatarUrl={job.logoUrl}
                        avatarBg={job.logoColor}
                        sizeClass="h-[52px] w-[52px]"
                        textClass="text-base font-bold uppercase"
                      />
                      <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm dark:border-neutral-900" />
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="text-[17px] font-semibold leading-snug tracking-tight text-neutral-900 dark:text-stone-100">
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
