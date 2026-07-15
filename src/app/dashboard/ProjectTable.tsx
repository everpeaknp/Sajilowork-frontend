'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, FileText, Pencil, Trash2, ClipboardList, ExternalLink } from 'lucide-react';
import { getDashboardProjectDetailHref } from './dashboardTabs';
import type { Project } from './types';

function getProjectViewHref(project: Project): string | null {
  if (!project.taskSlug) return null;
  return getDashboardProjectDetailHref(project.taskSlug);
}

interface ProjectTableProps {
  projects: Project[];
  activeSubTab: string;
  onEdit?: (project: Project) => void;
  onDelete?: (id: string) => void;
  onAddClick?: () => void;
  variant?: 'manage' | 'assigned';
}

export default function ProjectTable({
  projects,
  activeSubTab,
  onEdit,
  onDelete,
  onAddClick,
  variant = 'manage',
}: ProjectTableProps) {
  const router = useRouter();
  const isAssigned = variant === 'assigned';

  const handleRowClick = (project: Project) => {
    const href = getProjectViewHref(project);
    if (href) router.push(href);
  };

  return (
    <div className="overflow-x-auto" id="projects-table-wrapper">
      <table className="w-full table-auto border-collapse text-left" id="projects-data-table">
        <thead>
          <tr className="border-b border-neutral-100 text-[15px] font-medium text-neutral-800 dark:border-neutral-800 dark:text-stone-100">
            <th className="w-[44%] pb-5 pl-2 pt-2 font-medium">Title</th>
            <th className="w-[18%] pb-5 pt-2 font-medium">Category</th>
            <th className="w-[16%] pb-5 pt-2 font-medium">Type/Cost</th>
            <th className="min-w-[10.5rem] w-[22%] pb-5 pt-2 text-center font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {projects.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-20 text-center">
                <div className="flex flex-col items-center justify-center space-y-2 text-neutral-400">
                  <ClipboardList className="h-10 w-10 text-neutral-300" strokeWidth={1.5} />
                  <p className="text-sm font-normal">
                    {isAssigned
                      ? `No assigned projects under ${activeSubTab}.`
                      : `No projects found under ${activeSubTab} Projects.`}
                  </p>
                  {isAssigned ? (
                    <Link
                      href="/projects"
                      className="cursor-pointer text-xs font-semibold text-[#52C47F] hover:underline"
                    >
                      Browse available projects
                    </Link>
                  ) : onAddClick ? (
                    <button
                      onClick={onAddClick}
                      type="button"
                      className="cursor-pointer text-xs font-semibold text-[#52C47F] hover:underline"
                    >
                      Post a new project campaign
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          ) : (
            projects.map((project) => {
              const viewHref = getProjectViewHref(project);
              return (
              <tr
                key={project.id}
                role={viewHref ? 'link' : undefined}
                tabIndex={viewHref ? 0 : undefined}
                onClick={() => handleRowClick(project)}
                onKeyDown={(event) => {
                  if (!viewHref) return;
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleRowClick(project);
                  }
                }}
                className={`transition-colors hover:bg-neutral-50/25 dark:hover:bg-neutral-800/50 ${
                  viewHref ? 'cursor-pointer select-none' : ''
                }`}
                id={`project-row-${project.id}`}
              >
                <td className="py-6 pl-2 align-top">
                  <div className="space-y-4">
                    {viewHref ? (
                      <Link
                        href={viewHref}
                        onClick={(event) => event.stopPropagation()}
                        className="text-[17px] font-semibold leading-snug tracking-tight text-neutral-900 transition-colors hover:text-[#52C47F] dark:text-stone-100"
                      >
                        {project.title}
                      </Link>
                    ) : (
                      <h4 className="text-[17px] font-semibold leading-snug tracking-tight text-neutral-900 dark:text-stone-100">
                        {project.title}
                      </h4>
                    )}

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-neutral-400">
                      <div className="flex items-center gap-1.5 font-normal">
                        <MapPin className="h-[18px] w-[18px] text-neutral-400" strokeWidth={1.8} />
                        <span>{project.location}</span>
                      </div>

                      <div className="flex items-center gap-1.5 font-normal">
                        <Calendar className="h-[18px] w-[18px] text-neutral-400" strokeWidth={1.8} />
                        <span>{project.postedTime}</span>
                      </div>

                      <div
                        className={`flex items-center gap-1.5 font-medium ${
                          isAssigned ? 'text-neutral-500' : 'text-emerald-500'
                        }`}
                      >
                        <FileText
                          className={`h-[18px] w-[18px] ${isAssigned ? 'text-neutral-400' : 'text-emerald-500'}`}
                          strokeWidth={1.8}
                        />
                        <span>{isAssigned ? project.status : `${project.receivedCount} Received`}</span>
                      </div>
                    </div>
                  </div>
                </td>

                <td className="py-6 align-middle text-[15px] font-normal text-neutral-600">{project.category}</td>

                <td className="py-6 align-middle text-[15px] font-medium text-neutral-800">{project.typeCost}</td>

                <td
                  className="whitespace-nowrap py-6 pr-2 text-center align-middle"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  {isAssigned && viewHref ? (
                    <Link
                      href={viewHref}
                      className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-[#ebf8f2] px-3.5 text-sm font-normal text-[#52C47F] transition-colors hover:bg-[#dff5ea] dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/60"
                    >
                      <span>View</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                    </Link>
                  ) : (
                    <div className="inline-flex flex-nowrap items-center justify-center gap-1.5">
                      {viewHref ? (
                        <Link
                          href={viewHref}
                          className="inline-flex h-9 shrink-0 items-center rounded-lg bg-[#FEF1EE] px-3 text-sm font-normal text-[#FF6B6B] transition-colors hover:bg-[#FCE2DC] dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
                        >
                          View
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        id={`project-edit-btn-${project.id}`}
                        onClick={() => onEdit?.(project)}
                        className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-transparent bg-[#FFF5F4] text-[#F87171] transition-all hover:bg-[#FEE2E2] hover:text-[#EF4444]"
                        title="Edit project details"
                      >
                        <Pencil className="h-4 w-4" strokeWidth={2.2} />
                      </button>

                      <button
                        type="button"
                        id={`project-delete-btn-${project.id}`}
                        onClick={() => onDelete?.(project.id)}
                        className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-transparent bg-[#FFF5F4] text-[#F87171] transition-all hover:bg-[#FEE2E2] hover:text-[#EF4444]"
                        title="Delete this project"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2.2} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
