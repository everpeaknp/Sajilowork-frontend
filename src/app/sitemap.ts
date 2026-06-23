import type { MetadataRoute } from 'next';

import { SITEMAP_IDS, buildSitemapForId, type SitemapId } from '@/lib/seo/sitemap-data';

export async function generateSitemaps() {
  return SITEMAP_IDS.map((id) => ({ id }));
}

export default async function sitemap(props: {
  id: Promise<SitemapId>;
}): Promise<MetadataRoute.Sitemap> {
  const id = await props.id;
  try {
    return await buildSitemapForId(id);
  } catch (error) {
    console.error(`[sitemap] failed to build sitemap for id=${id}:`, error);
    return [];
  }
}
