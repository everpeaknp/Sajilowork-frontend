"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { SlidersHorizontal, MapPin } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import Navbar from '@/components/common/navbar';
import UserAvatar from '@/components/common/UserAvatar';
import FilterBar from '@/components/task/FilterBar';
import TaskCard from '@/components/task/TaskCard';
import TaskDetails from '@/components/task/TaskDetails';
import TaskMapPreview from '@/components/task/TaskMapPreview';
import { useSidebar } from '@/hooks/useSidebar';
import { useTaskStore } from '@/store';
import { useAuth } from '@/hooks/useAuth';
import type { SearchFilters, Task } from '@/types';
import { getMediaUrl } from '@/lib/utils';
import { filterAndSortTasks, taskBudgetAmount } from '@/lib/taskFilters';
import { isCurrentUserTaskOwner } from '@/lib/taskUtils';
import { formatTaskLocationShort } from '@/lib/nepalLocale';

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/task/MapView'), {
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

export default function App() {
  const searchParams = useSearchParams();

  /** Map marker click — centered preview */
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);
  /** Sidebar card or "View Task" — full TaskDetails */
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [isCompactSidebar, setIsCompactSidebar] = useState(false);
  
  const tasks = useTaskStore((s) => s.tasks);
  const filters = useTaskStore((s) => s.filters);
  const setFilters = useTaskStore((s) => s.setFilters);
  const fetchTasks = useTaskStore((s) => s.fetchTasks);
  const fetchCategories = useTaskStore((s) => s.fetchCategories);
  const categories = useTaskStore((s) => s.categories);
  const isLoading = useTaskStore((s) => s.isLoading);
  const error = useTaskStore((s) => s.error);
  const taskList = Array.isArray(tasks) ? tasks : [];

  const { user } = useAuth();

  const { isSidebarVisible, setIsSidebarVisible, sidebarWidth, isResizing, setIsResizing, mainRef } = useSidebar();

  const safeFilters = filters ?? {};

  const handleFilterChange = useCallback(
    (next: SearchFilters) => {
      const prev = useTaskStore.getState().filters ?? {};
      setFilters(next);

      const sortChanged = (prev.sort_by ?? 'newest') !== (next.sort_by ?? 'newest');
      if (sortChanged) {
        void fetchTasks();
      }
    },
    [setFilters, fetchTasks]
  );

  const handleTaskUpdated = useCallback(() => {
    void fetchTasks();
  }, [fetchTasks]);

  // Apply ?category= from landing / directory links
  useEffect(() => {
    const category = searchParams.get('category')?.trim();
    if (!category) return;
    const prev = useTaskStore.getState().filters ?? {};
    if (prev.category === category) return;
    setFilters({ ...prev, category });
  }, [searchParams, setFilters]);

  // Load tasks once; FilterBar applies filters client-side to avoid request storms.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await fetchCategories();
        if (!cancelled) {
          await fetchTasks();
        }
      } catch {
        if (!cancelled) {
          toast.error('Failed to load tasks');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchCategories, fetchTasks]);

  const filteredTaskList = useMemo(() => {
    const base = filterAndSortTasks(taskList, safeFilters);
    // Browse page: hide own tasks and completed listings.
    return base.filter(
      (task) =>
        !isCurrentUserTaskOwner(task, user?.id) && task.status !== 'completed'
    );
  }, [taskList, user?.id, filters]);

  /** Stable key so MapView + cards re-sync when sort order changes */
  const browseTasksOrderKey = useMemo(
    () =>
      `${safeFilters.sort_by ?? 'newest'}|${filteredTaskList
        .map((t) => String(t.id))
        .join(',')}`,
    [filteredTaskList, safeFilters.sort_by]
  );

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

  const findTaskByKey = useCallback(
    (taskKey: string | null) => {
      if (!taskKey) return null;
      return (
        filteredTaskList.find((t) => t.id === taskKey || t.slug === taskKey) ||
        taskList.find((t) => t.id === taskKey || t.slug === taskKey) ||
        null
      );
    },
    [filteredTaskList, taskList]
  );

  const detailTask = useMemo(
    () => findTaskByKey(detailTaskId),
    [findTaskByKey, detailTaskId]
  );

  const handleTaskFocus = useCallback((taskKey: string) => {
    setFocusedTaskId(taskKey);
    setDetailTaskId(null);
  }, []);

  const handleViewTask = useCallback((taskKey: string) => {
    setFocusedTaskId(taskKey);
    setDetailTaskId(taskKey);
  }, []);

  const handleCloseMapPreview = useCallback(() => {
    setFocusedTaskId(null);
  }, []);

  // Resolve a task's poster into a single display-friendly shape.
  // Critical detail: DRF's TaskListSerializer serializes the `owner`
  // ForeignKey as just the owner's UUID *string* (not a nested object).
  // The old code did `if (task.poster || task.owner)` which always
  // entered the nested branch — because a UUID string is truthy — and
  // then read `.first_name` off a string, producing the "Unknown" /
  // default-avatar fallback for every single card. We therefore only
  // treat `poster`/`owner` as a source if it is actually an object.
  const resolvePoster = (task: Task) => {
    const nested =
      (task.poster && typeof task.poster === 'object' ? task.poster : null) ||
      (task.owner && typeof task.owner === 'object' ? task.owner : null);

    if (nested) {
      const name =
        `${nested.first_name || ''} ${nested.last_name || ''}`.trim() ||
        nested.full_name ||
        'Unknown';
      return {
        name,
        avatar: getMediaUrl(nested.profile_image),
        rating: nested.average_rating || 0,
        reviews: nested.total_reviews || 0,
      };
    }

    // Fall back to the flat fields produced by TaskListSerializer.
    return {
      name: task.owner_name || 'Unknown',
      avatar: getMediaUrl(task.owner_image),
      rating: task.owner_rating || 0,
      reviews: 0,
    };
  };

  const formatTaskStatusLabel = (status: string): string => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'draft':
        return 'Draft';
      case 'assigned':
        return 'Assigned';
      case 'in_progress':
        return 'In progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'disputed':
        return 'Disputed';
      default:
        return status.replace(/_/g, ' ');
    }
  };

  // Convert Task to display format for TaskCard
  const getTaskCardProps = (task: Task) => {
    const poster = resolvePoster(task);
    const offerCount = task.bid_count ?? task.bids_count ?? 0;

    return {
      title: task.title || 'Untitled Task',
      status: task.status || 'open',
      statusLabel: formatTaskStatusLabel(task.status || 'open'),
      location: formatTaskLocationShort(task),
      price: taskBudgetAmount(task),
      dueDate: task.due_date ?? null,
      timeLabel: task.flexible_date ? 'Anytime' : 'Anytime',
      offerCount,
      user: {
        name: poster.name,
        avatar: poster.avatar,
        rating: poster.rating,
      },
    };
  };

  // A task is mappable only when it has REAL latitude/longitude.
  // We intentionally do NOT fall back to a fake default (the previous code
  // pinned every coordinate-less task to Perth, Australia which made them
  // stack on the same fake pin and zoomed the map to the wrong continent).
  // Safely coerce DRF's DecimalField output (which arrives as a STRING like
  // "27.708317") or raw number into a JS number, returning NaN for null /
  // undefined / blank strings.
  const toCoord = (raw: unknown): number => {
    if (raw === null || raw === undefined || raw === '') return NaN;
    if (typeof raw === 'number') return raw;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : NaN;
  };

  const hasValidCoordinates = (task: Task): boolean => {
    const lat = toCoord(task.latitude);
    const lng = toCoord(task.longitude);
    return (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180 &&
      // Treat (0,0) "Null Island" as missing data, not a real location.
      !(lat === 0 && lng === 0)
    );
  };

  // Convert API Task -> MapView Task format. Only tasks with real coords.
  // Preserves browse sort order via browseOrder (sidebar list index).
  const transformTasksForMap = (apiTasks?: Task[]) => {
    const normalizedTasks = Array.isArray(apiTasks) ? apiTasks : [];
    return normalizedTasks
      .map((task, browseOrder) => ({ task, browseOrder }))
      .filter(({ task }) => hasValidCoordinates(task))
      .map(({ task, browseOrder }) => {
      const categoryName = typeof task.category === 'string' 
        ? task.category 
        : task.category?.name || task.category_name || 'General';
      
      // Same nested-vs-flat resolution rule as the sidebar — see resolvePoster.
      const poster = resolvePoster(task);
      const posterName = poster.name;
      const posterAvatar = poster.avatar;
      const posterRating = poster.rating;
      
      // Safe date parsing
      let postedDate = new Date();
      let dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      try {
        if (task.created_at) {
          const parsed = new Date(task.created_at);
          if (!isNaN(parsed.getTime())) postedDate = parsed;
        }
      } catch (e) {
        console.warn('Invalid created_at date:', task.created_at);
      }
      
      try {
        if (task.due_date) {
          const parsed = new Date(task.due_date);
          if (!isNaN(parsed.getTime())) dueDate = parsed;
        }
      } catch (e) {
        console.warn('Invalid due_date:', task.due_date);
      }
      
      return {
        id: task.slug || task.id, // Use slug for map marker IDs
        slug: task.slug || task.id, // Add slug explicitly
        title: task.title || 'Untitled Task',
        status: task.status || 'open',
        location: formatTaskLocationShort(task),
        // toCoord() handles strings (DRF DecimalField -> string) and numbers.
        coordinates: [toCoord(task.latitude), toCoord(task.longitude)] as [number, number],
        price: taskBudgetAmount(task),
        browseOrder,
        category: categoryName,
        workType:
          (task.work_type || task.location_type) === 'in_person'
            ? ('in-person' as const)
            : (task.work_type || task.location_type) === 'remote'
              ? ('remotely' as const)
              : ('all' as const),
        postedDate,
        dueDate,
        description: task.description || '',
        hasOffers: (task.bid_count || task.bids_count || 0) > 0,
        isAssigned: task.status === 'assigned',
        statusColor: task.status === 'open' ? 'green' : task.status === 'assigned' ? 'blue' : 'gray',
        user: {
          name: posterName,
          avatar: posterAvatar,
          rating: posterRating
        }
      };
    });
  };

  // Compute mapped tasks once so we can show an "unmapped" banner.
  const mappedTasks = useMemo(
    () => transformTasksForMap(filteredTaskList),
    [filteredTaskList, browseTasksOrderKey]
  );

  const previewMapTask = useMemo(() => {
    if (!focusedTaskId || detailTaskId) return null;
    return (
      mappedTasks.find(
        (t) =>
          String(t.id) === String(focusedTaskId) ||
          String(t.slug) === String(focusedTaskId)
      ) ?? null
    );
  }, [focusedTaskId, detailTaskId, mappedTasks]);

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
                    {filteredTaskList.map((task) => {
                      // Use the same resolver as the full sidebar / map so we
                      // never end up with an undefined / "/default-avatar.png"
                      // image being treated as a real picture.
                      const poster = resolvePoster(task);
                      return (
                        <button
                          key={task.id}
                          onClick={() => handleViewTask(String(task.slug || task.id))}
                          className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${
                            detailTaskId === (task.slug || task.id) ? 'border-primary shadow-lg' : 'border-outline-variant'
                          }`}
                          title={task.title}
                        >
                          <UserAvatar
                            src={poster.avatar}
                            alt={poster.name}
                            name={poster.name}
                            size="md"
                            className="w-full h-full border-0 rounded-none"
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
                    <p className="text-on-surface-variant font-semibold">Loading tasks...</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 pb-2">
                    {filteredTaskList.length > 0 ? (
                      filteredTaskList.map((task, index) => {
                        const cardProps = getTaskCardProps(task);
                        const taskKey = task.slug || task.id;
                        const isActive = detailTaskId === taskKey;
                        const sortKey = safeFilters.sort_by ?? 'newest';
                        return (
                          <TaskCard
                            key={`${task.id}-${sortKey}-${index}`}
                            {...cardProps}
                            isActive={isActive}
                            onClick={() => handleViewTask(taskKey)}
                          />
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="w-16 h-16 bg-surface-dim rounded-full flex items-center justify-center mb-4">
                          <SlidersHorizontal className="w-8 h-8 text-on-surface-variant" />
                        </div>
                        <h3 className="text-lg font-bold text-on-surface mb-2">
                          {taskList.length > 0 ? 'No tasks match your filters' : 'No tasks available'}
                        </h3>
                        <p className="text-on-surface-variant font-sans text-[14px] font-normal leading-[20px] mb-4">
                          {taskList.length > 0
                            ? 'Try adjusting search, category, location, or price filters.'
                            : 'There are currently no tasks posted. Be the first to post a task!'}
                        </p>
                        <a
                          href="/post-task"
                          className="px-6 py-2 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-colors"
                        >
                          Post a Task
                        </a>
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
        <div className="flex flex-1 flex-col relative min-w-0 min-h-0 z-0">
          <FilterBar
            currentFilters={safeFilters}
            onFilterChange={handleFilterChange}
            categories={categories}
            isSidebarVisible={isSidebarVisible}
            onToggleSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
            isCompactSidebar={isCompactSidebar}
            onToggleCompact={() => setIsCompactSidebar(!isCompactSidebar)}
          />

          <div className="flex-1 min-h-0 bg-surface-dim relative overflow-hidden">
            <div className="absolute inset-0">
              <MapView
                tasks={mappedTasks}
                tasksOrderKey={browseTasksOrderKey}
                sortBy={safeFilters.sort_by ?? 'newest'}
                focusTaskId={focusedTaskId}
                onTaskFocus={(id) => handleTaskFocus(String(id))}
              />
            </div>

            {previewMapTask && (
              <TaskMapPreview
                task={previewMapTask}
                onClose={handleCloseMapPreview}
                onViewTask={() => handleViewTask(String(previewMapTask.slug || previewMapTask.id))}
              />
            )}

            {/* Friendly overlay when no tasks have coordinates at all.
                Hide while a detail panel is open so it doesn't feel like a task error. */}
            {!isLoading && mappedTasks.length === 0 && !detailTask && (
              <div className="absolute inset-0 z-[400] flex items-center justify-center p-6 pointer-events-none">
                <div className="bg-white rounded-2xl shadow-xl border border-outline-variant max-w-sm text-center p-6 pointer-events-auto">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-surface-dim flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-on-surface-variant" />
                  </div>
                  <h3 className="text-base font-bold text-on-surface mb-1">
                    Map pins unavailable
                  </h3>
                  <p className="text-sm text-on-surface-variant">
                    {filteredTaskList.length === 0
                      ? taskList.length === 0
                        ? 'No tasks have been posted yet.'
                        : 'No tasks match your current filters.'
                      : 'These tasks don’t have saved coordinates (latitude/longitude) yet. Open a task and use “View map” to search by address.'}
                  </p>
                </div>
              </div>
            )}

            {/* Full details — sidebar card or "View Task" on map preview */}
            <AnimatePresence mode="wait">
              {detailTask && (
                <TaskDetails
                  key={detailTask.id}
                  task={detailTask}
                  onClose={() => setDetailTaskId(null)}
                  onTaskUpdated={handleTaskUpdated}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
