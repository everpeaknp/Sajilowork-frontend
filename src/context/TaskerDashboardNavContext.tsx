'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type TaskerDashboardNavContextValue = {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  toggleMobile: () => void;
};

const TaskerDashboardNavContext = createContext<TaskerDashboardNavContextValue | null>(
  null
);

export function TaskerDashboardNavProvider({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = useCallback(() => {
    setMobileOpen((open) => !open);
  }, []);

  const value = useMemo(
    () => ({
      mobileOpen,
      setMobileOpen,
      toggleMobile,
    }),
    [mobileOpen, toggleMobile]
  );

  return (
    <TaskerDashboardNavContext.Provider value={value}>
      {children}
    </TaskerDashboardNavContext.Provider>
  );
}

export function useTaskerDashboardNav() {
  const context = useContext(TaskerDashboardNavContext);
  if (!context) {
    throw new Error('useTaskerDashboardNav must be used within TaskerDashboardNavProvider');
  }
  return context;
}

/** Returns null outside tasker dashboard layout (e.g. global Navbar). */
export function useTaskerDashboardNavOptional() {
  return useContext(TaskerDashboardNavContext);
}
