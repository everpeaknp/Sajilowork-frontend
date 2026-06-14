"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import Navbar from '@/components/common/navbar';
import UserAvatar from '@/components/common/UserAvatar';
import FilterBar from '@/components/my-task/FilterBar';
import TaskCard from '@/components/my-task/TaskCard';
import TaskDetails from '@/components/my-task/TaskDetails';
import TaskMapPreview from '@/components/task/TaskMapPreview';
import TaskBrowseMobileSheet, {
  type BrowseSheetSnap,
} from '@/components/task/TaskBrowseMobileSheet';
import {
  TaskAvatarListSkeleton,
  TaskCardListSkeleton,
  TaskMapSkeleton,
} from '@/components/task/TaskBrowseSkeletons';
import { useSidebar } from '@/hooks/useSidebar';
import { useAuth } from '@/hooks/useAuth';
import { POST_TASK_PATH } from '@/lib/postTaskPath';
import { taskService } from '@/services/task.service';
import type { SearchFilters, Task } from '@/types';
import { filterAndSortTasks, hasActiveFilters, taskBudgetAmount } from '@/lib/taskFilters';
import { confirmDeleteTask } from '@/lib/confirmToast';
import { formatTaskLocationShort } from '@/lib/nepalLocale';
import { getStraightDistanceLabel } from '@/hooks/useRoadDistanceLabel';
import {
  DEFAULT_TASK_RADIUS_KM,
  KATHMANDU_CENTER,
  requestUserGeolocationDetailed,
} from '@/lib/userGeolocation';
import {
  type MyTasksFilterId,
  formatMyTaskStatusLabel,
  formatTaskDisplayTitle,
  extractTaskList,
  mergeUserTasks,
  isUserInvolvedInMyTask,
  matchesMyTasksFilter,
  countMyTasksByFilter,
  getTaskBidCount,
  canEditMyPostedTask,
  canDeleteMyPostedTask,
} from '@/lib/taskUtils';
import {
  hasValidCoordinates,
  resolvePoster,
  toCoord,
  transformApiTaskToMyTaskView,
  transformMyTasksForMapBrowse,
} from '@/lib/myTaskDisplay';
import { getDashboardEditHref } from '@/app/dashboard/dashboardTabs';

const MapView = dynamic(() => import('@/components/task/MapView'), {
  ssr: false,
  loading: () => <TaskMapSkeleton />,
});

const EMPTY_STATE_BY_FILTER: Partial<
  Record<MyTasksFilterId, { title: string; description: string }>
> = {
  open: {
    title: 'No posted tasks',
    description: 'You have no open tasks waiting for offers.',
  },
  assigned: {
    title: 'No assigned tasks',
    description: 'No tasks are waiting to start.',
  },
  in_progress: {
    title: 'No tasks in progress',
    description: 'You have no active work in progress.',
  },
  completed: {
    title: 'No completed tasks',
    description: 'Completed tasks will appear here.',
  },
  cancelled: {
    title: 'No cancelled tasks',
    description: 'Cancelled tasks will appear here.',
  },
  disputed: {
    title: 'No disputed tasks',
    description: 'Disputed tasks will appear here.',
  },
};

