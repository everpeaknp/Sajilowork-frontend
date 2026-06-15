'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import Navbar from '@/components/common/navbar';
import { useAuthStore } from '@/store/auth.store';
import DashboardSidebar from './DashboardSidebar';
import { DashboardTabProvider, useDashboardTab } from './DashboardTabContext';
import { DashboardRoleSwitchProvider } from './DashboardRoleSwitchContext';

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const initialize = useAuthStore((s) => s.initialize);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const pathname = usePathname();
  const router = useRouter();
  const { activeTab, setActiveTab, mobileOpen, setMobileOpen, sidebarCollapsed, toggleSidebarCollapsed } =
    useDashboardTab();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      void refreshUser();
    }
  }, [isAuthenticated, refreshUser]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(`/signin?redirect=${encodeURIComponent(pathname || '/dashboard')}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

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

  return (
    <div className="mobile-bottom-nav-offset min-h-[100dvh] overflow-x-clip bg-[#f0efec] font-body md:pb-0">
      <Navbar />

      <nav
        className={`fixed top-14 left-0 z-50 h-[calc(100dvh-3.5rem)] w-[17.5rem] overflow-hidden bg-white shadow-xl transition-[width,transform] duration-300 ease-in-out sm:top-16 sm:h-[calc(100dvh-4rem)] lg:z-40 lg:translate-x-0 lg:shadow-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'lg:w-[4.75rem]' : 'lg:w-[17.5rem]'}`}
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
          className="fixed inset-0 top-14 z-40 bg-black/50 transition-opacity duration-300 ease-in-out sm:top-16 lg:hidden"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <main
        className={`min-w-0 overflow-x-clip bg-[#f0efec] transition-[padding-left] duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:pl-[4.75rem]' : 'lg:pl-[17.5rem]'
        }`}
      >
        <div className="mx-auto w-full min-w-0 p-4 sm:p-6 md:p-8 lg:pt-3">
          <div className="mb-4 flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 transition-colors hover:bg-neutral-50"
              aria-label="Open dashboard menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium text-neutral-800">Dashboard menu</span>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardTabProvider>
      <DashboardRoleSwitchProvider>
        <DashboardShellInner>{children}</DashboardShellInner>
      </DashboardRoleSwitchProvider>
    </DashboardTabProvider>
  );
}
