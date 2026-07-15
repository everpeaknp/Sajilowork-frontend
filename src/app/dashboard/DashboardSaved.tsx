'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import UserAvatar from '@/components/common/UserAvatar';
import DeleteConfirmModal from './DeleteConfirmModal';
import { formatNPR } from '@/lib/nepalLocale';
import {
  savedItemDetailPath,
  type DashboardSavedItem,
  type SavedSubTab,
} from '@/lib/dashboardSaved';
import { filterBookmarkedTasksByTab } from '@/lib/dashboardSavedApi';
import { BOOKMARKS_CHANGED_EVENT, notifyBookmarksChanged, resolveListingSlug } from '@/lib/listingBookmark';
import { extractTaskList } from '@/lib/taskUtils';
import { bookmarkService } from '@/services/bookmark.service';
import type { Task } from '@/types';
import {
  DASHBOARD_CARD,
  DASHBOARD_HEADING_MD,
  DASHBOARD_PAGE_ROOT,
  DASHBOARD_PAGINATION_ARROW_PLAIN,
  DASHBOARD_PAGINATION_INNER,
  DASHBOARD_PAGINATION_OUTER,
  DASHBOARD_SUBTABS_ROW,
  DASHBOARD_SUBTABS_WRAP,
  dashboardPageButtonClass,
} from './dashboardResponsive';

