'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { dashboardService, type UserStats } from '@/services/dashboard.service';

type TaskerStatsContextValue = {
  stats: UserStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const TaskerStatsContext = createContext<TaskerStatsContextValue | null>(null);

export function TaskerStatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardService.getMyStats();
      if (response?.success && response.data) {
        setStats(response.data);
      } else {
        setError(response?.message || 'Failed to load dashboard stats');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load dashboard stats';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ stats, loading, error, refresh }),
    [stats, loading, error, refresh]
  );

  return (
    <TaskerStatsContext.Provider value={value}>{children}</TaskerStatsContext.Provider>
  );
}

export function useTaskerStats() {
  const context = useContext(TaskerStatsContext);
  if (!context) {
    throw new Error('useTaskerStats must be used within TaskerStatsProvider');
  }
  return context;
}
