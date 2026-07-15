'use client';

import { useState, useMemo, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { SlidersHorizontal, MapPin } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import Navbar from '@/components/common/navbar';
import UserAvatar from '@/components/common/UserAvatar';
import ProjectMapFilterBar from '@/components/projects/ProjectMapFilterBar';
import ProjectMapCard from '@/components/projects/ProjectMapCard';
import ProjectDetails from '@/components/projects/ProjectDetails';
import ProjectMapPreview from '@/components/projects/ProjectMapPreview';
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
import { getDashboardCreateHref } from '@/app/dashboard/dashboardTabs';
import { mapTaskToPublicProject } from '@/lib/projectApi';
import {
  applyProjectMapFilters,
  DEFAULT_PROJECT_MAP_FILTERS,
  type ProjectMapFilters,
} from '@/lib/projectMapFilters';
import { searchBrowseProjectTasks } from '@/lib/listingSearchApi';
import { taskBudgetAmount } from '@/lib/taskFilters';
import { resolveMapMarkerPriceLabel } from '@/lib/mapMarkerPrice';
import { formatTaskLocationShort } from '@/lib/nepalLocale';
import { extractTaskList } from '@/lib/taskUtils';
import {
  DEFAULT_TASK_RADIUS_KM,
  KATHMANDU_CENTER,
  requestUserGeolocationDetailed,
} from '@/lib/userGeolocation';
import { getMediaUrl } from '@/lib/utils';
import { projectService } from '@/services/project.service';
import type { Task } from '@/types';
import type { Project } from '@/components/projects/projectListData';
import type { Task as MapTask } from '@/components/task/types';

const MapView = dynamic(() => import('@/components/task/MapView'), {
  ssr: false,
  loading: () => <TaskMapSkeleton />,
});

function toCoord(raw: unknown): number {
  if (raw === null || raw === undefined || raw === '') return NaN;
  if (typeof raw === 'number') return raw;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function hasValidCoordinates(task: Task): boolean {
  const lat = toCoord(task.latitude);
  const lng = toCoord(task.longitude);
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

function resolveEmployer(task: Task) {
  const nested =
    (task.owner && typeof task.owner === 'object' ? task.owner : null) ||
    null;

  if (nested) {
    const name =
      `${nested.first_name || ''} ${nested.last_name || ''}`.trim() ||
      task.owner_business_name ||
      task.owner_name ||
      'Employer';
    return {
      name,
      avatar: getMediaUrl(nested.profile_image || task.owner_image),
      verified: Boolean(nested.is_verified_tasker || task.owner_is_verified),
    };
  }

  return {
    name: task.owner_business_name || task.owner_name || 'Employer',
    avatar: getMediaUrl(task.owner_image),
    verified: Boolean(task.owner_is_verified),
  };
}

function isOpenProject(task: Task): boolean {
  return task.status !== 'completed' && task.status !== 'cancelled';
}

function ProjectmapPageContent() {
  const searchParams = useSearchParams();
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);
  const [detailProjectSlug, setDetailProjectSlug] = useState<string | null>(null);
  const [isCompactSidebar, setIsCompactSidebar] = useState(false);
  const [sheetSnap, setSheetSnap] = useState<BrowseSheetSnap>('map');
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ProjectMapFilters>(() => ({
    ...DEFAULT_PROJECT_MAP_FILTERS,
    user_latitude: KATHMANDU_CENTER.lat,
    user_longitude: KATHMANDU_CENTER.lng,
  }));

  const { user } = useAuth();
  const mapCenterInitialized = useRef(false);
  const { isSidebarVisible, setIsSidebarVisible, sidebarWidth, isResizing, setIsResizing, mainRef } =
    useSidebar();

  useEffect(() => {
    if (mapCenterInitialized.current) return;
    mapCenterInitialized.current = true;

    const categoryFromUrl = searchParams.get('category')?.trim();
    if (categoryFromUrl) {
      setFilters((prev) => ({ ...prev, category: categoryFromUrl }));
    }

    (async () => {
      const geo = await requestUserGeolocationDetailed();
      if (geo.success) {
        setFilters((prev) => ({
          ...prev,
          user_latitude: geo.lat,
          user_longitude: geo.lng,
        }));
        return;
      }

      const profileLat = user?.latitude != null ? Number(user.latitude) : NaN;
      const profileLng = user?.longitude != null ? Number(user.longitude) : NaN;
      if (Number.isFinite(profileLat) && Number.isFinite(profileLng)) {
        setFilters((prev) => ({
          ...prev,
          user_latitude: profileLat,
          user_longitude: profileLng,
        }));
      }
    })();
  }, [searchParams, user?.latitude, user?.longitude]);

  const userMapCenter = useMemo((): [number, number] | null => {
    const lat = filters.user_latitude;
    const lng = filters.user_longitude;
    if (lat == null || lng == null) return null;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return [lat, lng];
  }, [filters.user_latitude, filters.user_longitude]);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await projectService.getProjects({ page_size: 200 });
      if (response.success && response.data) {
        setProjectTasks(extractTaskList(response.data).filter(isOpenProject));
        return;
      }

      const result = await searchBrowseProjectTasks({
        page: 1,
        page_size: 200,
        sort_by: 'newest',
      });
      setProjectTasks(result.items.filter(isOpenProject));
    } catch {
      try {
        const result = await searchBrowseProjectTasks({
          page: 1,
          page_size: 200,
          sort_by: 'newest',
        });
        setProjectTasks(result.items.filter(isOpenProject));
      } catch {
        toast.error('Failed to load projects');
        setProjectTasks([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    const category = searchParams.get('category')?.trim();
    if (!category) return;
    setFilters((prev) => (prev.category === category ? prev : { ...prev, category }));
  }, [searchParams]);

  const handleFilterChange = useCallback((next: ProjectMapFilters) => {
    setFilters(next);
  }, []);

  const filteredProjectTasks = useMemo(
    () => applyProjectMapFilters(projectTasks, filters),
    [projectTasks, filters],
  );

  const projectByKey = useMemo(() => {
    const map = new Map<string, Project>();
    for (const task of filteredProjectTasks) {
      const project = mapTaskToPublicProject(task);
      const key = String(task.slug || task.id);
      map.set(key, project);
    }
    return map;
  }, [filteredProjectTasks]);

  const browseTasksOrderKey = useMemo(
    () =>
      `${filters.sortBy ?? 'newest'}|${filteredProjectTasks
        .map((t) => String(t.id))
        .join(',')}`,
    [filteredProjectTasks, filters.sortBy],
  );

  const findTaskByKey = useCallback(
    (taskKey: string | null) => {
      if (!taskKey) return null;
      return (
        filteredProjectTasks.find((t) => t.id === taskKey || t.slug === taskKey) ||
        projectTasks.find((t) => t.id === taskKey || t.slug === taskKey) ||
        null
      );
    },
    [filteredProjectTasks, projectTasks],
  );

  const handleViewProject = useCallback((taskKey: string) => {
    const task = findTaskByKey(taskKey);
    const slug = task?.slug || taskKey;
    setFocusedTaskId(taskKey);
    setDetailProjectSlug(String(slug));
    setSheetSnap('map');
  }, [findTaskByKey]);

  const handleTaskFocus = useCallback((taskKey: string) => {
    setFocusedTaskId(taskKey);
    setDetailProjectSlug(null);
    setSheetSnap('map');
  }, []);

  const cardUserCenter = useMemo(
    (): [number, number] => userMapCenter ?? [KATHMANDU_CENTER.lat, KATHMANDU_CENTER.lng],
    [userMapCenter],
  );

  const mapSortBy = filters.sortBy === 'closest' ? 'closest' : filters.sortBy ?? 'newest';
  const mapRadiusKm =
    filters.distance_km != null && filters.distance_km < 100
      ? filters.distance_km
      : DEFAULT_TASK_RADIUS_KM;

  const transformTasksForMap = (apiTasks: Task[]): MapTask[] =>
    apiTasks
      .map((task, browseOrder) => ({ task, browseOrder }))
      .filter(({ task }) => hasValidCoordinates(task))
      .map(({ task, browseOrder }) => {
        const employer = resolveEmployer(task);
        const categoryName =
          typeof task.category === 'string'
            ? task.category
            : task.category?.name || task.category_name || 'General';

        let postedDate = new Date();
        let dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        try {
          if (task.created_at) {
            const parsed = new Date(task.created_at);
            if (!Number.isNaN(parsed.getTime())) postedDate = parsed;
          }
        } catch {
          /* ignore */
        }
        try {
          if (task.due_date) {
            const parsed = new Date(task.due_date);
            if (!Number.isNaN(parsed.getTime())) dueDate = parsed;
          }
        } catch {
          /* ignore */
        }

        return {
          id: task.slug || task.id,
          slug: task.slug || task.id,
          title: task.title || 'Untitled Project',
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
          user: {
            name: employer.name,
            avatar: employer.avatar,
            rating: task.owner_rating || 0,
            verified: employer.verified,
          },
        };
      });

  const mappedTasks = useMemo(
    () => transformTasksForMap(filteredProjectTasks),
    [filteredProjectTasks, browseTasksOrderKey],
  );

  const previewEntry = useMemo(() => {
    if (!focusedTaskId || detailProjectSlug) return null;
    const mapTask = mappedTasks.find(
      (t) => String(t.id) === String(focusedTaskId) || String(t.slug) === String(focusedTaskId),
    );
    if (!mapTask) return null;
    const project = projectByKey.get(String(focusedTaskId)) ?? projectByKey.get(String(mapTask.slug));
    if (!project) return null;
    return { project, mapTask };
  }, [focusedTaskId, detailProjectSlug, mappedTasks, projectByKey]);

  const postProjectHref = getDashboardCreateHref('project');

  return (
    <div className="mobile-bottom-nav-offset flex h-screen flex-col bg-surface dark:bg-neutral-950 md:pb-0">
      <Navbar />

      <main ref={mainRef} className="flex flex-1 overflow-hidden">
        {isSidebarVisible && (
          <div
            className={`relative z-10 hidden shrink-0 flex-col border-r border-outline-variant bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 lg:flex ${
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
                    {filteredProjectTasks.map((task) => {
                      const employer = resolveEmployer(task);
                      const taskKey = String(task.slug || task.id);
                      return (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => handleViewProject(taskKey)}
                          className={`rounded-full border-2 transition-all hover:scale-110 ${
                            detailProjectSlug === task.slug || detailProjectSlug === taskKey
                              ? 'border-brand-emerald shadow-lg'
                              : 'border-outline-variant'
                          }`}
                          title={task.title}
                        >
                          <UserAvatar
                            src={employer.avatar}
                            alt={employer.name}
                            name={employer.name}
                            size="md"
                            verified={employer.verified}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="scrollbar-thin scrollbar-thumb-outline-variant flex-1 overflow-y-auto px-6 py-6 lg:px-8">
                {isLoading ? (
                  <TaskCardListSkeleton />
                ) : (
                  <div className="flex flex-col gap-3 pb-2">
                    {filteredProjectTasks.length > 0 ? (
                      filteredProjectTasks.map((task) => {
                        const taskKey = String(task.slug || task.id);
                        const project = projectByKey.get(taskKey);
                        if (!project) return null;
                        const coordinates = hasValidCoordinates(task)
                          ? ([toCoord(task.latitude), toCoord(task.longitude)] as [number, number])
                          : null;
                        return (
                          <ProjectMapCard
                            key={`${task.id}-${filters.sortBy ?? 'newest'}`}
                            project={project}
                            coordinates={coordinates}
                            userCenter={cardUserCenter}
                            isActive={detailProjectSlug === task.slug || detailProjectSlug === taskKey}
                            onClick={() => handleViewProject(taskKey)}
                          />
                        );
                      })
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-dim dark:bg-neutral-800">
                          <SlidersHorizontal className="h-8 w-8 text-on-surface-variant" />
                        </div>
                        <h3 className="mb-2 text-lg font-bold text-on-surface dark:text-stone-100">
                          {projectTasks.length > 0 ? 'No projects match your filters' : 'No projects available'}
                        </h3>
                        <p className="mb-4 font-sans text-sm font-normal leading-5 text-on-surface-variant">
                          {projectTasks.length > 0
                            ? 'Try adjusting search, category, budget, or location filters.'
                            : 'There are currently no projects posted. Be the first to post a project!'}
                        </p>
                        <a
                          href={postProjectHref}
                          className="rounded-full bg-brand-emerald px-6 py-2 font-semibold text-white transition-colors hover:bg-brand-emerald/90"
                        >
                          Post a Project
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {!isCompactSidebar && (
              <div
                className={`absolute -right-1.5 top-0 z-50 flex h-full w-3 cursor-col-resize items-center justify-center group ${
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
            )}
          </div>
        )}

        <div className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col">
          <ProjectMapFilterBar
            currentFilters={filters}
            onFilterChange={handleFilterChange}
            projectCount={filteredProjectTasks.length}
            isSidebarVisible={isSidebarVisible}
            onToggleSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
            isCompactSidebar={isCompactSidebar}
            onToggleCompact={() => setIsCompactSidebar(!isCompactSidebar)}
          />

          <div className="relative min-h-0 flex-1 overflow-hidden bg-surface-dim">
            <div className="absolute inset-0">
              <MapView
                tasks={mappedTasks}
                tasksOrderKey={browseTasksOrderKey}
                sortBy={mapSortBy}
                focusTaskId={focusedTaskId}
                onTaskFocus={(id) => handleTaskFocus(String(id))}
                userCenter={userMapCenter}
                radiusKm={mapRadiusKm}
                onUserLocationFound={(lat, lng) => {
                  setFilters((prev) => ({
                    ...prev,
                    user_latitude: lat,
                    user_longitude: lng,
                  }));
                }}
              />
            </div>

            {previewEntry ? (
              <ProjectMapPreview
                project={previewEntry.project}
                mapTask={previewEntry.mapTask}
                userCenter={userMapCenter}
                onClose={() => setFocusedTaskId(null)}
                onViewProject={() =>
                  handleViewProject(String(previewEntry.mapTask.slug || previewEntry.mapTask.id))
                }
              />
            ) : null}

            <TaskBrowseMobileSheet
              snap={sheetSnap}
              onSnapChange={setSheetSnap}
              taskCount={filteredProjectTasks.length}
              hidden={Boolean(detailProjectSlug)}
              countLabel="projects"
            >
              {isLoading ? (
                <TaskCardListSkeleton count={4} />
              ) : filteredProjectTasks.length > 0 ? (
                <div className="flex flex-col gap-3 pb-2">
                  {filteredProjectTasks.map((task) => {
                    const taskKey = String(task.slug || task.id);
                    const project = projectByKey.get(taskKey);
                    if (!project) return null;
                    const coordinates = hasValidCoordinates(task)
                      ? ([toCoord(task.latitude), toCoord(task.longitude)] as [number, number])
                      : null;
                    return (
                      <ProjectMapCard
                        key={`mobile-${task.id}`}
                        project={project}
                        coordinates={coordinates}
                        userCenter={cardUserCenter}
                        isActive={detailProjectSlug === task.slug || detailProjectSlug === taskKey}
                        onClick={() => handleViewProject(taskKey)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center px-2 py-10 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-dim dark:bg-neutral-800">
                    <SlidersHorizontal className="h-7 w-7 text-on-surface-variant" />
                  </div>
                  <h3 className="mb-2 text-base font-bold text-on-surface dark:text-stone-100">
                    {projectTasks.length > 0 ? 'No projects match your filters' : 'No projects available'}
                  </h3>
                  <p className="mb-4 text-sm text-on-surface-variant">
                    {projectTasks.length > 0 ? 'Try adjusting search or project filters.' : 'Be the first to post a project!'}
                  </p>
                  <a
                    href={postProjectHref}
                    className="rounded-full bg-brand-emerald px-6 py-2 font-semibold text-white hover:bg-brand-emerald/90"
                  >
                    Post a Project
                  </a>
                </div>
              )}
            </TaskBrowseMobileSheet>

            {!isLoading &&
              !detailProjectSlug &&
              filteredProjectTasks.length > 0 &&
              mappedTasks.length === 0 && (
                <div
                  className={`pointer-events-none absolute inset-0 z-[25] flex items-center justify-center p-6 pb-32 lg:pb-6 ${
                    sheetSnap === 'list' ? 'hidden lg:flex' : 'flex'
                  }`}
                >
                  <div className="pointer-events-auto max-w-sm rounded-2xl border border-outline-variant bg-white p-6 text-center shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-dim dark:bg-neutral-800">
                      <MapPin className="h-6 w-6 text-on-surface-variant" />
                    </div>
                    <h3 className="mb-1 text-base font-bold text-on-surface dark:text-stone-100">Map pins unavailable</h3>
                    <p className="text-sm text-on-surface-variant">
                      These projects don&apos;t have saved map coordinates yet. Browse the list below or
                      open a project for full details.
                    </p>
                  </div>
                </div>
              )}

            <AnimatePresence mode="wait">
              {detailProjectSlug ? (
                <ProjectDetails key={detailProjectSlug} projectSlug={detailProjectSlug} onClose={() => setDetailProjectSlug(null)} />
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProjectmapPage() {
  return (
    <Suspense
      fallback={
        <div className="mobile-bottom-nav-offset flex h-screen flex-col bg-surface dark:bg-neutral-950 md:pb-0">
          <Navbar />
          <main className="flex flex-1 overflow-hidden">
            <TaskMapSkeleton />
          </main>
        </div>
      }
    >
      <ProjectmapPageContent />
    </Suspense>
  );
}
