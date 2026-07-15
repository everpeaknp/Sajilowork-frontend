'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { fetchMyListingTasks, mapTaskToDashboardTask } from '@/lib/dashboardListingApi';
import { taskService } from '@/services/task.service';
import { useAuthStore } from '@/store';
import { getDashboardCreateHref, getDashboardEditHref } from './dashboardTabs';
import TaskTable from './TaskTable';
import type { Project } from './types';
import DeleteConfirmModal from './DeleteConfirmModal';
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

type TaskStatus = Project['status'];

const STATUS_TABS: TaskStatus[] = ['Active', 'Pending', 'Ongoing', 'Completed', 'Canceled'];

export default function DashboardTasks() {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [tasks, setTasks] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<TaskStatus>('Active');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    if (!isAuthenticated) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      const rows = await fetchMyListingTasks('task');
      setTasks(rows.map(mapTaskToDashboardTask));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load tasks';
      toast.error(message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (pathname === '/dashboard/task') {
      void loadTasks();
    }
  }, [pathname, loadTasks, isAuthenticated]);

  const filteredTasks = useMemo(
    () => tasks.filter((task) => task.status === activeSubTab),
    [tasks, activeSubTab],
  );

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedTasks = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return filteredTasks.slice(start, start + itemsPerPage);
  }, [filteredTasks, activePage, itemsPerPage]);

  const openCreatePage = () => {
    router.push(getDashboardCreateHref('task'));
  };

  const openEditPage = (task: Project) => {
    if (!task.taskSlug) {
      toast.error('This task cannot be edited yet');
      return;
    }
    router.push(getDashboardEditHref('task', task.taskSlug));
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const slug = deleteTarget.taskSlug ?? deleteTarget.id;

    try {
      const response = await taskService.deleteTask(slug);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete task');
      }
      setTasks((prev) => prev.filter((task) => task.id !== deleteTarget.id));
      toast.success('Task deleted');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete task';
      toast.error(message);
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className={DASHBOARD_PAGE_ROOT}>
      <div className="mx-auto mb-6 flex max-w-7xl flex-col gap-5 pl-1 sm:mb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className={DASHBOARD_HEADING}>
            Manage Tasks
          </h1>
          <p className="mt-2 text-[15px] font-normal tracking-tight text-neutral-500">
            Post local tasks and review quotes from taskers.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreatePage}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#222222] px-6 py-3.5 text-sm font-medium text-white shadow-md transition-all hover:bg-neutral-800 active:scale-[0.99] sm:w-auto sm:py-4"
        >
          <Plus className="h-4 w-4" />
          <span>Post New Task</span>
        </button>
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
          <div className="py-20 text-center text-sm text-neutral-400">Loading tasks…</div>
        ) : (
          <TaskTable
            tasks={paginatedTasks}
            activeSubTab={activeSubTab}
            onEdit={openEditPage}
            onDelete={(id) => {
              const target = tasks.find((task) => task.id === id) ?? null;
              setDeleteTarget(target);
            }}
            onAddClick={openCreatePage}
          />
        )}

        {!loading && filteredTasks.length > 0 ? (
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
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={dashboardPageButtonClass(activePage === page)}
                  >
                    {page}
                  </button>
                ))}
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

      <DeleteConfirmModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
        title="Delete task?"
        description="This will permanently remove the task from your dashboard."
      />
    </div>
  );
}
