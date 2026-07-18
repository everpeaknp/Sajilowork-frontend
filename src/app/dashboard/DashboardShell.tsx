'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import Navbar from '@/components/common/navbar';
import DashboardProductTour from '@/components/dashboard/DashboardProductTour';
import FirstRegistrationOnboarding from '@/components/dashboard/FirstRegistrationOnboarding';
import { useAuthStore } from '@/store/auth.store';
import { tokenManager } from '@/lib/api/client';
import dynamic from 'next/dynamic';
import { DashboardTabProvider, useDashboardTab } from './DashboardTabContext';
import { DashboardRoleSwitchProvider } from './DashboardRoleSwitchContext';
import DashboardLoadingFallback from './DashboardLoadingFallback';

const DashboardSidebar = dynamic(() => import('./DashboardSidebar'), {
  loading: () => (
    <div className="fixed top-14 left-0 z-50 h-[calc(100dvh-3.5rem-env(safe-area-inset-bottom,0px))] w-[17.5rem] bg-white sm:top-16 sm:h-[calc(100dvh-4rem-env(safe-area-inset-bottom,0px))] lg:h-[calc(100dvh-4rem)] dark:bg-neutral-950" />
  ),
  ssr: false,
});

function DashboardLoading() {
  return <DashboardLoadingFallback message="Loading dashboard..." />;
}

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const initialize = useAuthStore((s) => s.initialize);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const pathname = usePathname();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const { activeTab, setActiveTab, mobileOpen, setMobileOpen, sidebarCollapsed, toggleSidebarCollapsed } =
    useDashboardTab();

  useEffect(() => {
    void initialize().finally(() => setAuthChecked(true));
  }, [initialize]);

  useEffect(() => {
    if (!authChecked || isLoading) return;
    if (!isAuthenticated) {
      const hasTokens =
        !!tokenManager.getAccessToken() && !!tokenManager.getRefreshToken();
      if (hasTokens) return;
      router.replace(`/signin?redirect=${encodeURIComponent(pathname || '/dashboard')}`);
    }
  }, [authChecked, isAuthenticated, isLoading, pathname, router]);

  useEffect(() => {
    if (!authChecked || !isAuthenticated) return;
    void refreshUser();
  }, [authChecked, isAuthenticated, refreshUser]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const isMobile = window.matchMedia('(max-width: 1023px)').matches;
    if (!isMobile) return undefined;

    if (mobileOpen) {
      document.body.classList.add('dashboard-mobile-sidebar-open');
    } else {
      document.body.classList.remove('dashboard-mobile-sidebar-open');
    }

    return () => {
      document.body.classList.remove('dashboard-mobile-sidebar-open');
    };
  }, [mobileOpen]);

  if (!authChecked || (isLoading && !isAuthenticated)) {
    return <DashboardLoading />;
  }

  const hasTokens =
    !!tokenManager.getAccessToken() && !!tokenManager.getRefreshToken();

  if (!isAuthenticated && !hasTokens) {
    return null;
  }

  const isMessagesTab = activeTab === 'message';

  return (
    <div
      className={`mobile-bottom-nav-offset bg-[#f0efec] font-body md:pb-0 dark:bg-neutral-950 ${
        isMessagesTab
          ? 'flex h-[100dvh] flex-col overflow-hidden'
          : 'min-h-[100dvh] overflow-x-clip'
      }`}
    >
      <Navbar />

      <nav
        className={`fixed top-14 left-0 w-[17.5rem] overflow-hidden bg-white shadow-xl transition-[width,transform,height,z-index] duration-300 ease-in-out sm:top-16 lg:z-40 lg:h-[calc(100dvh-4rem)] lg:translate-x-0 lg:shadow-none dark:bg-neutral-950 dark:shadow-black/40 ${
          mobileOpen
            ? 'z-[10010] h-[calc(100dvh-3.5rem-env(safe-area-inset-bottom,0px))] sm:h-[calc(100dvh-4rem-env(safe-area-inset-bottom,0px))]'
            : 'z-50 h-[calc(100dvh-3.5rem-3.75rem-env(safe-area-inset-bottom,0px))] sm:h-[calc(100dvh-4rem-3.75rem-env(safe-area-inset-bottom,0px))] md:h-[calc(100dvh-4rem)] -translate-x-full lg:translate-x-0'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${
          sidebarCollapsed ? 'lg:w-[4.75rem]' : 'lg:w-[17.5rem]'
        }`}
      >
        <DashboardSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapsed}
        />
      </nav>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 top-14 z-[10005] bg-black/50 transition-opacity duration-300 ease-in-out sm:top-16 lg:hidden"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <main
        className={`min-w-0 bg-[#f0efec] transition-[padding-left] duration-300 ease-in-out dark:bg-neutral-950 ${
          isMessagesTab ? 'min-h-0 flex-1 overflow-hidden' : 'overflow-x-clip'
        } ${sidebarCollapsed ? 'lg:pl-[4.75rem]' : 'lg:pl-[17.5rem]'}`}
      >
        <div
          className={`mx-auto w-full min-w-0 p-4 sm:p-6 md:p-8 lg:pt-3 ${
            isMessagesTab ? 'flex h-full min-h-0 flex-col overflow-hidden' : ''
          }`}
        >
          <div className="mb-4 flex shrink-0 items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
              aria-label="Open dashboard menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium text-neutral-800 dark:text-stone-200">Dashboard menu</span>
          </div>
          {isMessagesTab ? (
            <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
          ) : (
            children
          )}
        </div>
      </main>

      <DashboardProductTour />
      <FirstRegistrationOnboarding />
    </div>
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardTabProvider>
        <DashboardRoleSwitchProvider>
          <DashboardShellInner>{children}</DashboardShellInner>
        </DashboardRoleSwitchProvider>
      </DashboardTabProvider>
    </Suspense>
  );
}