function SavedCard({
  item,
  onDelete,
  onOpen,
}: {
  item: DashboardSavedItem;
  onDelete: (item: DashboardSavedItem) => void;
  onOpen: (item: DashboardSavedItem) => void;
}) {
  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-100 bg-white transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:shadow-none">
      <div>
        <div className="relative h-[200px] w-full overflow-hidden bg-neutral-100">
          <button
            type="button"
            onClick={() => onOpen(item)}
            className="block h-full w-full cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-[#52C47F]/40"
          >
            <img
              src={item.image}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              referrerPolicy="no-referrer"
            />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="absolute right-4 top-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-neutral-100 bg-white text-black shadow-sm outline-none transition-all hover:scale-110 hover:text-red-500 active:scale-95 dark:border-neutral-700 dark:bg-neutral-900 dark:text-stone-100"
            title="Remove from bookmarks"
          >
            <Trash2 className="h-4 w-4 text-neutral-800" strokeWidth={1.5} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onOpen(item)}
          className="w-full cursor-pointer space-y-2.5 p-5 pb-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#52C47F]/30"
        >
          <span className="block text-xs font-normal tracking-tight text-neutral-500">
            {item.category}
          </span>
          <h4 className="line-clamp-2 h-11 text-sm font-normal leading-snug tracking-tight text-black dark:text-stone-100">
            {item.title}
          </h4>
          <div className="flex items-center gap-1.5 text-xs font-normal text-neutral-800">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 stroke-none" />
            <span className="font-normal text-neutral-950">
              {item.rating > 0 ? item.rating.toFixed(2) : '—'}
            </span>
            <span className="font-normal text-neutral-500">
              {item.reviewsCount}{' '}
              {item.kind === 'service'
                ? item.reviewsCount === 1
                  ? 'review'
                  : 'reviews'
                : item.reviewsCount === 1
                  ? 'offer'
                  : 'offers'}
            </span>
          </div>
        </button>
      </div>

      <div className="px-5 pb-5">
        <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <UserAvatar
              src={item.authorAvatar}
              name={item.authorName}
              alt={item.authorName}
              size="xs"
              className="!h-7 !w-7 shrink-0"
            />
            <div className="min-w-0 leading-tight">
              {item.authorName === 'Wanda Runo' ? (
                <div className="text-[11.5px] font-normal text-neutral-800">
                  <span>Wanda</span>
                  <br />
                  <span>Runo</span>
                </div>
              ) : (
                <span className="block truncate text-[11.5px] font-normal text-neutral-800">
                  {item.authorName}
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0 text-right leading-none">
            {item.authorName === 'Wanda Runo' ? (
              <div className="text-xs font-normal text-neutral-950">
                <span className="mb-0.5 block text-[10.5px] text-neutral-500">Starting</span>
                <span className="mb-0.5 block text-[11.5px] text-neutral-500">at </span>
                <span className="text-sm font-medium text-black dark:text-stone-100">{formatNPR(item.price)}</span>
              </div>
            ) : (
              <div className="text-xs font-normal">
                <span className="text-[10px] text-neutral-500">Starting at </span>
                <span className="text-sm font-medium text-black dark:text-stone-100">{formatNPR(item.price)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardSaved() {
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState<SavedSubTab>('services');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [bookmarkedTasks, setBookmarkedTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<DashboardSavedItem | null>(null);
  const [removing, setRemoving] = useState(false);

  const loadTaskBookmarks = useCallback(async () => {
    setTasksLoading(true);
    try {
      const response = await bookmarkService.getBookmarked();
      if (response.success && response.data) {
        setBookmarkedTasks(extractTaskList(response.data));
      } else {
        setBookmarkedTasks([]);
      }
    } catch {
      setBookmarkedTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTaskBookmarks();
  }, [loadTaskBookmarks]);

  useEffect(() => {
    const refresh = () => {
      void loadTaskBookmarks();
    };
    window.addEventListener(BOOKMARKS_CHANGED_EVENT, refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener(BOOKMARKS_CHANGED_EVENT, refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [loadTaskBookmarks]);

  const handleTabChange = (tab: SavedSubTab) => {
    setActiveSubTab(tab);
    setCurrentPage(1);
  };

  const allItems = useMemo(
    () => filterBookmarkedTasksByTab(bookmarkedTasks, activeSubTab),
    [activeSubTab, bookmarkedTasks],
  );

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setRemoving(true);
    try {
      const response = await bookmarkService.unbookmark(deleteTarget.slug);
      if (response.success) {
        const removedSlug = deleteTarget.slug;
        setBookmarkedTasks((prev) =>
          prev.filter((task) => resolveListingSlug(task.slug, task.id) !== removedSlug),
        );
        toast.success('Removed from saved');
        setDeleteTarget(null);
        notifyBookmarksChanged();
      } else {
        toast.error(response.message || 'Could not remove bookmark');
      }
      return;
    } catch {
      toast.error('Could not remove bookmark');
    } finally {
      setRemoving(false);
    }
  };

  const openItem = (item: DashboardSavedItem) => {
    router.push(savedItemDetailPath(item));
  };

  const activeLabel =
    activeSubTab === 'services'
      ? 'services'
      : activeSubTab === 'project'
        ? 'projects'
        : activeSubTab === 'jobs'
          ? 'jobs'
          : 'tasks';

  const totalItems = allItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const indexOfLastItem = safePage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = allItems.slice(indexOfFirstItem, indexOfLastItem);

  const showLoading = tasksLoading && totalItems === 0;

  const subTabClass = (tab: SavedSubTab) =>
    `relative cursor-pointer pb-4 text-[15px] font-normal tracking-tight transition-all outline-none ${
      activeSubTab === tab
        ? 'text-black after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-black dark:text-stone-100 dark:after:bg-stone-100'
        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-stone-100'
    }`;

  return (
    <div className={DASHBOARD_PAGE_ROOT}>
      <div className="mx-auto mb-6 max-w-7xl pl-1 sm:mb-8">
        <h1 className={DASHBOARD_HEADING_MD}>Saved</h1>
        <p className="mt-2 text-[15px] font-normal tracking-tight text-neutral-500">
          Your bookmarked services, projects, jobs, and tasks.
        </p>
      </div>

      <div className={DASHBOARD_CARD}>
        <div className={DASHBOARD_SUBTABS_WRAP}>
          <div className={DASHBOARD_SUBTABS_ROW}>
            <button type="button" onClick={() => handleTabChange('services')} className={subTabClass('services')}>
              Services
            </button>
            <button type="button" onClick={() => handleTabChange('project')} className={subTabClass('project')}>
              Project
            </button>
            <button type="button" onClick={() => handleTabChange('jobs')} className={subTabClass('jobs')}>
              Jobs
            </button>
            <button type="button" onClick={() => handleTabChange('task')} className={subTabClass('task')}>
              Tasks
            </button>
          </div>
        </div>

        {showLoading ? (
          <div className="py-24 text-center text-sm text-neutral-400">Loading saved items…</div>
        ) : totalItems === 0 ? (
          <div className="py-24 text-center text-sm text-neutral-400">
            No saved {activeLabel} found.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {currentItems.map((item) => (
                <SavedCard
                  key={`${item.kind}-${item.id}`}
                  item={item}
                  onDelete={setDeleteTarget}
                  onOpen={openItem}
                />
              ))}
            </div>

            <div className={DASHBOARD_PAGINATION_OUTER}>
              <div className={DASHBOARD_PAGINATION_INNER}>
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={safePage === 1}
                  className={DASHBOARD_PAGINATION_ARROW_PLAIN}
                >
                  <ChevronLeft className="h-5 w-5 text-black dark:text-stone-100" strokeWidth={1.5} />
                </button>

                <div className="flex shrink-0 items-center gap-1">
                  {[1, 2, 3, 4, 5].map((page) =>
                    totalPages >= page ? (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={dashboardPageButtonClass(safePage === page)}
                      >
                        {page}
                      </button>
                    ) : null,
                  )}

                  {totalPages > 5 ? (
                    <span className="pointer-events-none flex h-9 w-9 shrink-0 select-none items-center justify-center text-sm font-normal text-neutral-400 sm:h-[44px] sm:w-[44px]">
                      ...
                    </span>
                  ) : null}

                  {totalPages > 5 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentPage(totalPages)}
                      className={dashboardPageButtonClass(safePage === totalPages)}
                    >
                      {totalPages}
                    </button>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={safePage === totalPages}
                  className={DASHBOARD_PAGINATION_ARROW_PLAIN}
                >
                  <ChevronRight className="h-5 w-5 text-black dark:text-stone-100" strokeWidth={1.5} />
                </button>
              </div>

              <div className="pt-1 text-sm font-normal tracking-tight text-neutral-800">
                {indexOfFirstItem + 1} – {Math.min(indexOfLastItem, totalItems)} of {totalItems}{' '}
                {activeLabel} saved
              </div>
            </div>
          </>
        )}
      </div>

      <DeleteConfirmModal
        open={deleteTarget !== null}
        onClose={() => !removing && setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
