'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchAssignedListingTasks,
  mapTaskToProject,
} from '@/lib/dashboardListingApi';
import { useAuthStore } from '@/store';
import ProjectTable from './ProjectTable';
import type { Project } from './types';
import {
  DASHBOARD_CARD,
  DASHBOARD_HEADING,
  DASHBOARD_PAGE_ROOT,
  DASHBOARD_PAGINATION_ARROW,
  DASHBOARD_PAGINATION_INNER,
  DASHBOARD_PAGINATION_OUTER,
  DASHBOARD_SUBTABS_ROW,
  DASHBOARD_SUBTABS_WRAP,
  dashboardPageButtonClass,
  dashboardSubtabClass,
} from './dashboardResponsive';

type ProjectStatus = Project['status'];

const STATUS_TABS: ProjectStatus[] = ['Active', 'Pending', 'Ongoing', 'Completed', 'Canceled'];

export default function DashboardFreelancerProjects() {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<ProjectStatus>('Ongoing');
  const [currentPage, setCurrentPage] = useState(1);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    if (!isAuthenticated) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      const tasks = await fetchAssignedListingTasks('project');
      setProjects(tasks.map(mapTaskToProject));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load assigned projects';
      toast.error(message);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (pathname === '/dashboard/project') {
      void loadProjects();
    }
  }, [pathname, loadProjects, isAuthenticated]);

  const filteredProjects = useMemo(
    () => projects.filter((project) => project.status === activeSubTab),
    [projects, activeSubTab],
  );

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedProjects = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return filteredProjects.slice(start, start + itemsPerPage);
  }, [filteredProjects, activePage, itemsPerPage]);

  return (
    <div className={DASHBOARD_PAGE_ROOT}>
      <div className="mx-auto mb-6 flex max-w-7xl flex-col gap-5 pl-1 sm:mb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className={DASHBOARD_HEADING}>
            Projects
          </h1>
          <p className="mt-2 text-[15px] font-normal tracking-tight text-neutral-500">
            Projects assigned to you after your proposal was accepted.
          </p>
        </div>

        <Link
          href="/projects"
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-6 py-3.5 text-sm font-medium text-neutral-800 shadow-sm transition-all hover:bg-neutral-50 active:scale-[0.99] sm:w-auto sm:py-4 dark:border-neutral-800 dark:bg-neutral-900 dark:text-stone-100 dark:hover:bg-neutral-800"
        >
          Browse projects
        </Link>
      </div>

      <div className={DASHBOARD_CARD}>
        <div className={DASHBOARD_SUBTABS_WRAP}>
          <div className={DASHBOARD_SUBTABS_ROW}>
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveSubTab(tab);
                  setCurrentPage(1);
                }}
                className={dashboardSubtabClass(activeSubTab === tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-neutral-400">Loading assigned projects…</div>
        ) : (
          <ProjectTable
            projects={paginatedProjects}
            activeSubTab={activeSubTab}
            variant="assigned"
          />
        )}

        {!loading && filteredProjects.length > 0 ? (
          <div className={DASHBOARD_PAGINATION_OUTER}>
            <div className={DASHBOARD_PAGINATION_INNER}>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={activePage === 1}
                className={DASHBOARD_PAGINATION_ARROW}
              >
                <ChevronLeft className="h-5 w-5 text-black dark:text-stone-100" strokeWidth={1.5} />
              </button>

              <div className="flex shrink-0 items-center gap-1">
                {totalPages <= 6 ? (
                  Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={dashboardPageButtonClass(activePage === page)}
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
                        className={dashboardPageButtonClass(activePage === page)}
                      >
                        {page}
                      </button>
                    ))}
                    <span className="px-2 text-neutral-400">…</span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(totalPages)}
                      className={dashboardPageButtonClass(activePage === totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={activePage === totalPages}
                className={DASHBOARD_PAGINATION_ARROW}
              >
                <ChevronRight className="h-5 w-5 text-black dark:text-stone-100" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
