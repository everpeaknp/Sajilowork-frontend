'use client';

import { Suspense } from 'react';
import MessagesSection from '@/components/message/message';
import Navbar from '@/components/common/navbar';

export default function MessagePage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
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
