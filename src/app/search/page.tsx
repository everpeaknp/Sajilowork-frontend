'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Search, User } from 'lucide-react';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import UserAvatar from '@/components/common/UserAvatar';
import {
  searchService,
  type SearchTaskResult,
  type SearchTaskerResult,
} from '@/services/search.service';
import { TASK_BROWSE_PATH } from '@/lib/taskBrowsePath';
import { formatNPR } from '@/lib/nepalLocale';
import { formatTaskDisplayTitle } from '@/lib/taskUtils';

type Tab = 'tasks' | 'taskers';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = (searchParams.get('q') || '').trim();
  const tabParam = searchParams.get('tab');
  const [tab, setTab] = useState<Tab>(tabParam === 'taskers' ? 'taskers' : 'tasks');
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<SearchTaskResult[]>([]);
  const [taskers, setTaskers] = useState<SearchTaskerResult[]>([]);
  const [total, setTotal] = useState(0);

  const runSearch = useCallback(async () => {
    if (!q) {
      setTasks([]);
      setTaskers([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      if (tab === 'tasks') {
        const data = await searchService.searchTasks(q, { page_size: 24, listing_kind: 'task' });
        const list = Array.isArray(data?.results) ? (data!.results as SearchTaskResult[]) : [];
        setTasks(list);
        setTotal(data?.total_results ?? list.length);
      } else {
        const data = await searchService.searchTaskers(q, { page_size: 24 });
        const list = Array.isArray(data?.results) ? (data!.results as SearchTaskerResult[]) : [];
        setTaskers(list);
        setTotal(data?.total_results ?? list.length);
      }
    } catch {
      setTasks([]);
      setTaskers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [q, tab]);

  useEffect(() => {
    void runSearch();
  }, [runSearch]);

  const switchTab = (next: Tab) => {
    setTab(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', next);
    router.replace(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0a1452] dark:text-stone-100">Search results</h1>
            {q ? (
              <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
                {total} result{total === 1 ? '' : 's'} for &ldquo;{q}&rdquo;
              </p>
            ) : (
              <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">Enter a search term from the navbar.</p>
            )}
          </div>
          <div className="flex rounded-full bg-white p-1 shadow-sm dark:bg-neutral-900 dark:border dark:border-neutral-800">
            <button
              type="button"
              onClick={() => switchTab('tasks')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === 'tasks'
                  ? 'bg-[#005fff] text-white'
                  : 'text-gray-600 hover:text-[#005fff] dark:text-neutral-400 dark:hover:text-stone-100'
              }`}
            >
              Tasks
            </button>
            <button
              type="button"
              onClick={() => switchTab('taskers')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === 'taskers'
                  ? 'bg-[#005fff] text-white'
                  : 'text-gray-600 hover:text-[#005fff] dark:text-neutral-400 dark:hover:text-stone-100'
              }`}
            >
              Taskers
            </button>
          </div>
        </div>

        {!q && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-transparent bg-white py-16 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <Search className="mb-3 h-10 w-10 text-gray-300 dark:text-neutral-500" />
            <p className="text-gray-600 dark:text-neutral-400">Use the search bar to find tasks and taskers.</p>
            <Link href={TASK_BROWSE_PATH} className="mt-4 text-sm font-semibold text-[#005fff] hover:underline">
              Browse all tasks
            </Link>
          </div>
        )}

        {q && loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#005fff]" />
          </div>
        )}

        {q && !loading && tab === 'tasks' && (
          <ul className="space-y-3">
            {tasks.length === 0 ? (
              <li className="rounded-2xl border border-transparent bg-white p-8 text-center text-gray-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                No tasks found.
              </li>
            ) : (
              tasks.map((task) => (
                <li key={task.id}>
                  <Link
                    href={`/task/${task.slug || task.id}`}
                    className="block rounded-2xl border border-transparent bg-white p-5 transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-bold text-[#0a1452] dark:text-stone-100">
                          {formatTaskDisplayTitle(task.title)}
                        </h2>
                        {task.category_name && (
                          <p className="mt-1 text-xs font-medium text-gray-400 dark:text-neutral-500">{task.category_name}</p>
                        )}
                        {task.location && (
                          <p className="mt-2 text-sm text-gray-500 dark:text-neutral-400">{task.location}</p>
                        )}
                      </div>
                      <p className="shrink-0 text-lg font-bold text-[#005fff]">
                        {formatNPR(Number(task.budget))}
                      </p>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        )}

        {q && !loading && tab === 'taskers' && (
          <ul className="space-y-3">
            {taskers.length === 0 ? (
              <li className="rounded-2xl border border-transparent bg-white p-8 text-center text-gray-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                No taskers found.
              </li>
            ) : (
              taskers.map((tasker) => {
                const name =
                  `${tasker.first_name || ''} ${tasker.last_name || ''}`.trim() || tasker.email || 'Tasker';
                return (
                  <li key={tasker.id}>
                    <Link
                      href={`/users/${tasker.id}`}
                      className="flex items-center gap-4 rounded-2xl border border-transparent bg-white p-5 transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
                    >
                      <UserAvatar
                        name={name}
                        size="md"
                        verified={tasker.is_verified_tasker}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[#0a1452] dark:text-stone-100">{name}</p>
                        {tasker.tagline && (
                          <p className="truncate text-sm text-gray-500 dark:text-neutral-400">{tasker.tagline}</p>
                        )}
                        {tasker.average_rating != null && (
                          <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">
                            ★ {Number(tasker.average_rating).toFixed(1)}
                            {tasker.total_reviews != null ? ` (${tasker.total_reviews} reviews)` : ''}
                          </p>
                        )}
                      </div>
                      <User className="h-5 w-5 shrink-0 text-gray-300 dark:text-neutral-500" />
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-neutral-950">
          <Loader2 className="h-8 w-8 animate-spin text-[#005fff]" />
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
