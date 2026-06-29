import { NextResponse } from 'next/server';

import { buildImageSitemapXml } from '@/lib/seo/image-sitemap-data';

/** Google image sitemap extension — referenced from /sitemap.xml index. */
export async function GET() {
  try {
    const xml = await buildImageSitemapXml();
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[sitemap-images] failed to build image sitemap:', error);
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"></urlset>',
      {
        headers: { 'Content-Type': 'application/xml' },
        status: 200,
      },
    );
  }
}

export const revalidate = 3600;
