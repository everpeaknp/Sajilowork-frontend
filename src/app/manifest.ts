import type { MetadataRoute } from 'next';

import { DEFAULT_DESCRIPTION, DEFAULT_SITE_NAME } from '@/lib/seo/constants';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${DEFAULT_SITE_NAME} — Nepal Marketplace`,
    short_name: DEFAULT_SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#ffffff',
    theme_color: '#10b981',
    lang: 'en-NP',
    categories: ['business', 'productivity'],
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/icon',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
