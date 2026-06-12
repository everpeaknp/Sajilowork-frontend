'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '../ui/sidebar-with-submenu';
import Navbar from '../common/navbar';
import { useAuthStore } from '@/store/auth.store';
import { TaskerStatsProvider } from '@/context/TaskerStatsContext';
import {
  TaskerDashboardNavProvider,
  useTaskerDashboardNav,
} from '@/context/TaskerDashboardNavContext';

function DashboardLayoutShell({ children }: { children: React.ReactNode }) {
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const pathname = usePathname();
  const { mobileOpen, setMobileOpen } = useTaskerDashboardNav();

  useEffect(() => {
    if (isAuthenticated) {
      void refreshUser();
    }
  }, [isAuthenticated, refreshUser]);

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
    <div className="mobile-bottom-nav-offset min-h-[100dvh] bg-white font-body md:pb-0">
      <Navbar />
      <Sidebar mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} />

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 top-14 z-40 bg-black/50 lg:hidden"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <main className="min-h-[calc(100dvh-3.5rem)] bg-white lg:pl-80">
        <div className="mx-auto w-full min-w-0 max-w-6xl p-4 sm:p-6 md:p-10 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <TaskerStatsProvider>
      <TaskerDashboardNavProvider>
        <DashboardLayoutShell>{children}</DashboardLayoutShell>
      </TaskerDashboardNavProvider>
    </TaskerStatsProvider>
  );
}
