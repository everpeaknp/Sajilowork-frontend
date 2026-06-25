import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'sajilowork-saved-employer-ids';
const CHANGE_EVENT = 'sajilowork-employer-bookmarks-change';

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

export function getSavedEmployerIdsSnapshot(): readonly string[] {
  return buildSnapshot();
}

export function toggleEmployerSaved(employerId: string): boolean {
  const ids = readIds();
  const next = !ids.has(employerId);
  if (next) {
    ids.add(employerId);
  } else {
    ids.delete(employerId);
  }
  writeIds(ids);
  return next;
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => undefined;
  const handler = () => callback();
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

export function useSavedEmployerIds(): readonly string[] {
  return useSyncExternalStore(subscribe, getSavedEmployerIdsSnapshot, () => SERVER_SNAPSHOT);
}