export default function MyTasksPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [activeStatus, setActiveStatus] = useState<MyTasksFilterId>('all');
  const [isCompactSidebar, setIsCompactSidebar] = useState(false);
  const [sheetSnap, setSheetSnap] = useState<BrowseSheetSnap>('map');
  const [userMapCenter, setUserMapCenter] = useState<[number, number]>([
    KATHMANDU_CENTER.lat,
    KATHMANDU_CENTER.lng,
  ]);

  const mapCenterInitialized = useRef(false);
  const {
    isSidebarVisible,
    setIsSidebarVisible,
    sidebarWidth,
    isResizing,
    setIsResizing,
    mainRef,
  } = useSidebar();

  const loadUserTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [postedRes, assignedRes] = await Promise.all([
        taskService.getMyTasks(),
        taskService.getAssignedTasks(),
      ]);
      const posted = postedRes.success ? extractTaskList(postedRes.data) : [];
      const assigned = assignedRes.success ? extractTaskList(assignedRes.data) : [];
      setUserTasks(mergeUserTasks(posted, assigned));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load your tasks';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserTasks().catch(() => {
        // error state + toast handled below
      });
    } else if (!isAuthenticated) {
      setIsLoading(false);
      toast.error('Please sign in to view your tasks');
    }
  }, [isAuthenticated, user, loadUserTasks]);

  useEffect(() => {
    if (error) {
      toast.error(typeof error === 'string' ? error : 'An unexpected error occurred');
    }
  }, [error]);

  useEffect(() => {
    if (mapCenterInitialized.current) return;
    mapCenterInitialized.current = true;

    void (async () => {
      const geo = await requestUserGeolocationDetailed();
      if (geo.success) {
        setUserMapCenter([geo.lat, geo.lng]);
        return;
      }

      const profileLat = user?.latitude != null ? Number(user.latitude) : NaN;
      const profileLng = user?.longitude != null ? Number(user.longitude) : NaN;
      if (Number.isFinite(profileLat) && Number.isFinite(profileLng)) {
        setUserMapCenter([profileLat, profileLng]);
      }
    })();
  }, [user?.latitude, user?.longitude]);

  const filterCounts = useMemo(
    () => countMyTasksByFilter(userTasks, user?.id),
    [userTasks, user?.id],
  );

  const filteredTasks = useMemo(() => {
    const involved = userTasks.filter((task) => isUserInvolvedInMyTask(task, user?.id));
    const { status: _status, ...filtersWithoutStatus } = searchFilters;
    let filtered = filterAndSortTasks(involved, filtersWithoutStatus);

    if (activeStatus !== 'all') {
      filtered = filtered.filter((task) =>
        matchesMyTasksFilter(task, activeStatus, user?.id),
      );
    }

    return filtered;
  }, [userTasks, searchFilters, activeStatus, user?.id]);

  const mappedTasks = useMemo(
    () => transformMyTasksForMapBrowse(filteredTasks, user?.id),
    [filteredTasks, user?.id],
  );

  const browseTasksOrderKey = useMemo(
    () =>
      `${searchFilters.sort_by ?? 'newest'}|${mappedTasks.map((t) => String(t.id)).join(',')}`,
    [mappedTasks, searchFilters.sort_by],
  );

  const detailApiTask = useMemo(() => {
    if (!detailTaskId) return null;
    return (
      userTasks.find(
        (t) => String(t.id) === detailTaskId || t.slug === detailTaskId,
      ) ?? null
    );
  }, [detailTaskId, userTasks]);

  const detailTask = useMemo(
    () => (detailApiTask ? transformApiTaskToMyTaskView(detailApiTask, user?.id) : null),
    [detailApiTask, user?.id],
  );

  const previewMapTask = useMemo(() => {
    if (!focusedTaskId || detailTaskId) return null;
    return (
      mappedTasks.find(
        (t) => String(t.id) === String(focusedTaskId) || String(t.slug) === String(focusedTaskId),
      ) ?? null
    );
  }, [focusedTaskId, detailTaskId, mappedTasks]);

  const handleViewTask = useCallback((taskKey: string) => {
    setFocusedTaskId(taskKey);
    setDetailTaskId(taskKey);
    setSheetSnap('map');
  }, []);

  const handleTaskFocus = useCallback((taskKey: string) => {
    setFocusedTaskId(taskKey);
    setDetailTaskId(null);
    setSheetSnap('map');
  }, []);

  const handleCloseMapPreview = useCallback(() => {
    setFocusedTaskId(null);
  }, []);

  const cardUserCenter = useMemo(
    (): [number, number] => userMapCenter,
    [userMapCenter],
  );

  const getTaskCardProps = useCallback(
    (task: Task) => {
      const poster = resolvePoster(task);
      const rawStatus = task.status || 'open';
      const coordinates = hasValidCoordinates(task)
        ? ([toCoord(task.latitude), toCoord(task.longitude)] as [number, number])
        : null;

      return {
        title: formatTaskDisplayTitle(task.title || 'Untitled Task'),
        status: rawStatus,
        statusLabel: formatMyTaskStatusLabel(rawStatus),
        location: formatTaskLocationShort(task),
        coordinates,
        userCenter: cardUserCenter,
        distanceLabel: getStraightDistanceLabel(cardUserCenter, coordinates),
        price: taskBudgetAmount(task),
        dueDate: task.due_date ?? null,
        timeLabel: task.flexible_date ? 'Anytime' : 'Anytime',
        offerCount: getTaskBidCount(task),
        canEdit: canEditMyPostedTask(task, user?.id),
        canDelete: canDeleteMyPostedTask(task, user?.id),
        user: {
          name: poster.name,
          avatar: poster.avatar,
          rating: poster.rating,
          verified: poster.verified,
        },
      };
    },
    [cardUserCenter, user?.id],
  );

  const renderTaskCard = (task: Task, keyPrefix: string) => {
    const cardProps = getTaskCardProps(task);
    const taskSlug = task.slug || String(task.id);
    const taskId = String(task.id);
    const taskKey = taskSlug || taskId;
    const isActive = detailTaskId === taskKey || detailTaskId === taskId;

    return (
      <TaskCard
        key={`${keyPrefix}-${task.id}`}
        {...cardProps}
        id={taskId}
        slug={taskSlug}
        isActive={isActive}
        onClick={() => handleViewTask(taskKey)}
        onEdit={
          cardProps.canEdit
            ? () => {
                router.push(getDashboardEditHref('task', taskSlug));
              }
            : undefined
        }
        onDelete={
          cardProps.canDelete
            ? async () => {
                if (!(await confirmDeleteTask())) return;
                try {
                  await taskService.deleteTask(taskSlug);
                  toast.success('Task deleted successfully');
                  if (detailTaskId === taskKey || detailTaskId === taskId) {
                    setDetailTaskId(null);
                    setFocusedTaskId(null);
                  }
                  loadUserTasks();
                } catch (error: unknown) {
                  const err = error as {
                    response?: { data?: { detail?: string; error?: string } };
                    message?: string;
                  };
                  const errorMessage =
                    err?.response?.data?.detail ||
                    err?.response?.data?.error ||
                    err?.message ||
                    'Failed to delete task';
                  toast.error(errorMessage);
                }
              }
            : undefined
        }
      />
    );
  };

  const renderTaskList = () => {
    if (isLoading) {
      return <TaskCardListSkeleton />;
    }

    if (filteredTasks.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-dim">
            <SlidersHorizontal className="h-8 w-8 text-on-surface-variant" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-on-surface">
            {activeStatus === 'all' && !hasActiveFilters(searchFilters) && 'No tasks yet'}
            {(activeStatus !== 'all' || hasActiveFilters(searchFilters)) &&
              (activeStatus !== 'all'
                ? (EMPTY_STATE_BY_FILTER[activeStatus]?.title ?? 'No tasks in this status')
                : 'No tasks found')}
          </h3>
          <p className="mb-4 text-sm text-on-surface-variant">
            {activeStatus === 'all' && !hasActiveFilters(searchFilters) &&
              'Start by posting your first task or making an offer to get started.'}
            {activeStatus === 'all' && hasActiveFilters(searchFilters) &&
              'Try a different search term or filter.'}
            {activeStatus !== 'all' &&
              (EMPTY_STATE_BY_FILTER[activeStatus]?.description ??
                'Tasks you post or are assigned to will show here.')}
          </p>
          {activeStatus === 'all' && !hasActiveFilters(searchFilters) && (
            <a
              href={POST_TASK_PATH}
              className="rounded-full bg-brand-emerald px-6 py-2 font-semibold text-white hover:bg-brand-emerald/90"
            >
              Post Your First Task
            </a>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3 pb-2">
        {filteredTasks.map((task) => renderTaskCard(task, 'sidebar'))}
      </div>
    );
  };

  return (
    <div className="mobile-bottom-nav-offset flex h-screen flex-col bg-surface md:pb-0">
      <Navbar />

      <main ref={mainRef} className="flex flex-1 overflow-hidden">
        {isSidebarVisible ? (
          <div
            className={`relative z-10 hidden shrink-0 flex-col border-r border-outline-variant bg-white shadow-sm lg:flex ${
              isCompactSidebar ? 'w-20' : ''
            }`}
            style={{ width: isCompactSidebar ? '80px' : `${sidebarWidth}px` }}
          >
            {isCompactSidebar ? (
              <div className="scrollbar-thin scrollbar-thumb-outline-variant flex-1 overflow-y-auto py-6">
                {isLoading ? (
                  <TaskAvatarListSkeleton />
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    {filteredTasks.map((task) => {
                      const poster = resolvePoster(task);
                      const taskKey = task.slug || String(task.id);
                      const isSelected =
                        detailTaskId === taskKey || detailTaskId === String(task.id);
                      return (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => handleViewTask(taskKey)}
                          className={`rounded-full border-2 transition-all hover:scale-110 ${
                            isSelected ? 'border-brand-emerald shadow-lg' : 'border-outline-variant'
                          }`}
                          title={`${formatTaskDisplayTitle(task.title || 'Untitled Task')} — ${poster.name}`}
                        >
                          <UserAvatar
                            src={poster.avatar}
                            alt={poster.name}
                            name={poster.name}
                            size="md"
                            verified={poster.verified}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="scrollbar-thin scrollbar-thumb-outline-variant flex-1 overflow-y-auto px-10 py-6">
                {renderTaskList()}
              </div>
            )}

            {!isCompactSidebar ? (
              <div
                className={`group absolute top-0 -right-1.5 z-50 flex h-full w-3 cursor-col-resize items-center justify-center ${
                  isResizing ? 'bg-brand-emerald/20' : 'hover:bg-brand-emerald/10'
                }`}
                onMouseDown={() => setIsResizing(true)}
              >
                <div
                  className={`h-12 w-0.5 rounded-full bg-outline-variant transition-colors group-hover:bg-brand-emerald ${
                    isResizing ? 'bg-brand-emerald' : ''
                  }`}
                />
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col">
          <FilterBar
            currentFilters={searchFilters}
            onFilterChange={(next) => setSearchFilters({ ...next, status: undefined })}
            isSidebarVisible={isSidebarVisible}
            onToggleSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
            isCompactSidebar={isCompactSidebar}
            onToggleCompact={() => setIsCompactSidebar(!isCompactSidebar)}
            statusTabs={{
              active: activeStatus,
              onChange: setActiveStatus,
              counts: filterCounts,
            }}
          />

          <div className="relative min-h-0 flex-1 overflow-hidden bg-surface-dim">
            <div className="absolute inset-0">
              <MapView
                tasks={mappedTasks}
                tasksOrderKey={browseTasksOrderKey}
                sortBy={searchFilters.sort_by ?? 'newest'}
                focusTaskId={focusedTaskId}
                onTaskFocus={(id) => handleTaskFocus(String(id))}
                userCenter={userMapCenter}
                radiusKm={DEFAULT_TASK_RADIUS_KM}
                onUserLocationFound={(lat, lng) => setUserMapCenter([lat, lng])}
              />
            </div>

            {previewMapTask ? (
              <TaskMapPreview
                task={previewMapTask}
                userCenter={userMapCenter}
                onClose={handleCloseMapPreview}
                onViewTask={() =>
                  handleViewTask(String(previewMapTask.slug || previewMapTask.id))
                }
              />
            ) : null}

            <TaskBrowseMobileSheet
              snap={sheetSnap}
              onSnapChange={setSheetSnap}
              taskCount={filteredTasks.length}
              hidden={Boolean(detailTask)}
            >
              {isLoading ? (
                <TaskCardListSkeleton count={4} />
              ) : filteredTasks.length > 0 ? (
                <div className="flex flex-col gap-3 pb-2">
                  {filteredTasks.map((task) => renderTaskCard(task, 'mobile'))}
                </div>
              ) : (
                renderTaskList()
              )}
            </TaskBrowseMobileSheet>

            {!isLoading && !detailTask && filteredTasks.length > 0 && mappedTasks.length === 0 ? (
              <div
                className={`pointer-events-none absolute inset-0 z-[25] flex items-center justify-center p-6 pb-32 lg:pb-6 ${
                  sheetSnap === 'list' ? 'hidden lg:flex' : 'flex'
                }`}
              >
                <div className="pointer-events-auto max-w-sm rounded-2xl border border-outline-variant bg-white/95 px-6 py-5 text-center shadow-lg backdrop-blur">
                  <h3 className="mb-1 text-base font-bold text-on-surface">Map pins unavailable</h3>
                  <p className="text-sm text-on-surface-variant">
                    These tasks don&apos;t have saved coordinates yet. Open a task from the list to
                    view details.
                  </p>
                </div>
              </div>
            ) : null}

            <AnimatePresence mode="wait">
              {detailTask ? (
                <TaskDetails
                  task={detailTask}
                  apiTask={detailApiTask ?? undefined}
                  onClose={() => {
                    setDetailTaskId(null);
                    setFocusedTaskId(null);
                  }}
                  onTaskDeleted={() => {
                    setDetailTaskId(null);
                    setFocusedTaskId(null);
                    loadUserTasks();
                  }}
                  onTaskUpdated={() => {
                    loadUserTasks();
                  }}
                />
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
