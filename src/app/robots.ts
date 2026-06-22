import type { MetadataRoute } from 'next';

import { getCanonicalSiteUrl } from '@/lib/seo/constants';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await getCanonicalSiteUrl();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/tasker-dashboard/',
          '/signin/',
          '/signup/',
          '/verify-email/',
          '/checkout/',
          '/payments/',
          '/my-tasks/',
          '/edit-task/',
          '/auth/',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
