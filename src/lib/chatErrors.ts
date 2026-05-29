import type { ApiError } from '@/types';

/** Turn API / DRF errors into a single user-facing string. */
export function formatChatApiError(err: unknown, fallback = 'Something went wrong'): string {
  if (!err || typeof err !== 'object') {
    return fallback;
  }

  const apiErr = err as ApiError & { errors?: Record<string, string[] | string> };

  if (apiErr.errors && typeof apiErr.errors === 'object') {
    const parts: string[] = [];
    for (const value of Object.values(apiErr.errors)) {
      if (Array.isArray(value)) {
        parts.push(...value.map(String));
      } else if (value) {
        parts.push(String(value));
      }
    }
    if (parts.length) {
      return parts.join(' ');
    }
  }

  if (typeof apiErr.message === 'string' && apiErr.message.trim()) {
    return apiErr.message;
  }

  const detail = (err as { detail?: string }).detail;
  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }

  return fallback;
}
