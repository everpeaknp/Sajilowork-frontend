'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchMyListingTasks,
} from '@/lib/dashboardListingApi';
import { mapTaskToDashboardJob } from '@/lib/jobApi';
import { jobService } from '@/services/job.service';
import { useAuthStore } from '@/store';
import { getDashboardCreateHref, getDashboardEditHref } from './dashboardTabs';
import JobTable from './JobTable';
import type { Job } from './types';
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
      toast.error(message);
      setJobs([]);
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
    () => jobs.filter((job) => job.status === activeSubTab),
    [jobs, activeSubTab],
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

  const subTabClass = (tab: JobStatus) =>
    `relative cursor-pointer pb-4 text-[15px] font-normal tracking-tight transition-all outline-none ${
      activeSubTab === tab
        ? 'font-medium text-black after:absolute after:bottom-0 after:left-0 after:h-[2.5px] after:w-full after:bg-black'
        : 'text-neutral-400 hover:text-neutral-900'
    }`;

  return (
    <div className={DASHBOARD_PAGE_ROOT}>
      <div className="mx-auto mb-6 flex max-w-7xl flex-col gap-5 pl-1 sm:mb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className={DASHBOARD_HEADING}>Manage Jobs</h1>
          <p className="mt-2 text-[15px] font-normal tracking-tight text-neutral-500">
            Lorem ipsum dolor sit amet, consectetur.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreatePage}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#222222] px-6 py-3.5 text-sm font-medium text-white shadow-md transition-all hover:bg-neutral-800 active:scale-[0.99] sm:w-auto sm:py-4"
        >
          <Plus className="h-4 w-4" />
          <span>Post New Job</span>
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
                className={subTabClass(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-neutral-500">Loading jobs…</div>
        ) : (
          <JobTable
            jobs={paginatedJobs}
            activeSubTab={activeSubTab}
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
                <ChevronLeft className="h-5 w-5 text-black" strokeWidth={1.5} />
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
                    <button type="button" onClick={() => setCurrentPage(totalPages)} className={dashboardPageButtonClass(activePage === totalPages)}>
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
                <ChevronRight className="h-5 w-5 text-black" strokeWidth={1.5} />
              </button>
            </div>

            <div className="pt-1 text-sm font-normal tracking-tight text-neutral-800">
              {filteredJobs.length} job{filteredJobs.length === 1 ? '' : 's'} in {activeSubTab}
            </div>
          </div>
        ) : null}
      </div>

      <DeleteConfirmModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
