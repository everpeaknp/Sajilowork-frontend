import { ImageResponse } from 'next/og';

import { BrandMark } from '@/lib/seo/brand-image';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(<BrandMark titleSize={18} compact />, { ...size });
}
