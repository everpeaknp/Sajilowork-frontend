import type { MetadataRoute } from 'next';

import { getCanonicalSiteUrl } from '@/lib/seo/constants';

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
  '/users/',
  '/taskmap/',
  '/jobmap/',
  '/projectmap/',
  '/servicemap/',
  '/disputes/',
  '/profile/',
  '/settings/',
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
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
