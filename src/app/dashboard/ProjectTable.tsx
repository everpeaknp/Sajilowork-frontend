'use client';

import { MapPin, Calendar, FileText, Pencil, Trash2, ClipboardList } from 'lucide-react';
import type { Project } from './types';

interface ProjectTableProps {
  projects: Project[];
  activeSubTab: string;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onAddClick: () => void;
}

export default function ProjectTable({
  projects,
  activeSubTab,
  onEdit,
  onDelete,
  onAddClick,
}: ProjectTableProps) {
  return (
    <div className="overflow-x-auto" id="projects-table-wrapper">
      <table className="w-full table-auto border-collapse text-left" id="projects-data-table">
        <thead>
          <tr className="border-b border-neutral-100 text-[15px] font-medium text-neutral-800">
            <th className="w-[50%] pb-5 pl-2 pt-2 font-medium">Title</th>
            <th className="w-[20%] pb-5 pt-2 font-medium">Category</th>
            <th className="w-[18%] pb-5 pt-2 font-medium">Type/Cost</th>
            <th className="w-[12%] pb-5 pt-2 text-center font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {projects.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-20 text-center">
                <div className="flex flex-col items-center justify-center space-y-2 text-neutral-400">
                  <ClipboardList className="h-10 w-10 text-neutral-300" strokeWidth={1.5} />
                  <p className="text-sm font-normal">No projects found under {activeSubTab} Projects.</p>
                  <button
                    onClick={onAddClick}
                    type="button"
                    className="cursor-pointer text-xs font-semibold text-[#52C47F] hover:underline"
                  >
                    Post a new project campaign
                  </button>
                </div>
              </td>
            </tr>
          ) : (
            projects.map((project) => (
              <tr
                key={project.id}
                className="transition-colors hover:bg-neutral-50/25"
                id={`project-row-${project.id}`}
              >
                <td className="select-all py-6 pl-2 align-top">
                  <div className="space-y-4">
                    <h4 className="cursor-pointer text-[17px] font-semibold leading-snug tracking-tight text-neutral-900 transition-colors hover:text-[#52C47F]">
                      {project.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-neutral-400">
                      <div className="flex items-center gap-1.5 font-normal">
                        <MapPin className="h-[18px] w-[18px] text-neutral-400" strokeWidth={1.8} />
                        <span>{project.location}</span>
                      </div>

                      <div className="flex items-center gap-1.5 font-normal">
                        <Calendar className="h-[18px] w-[18px] text-neutral-400" strokeWidth={1.8} />
                        <span>{project.postedTime}</span>
                      </div>

                      <div className="flex items-center gap-1.5 font-medium text-emerald-500">
                        <FileText className="h-[18px] w-[18px] text-emerald-500" strokeWidth={1.8} />
                        <span>{project.receivedCount} Received</span>
                      </div>
                    </div>
                  </div>
                </td>

                <td className="py-6 align-middle text-[15px] font-normal text-neutral-600">{project.category}</td>

                <td className="py-6 align-middle text-[15px] font-medium text-neutral-800">{project.typeCost}</td>

                <td className="py-6 pr-1 text-center align-middle">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      id={`project-edit-btn-${project.id}`}
                      onClick={() => onEdit(project)}
                      className="cursor-pointer rounded-xl border border-transparent bg-[#FFF5F4] p-2.5 text-[#F87171] transition-all hover:scale-[1.02] hover:bg-[#FEE2E2] hover:text-[#EF4444]"
                      title="Edit project details"
                    >
                      <Pencil className="h-[17px] w-[17px]" strokeWidth={2.2} />
                    </button>

                    <button
                      type="button"
                      id={`project-delete-btn-${project.id}`}
                      onClick={() => onDelete(project.id)}
                      className="cursor-pointer rounded-xl border border-transparent bg-[#FFF5F4] p-2.5 text-[#F87171] transition-all hover:scale-[1.02] hover:bg-[#FEE2E2] hover:text-[#EF4444]"
                      title="Delete this project"
                    >
                      <Trash2 className="h-[17px] w-[17px]" strokeWidth={2.2} />
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
