'use client';

import { useEffect } from 'react';
import { initClientSentry } from '@/lib/sentry.client';

export default function SentryInit() {
  useEffect(() => {
    initClientSentry();
  }, []);

  return null;
}
