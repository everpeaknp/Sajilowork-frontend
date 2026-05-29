"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Search, Menu, SlidersHorizontal } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import Navbar from '@/components/common/navbar';
import UserAvatar from '@/components/common/UserAvatar';
import TaskCard from '@/components/my-task/TaskCard';
import TaskDetails from '@/components/my-task/TaskDetails';
import { useSidebar } from '@/hooks/useSidebar';
import { useAuth } from '@/hooks/useAuth';
import { taskService } from '@/services/task.service';
import type { Task } from '@/types';
import { getMediaUrl } from '@/lib/utils';
import {
  type MyTasksFilterId,
  MY_TASKS_STATUS_FILTERS,
  formatMyTaskStatusLabel,
  extractTaskList,
  mergeUserTasks,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<MyTasksFilterId>('all');
  const [isCompactSidebar, setIsCompactSidebar] = useState(false);
  const { isSidebarVisible, sidebarWidth, isResizing, setIsResizing, mainRef } = useSidebar();

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
    let filtered = userTasks;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(q) ||
          task.address?.toLowerCase().includes(q) ||
          task.city?.toLowerCase().includes(q)
      );
    }

    if (activeStatus !== 'all') {
      filtered = filtered.filter((task) =>
        matchesMyTasksFilter(task, activeStatus, user?.id)
      );
    }

    return filtered;
  }, [userTasks, searchQuery, activeStatus, user?.id]);

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
    <div className="flex flex-col h-screen bg-surface">
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
                          onClick={() => setSelectedTaskId(taskId)}
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
              <div className="flex-1 overflow-y-auto px-10 py-6 scrollbar-thin scrollbar-thumb-outline-variant">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-on-surface-variant font-semibold">Loading your tasks...</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 pb-2">
                    {filteredTasks.length > 0 ? (
                      filteredTasks.map((task) => {
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
                              onClick={() => setSelectedTaskId(taskId)}
                              onEdit={
                                cardProps.canEdit
                                  ? () => {
                                      window.location.href = `/edit-task/${taskSlug}`;
                                    }
                                  : undefined
                              }
                              onDelete={cardProps.canDelete ? async () => {
                                if (!(await confirmDeleteTask())) {
                                  return;
                                }

                                try {
                                  await taskService.deleteTask(taskSlug);
                                  toast.success('Task deleted successfully');
                                  // Refresh the task list
                                  loadUserTasks();
                                } catch (error: any) {
                                  const errorMessage = error?.response?.data?.detail 
                                    || error?.response?.data?.error
                                    || error?.message 
                                    || 'Failed to delete task';
                                  toast.error(errorMessage);
                                }
                              } : undefined}
                            />
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="w-16 h-16 bg-surface-dim rounded-full flex items-center justify-center mb-4">
                          <SlidersHorizontal className="w-8 h-8 text-on-surface-variant" />
                        </div>
                        <h3 className="text-lg font-bold text-on-surface mb-2">
                          {activeStatus === 'all' && !searchQuery && 'No tasks yet'}
                          {activeStatus === 'all' && searchQuery && 'No tasks found'}
                          {activeStatus !== 'all' &&
                            (EMPTY_STATE_BY_FILTER[activeStatus]?.title ??
                              'No tasks in this status')}
                        </h3>
                        <p className="text-on-surface-variant font-sans text-[14px] font-normal leading-[20px] mb-4">
                          {activeStatus === 'all' && !searchQuery &&
                            'Start by posting your first task or making an offer to get started.'}
                          {activeStatus === 'all' && searchQuery && 'Try a different search term.'}
                          {activeStatus !== 'all' &&
                            (EMPTY_STATE_BY_FILTER[activeStatus]?.description ??
                              'Tasks you post or are assigned to will show here.')}
                        </p>
                        {activeStatus === 'all' && !searchQuery && (
                          <a
                            href="/post-task"
                            className="px-6 py-2 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-colors"
                          >
                            Post Your First Task
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
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
        <div className="flex flex-1 flex-col relative overflow-visible min-w-0">
          {/* Filter Bar with Search and Status Filters */}
          <div className="bg-white border-b border-outline-variant px-10 py-3 flex items-center justify-between relative z-50">
            <div className="flex items-center gap-6 flex-nowrap min-w-0">
              <button
                onClick={() => setIsCompactSidebar(!isCompactSidebar)}
                className="p-2 hover:bg-surface-dim rounded-lg transition-colors flex-shrink-0"
                title={isCompactSidebar ? 'Show full sidebar' : 'Show compact sidebar'}
              >
                <Menu className="w-5 h-5 text-on-surface-variant" />
              </button>

              <div className="relative flex-shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white border border-[#2f6bff]/30 focus:border-[#2f6bff]/50 shadow-sm rounded-full py-2 pl-10 pr-4 w-64 outline-none transition-all placeholder:text-on-surface-variant/60 font-sans text-[14px]"
                />
              </div>

              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar flex-1 min-w-0">
                {MY_TASKS_STATUS_FILTERS.map((filter) => {
                  const count = filterCounts[filter.id];
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setActiveStatus(filter.id)}
                      className={`font-sans text-[13px] font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                        activeStatus === filter.id
                          ? 'text-[#2f6bff]'
                          : 'text-black/70 hover:text-[#2f6bff]'
                      }`}
                    >
                      {filter.label}
                      {count > 0 ? ` (${count})` : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex-1 bg-surface-dim relative overflow-hidden">
            <div style={{ width: '100%', height: '100%' }}>
              <MapView tasks={transformedTasks} onTaskSelect={(id) => setSelectedTaskId(id)} />
            </div>

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

