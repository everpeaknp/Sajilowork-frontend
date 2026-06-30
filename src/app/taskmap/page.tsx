"use client";

import { useState, useMemo, useEffect, useCallback, useRef, Suspense } from 'react';
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
import { useTaskStore } from '@/store';
import { POST_TASK_PATH } from '@/lib/postTaskPath';
import type { SearchFilters, Task } from '@/types';
import { getMediaUrl } from '@/lib/utils';
import { filterAndSortTasks, taskBudgetAmount } from '@/lib/taskFilters';
import { resolveMapMarkerPriceLabel } from '@/lib/mapMarkerPrice';
import { getListingKind } from '@/lib/dashboardListingApi';
import { formatTaskLocationShort } from '@/lib/nepalLocale';
import {
  DEFAULT_TASK_RADIUS_KM,
  KATHMANDU_CENTER,
  requestUserGeolocationDetailed,
} from '@/lib/userGeolocation';
import { getStraightDistanceLabel } from '@/hooks/useRoadDistanceLabel';

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/task/MapView'), {
  ssr: false,
  loading: () => <TaskMapSkeleton />,
});

function TaskmapPageContent() {
  const searchParams = useSearchParams();

  /** Map marker click — centered preview */
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);
  /** Sidebar card or "View Task" — full TaskDetails */
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [isCompactSidebar, setIsCompactSidebar] = useState(false);
  const [sheetSnap, setSheetSnap] = useState<BrowseSheetSnap>('map');
  
  const tasks = useTaskStore((s) => s.tasks);
  const filters = useTaskStore((s) => s.filters);
  const setFilters = useTaskStore((s) => s.setFilters);
  const fetchTasks = useTaskStore((s) => s.fetchTasks);
  const fetchCategories = useTaskStore((s) => s.fetchCategories);
  const categories = useTaskStore((s) => s.categories);
  const categoriesLoaded = useTaskStore((s) => s.categoriesLoaded);
  const isLoading = useTaskStore((s) => s.isLoading);
  const error = useTaskStore((s) => s.error);
  const taskList = Array.isArray(tasks) ? tasks : [];

  const { user } = useAuth();
  const radiusFilterInitialized = useRef(false);

  const { isSidebarVisible, setIsSidebarVisible, sidebarWidth, isResizing, setIsResizing, mainRef } = useSidebar();

  const safeFilters = filters ?? {};

  // Default map view: zoom to 15km around user. Set fallback immediately, then refine with GPS.
  useEffect(() => {
    if (radiusFilterInitialized.current) return;
    radiusFilterInitialized.current = true;

    const categoryFromUrl = searchParams.get('category')?.trim();
    const prevCategory =
      categoryFromUrl && categoryFromUrl.length > 0 ? categoryFromUrl : undefined;

    setFilters({
      ...(prevCategory ? { category: prevCategory } : {}),
      user_latitude: KATHMANDU_CENTER.lat,
      user_longitude: KATHMANDU_CENTER.lng,
      sort_by: 'closest',
    });

    (async () => {
      const geo = await requestUserGeolocationDetailed();
      if (geo.success) {
        setFilters({
          ...useTaskStore.getState().filters,
          user_latitude: geo.lat,
          user_longitude: geo.lng,
        });
        return;
      }

      const profileLat = user?.latitude != null ? Number(user.latitude) : NaN;
      const profileLng = user?.longitude != null ? Number(user.longitude) : NaN;
      if (Number.isFinite(profileLat) && Number.isFinite(profileLng)) {
        setFilters({
          ...useTaskStore.getState().filters,
          user_latitude: profileLat,
          user_longitude: profileLng,
        });
      }
    })();
  }, [setFilters, user?.latitude, user?.longitude]);

  const userMapCenter = useMemo((): [number, number] | null => {
    const lat = safeFilters.user_latitude;
    const lng = safeFilters.user_longitude;
    if (lat == null || lng == null) return null;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return [lat, lng];
  }, [safeFilters.user_latitude, safeFilters.user_longitude]);

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
    const marketplaceTasks = taskList.filter((task) => getListingKind(task) === 'task');
    const base = filterAndSortTasks(marketplaceTasks, safeFilters);
    // Hide completed listings from active browse (Make offer still blocked on own tasks in TaskDetails).
    return base.filter((task) => task.status !== 'completed');
  }, [taskList, filters]);

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
        verified: Boolean(nested.is_verified_tasker),
      };
    }

    return {
      name: task.owner_name || 'Unknown',
      avatar: getMediaUrl(task.owner_image),
      rating: task.owner_rating || 0,
      reviews: 0,
      verified: Boolean(task.owner_is_verified),
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
      !(lat === 0 && lng === 0)
    );
  };

  const cardUserCenter = useMemo(
    (): [number, number] =>
      userMapCenter ?? [KATHMANDU_CENTER.lat, KATHMANDU_CENTER.lng],
    [userMapCenter]
  );

  const getTaskCardProps = (task: Task) => {
    const poster = resolvePoster(task);
    const offerCount = task.bid_count ?? task.bids_count ?? 0;
    const coordinates = hasValidCoordinates(task)
      ? ([toCoord(task.latitude), toCoord(task.longitude)] as [number, number])
      : null;

    return {
      title: task.title || 'Untitled Task',
      status: task.status || 'open',
      statusLabel: formatTaskStatusLabel(task.status || 'open'),
      location: formatTaskLocationShort(task),
      coordinates,
      userCenter: cardUserCenter,
      distanceLabel: getStraightDistanceLabel(cardUserCenter, coordinates),
      price: taskBudgetAmount(task),
      dueDate: task.due_date ?? null,
      timeLabel: task.flexible_date ? 'Anytime' : 'Anytime',
      offerCount,
      user: {
        name: poster.name,
        avatar: poster.avatar,
        rating: poster.rating,
        verified: poster.verified,
      },
    };
  };

  const transformTasksForMap = (apiTasks?: Task[]) => {
    const normalizedTasks = Array.isArray(apiTasks) ? apiTasks : [];
    return normalizedTasks
      .map((task, browseOrder) => ({ task, browseOrder }))
      .filter(({ task }) => hasValidCoordinates(task))
      .map(({ task, browseOrder }) => {
      const categoryName = typeof task.category === 'string' 
        ? task.category 
        : task.category?.name || task.category_name || 'General';
      
      const poster = resolvePoster(task);
      const posterName = poster.name;
      const posterAvatar = poster.avatar;
      const posterRating = poster.rating;
      
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
        id: task.slug || task.id,
        slug: task.slug || task.id,
        title: task.title || 'Untitled Task',
        status: task.status || 'open',
        location: formatTaskLocationShort(task),
        coordinates: [toCoord(task.latitude), toCoord(task.longitude)] as [number, number],
        price: taskBudgetAmount(task),
        priceLabel: resolveMapMarkerPriceLabel(task),
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
          rating: posterRating,
          verified: poster.verified,
        }
      };
    });
  };

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
    <div className="mobile-bottom-nav-offset flex h-screen flex-col bg-surface md:pb-0">
      <Navbar />
      
      <main ref={mainRef} className="flex-1 flex overflow-hidden">
        {isSidebarVisible && (
          <div 
            className={`hidden lg:flex border-r border-outline-variant bg-white flex-col z-10 shadow-sm relative shrink-0 ${
              isCompactSidebar ? 'w-20' : ''
            }`}
            style={{ width: isCompactSidebar ? '80px' : `${sidebarWidth}px` }}
          >
            {isCompactSidebar ? (
              <div className="flex-1 overflow-y-auto py-6 scrollbar-thin scrollbar-thumb-outline-variant">
                {isLoading ? (
                  <TaskAvatarListSkeleton />
                ) : (
                  <div className="flex flex-col gap-4 items-center">
                    {filteredTaskList.map((task) => {
                      const poster = resolvePoster(task);
                      return (
                        <button
                          key={task.id}
                          onClick={() => handleViewTask(String(task.slug || task.id))}
                          className={`rounded-full border-2 transition-all hover:scale-110 ${
                            detailTaskId === (task.slug || task.id) ? 'border-brand-emerald shadow-lg' : 'border-outline-variant'
                          }`}
                          title={task.title}
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
              <div className="flex-1 overflow-y-auto px-10 py-6 scrollbar-thin scrollbar-thumb-outline-variant">
                {isLoading ? (
                  <TaskCardListSkeleton />
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
                            showOffersOnly
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
                          href={POST_TASK_PATH}
                          className="px-6 py-2 bg-brand-emerald text-white rounded-full font-semibold hover:bg-brand-emerald/90 transition-colors"
                        >
                          Post a Task
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {!isCompactSidebar && (
              <div 
                className={`absolute top-0 -right-1.5 w-3 h-full cursor-col-resize z-50 group flex items-center justify-center ${
                  isResizing ? 'bg-brand-emerald/20' : 'hover:bg-brand-emerald/10'
                }`}
                onMouseDown={() => setIsResizing(true)}
              >
                <div className={`w-0.5 h-12 rounded-full bg-outline-variant transition-colors group-hover:bg-brand-emerald ${
                  isResizing ? 'bg-brand-emerald' : ''
                }`} />
              </div>
            )}
          </div>
        )}

        <div className="flex flex-1 flex-col relative min-w-0 min-h-0 z-0">
          <FilterBar
            currentFilters={safeFilters}
            onFilterChange={handleFilterChange}
            categories={categories}
            categoriesLoaded={categoriesLoaded}
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
                userCenter={userMapCenter}
                radiusKm={safeFilters.distance_km ?? DEFAULT_TASK_RADIUS_KM}
                onUserLocationFound={(lat, lng) => {
                  setFilters({
                    ...useTaskStore.getState().filters,
                    user_latitude: lat,
                    user_longitude: lng,
                    distance_km:
                      useTaskStore.getState().filters?.distance_km ??
                      DEFAULT_TASK_RADIUS_KM,
                    sort_by:
                      useTaskStore.getState().filters?.sort_by ?? 'closest',
                  });
                }}
              />
            </div>

            {previewMapTask && (
              <TaskMapPreview
                task={previewMapTask}
                userCenter={userMapCenter}
                onClose={handleCloseMapPreview}
                onViewTask={() => handleViewTask(String(previewMapTask.slug || previewMapTask.id))}
              />
            )}

            <TaskBrowseMobileSheet
              snap={sheetSnap}
              onSnapChange={setSheetSnap}
              taskCount={filteredTaskList.length}
              hidden={Boolean(detailTask)}
            >
              {isLoading ? (
                <TaskCardListSkeleton count={4} />
              ) : filteredTaskList.length > 0 ? (
                <div className="flex flex-col gap-3 pb-2">
                  {filteredTaskList.map((task, index) => {
                    const cardProps = getTaskCardProps(task);
                    const taskKey = task.slug || task.id;
                    const sortKey = safeFilters.sort_by ?? 'newest';
                    return (
                      <TaskCard
                        key={`mobile-${task.id}-${sortKey}-${index}`}
                        {...cardProps}
                        showOffersOnly
                        isActive={detailTaskId === taskKey}
                        onClick={() => handleViewTask(taskKey)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center px-2 py-10 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-dim">
                    <SlidersHorizontal className="h-7 w-7 text-on-surface-variant" />
                  </div>
                  <h3 className="mb-2 text-base font-bold text-on-surface">
                    {taskList.length > 0
                      ? 'No tasks match your filters'
                      : 'No tasks available'}
                  </h3>
                  <p className="mb-4 text-sm text-on-surface-variant">
                    {taskList.length > 0
                      ? 'Try adjusting search or filters.'
                      : 'Be the first to post a task!'}
                  </p>
                  <a
                    href={POST_TASK_PATH}
                    className="rounded-full bg-brand-emerald px-6 py-2 font-semibold text-white hover:bg-brand-emerald/90"
                  >
                    Post a Task
                  </a>
                </div>
              )}
            </TaskBrowseMobileSheet>

            {!isLoading &&
              !detailTask &&
              filteredTaskList.length > 0 &&
              mappedTasks.length === 0 && (
                <div
                  className={`absolute inset-0 z-[25] flex items-center justify-center p-6 pb-32 pointer-events-none lg:pb-6 ${
                    sheetSnap === 'list' ? 'hidden lg:flex' : 'flex'
                  }`}
                >
                  <div className="pointer-events-auto max-w-sm rounded-2xl border border-outline-variant bg-white p-6 text-center shadow-xl">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-dim">
                      <MapPin className="h-6 w-6 text-on-surface-variant" />
                    </div>
                    <h3 className="mb-1 text-base font-bold text-on-surface">
                      Map pins unavailable
                    </h3>
                    <p className="text-sm text-on-surface-variant">
                      These tasks don&apos;t have saved map coordinates yet. Open a task
                      and use <span className="font-semibold">View map</span> to search by
                      address, or browse the list below.
                    </p>
                  </div>
                </div>
              )}

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

export default function TaskmapPage() {
  return (
    <Suspense
      fallback={
        <div className="mobile-bottom-nav-offset flex h-screen flex-col bg-surface md:pb-0">
          <Navbar />
          <main className="flex flex-1 overflow-hidden">
            <TaskMapSkeleton />
          </main>
        </div>
      }
    >
      <TaskmapPageContent />
    </Suspense>
  );
}
