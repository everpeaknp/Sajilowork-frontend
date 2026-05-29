'use client';

import { Suspense } from 'react';
import MessagesSection from '@/components/message/message';
import Navbar from '@/components/common/navbar';

export default function MessagePage() {
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
