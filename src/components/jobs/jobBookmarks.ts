import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'sajilowork-saved-job-ids';
const CHANGE_EVENT = 'sajilowork-job-bookmarks-change';

const EMPTY_SNAPSHOT: readonly string[] = [];
const SERVER_SNAPSHOT: readonly string[] = EMPTY_SNAPSHOT;

let snapshotCache: readonly string[] = EMPTY_SNAPSHOT;
let snapshotCacheKey = '';

function readIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === 'string' && id.length > 0));
  } catch {
    return new Set();
  }
}

function buildSnapshot(): readonly string[] {
  const ids = [...readIds()].sort();
  const key = ids.join('\0');
  if (key === snapshotCacheKey) {
    return snapshotCache;
  }
  snapshotCacheKey = key;
  snapshotCache = ids;
  return snapshotCache;
}

function writeIds(ids: Set<string>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

/** Stable snapshot for useSyncExternalStore — same array reference until data changes. */
export function getSavedJobIdsSnapshot(): readonly string[] {
  return buildSnapshot();
}

export function isJobSaved(jobId: string): boolean {
  return buildSnapshot().includes(jobId);
}

export function setJobSaved(jobId: string, saved: boolean): void {
  const ids = readIds();
  if (saved) ids.add(jobId);
  else ids.delete(jobId);
  writeIds(ids);
}

/** Toggle saved state; returns the new saved flag. */
export function toggleJobSaved(jobId: string): boolean {
  const ids = readIds();
  const next = !ids.has(jobId);
  if (next) ids.add(jobId);
  else ids.delete(jobId);
  writeIds(ids);
  return next;
}

export function subscribeJobBookmarks(listener: () => void): () => void {
  const handler = () => listener();
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

export function useSavedJobIds(): readonly string[] {
  return useSyncExternalStore(
    subscribeJobBookmarks,
    getSavedJobIdsSnapshot,
    () => SERVER_SNAPSHOT,
  );
}
