'use client';

import { Pencil, Trash2, ClipboardList } from 'lucide-react';
import { DEFAULT_SERVICE_IMAGE } from '@/lib/dashboardListingApi';
import type { Service } from './types';

interface ServiceTableProps {
  services: Service[];
  activeSubTab: string;
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
  onAddClick: () => void;
}

export default function ServiceTable({
  services,
  activeSubTab,
  onEdit,
  onDelete,
  onAddClick,
}: ServiceTableProps) {
  return (
    <div className="overflow-x-auto" id="services-table-wrapper">
      <table className="w-full table-auto border-collapse text-left" id="services-data-table">
        <thead>
          <tr className="border-b border-transparent text-sm font-medium text-neutral-800">
            <th className="w-[55%] pb-6 pl-2 pt-2 font-medium">Title</th>
            <th className="w-[20%] pb-6 pt-2 font-medium">Category</th>
            <th className="w-[15%] pb-6 pt-2 font-medium">Type/Cost</th>
            <th className="w-[10%] pb-6 pt-2 text-center font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {services.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-20 text-center">
                <div className="flex flex-col items-center justify-center space-y-2 text-neutral-400">
                  <ClipboardList className="h-10 w-10 text-neutral-300" strokeWidth={1.5} />
                  <p className="text-sm font-normal">
                    No services registered under {activeSubTab} Services category.
                  </p>
                  <button
                    onClick={onAddClick}
                    type="button"
                    className="cursor-pointer text-xs font-semibold text-[#52C47F] hover:underline"
                  >
                    Create high-converting gig now
                  </button>
                </div>
              </td>
            </tr>
          ) : (
            services.map((svc) => (
              <tr
                key={svc.id}
                className="transition-colors hover:bg-neutral-50/20"
                id={`service-row-${svc.id}`}
              >
                <td className="select-all py-6 pl-2 align-top">
                  <div className="flex flex-col items-start gap-5 sm:flex-row">
                    <div className="h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-100 shadow-inner">
                      <img
                        src={svc.image || DEFAULT_SERVICE_IMAGE}
                        alt=""
                        role="presentation"
                        className="h-full w-full select-none object-cover"
                        onError={(event) => {
                          const img = event.currentTarget;
                          if (img.dataset.fallbackApplied === 'true') return;
                          img.dataset.fallbackApplied = 'true';
                          img.src = DEFAULT_SERVICE_IMAGE;
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-[15px] font-medium leading-snug tracking-tight text-neutral-900">
                        {svc.title}
                      </h4>
                      {svc.bullets.length > 0 ? (
                        <ul className="space-y-1 pl-1">
                          {svc.bullets.map((bullet, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-2 text-xs font-normal text-neutral-500"
                            >
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#52C47F]" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                </td>

                <td className="py-6 pt-[26px] align-top text-sm font-normal text-neutral-500">
                  {svc.category}
                </td>

                <td className="py-6 pt-[26px] align-top text-sm font-normal text-neutral-800">
                  {svc.typeCost}
                </td>

                <td className="py-6 pt-5 text-center align-top">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      id={`edit-btn-${svc.id}`}
                      onClick={() => onEdit(svc)}
                      className="cursor-pointer rounded-xl border border-transparent bg-[#FFF5F4] p-2.5 text-[#F87171] transition-all hover:scale-[1.02] hover:bg-[#FEE2E2] hover:text-[#EF4444]"
                      title="Edit this service parameters"
                    >
                      <Pencil className="h-4 w-4" strokeWidth={2} />
                    </button>

                    <button
                      type="button"
                      id={`delete-btn-${svc.id}`}
                      onClick={() => onDelete(svc.id)}
                      className="cursor-pointer rounded-xl border border-transparent bg-[#FFF5F4] p-2.5 text-[#F87171] transition-all hover:scale-[1.02] hover:bg-[#FEE2E2] hover:text-[#EF4444]"
                      title="Delete this service record"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={2} />
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
