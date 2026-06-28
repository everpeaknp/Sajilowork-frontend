/**
 * Client-side Sentry initialization (optional — set NEXT_PUBLIC_SENTRY_DSN).
 * Loaded from the root layout on the client only.
 */
export function initClientSentry(): void {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn || typeof window === 'undefined') return;

  void import('@sentry/browser').then((Sentry) => {
    if (Sentry.getClient()) return;
    Sentry.init({
      dsn,
      environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
      tracesSampleRate: 0.1,
      sendDefaultPii: false,
    });
  });
}
