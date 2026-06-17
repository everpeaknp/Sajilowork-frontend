'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Users } from 'lucide-react';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';
import PublicUserDirectoryCard from '@/components/users/PublicUserDirectoryCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { userService, type UserDirectoryEntry } from '@/services/user.service';
import { getUserProfileHref } from '@/lib/taskUtils';
import { UserDirectoryGridSkeleton } from '@/components/users/UserDirectorySkeletons';

type RoleFilter = 'all' | 'tasker' | 'customer';
type SortFilter = 'rating' | 'tasks' | 'newest' | 'name';

export default function UserDirectory() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const [role, setRole] = useState<RoleFilter>(
    (searchParams.get('role') as RoleFilter) || 'all'
  );
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [minRating, setMinRating] = useState(searchParams.get('min_rating') || '');
  const [verifiedOnly, setVerifiedOnly] = useState(
    searchParams.get('verified_only') === 'true'
  );
  const [sortBy, setSortBy] = useState<SortFilter>(
    (searchParams.get('sort_by') as SortFilter) || 'rating'
  );

  const [users, setUsers] = useState<UserDirectoryEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    const q = searchInput.trim();
    if (q) params.set('q', q);
    if (role !== 'all') params.set('role', role);
    if (city.trim()) params.set('city', city.trim());
    if (minRating) params.set('min_rating', minRating);
    if (verifiedOnly) params.set('verified_only', 'true');
    if (sortBy !== 'rating') params.set('sort_by', sortBy);
    if (page > 1) params.set('page', String(page));
    return params.toString();
  }, [searchInput, role, city, minRating, verifiedOnly, sortBy, page]);

  const syncUrl = useCallback(() => {
    const next = queryString ? `/users?${queryString}` : '/users';
    router.replace(next, { scroll: false });
  }, [queryString, router]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userService.getUserDirectory({
        search: searchInput.trim() || undefined,
        role: role === 'all' ? undefined : role,
        city: city.trim() || undefined,
        min_rating: minRating ? Number(minRating) : undefined,
        verified_only: verifiedOnly || undefined,
        sort_by: sortBy,
        page,
        page_size: 24,
      });
      const data = res.data;
      const list = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
      setUsers(list);
      setTotal(data?.count ?? list.length);
    } catch {
      setUsers([]);
      setTotal(0);
      setError('Could not load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchInput, role, city, minRating, verifiedOnly, sortBy, page]);

  useEffect(() => {
    syncUrl();
  }, [syncUrl]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchUsers();
    }, 300);
    return () => window.clearTimeout(timer);
  }, [fetchUsers]);

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <section className="w-full rounded-b-3xl border-b border-gray-200 bg-white">
        <div className="w-full px-4 py-4 sm:px-6 sm:py-5 lg:px-10">
          <div className="grid gap-4 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-4">
              <label htmlFor="user-search" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Search
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="user-search"
                  type="search"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Name, username, bio, or city…"
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 text-sm shadow-sm outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20"
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Role
              </label>
              <Select
                value={role}
                onValueChange={(v) => {
                  setRole(v as RoleFilter);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="tasker">Taskers</SelectItem>
                  <SelectItem value="customer">Customers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="user-city" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                City
              </label>
              <input
                id="user-city"
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setPage(1);
                }}
                placeholder="e.g. Kathmandu"
                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm shadow-sm outline-none transition focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Min rating
              </label>
              <Select
                value={minRating || 'any'}
                onValueChange={(v) => {
                  setMinRating(v === 'any' ? '' : v);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any rating</SelectItem>
                  <SelectItem value="3">3+ stars</SelectItem>
                  <SelectItem value="4">4+ stars</SelectItem>
                  <SelectItem value="4.5">4.5+ stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Sort by
              </label>
              <Select
                value={sortBy}
                onValueChange={(v) => {
                  setSortBy(v as SortFilter);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Top rated</SelectItem>
                  <SelectItem value="tasks">Most tasks</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="name">Name A–Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => {
                  setVerifiedOnly(e.target.checked);
                  setPage(1);
                }}
                className="h-4 w-4 rounded border-gray-300 text-brand-emerald focus:ring-brand-emerald"
              />
              Verified taskers only
            </label>
            <p className="text-sm text-gray-500">
              {loading ? 'Loading…' : `${total} member${total === 1 ? '' : 's'}`}
            </p>
          </div>
        </div>
      </section>

      <main className="w-full px-4 py-6 sm:px-6 lg:px-10">
        {loading ? (
          <UserDirectoryGridSkeleton count={8} />
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-700">
            {error}
            <button
              type="button"
              onClick={() => void fetchUsers()}
              className="ml-2 font-semibold underline"
            >
              Retry
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-16 text-center">
            <Users className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 font-medium text-gray-700">No members match your filters</p>
            <p className="mt-1 text-sm text-gray-500">Try clearing search or broadening filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {users.map((user) => {
              const href = getUserProfileHref(user as any) ?? '#';
              return (
                <PublicUserDirectoryCard key={user.id} user={user} href={href} />
              );
            })}
          </div>
        )}

        {!loading && total > 24 ? (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-brand-emerald hover:text-brand-emerald disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">Page {page}</span>
            <button
              type="button"
              disabled={users.length < 24}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-brand-emerald hover:text-brand-emerald disabled:opacity-40"
            >
              Next
            </button>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
