import { fetchAllPaginated } from './api';
import { getCanonicalSiteUrl } from './constants';

import { getMediaUrl } from '@/lib/utils';

type ImageRecord = {
  slug?: string;
  username?: string;
  title?: string;
  primary_image?: string | null;
  image?: string | null;
  image_url?: string | null;
  profile_image?: string | null;
  logo_url?: string | null;
};

type ImageUrlEntry = {
  pageUrl: string;
  imageUrl: string;
  title?: string;
};

function resolveImage(record: ImageRecord): string | null {
  const url =
    record.primary_image ||
    record.image ||
    record.image_url ||
    record.profile_image ||
    record.logo_url;
  if (!url || !url.trim()) return null;
  const resolved = getMediaUrl(url.trim());
  if (!resolved) return null;
  if (resolved.startsWith('http://') || resolved.startsWith('https://')) return resolved;
  return null;
}

function collectEntries(
  base: string,
  prefix: string,
  records: ImageRecord[],
  slugKey: 'slug' | 'username' = 'slug',
): ImageUrlEntry[] {
  const entries: ImageUrlEntry[] = [];
  for (const record of records) {
    const slug = (record[slugKey] || record.slug || record.username || '').trim();
    const imageUrl = resolveImage(record);
    if (!slug || !imageUrl) continue;
    entries.push({
      pageUrl: `${base}${prefix}/${encodeURIComponent(slug)}`,
      imageUrl,
      title: record.title?.trim(),
    });
  }
  return entries;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function buildImageSitemapXml(): Promise<string> {
  const base = await getCanonicalSiteUrl();
  const revalidate = 3600;

  const [jobs, tasks, services, projects, blog, freelancers, employers] = await Promise.all([
    fetchAllPaginated<ImageRecord>('/jobs/?page_size=100', { revalidate }),
    fetchAllPaginated<ImageRecord>('/tasks/?listing_kind=task&page_size=100', { revalidate }),
    fetchAllPaginated<ImageRecord>('/services/?page_size=100', { revalidate }),
    fetchAllPaginated<ImageRecord>('/projects/?page_size=100', { revalidate }),
    fetchAllPaginated<ImageRecord>('/blog/posts/?page_size=100', { revalidate }),
    fetchAllPaginated<ImageRecord>('/users/directory/?role=tasker&page_size=100', {
      revalidate,
    }),
    fetchAllPaginated<ImageRecord>('/employers/?page_size=100', { revalidate }),
  ]);

  const entries = [
    ...collectEntries(base, '/jobs', jobs),
    ...collectEntries(base, '/task', tasks),
    ...collectEntries(base, '/services', services),
    ...collectEntries(base, '/projects', projects),
    ...collectEntries(base, '/blog', blog),
    ...collectEntries(base, '/freelancers', freelancers, 'username'),
    ...collectEntries(base, '/employers', employers),
  ];

  const urlNodes = entries
    .map((entry) => {
      const titleTag = entry.title
        ? `\n      <image:title>${escapeXml(entry.title)}</image:title>`
        : '';
      return `  <url>\n    <loc>${escapeXml(entry.pageUrl)}</loc>\n    <image:image>\n      <image:loc>${escapeXml(entry.imageUrl)}</image:loc>${titleTag}\n    </image:image>\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urlNodes}\n</urlset>`;
}
