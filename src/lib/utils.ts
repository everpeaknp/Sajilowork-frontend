import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the full URL for a media file from the backend
 * @param path - The media path (can be relative or absolute URL)
 * @returns Full URL to the media file
 */
export function getMediaUrl(path: string | null | undefined): string {
  if (!path || !path.trim()) {
    return '';
  }

  const trimmed = path.trim();

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Frontend static assets — do not prefix with API host
  if (trimmed.startsWith('/images/') || trimmed.startsWith('/default-avatar')) {
    return trimmed;
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
  const baseUrl = apiBaseUrl.replace(/\/api\/v1\/?$/, '');

  let normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  // DB paths like profile_images/foo.jpg (no /media/ prefix)
  if (
    !normalizedPath.startsWith('/media/') &&
    (normalizedPath.includes('/profile_images/') || normalizedPath.startsWith('/profile_images/'))
  ) {
    normalizedPath = `/media${normalizedPath}`;
  }

  // Task attachment paths stored without /media/ prefix
  if (
    !normalizedPath.startsWith('/media/') &&
    (normalizedPath.includes('/task_attachments/') ||
      normalizedPath.startsWith('/task_attachments/'))
  ) {
    normalizedPath = `/media${normalizedPath}`;
  }

  // Employer logo uploads
  if (
    !normalizedPath.startsWith('/media/') &&
    (normalizedPath.includes('/employer_logos/') ||
      normalizedPath.startsWith('/employer_logos/'))
  ) {
    normalizedPath = `/media${normalizedPath}`;
  }

  return `${baseUrl}${normalizedPath}`;
}

/** True when a task attachment row represents an image (API uses `image` or MIME types). */
export function isTaskImageAttachment(
  fileType: string | null | undefined
): boolean {
  if (!fileType || typeof fileType !== 'string') return false;
  const normalized = fileType.toLowerCase();
  return normalized === 'image' || normalized.startsWith('image/');
}