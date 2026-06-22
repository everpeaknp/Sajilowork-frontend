import type { MetadataRoute } from 'next';

import { SITEMAP_IDS, buildSitemapForId, type SitemapId } from '@/lib/seo/sitemap-data';

export async function generateSitemaps() {
  return SITEMAP_IDS.map((id) => ({ id }));
}

export default async function sitemap({
  id,
}: {
  id: SitemapId;
}): Promise<MetadataRoute.Sitemap> {
  try {
    return await buildSitemapForId(id);
  } catch {
    return [];
  }
}
