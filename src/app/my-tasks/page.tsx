"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Menu, SlidersHorizontal } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import Navbar from '@/components/common/navbar';
import UserAvatar from '@/components/common/UserAvatar';
import FilterBar from '@/components/my-task/FilterBar';
import TaskCard from '@/components/my-task/TaskCard';
import TaskDetails from '@/components/my-task/TaskDetails';
import { useSidebar } from '@/hooks/useSidebar';
import { useAuth } from '@/hooks/useAuth';
import { taskService } from '@/services/task.service';
import type { SearchFilters, Task } from '@/types';
import { filterAndSortTasks, hasActiveFilters } from '@/lib/taskFilters';
import { getMediaUrl } from '@/lib/utils';
import TaskBrowseMobileSheet, {
  type BrowseSheetSnap,
} from '@/components/task/TaskBrowseMobileSheet';
import {
  type MyTasksFilterId,
  formatMyTaskStatusLabel,
  extractTaskList,
  mergeUserTasks,
  isUserInvolvedInMyTask,
  matchesMyTasksFilter,
  countMyTasksByFilter,
  getTaskBidCount,
  canEditMyPostedTask,
  canDeleteMyPostedTask,
} from '@/lib/taskUtils';
import { formatTaskLocationShort } from '@/lib/nepalLocale';
import { confirmDeleteTask } from '@/lib/confirmToast';
import {
  hasValidCoordinates,
  resolvePoster,
  transformApiTaskToMyTaskView,
} from '@/lib/myTaskDisplay';

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/my-task/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-surface-dim">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-on-surface-variant font-semibold">Loading map...</p>
      </div>
    </div>
  ),
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
  const { user, isAuthenticated } = useAuth();

  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [activeStatus, setActiveStatus] = useState<MyTasksFilterId>('all');
  const [isCompactSidebar, setIsCompactSidebar] = useState(false);
  const [sheetSnap, setSheetSnap] = useState<BrowseSheetSnap>('map');
  const { isSidebarVisible, sidebarWidth, isResizing, setIsResizing, mainRef } = useSidebar();

  const handleSelectTask = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
    setSheetSnap('map');
  }, []);

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
      toast.error('Please sign in to view your tasks');
    }
  }, [isAuthenticated, user, loadUserTasks]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(
        typeof error === 'string'
          ? error
          : 'An unexpected error occurred'
      );
    }
  }, [error]);

  const filterCounts = useMemo(
    () => countMyTasksByFilter(userTasks, user?.id),
    [userTasks, user?.id]
  );

  const filteredTasks = useMemo(() => {
    const involved = userTasks.filter((task) =>
      isUserInvolvedInMyTask(task, user?.id)
    );
    const { status: _status, ...filtersWithoutStatus } = searchFilters;
    let filtered = filterAndSortTasks(involved, filtersWithoutStatus);

    if (activeStatus !== 'all') {
      filtered = filtered.filter((task) =>
        matchesMyTasksFilter(task, activeStatus, user?.id)
      );
    }

    return filtered;
  }, [userTasks, searchFilters, activeStatus, user?.id]);

  function transformTaskForMap(task: Task): import('@/components/my-task/types').Task {
    return transformApiTaskToMyTaskView(task, user?.id);
  }

  const selectedApiTask = useMemo(() => {
    if (!selectedTaskId) return null;
    return (
      userTasks.find(
        (t) => String(t.id) === selectedTaskId || t.slug === selectedTaskId
      ) ?? null
    );
  }, [selectedTaskId, userTasks]);

  const selectedTask = useMemo(() => {
    return selectedApiTask ? transformTaskForMap(selectedApiTask) : null;
  }, [selectedApiTask, user?.id]);

  // Transform tasks for MapView — only those with REAL coordinates.
  // Tasks without lat/lng stay in the list but are skipped on the map.
  const transformedTasks = useMemo(() => {
    return filteredTasks.filter(hasValidCoordinates).map(transformTaskForMap);
  }, [filteredTasks]);

  // Convert Task to display format for TaskCard
  const renderTaskList = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="font-semibold text-on-surface-variant">Loading your tasks…</p>
        </div>
      );
    }

    if (filteredTasks.length === 0) {
      return (
        <div className="flex flex-col items-center px-4 py-10 text-center">
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
              href="/post-task"
              className="rounded-full bg-primary px-6 py-2 font-semibold text-white hover:bg-primary/90"
            >
              Post Your First Task
            </a>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3 pb-2">
        {filteredTasks.map((task) => {
          const cardProps = getTaskCardProps(task);
          const taskSlug = task.slug || String(task.id);
          const taskId = String(task.id);
          const isActive = selectedTaskId === taskId;

          return (
            <TaskCard
              key={task.id}
              {...cardProps}
              id={taskId}
              slug={taskSlug}
              isActive={isActive}
              onClick={() => handleSelectTask(taskId)}
              onEdit={
                cardProps.canEdit
                  ? () => {
                      window.location.href = `/edit-task/${taskSlug}`;
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
        })}
      </div>
    );
  };

  function getTaskCardProps(task: Task) {
    const poster = resolvePoster(task);
    const rawStatus = task.status || 'open';
    const canEdit = canEditMyPostedTask(task, user?.id);
    const canDelete = canDeleteMyPostedTask(task, user?.id);
    return {
      title: task.title || 'Untitled Task',
      status: rawStatus,
      statusLabel: formatMyTaskStatusLabel(rawStatus),
      location: formatTaskLocationShort(task),
      price: task.budget_amount || 0,
      dueDate: task.due_date ?? null,
      timeLabel: task.flexible_date ? 'Anytime' : 'Anytime',
      user: {
        name: poster.name,
        avatar: poster.avatar,
        rating: poster.rating,
      },
      offerCount: getTaskBidCount(task),
      canEdit,
      canDelete,
    };
  }

  return (
    <div className="mobile-bottom-nav-offset flex h-screen flex-col bg-surface md:pb-0">
      <Navbar />
      
      <main ref={mainRef} className="flex-1 flex overflow-hidden">
        {/* Sidebar - Task List */}
        {isSidebarVisible && (
          <div 
            className={`hidden lg:flex border-r border-outline-variant bg-white flex-col z-10 shadow-sm relative shrink-0 ${
              isCompactSidebar ? 'w-20' : ''
            }`}
            style={{ width: isCompactSidebar ? '80px' : `${sidebarWidth}px` }}
          >
            {isCompactSidebar ? (
              // Compact view - Only profile pictures
              <div className="flex-1 overflow-y-auto py-6 scrollbar-thin scrollbar-thumb-outline-variant">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 items-center">
                    {filteredTasks.map((task) => {
                      const poster = resolvePoster(task);
                      const taskId = String(task.id);
                      const isSelected = selectedTaskId === taskId;
                      return (
                        <button
                          key={task.id}
                          onClick={() => handleSelectTask(taskId)}
                          className={`rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${
                            isSelected ? 'border-primary shadow-lg' : 'border-outline-variant'
                          }`}
                          title={`${task.title} — ${poster.name}`}
                        >
                          {/* UserAvatar handles missing/broken images by
                              showing the poster's initials instead. */}
                          <UserAvatar
                            src={poster.avatar}
                            alt={poster.name}
                            name={poster.name}
                            size="md"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              // Full view - Task cards
              <div className="flex-1 overflow-y-auto px-6 py-6 lg:px-10 scrollbar-thin scrollbar-thumb-outline-variant">
                {renderTaskList()}
              </div>
            )}

            {/* Resize Handle */}
            {!isCompactSidebar && (
              <div 
                className={`absolute top-0 -right-1.5 w-3 h-full cursor-col-resize z-50 group flex items-center justify-center ${
                  isResizing ? 'bg-primary/20' : 'hover:bg-primary/10'
                }`}
                onMouseDown={() => setIsResizing(true)}
              >
                <div className={`w-0.5 h-12 rounded-full bg-outline-variant transition-colors group-hover:bg-primary ${
                  isResizing ? 'bg-primary' : ''
                }`} />
              </div>
            )}
          </div>
        )}

        {/* Right Area - Filters + Map */}
        <div className="flex flex-1 flex-col relative min-w-0 min-h-0 z-0">
          <FilterBar
            currentFilters={searchFilters}
            onFilterChange={(next) =>
              setSearchFilters({ ...next, status: undefined })
            }
            isSidebarVisible={isSidebarVisible}
            onToggleSidebar={() => {}}
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
              <MapView tasks={transformedTasks} onTaskSelect={handleSelectTask} />
            </div>

            <TaskBrowseMobileSheet
              snap={sheetSnap}
              onSnapChange={setSheetSnap}
              taskCount={filteredTasks.length}
              hidden={Boolean(selectedTask)}
            >
              {renderTaskList()}
            </TaskBrowseMobileSheet>

            {/* Friendly empty state when NO filtered task has coords.
                Hide it when a task is selected so it doesn't look like a task-level error. */}
            {!isLoading && !selectedTask && filteredTasks.length > 0 && transformedTasks.length === 0 && (
              <div className="absolute inset-0 z-[300] flex items-center justify-center pointer-events-none">
                <div className="bg-white/95 backdrop-blur border border-outline-variant rounded-2xl shadow-lg px-6 py-5 max-w-sm text-center pointer-events-auto">
                  <h3 className="text-base font-bold text-on-surface mb-1">
                    Map pins unavailable
                  </h3>
                  <p className="text-sm text-on-surface-variant">
                    These tasks don&apos;t have saved coordinates (latitude/longitude) yet.
                    You can still open a task and use <span className="font-semibold">View map</span> to search by address.
                  </p>
                </div>
              </div>
            )}

            {/* Task Details Overlay */}
            <AnimatePresence mode="wait">
              {selectedTask && (
                <TaskDetails
                  task={selectedTask}
                  apiTask={selectedApiTask ?? undefined}
                  onClose={() => setSelectedTaskId(null)}
                  onTaskDeleted={() => {
                    // Refresh the task list after deletion
                    loadUserTasks();
                  }}
                  onTaskUpdated={() => {
                    loadUserTasks();
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

