'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-neutral-950">
      <div className="w-full max-w-md rounded-lg border border-transparent bg-white p-8 text-center shadow-lg dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-stone-100">
          Something went wrong!
        </h2>

        <p className="mb-4 text-gray-600 dark:text-neutral-400">
          {error.message || 'An unexpected error occurred'}
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:text-neutral-500 dark:hover:text-neutral-300">
              Error Details (Development Only)
            </summary>
            <pre className="mt-2 max-h-40 overflow-auto rounded bg-gray-100 p-3 text-xs dark:bg-neutral-800 dark:text-neutral-300">
              {error.stack}
            </pre>
          </details>
        )}

        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-brand-emerald px-4 py-2 text-white transition-colors hover:bg-[#3d9665] dark:text-neutral-950 dark:hover:bg-emerald-400"
          >
            Try again
          </button>

          <Link
            href="/"
            className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300 dark:bg-neutral-800 dark:text-stone-200 dark:hover:bg-neutral-700"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
