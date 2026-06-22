import type { MetadataRoute } from 'next';

import { getCanonicalSiteUrl } from '@/lib/seo/constants';
import { SITEMAP_IDS } from '@/lib/seo/sitemap-data';

const DISALLOW_PATHS = [
  '/admin/',
  '/dashboard/',
  '/tasker-dashboard/',
  '/signin/',
  '/signup/',
  '/verify-email/',
  '/forgot-password/',
  '/reset-password/',
  '/checkout/',
  '/payments/',
  '/payment/',
  '/my-tasks/',
  '/edit-task/',
  '/post-task/',
  '/auth/',
  '/bookmarks/',
  '/message/',
  '/search/',
  '/taskmap/',
  '/api/',
];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await getCanonicalSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW_PATHS,
      },
    ],
    sitemap: [
      `${base}/sitemap.xml`,
      ...SITEMAP_IDS.map((id) => `${base}/sitemap/${id}.xml`),
    ],
    host: base,
  };
}
