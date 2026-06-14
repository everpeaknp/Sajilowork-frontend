'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  MapPin,
  FileText,
  ArrowUpRight,
  Calendar,
  Map,
} from 'lucide-react';
import { discoverBody, discoverHeadline, discoverMedium } from '@/components/LangingHome/landingTypography';
import { mapTaskToPublicProject } from '@/lib/projectApi';
import { getTaskDetailPath } from '@/lib/taskPageApi';
import { TASK_MAP_PATH } from '@/lib/taskBrowsePath';
import { getListingKind } from '@/lib/dashboardListingApi';
import {
  fetchPublicTasks,
  formatTaskBudgetLabel,
  formatTaskListDate,
  formatTaskOffersLabel,
  formatTaskTypeLabel,
  taskBrowseDisplayTags,
  taskListTitle,
} from '@/lib/taskBrowseApi';
import { filterAndSortTasks, hasActiveFilters } from '@/lib/taskFilters';
import { extractCategoryList } from '@/lib/taskUtils';
import { resolveEmployerProfileHref } from '@/components/employers/employerSlug';
import EmployerAvatarCircle from '@/components/employers/EmployerAvatarCircle';
import TaskBrowseFilterSidebar from '@/components/task/browse/TaskBrowseFilterSidebar';
import { MarketplaceBrowseRowListSkeleton } from '@/components/common/MarketplaceBrowseSkeletons';
import { taskService } from '@/services/task.service';
import type { Category, SearchFilters, Task } from '@/types';

interface TaskListProps {
  searchQuery?: string;
  searchLocation?: string;
  categoryFromUrl?: string;
  onClearSearch?: () => void;
}

