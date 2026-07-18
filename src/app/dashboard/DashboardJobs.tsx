'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Plus, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchMyListingTasks,
} from '@/lib/dashboardListingApi';
import { mapTaskToDashboardJob } from '@/lib/jobApi';
import { jobService } from '@/services/job.service';
import { useAuthStore } from '@/store';
import { getDashboardCreateHref, getDashboardEditHref } from './dashboardTabs';
import { matchesSearchQuery } from './dashboardListSearch';
import JobTable from './JobTable';
import type { Job } from './types';
import DeleteConfirmModal from './DeleteConfirmModal';
import {
  DASHBOARD_PAGE_ROOT,
  DASHBOARD_PAGINATION_ARROW,
  DASHBOARD_PAGINATION_INNER,
  DASHBOARD_PAGINATION_OUTER,
  DASHBOARD_SUBTABS_ROW,
  DASHBOARD_SUBTABS_WRAP,
  dashboardPageButtonClass,
  dashboardSubtabClass,
} from './dashboardResponsive';

type JobStatus = Job['status'];

const STATUS_TABS: JobStatus[] = ['Active', 'Pending', 'Draft', 'Closed', 'Expired'];

export default function DashboardJobs() {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<JobStatus>('Active');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Job | null>(null);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    if (!isAuthenticated) {
      setJobs([]);
      setLoading(false);
      return;
    }

    try {
      const tasks = await fetchMyListingTasks('job');
      setJobs(tasks.map(mapTaskToDashboardJob));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load jobs';
      const isRateLimited =
        (error as { status?: number })?.status === 429 ||
        message.toLowerCase().includes('throttled');
      toast.error(
        isRateLimited
          ? 'Too many requests — your jobs are still saved. Please wait a moment and refresh.'
          : message,
      );
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (pathname === '/dashboard/jobs') {
      void loadJobs();
    }
  }, [pathname, loadJobs, isAuthenticated]);

  const filteredJobs = useMemo(
    () =>
      jobs.filter(
        (job) =>
          job.status === activeSubTab &&
          matchesSearchQuery(searchQuery, job.title, job.company, job.applications, job.taskSlug),
      ),
    [jobs, activeSubTab, searchQuery],
  );

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedJobs = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return filteredJobs.slice(start, start + itemsPerPage);
  }, [filteredJobs, activePage, itemsPerPage]);

  const openCreatePage = () => {
    router.push(getDashboardCreateHref('jobs'));
  };

  const openEditPage = (job: Job) => {
    if (!job.taskSlug) {
      toast.error('This job cannot be edited yet');
      return;
    }
    router.push(getDashboardEditHref('jobs', job.taskSlug));
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const slug = deleteTarget.taskSlug ?? deleteTarget.id;

    try {
      const response = await jobService.deleteJob(slug);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete job');
      }
      setJobs((prev) => prev.filter((job) => job.id !== deleteTarget.id));
      toast.success('Job deleted');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete job';
      toast.error(message);
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className={`${DASHBOARD_PAGE_ROOT} relative flex min-h-[calc(100dvh-7.5rem)] flex-col sm:min-h-[calc(100dvh-8rem)] lg:min-h-[calc(100dvh-5.5rem)]`}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className={`${DASHBOARD_SUBTABS_WRAP} shrink-0 px-4 pt-4 sm:px-6 sm:pt-6 md:px-8`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div className={`${DASHBOARD_SUBTABS_ROW} min-w-0 flex-1 overflow-x-auto`}>
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

            <div className="relative mb-3 flex w-full shrink-0 items-center rounded-xl border border-neutral-200/80 bg-neutral-50 px-3 shadow-sm sm:mb-3.5 sm:w-[240px] md:w-[280px] dark:border-neutral-700 dark:bg-neutral-950 dark:shadow-none">
              <Search className="mr-2 h-4 w-4 shrink-0 text-neutral-400" strokeWidth={2} aria-hidden />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search jobs…"
                aria-label="Search jobs"
                className="w-full border-0 bg-transparent py-2.5 text-sm font-normal text-neutral-800 outline-none placeholder:text-neutral-400 focus:outline-none focus:ring-0 dark:bg-transparent dark:text-stone-100 dark:placeholder:text-neutral-500"
              />
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-auto px-4 pb-24 sm:px-6 md:px-8">
          {loading ? (
            <div className="flex flex-1 items-center justify-center py-16 text-center text-sm text-neutral-500">
              Loading jobs…
            </div>
          ) : (
            <JobTable
              jobs={paginatedJobs}
              activeSubTab={activeSubTab}
              searchQuery={searchQuery}
              onEdit={openEditPage}
              onDelete={(id) => setDeleteTarget(jobs.find((job) => job.id === id) ?? null)}
              onAddClick={openCreatePage}
            />
          )}

          {!loading && filteredJobs.length > 0 ? (
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
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center text-sm font-normal text-neutral-400 sm:h-[44px] sm:w-[44px]">
                        ...
                      </span>
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

              <div className="pt-1 text-sm font-normal tracking-tight text-neutral-800 dark:text-neutral-300">
                {filteredJobs.length} job{filteredJobs.length === 1 ? '' : 's'} in {activeSubTab}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={openCreatePage}
        className="fixed bottom-20 right-5 z-40 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg transition-all hover:scale-105 hover:bg-neutral-800 active:scale-95 md:bottom-8 md:right-8 dark:bg-stone-100 dark:text-neutral-900 dark:hover:bg-white"
        aria-label="Post new job"
        title="Post new job"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </button>

      <DeleteConfirmModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
