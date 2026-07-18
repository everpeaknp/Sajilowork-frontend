'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Plus, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchMyListingTasks,
  mapTaskToService,
} from '@/lib/dashboardListingApi';
import { taskService } from '@/services/task.service';
import { useAuthStore } from '@/store';
import { getDashboardCreateHref, getDashboardEditHref } from './dashboardTabs';
import { matchesSearchQuery } from './dashboardListSearch';
import ServiceTable from './ServiceTable';
import type { Service } from './types';
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

type ServiceStatus = Service['status'];

const STATUS_TABS: ServiceStatus[] = ['Active', 'Pending', 'Ongoing', 'Completed', 'Canceled'];

export default function DashboardServices() {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<ServiceStatus>('Active');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);

  const loadServices = useCallback(async () => {
    setLoading(true);
    if (!isAuthenticated) {
      setServices([]);
      setLoading(false);
      return;
    }

    try {
      const tasks = await fetchMyListingTasks('service');
      setServices(tasks.map(mapTaskToService));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load services';
      toast.error(message);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (pathname === '/dashboard/services') {
      void loadServices();
    }
  }, [pathname, loadServices, isAuthenticated]);

  const filteredServices = useMemo(
    () =>
      services.filter(
        (svc) =>
          svc.status === activeSubTab &&
          matchesSearchQuery(
            searchQuery,
            svc.title,
            svc.category,
            svc.typeCost,
            svc.taskSlug,
            ...(svc.bullets ?? []),
          ),
      ),
    [services, activeSubTab, searchQuery],
  );

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredServices.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedServices = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return filteredServices.slice(start, start + itemsPerPage);
  }, [filteredServices, activePage, itemsPerPage]);

  const openCreatePage = () => {
    router.push(getDashboardCreateHref('services'));
  };

  const openEditPage = (service: Service) => {
    if (!service.taskSlug) {
      toast.error('This service cannot be edited yet');
      return;
    }
    router.push(getDashboardEditHref('services', service.taskSlug));
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const slug = deleteTarget.taskSlug ?? deleteTarget.id;

    try {
      const response = await taskService.deleteTask(slug);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete service');
      }
      setServices((prev) => prev.filter((svc) => svc.id !== deleteTarget.id));
      toast.success('Service deleted');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete service';
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
                placeholder="Search services…"
                aria-label="Search services"
                className="w-full border-0 bg-transparent py-2.5 text-sm font-normal text-neutral-800 outline-none placeholder:text-neutral-400 focus:outline-none focus:ring-0 dark:bg-transparent dark:text-stone-100 dark:placeholder:text-neutral-500"
              />
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-auto px-4 pb-24 sm:px-6 md:px-8">
          {loading ? (
            <div className="flex flex-1 items-center justify-center py-16 text-center text-sm text-neutral-500">
              Loading services…
            </div>
          ) : (
            <ServiceTable
              services={paginatedServices}
              activeSubTab={activeSubTab}
              searchQuery={searchQuery}
              onEdit={openEditPage}
              onDelete={(id) => {
                const target = services.find((svc) => svc.id === id) ?? null;
                setDeleteTarget(target);
              }}
              onAddClick={openCreatePage}
            />
          )}

          {!loading && filteredServices.length > 0 ? (
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

      <button
        type="button"
        onClick={openCreatePage}
        className="fixed bottom-20 right-5 z-40 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg transition-all hover:scale-105 hover:bg-neutral-800 active:scale-95 md:bottom-8 md:right-8 dark:bg-stone-100 dark:text-neutral-900 dark:hover:bg-white"
        aria-label="Add new service"
        title="Add new service"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </button>

      <DeleteConfirmModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
        title="Delete service?"
        description="This will permanently remove the service from your dashboard."
      />
    </div>
  );
}
