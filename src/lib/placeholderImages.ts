import { hashStringSeed } from '@/lib/placeholderAvatar';

/** Stable marketplace hero imagery (bundled under public/images). */
export const MARKETPLACE_HERO_IMAGE = '/images/about/home6-hero-img-1.png';

export const MARKETPLACE_CTA_IMAGE =
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=1920';

export const LISTING_COVER_FALLBACK =
  'https://images.unsplash.com/photo-1541462608141-ad4979e458c9?auto=format&fit=crop&w=800&q=80';

const LISTING_COVER_POOL = [
  LISTING_COVER_FALLBACK,
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80',
] as const;

/** Deterministic listing cover when no gallery image was uploaded. */
export function listingCoverFallbackImage(seedSource: {
  slug?: string | null;
  id?: string | null;
  title?: string | null;
}): string {
  const seed = String(seedSource.slug || seedSource.id || seedSource.title || 'listing');
  const index = hashStringSeed(seed) % LISTING_COVER_POOL.length;
  return LISTING_COVER_POOL[index];
}
