import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'airtasker-saved-project-ids';
const CHANGE_EVENT = 'airtasker-project-bookmarks-change';

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

export function getSavedProjectIdsSnapshot(): readonly string[] {
  return buildSnapshot();
}

export function isProjectSaved(projectId: string): boolean {
  return buildSnapshot().includes(projectId);
}

export function setProjectSaved(projectId: string, saved: boolean): void {
  const ids = readIds();
  if (saved) ids.add(projectId);
  else ids.delete(projectId);
  writeIds(ids);
}

export function toggleProjectSaved(projectId: string): boolean {
  const ids = readIds();
  const next = !ids.has(projectId);
  if (next) ids.add(projectId);
  else ids.delete(projectId);
  writeIds(ids);
  return next;
}

export function subscribeProjectBookmarks(listener: () => void): () => void {
  const handler = () => listener();
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

export function useSavedProjectIds(): readonly string[] {
  return useSyncExternalStore(
    subscribeProjectBookmarks,
    getSavedProjectIdsSnapshot,
    () => SERVER_SNAPSHOT,
  );
}
