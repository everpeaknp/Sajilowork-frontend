import type { MetadataRoute } from 'next';

import { getAppBaseUrl } from '@/lib/seo/constants';

export default function robots(): MetadataRoute.Robots {
  const base = getAppBaseUrl();
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
