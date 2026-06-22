import { NextResponse } from 'next/server';

import { getCanonicalSiteUrl } from '@/lib/seo/constants';
import { SITEMAP_IDS } from '@/lib/seo/sitemap-data';

/** Sitemap index — served at /sitemap.xml via next.config rewrite. */
export async function GET() {
  const base = await getCanonicalSiteUrl();
  const lastmod = new Date().toISOString();

  const entries = SITEMAP_IDS.map(
    (id) =>
      `  <sitemap>\n    <loc>${base}/sitemap/${id}.xml</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`,
  ).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}

export const revalidate = 300;
