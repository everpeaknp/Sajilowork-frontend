'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Something went wrong | Sajilowork</title>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className="min-h-screen bg-gray-50 antialiased">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
            <h1 className="mb-2 text-2xl font-bold text-gray-900">Something went wrong</h1>
            <p className="mb-6 text-gray-600">
              We could not load this page. Please try again or return to the homepage.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={reset}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700"
              >
                Try again
              </button>
              <Link
                href="/"
                className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300"
              >
                Go home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
