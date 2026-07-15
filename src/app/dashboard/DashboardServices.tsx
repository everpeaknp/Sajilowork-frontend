'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchMyListingTasks,
  mapTaskToService,
} from '@/lib/dashboardListingApi';
import { taskService } from '@/services/task.service';
import { useAuthStore } from '@/store';
import { getDashboardCreateHref, getDashboardEditHref } from './dashboardTabs';
import ServiceTable from './ServiceTable';
import type { Service } from './types';
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

type ServiceStatus = Service['status'];

const STATUS_TABS: ServiceStatus[] = ['Active', 'Pending', 'Ongoing', 'Completed', 'Canceled'];

export default function DashboardServices() {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<ServiceStatus>('Active');
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
    () => services.filter((svc) => svc.status === activeSubTab),
    [services, activeSubTab],
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
    <div className={DASHBOARD_PAGE_ROOT}>
      <div className="mx-auto mb-6 flex max-w-7xl flex-col gap-5 pl-1 sm:mb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className={DASHBOARD_HEADING}>
            Manage Services
          </h1>
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
          <span>Add New Service</span>
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
          <div className="py-20 text-center text-sm text-neutral-400">Loading services…</div>
        ) : (
          <ServiceTable
            services={paginatedServices}
            activeSubTab={activeSubTab}
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
