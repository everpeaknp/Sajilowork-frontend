'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MessagesSection from '@/components/message/message';
import Navbar from '@/components/common/navbar';
import { useAuthStore } from '@/store/auth.store';
import { DASHBOARD_MESSAGES_PATH } from '@/lib/dashboardChat';

function MessageRedirect() {
  const router = useRouter();
  const { isAuthenticated, initialize } = useAuthStore();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      const qs = typeof window !== 'undefined' ? window.location.search : '';
      router.replace(`${DASHBOARD_MESSAGES_PATH}${qs}`);
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return (
      <div className="flex h-[100dvh] items-center justify-center text-sm text-neutral-500">
        Opening messages…
      </div>
    );
  }

  return (
    <div className="mobile-bottom-nav-offset flex h-[100dvh] flex-col overflow-hidden md:pb-0">
      <Navbar />
      <div className="flex-1 overflow-hidden">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center text-on-surface-variant">
              Loading messages…
            </div>
          }
        >
          <MessagesSection />
        </Suspense>
      </div>
    </div>
  );
}

export default function MessagePage() {
  return (
    <Suspense fallback={null}>
      <MessageRedirect />
    </Suspense>
  );
}
