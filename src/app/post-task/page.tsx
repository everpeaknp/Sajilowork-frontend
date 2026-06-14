'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { POST_TASK_PATH } from '@/lib/postTaskPath';

/** Legacy `/post-task` URL — always send users to the dashboard create flow. */
export default function PostTaskRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    router.replace(query ? `${POST_TASK_PATH}?${query}` : POST_TASK_PATH);
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white text-sm text-neutral-500">
      Redirecting…
      </div>
  );
}
