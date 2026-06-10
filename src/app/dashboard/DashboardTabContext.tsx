'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getDashboardHref, tabFromPathname, type DashboardTab } from './dashboardTabs';

export type { DashboardTab };

type DashboardTabContextValue = {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  toggleMobile: () => void;
};

const DashboardTabContext = createContext<DashboardTabContextValue | null>(null);

export function DashboardTabProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const activeTab = tabFromPathname(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);

  const setActiveTab = useCallback(
    (tab: DashboardTab) => {
      router.push(getDashboardHref(tab));
    },
    [router],
  );

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
    [activeTab, mobileOpen, setActiveTab, toggleMobile],
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
