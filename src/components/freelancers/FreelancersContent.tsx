'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import FreelancerHero from './FreelancerHero';
import FreelancerList from './FreelancerList';
import type { Freelancer } from './freelancerData';
import { mapDirectoryEntriesToFreelancers } from '@/lib/freelancerProfileFromApi';
import { isDirectoryEntryProfileConfigured } from '@/lib/freelancerProfileReadiness';
import { userService, type UserDirectoryEntry } from '@/services/user.service';

const DIRECTORY_PAGE_SIZE = 100;
const MAX_DIRECTORY_PAGES = 50;

function isFreelancerDirectoryEntry(entry: UserDirectoryEntry): boolean {
  if (!entry?.id) return false;
  if (entry.role === 'admin') return false;
  return entry.role === 'tasker';
}

async function fetchAllFreelancers(): Promise<Freelancer[]> {
  let page = 1;
  let total = 0;
  let rawFetched = 0;
  const entries: UserDirectoryEntry[] = [];
  const seenIds = new Set<string>();

  do {
    const res = await userService.getUserDirectory({
      role: 'tasker',
      sort_by: 'rating',
      page,
      page_size: DIRECTORY_PAGE_SIZE,
    });

    if (!res.success) {
      throw new Error(res.message || 'Could not load freelancers');
    }

    const data = res.data;
    const batch = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
    total = typeof data?.count === 'number' ? data.count : rawFetched + batch.length;
    rawFetched += batch.length;

    for (const entry of batch) {
      if (!entry?.id || seenIds.has(entry.id)) continue;
      seenIds.add(entry.id);
      if (isFreelancerDirectoryEntry(entry)) {
        if (isDirectoryEntryProfileConfigured(entry)) {
          entries.push(entry);
        }
      }
    }

    page += 1;
  } while (rawFetched < total && page <= MAX_DIRECTORY_PAGES);

  return mapDirectoryEntriesToFreelancers(entries);
}

export default function FreelancersContent({
  initialFreelancers,
}: {
  initialFreelancers?: Freelancer[];
}) {
  const hasInitial = Boolean(initialFreelancers?.length);
  const [freelancers, setFreelancers] = useState<Freelancer[]>(initialFreelancers ?? []);
  const [loading, setLoading] = useState(!hasInitial);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const skipInitialFetchRef = useRef(hasInitial);

  const loadFreelancers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchAllFreelancers();
      setFreelancers(list);
    } catch (err) {
      setFreelancers([]);
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message?: string }).message)
          : 'Could not load freelancers. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (skipInitialFetchRef.current) {
      skipInitialFetchRef.current = false;
      return;
    }
    void loadFreelancers();
  }, [loadFreelancers]);

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div id="freelancer-page-container" className="relative animate-in fade-in text-black">
      <AnimatePresence>
        {notification ? (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-4 z-50 mx-auto mb-6 flex max-w-xl items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-xs font-normal text-emerald-800 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
              <span>{notification}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="cursor-pointer rounded p-1 text-emerald-600 transition-colors hover:bg-emerald-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <FreelancerHero />

      <FreelancerList
        freelancers={freelancers}
        loading={loading}
        error={error}
        onRetry={() => void loadFreelancers()}
        onInquire={(name) => triggerNotification(`Inquiry sent to ${name}.`)}
      />
    </div>
  );
}