export default function TaskList({
  searchQuery = '',
  searchLocation = '',
  categoryFromUrl = '',
  onClearSearch,
}: TaskListProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [alertText, setAlertText] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadingTasks(true);
    void fetchPublicTasks()
      .then((items) => {
        if (cancelled) return;
        setTasks(items);
      })
      .catch(() => {
        if (!cancelled) setTasks([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingTasks(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void taskService
      .getCategories()
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) {
          setCategories(extractCategoryList(res.data));
        }
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setFilters((prev) => {
      const next: SearchFilters = { ...prev };
      let changed = false;

      if (searchQuery.trim()) {
        if (next.query !== searchQuery.trim()) {
          next.query = searchQuery.trim();
          changed = true;
        }
      } else if (next.query && !searchQuery.trim()) {
        next.query = undefined;
        changed = true;
      }

      if (searchLocation.trim()) {
        if (next.location !== searchLocation.trim()) {
          next.location = searchLocation.trim();
          changed = true;
        }
      }

      if (categoryFromUrl.trim()) {
        if (next.category !== categoryFromUrl.trim()) {
          next.category = categoryFromUrl.trim();
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [searchQuery, searchLocation, categoryFromUrl]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const triggerAlert = (text: string) => {
    setAlertText(text);
    setTimeout(() => setAlertText(null), 3500);
  };

  const filteredTasks = useMemo(
    () => filterAndSortTasks(tasks.filter((task) => getListingKind(task) === 'task'), filters),
    [tasks, filters],
  );

  const itemsPerPage = 8;
  const totalTasks = filteredTasks.length;
  const totalPages = Math.max(1, Math.ceil(totalTasks / itemsPerPage));
  const startIdx = totalTasks === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalTasks);

  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTasks.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTasks, currentPage]);

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }

    return pages.map((p, idx) => {
      if (p === '...') {
        return (
          <span
            key={`dots-${idx}`}
            className={`${discoverBody} select-none px-2 text-sm text-neutral-400`}
          >
            ...
          </span>
        );
      }
      const isCurrent = currentPage === p;
      return (
        <button
          key={`page-${p}`}
          type="button"
          onClick={() => setCurrentPage(p as number)}
          className={`${discoverMedium} flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[14.5px] transition-all ${
            isCurrent
              ? 'bg-[#52C47F] font-semibold text-white'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          {p}
        </button>
      );
    });
  };

  const hasHeroSearch = Boolean(searchQuery.trim() || searchLocation.trim());
  const activeSearchLabel =
    searchQuery.trim() && searchLocation.trim()
      ? `${searchQuery.trim()} (${searchLocation.trim()})`
      : searchQuery.trim() || searchLocation.trim();

  const resetAllFilters = () => {
    setFilters({});
    onClearSearch?.();
    triggerAlert('All filters have been reset.');
  };

  return (
    <section
      id="custom-task-board-grid"
      className="w-full select-none border-b border-gray-100 bg-white px-4 pb-12 pt-0 sm:px-6 sm:pt-2 md:px-8 lg:px-12"
    >
      <div className="mx-auto w-full max-w-none">
        <AnimatePresence>
          {alertText ? (
            <motion.div
              className="fixed bottom-20 left-4 right-4 z-50 flex items-center gap-3 rounded-xl border border-[#52C47F]/25 bg-[#1D3E35] px-5 py-3.5 text-white shadow-xl sm:bottom-8 sm:left-auto sm:right-8 sm:w-auto sm:px-6"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#52C47F]/20 text-white">
                <Check className="h-3.5 w-3.5 text-[#52C47F]" strokeWidth={3} />
              </div>
              <p className={`${discoverMedium} text-[13.5px] tracking-wide`}>{alertText}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-4">
          <TaskBrowseFilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            categories={categories}
            categoriesLoaded={categoriesLoaded}
            onClearAll={onClearSearch}
          />

          <div className="space-y-5 lg:col-span-3">
            <div className="mb-5 flex min-h-[40px] flex-wrap items-center justify-between gap-3">
              <p className={`${discoverBody} text-base font-medium text-neutral-800`}>
                <span className={`${discoverMedium} font-bold text-neutral-900`}>{totalTasks}</span>{' '}
                tasks available
              </p>

              <Link
                href={TASK_MAP_PATH}
                className={`${discoverMedium} inline-flex items-center gap-1.5 text-sm font-semibold text-[#52C47F] transition-opacity hover:opacity-80`}
              >
                <Map className="h-4 w-4" />
                View task map
              </Link>
            </div>

            {hasHeroSearch ? (
              <div className="mb-4 flex flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50/80 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                <p className={`${discoverBody} text-sm text-neutral-600`}>
                  Showing task matches for{' '}
                  <span className={`${discoverMedium} text-[#1D3E35]`}>&quot;{activeSearchLabel}&quot;</span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClearSearch?.();
                    setFilters((prev) => ({ ...prev, query: undefined, location: undefined }));
                    triggerAlert('Search cleared.');
                  }}
                  className={`${discoverMedium} cursor-pointer text-sm text-[#52C47F] transition-opacity hover:opacity-80`}
                >
                  Clear search
                </button>
              </div>
            ) : null}

            {loadingTasks ? (
              <MarketplaceBrowseRowListSkeleton count={4} />
            ) : filteredTasks.length === 0 ? (
              <div className="w-full rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-16 text-center">
                <AlertCircle className="mx-auto mb-3 h-10 w-10 text-neutral-300" />
                <span className={`${discoverHeadline} mb-1 block text-lg font-bold text-[#1D3E35]`}>
                  No matching tasks found
                </span>
                <p className={`${discoverBody} mx-auto mb-6 max-w-sm text-xs text-neutral-500`}>
                  {hasHeroSearch || hasActiveFilters(filters)
                    ? 'No tasks match your search or filters. Try adjusting them or clear all.'
                    : 'There are no available tasks right now.'}
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className={`${discoverMedium} inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#52C47F] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#41a668]`}
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {paginatedTasks.map((task) => {
                    const project = mapTaskToPublicProject(task);
                    const employerHref = resolveEmployerProfileHref({
                      employerSlug: project.employerSlug,
                      companyName: project.companyName,
                      allowDemoLookup: false,
                    });
                    const displaySkills = taskBrowseDisplayTags(task, categories);

                    const employerAvatar = (
                      <EmployerAvatarCircle
                        name={project.employerLogoText || project.companyName}
                        avatarUrl={project.ownerAvatarUrl}
                        avatarBg={project.companyLogoBg}
                        verified={project.verified}
                        useDemoIcon={false}
                        iconType={project.companyIconType}
                      />
                    );

                    return (
                      <motion.div
                        layout
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div
                          role="link"
                          tabIndex={0}
                          onClick={() => router.push(getTaskDetailPath(task))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              router.push(getTaskDetailPath(task));
                            }
                          }}
                          className="group relative box-border flex w-full shrink-0 cursor-pointer flex-col overflow-hidden rounded-[8px] border border-neutral-200/90 bg-white p-4 transition-all duration-300 hover:shadow-[0_4px_14px_rgba(0,0,0,0.05)] sm:p-6 lg:h-[248px] lg:min-h-[248px] lg:max-h-[248px] lg:w-full lg:flex-row lg:items-stretch"
                        >
                          <div className="flex min-h-0 min-w-0 flex-1 gap-3 overflow-hidden sm:gap-5">
                            {employerHref ? (
                              <Link
                                href={employerHref}
                                className="relative shrink-0 select-none transition-opacity hover:opacity-80"
                                onClick={(e) => e.stopPropagation()}
                                title={project.companyName}
                              >
                                {employerAvatar}
                              </Link>
                            ) : (
                              <div className="relative shrink-0 select-none" title={project.companyName}>
                                {employerAvatar}
                              </div>
                            )}

                            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                              <div className="flex items-start justify-between gap-2">
                                <h3
                                  className={`${discoverBody} block line-clamp-2 text-base !font-normal leading-snug text-black transition-colors group-hover:text-[#52C47F] sm:truncate sm:text-[18.5px]`}
                                >
                                  {taskListTitle(task)}
                                </h3>
                              </div>

                              <div
                                className={`${discoverBody} mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-normal text-neutral-700 sm:gap-x-0 sm:text-[13px]`}
                              >
                                <span className="flex items-center gap-1.5">
                                  <MapPin className="h-4 w-4 stroke-[1.6] text-neutral-500" />
                                  {project.locationLabel || project.location}
                                </span>
                                <span className="hidden select-none font-light text-neutral-300 sm:mx-3.5 sm:inline">|</span>
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="h-4 w-4 stroke-[1.6] text-neutral-500" />
                                  {formatTaskListDate(task)}
                                </span>
                                <span className="hidden select-none font-light text-neutral-300 sm:mx-3.5 sm:inline">|</span>
                                <span className="flex items-center gap-1.5">
                                  <FileText className="h-4 w-4 stroke-[1.6] text-neutral-500" />
                                  {formatTaskOffersLabel(task)}
                                </span>
                              </div>

                              <p
                                className={`${discoverBody} mb-3 mt-3 line-clamp-2 max-w-[620px] text-[13.5px] font-normal leading-relaxed text-black`}
                              >
                                {project.description}
                              </p>

                              <div className="mt-auto flex max-h-[34px] flex-wrap gap-1.5 overflow-hidden pt-0.5 select-none">
                                {displaySkills.map((skill) => (
                                  <span
                                    key={skill}
                                    className={`${discoverBody} rounded-full bg-[#ffede8] px-4 py-1.5 text-[14px] font-normal text-black`}
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="relative mt-4 shrink-0 border-t border-neutral-100 pt-4 sm:pt-5 lg:mt-0 lg:flex lg:w-auto lg:self-stretch lg:border-0 lg:border-l lg:border-neutral-200 lg:pl-8 lg:pt-0">
                            <div className="flex h-full w-full min-w-0 flex-col items-stretch justify-between gap-4 sm:items-end lg:min-w-[260px]">
                              <div className="w-full text-left sm:text-right">
                                <span
                                  className={`${discoverBody} block text-lg font-normal leading-none tracking-tight text-black sm:text-[21px]`}
                                >
                                  {formatTaskBudgetLabel(task)}
                                </span>
                                <span
                                  className={`${discoverBody} mt-1.5 block text-[13px] font-normal text-neutral-700`}
                                >
                                  {formatTaskTypeLabel(task)}
                                </span>
                              </div>

                              <span
                                className={`${discoverBody} group/btn relative flex h-auto w-full shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[6px] bg-[#ebf8f2] px-8 py-2.5 text-[16px] font-normal text-[#52C47F] transition-colors duration-300 group-hover/btn:text-white lg:min-w-[250px]`}
                              >
                                <span
                                  aria-hidden
                                  className="absolute inset-0 origin-bottom-left scale-0 bg-[#113E30] transition-transform duration-300 ease-out group-hover/btn:scale-100"
                                />
                                <span className="relative z-10 flex items-center justify-center gap-2.5">
                                  <span>Make offer</span>
                                  <ArrowUpRight className="h-4.5 w-4.5 shrink-0 stroke-[2.5] text-current transition-colors duration-300" />
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            {!loadingTasks && filteredTasks.length > 0 ? (
              <div className="flex flex-col items-center justify-center pb-4 pt-8">
                <div className="flex w-full max-w-full items-center justify-center gap-2 overflow-x-auto px-1 pb-1 sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-35 sm:h-10 sm:w-10"
                    title="Previous page"
                  >
                    <ChevronLeft className="h-4.5 w-4.5" />
                  </button>
                  <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">{renderPageNumbers()}</div>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-35 sm:h-10 sm:w-10"
                    title="Next page"
                  >
                    <ChevronRight className="h-4.5 w-4.5" />
                  </button>
                </div>
                <div
                  className={`${discoverBody} mt-3 text-center text-xs font-medium text-zinc-400 sm:mt-3.5 sm:text-[13.5px]`}
                >
                  Showing {startIdx} – {endIdx} of {totalTasks} tasks available
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
