'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { DashboardTab } from './DashboardSidebar';

type DashboardTabContextValue = {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  toggleMobile: () => void;
};

const DashboardTabContext = createContext<DashboardTabContextValue | null>(null);

export function DashboardTabProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = useCallback(() => {
    setMobileOpen((open) => !open);
  }, []);

  const value = useMemo(
    () => ({
      activeTab,
      setActiveTab,
      mobileOpen,
      setMobileOpen,
      toggleMobile,
    }),
    [activeTab, mobileOpen, toggleMobile],
  );

  return <DashboardTabContext.Provider value={value}>{children}</DashboardTabContext.Provider>;
}

export function useDashboardTab() {
  const context = useContext(DashboardTabContext);
  if (!context) {
    throw new Error('useDashboardTab must be used within DashboardTabProvider');
  }
  return context;
}

export function useDashboardTabOptional() {
  return useContext(DashboardTabContext);
}
