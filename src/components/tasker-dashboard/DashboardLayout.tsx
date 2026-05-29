'use client';

import { useEffect } from 'react';
import Sidebar from '../ui/sidebar-with-submenu';
import Navbar from '../common/navbar';
import { useAuthStore } from '@/store/auth.store';
import { TaskerStatsProvider } from '@/context/TaskerStatsContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const refreshUser = useAuthStore((s) => s.refreshUser);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <TaskerStatsProvider>
      <div className="min-h-screen bg-white font-sans">
        <Navbar />
        <Sidebar />
        <main className="lg:pl-80 min-h-screen bg-white">
          <div className="p-6 md:p-12 max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </TaskerStatsProvider>
  );
}
