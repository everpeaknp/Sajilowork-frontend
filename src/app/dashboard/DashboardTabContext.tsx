'use client';

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  getDashboardHref,
  tabFromPathname,
  type DashboardTab,
} from './dashboardTabs';
import { useDashboardSidebarRole } from './DashboardRoleSwitchContext';

export type { DashboardTab };

type DashboardTabContextValue = {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  toggleMobile: () => void;
  sidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;
};

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'dashboard-sidebar-collapsed';

const DashboardTabContext = createContext<DashboardTabContextValue | null>(null);

function resolveActiveTab(
  pathname: string,
  fromParam: string | null,
  sidebarRole: 'customer' | 'tasker',
): DashboardTab {
  const fromPath = tabFromPathname(pathname);

  if (sidebarRole === 'customer' && /^\/dashboard\/proposals\/[^/]+\/[^/]+$/.test(pathname)) {
    if (
      fromParam === 'contracts' ||
      fromParam === 'applications' ||
      fromParam === 'bids' ||
      fromParam === 'orders'
    ) {
      return fromParam;
    }
    return 'applications';
  }

  if (sidebarRole === 'tasker' && /^\/dashboard\/proposals\/[^/]+\/[^/]+$/.test(pathname)) {
    if (
      fromParam === 'contracts' ||
      fromParam === 'proposals' ||
      fromParam === 'bids' ||
      fromParam === 'orders'
    ) {
      return fromParam;
    }
    return 'proposals';
  }

  if (sidebarRole === 'customer' && /^\/dashboard\/applications\/[^/]+$/.test(pathname)) {
    return 'applications';
  }

  if (sidebarRole === 'customer' && /^\/dashboard\/bids\/[^/]+$/.test(pathname)) {
    return 'bids';
  }

  if (sidebarRole === 'customer' && fromPath === 'proposals') {
    return 'applications';
  }

  return fromPath;
}

export function DashboardTabProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-sm text-neutral-500">Loading…</p>
        </div>
      }
    >
      <DashboardTabProviderInner>{children}</DashboardTabProviderInner>
    </Suspense>
  );
}

function DashboardTabProviderInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sidebarRole = useDashboardSidebarRole();
  const fromParam = searchParams.get('from');
  const activeTab = resolveActiveTab(pathname, fromParam, sidebarRole);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY);
      if (stored === 'true') {
        setSidebarCollapsed(true);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const setActiveTab = useCallback(
    (tab: DashboardTab) => {
      router.push(getDashboardHref(tab));
    },
    [router],
  );

  const toggleMobile = useCallback(() => {
    setMobileOpen((open) => !open);
  }, []);

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      activeTab,
      setActiveTab,
      mobileOpen,
      setMobileOpen,
      toggleMobile,
      sidebarCollapsed,
      toggleSidebarCollapsed,
    }),
    [activeTab, mobileOpen, setActiveTab, sidebarCollapsed, toggleMobile, toggleSidebarCollapsed],
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
